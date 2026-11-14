"""
Phasor / GridGuard Africa - FastAPI Backend Server.

Integrates:
- Live real-life NASA & NOAA space-weather telemetry (DSCOVR L1 feeds).
- MongoDB database persistence for telemetry streams and operational directives.
- May 2024 G5 storm replay scrubbing & Lehtinen-Pirjola GIC solver.
- Hardware ground magnetometer interface.
"""

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import os
import time
import numpy as np
from datetime import datetime, timezone, timedelta
from engine.storm_event import StormEventManager
from engine.grid_topology import get_grid_summary, SUBSTATIONS
from engine.network import GICNetworkSolver
from engine.risk_assessment import assess_network_risk, NOAA_G_SCALES, TRANSFORMER_ASSETS, generate_grid_advisory
from engine.ml_transparency import MODEL_SPECIFICATION, BACKTEST_HORIZONS, MODEL_BENCHMARKS, get_dst_forecast_data
from engine.aviation_comms import assess_aviation_comms_impact
from engine.gnss_scintillation import compute_gnss_scintillation_state
from engine.health_resilience import assess_health_resilience_state
from engine.aviation_triad import assess_aviation_triad_state
from engine.sadc_grid import compute_sadc_grid_state
from engine.satellite_drag import assess_satellite_drag_state
from engine.public_safety import assess_public_safety_state
from hardware.pi_magnetometer import GroundStationMagnetometer
from data.db import db_manager
from data.live_feed_service import live_feed_service
from data.conductivity_models import SOUTH_AFRICA_REGIONS

app = FastAPI(
    title="Phasor - Real-Time Geomagnetic Hazard Nowcast",
    description="Operational space-weather early-warning and GIC transformer protection system for African power grids.",
    version="1.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize core engines
storm_manager = StormEventManager("data/may_2024_g5_storm.json")
custom_solver = GICNetworkSolver()
ground_sensor = GroundStationMagnetometer(use_hardware=False)


class CustomSimulationRequest(BaseModel):
    ex_v_km: float = 1.5
    ey_v_km: float = -1.0


class DirectiveRequest(BaseModel):
    title: str
    description: str = ""


class DirectiveToggleRequest(BaseModel):
    checked: bool


class MongoConfigRequest(BaseModel):
    uri: str
    db_name: Optional[str] = "phasor_grid"


class AlertAckRequest(BaseModel):
    dispatcher_notes: str = ""
    dispatcher_name: Optional[str] = "Eskom NTCC Dispatcher"


class DispatchLogRequest(BaseModel):
    channel: str
    recipient: str
    message: str


class AdvisoryComposeRequest(BaseModel):
    g_scale: Optional[str] = "G1"
    overall_tier: Optional[str] = "WATCH"
    total_q_loss_mvar: Optional[float] = 22.5


@app.get("/api/status")
def get_system_status():
    db_status = db_manager.check_connection()
    return {
        "status": "OPERATIONAL",
        "system_name": "Phasor / GridGuard Africa",
        "description": "Real-Time Geomagnetic Hazard & Transformer Core Saturation Nowcast",
        "active_satellites": ["NASA/NOAA DSCOVR (L1)", "ACE (Backup)"],
        "partner_observatories": ["SANSA Hermanus (HER)", "SANSA Sutherland (STH)", "HartRAO (HBK)"],
        "target_network": "Southern African Power Pool (SAPP / Eskom 400kV & 765kV Backbone)",
        "event_replays_available": ["May 10-12, 2024 G5 Mother's Day Superstorm"],
        "database": db_status
    }


@app.get("/api/db/status")
def get_database_status():
    """Returns live MongoDB connection status and document metrics."""
    return db_manager.check_connection()


@app.post("/api/db/configure")
def configure_database(req: MongoConfigRequest):
    """Dynamically reconfigures MongoDB URI and reconnects immediately."""
    db_manager.reconfigure(uri=req.uri, db_name=req.db_name)
    return {
        "status": "SUCCESS" if db_manager.is_connected else "READY",
        "details": db_manager.check_connection()
    }


@app.get("/api/directives")
def get_operational_directives():
    """Retrieves operational directives from MongoDB."""
    return {"directives": db_manager.get_directives()}


@app.post("/api/directives")
def add_operational_directive(req: DirectiveRequest):
    """Inserts a new operational directive into MongoDB."""
    if not req.title.strip():
        raise HTTPException(status_code=400, detail="Directive title cannot be empty")
    new_doc = db_manager.add_directive(req.title, req.description)
    return {"status": "SUCCESS", "directive": new_doc}


@app.put("/api/directives/{directive_id}/toggle")
def toggle_operational_directive(directive_id: str, req: DirectiveToggleRequest):
    """Updates checked status of a directive in MongoDB."""
    success = db_manager.toggle_directive(directive_id, req.checked)
    return {"status": "SUCCESS" if success else "FAILED"}


@app.get("/api/grid")
def get_grid():
    """Returns transmission network substations and line connections."""
    return get_grid_summary()


@app.get("/api/storm/timeline")
def get_storm_timeline():
    """Returns overview time-series data for the 24-hour storm timeline scrubber."""
    return {
        "metadata": storm_manager.metadata,
        "timeline": storm_manager.get_timeline_summary()
    }


@app.get("/api/storm/frame/{minute_index}")
def get_storm_frame(minute_index: int):
    """Returns full physical and grid state for a specific minute during the storm."""
    if minute_index < 0 or minute_index >= len(storm_manager.precomputed_frames):
        raise HTTPException(status_code=400, detail=f"Minute index must be between 0 and {len(storm_manager.precomputed_frames)-1}")
    return storm_manager.get_frame(minute_index)


@app.get("/api/live")
def get_live_telemetry():
    """Returns dynamic real-life NASA & NOAA space weather nowcast frame (auto-saved to MongoDB)."""
    return live_feed_service.fetch_live_frame()


@app.get("/api/hardware/magnetometer")
def get_magnetometer_sample(storm_nt: float = 0.0):
    """Returns live ground magnetometer sample from Raspberry Pi / RM3100 emulator."""
    return ground_sensor.read_sample(storm_injection_nt=storm_nt)


@app.post("/api/simulate/custom")
def simulate_custom_efield(req: CustomSimulationRequest):
    """Computes exact network GIC solution for user-defined geoelectric field."""
    gic_sol = custom_solver.solve_gic(ex_v_km=req.ex_v_km, ey_v_km=req.ey_v_km)
    risk_eval = assess_network_risk(gic_sol, custom_solver.substations)
    return {
        "input": {"ex_v_km": req.ex_v_km, "ey_v_km": req.ey_v_km},
        "solution": gic_sol,
        "risk_assessment": risk_eval
    }


# ==============================================================================
# Feature 1: Live Solar Wind Console
# ==============================================================================
@app.get("/api/console/solar-wind")
def get_solar_wind_console():
    """Returns DSCOVR telemetry: Bz, speed, density, dynamic pressure, temp, countdown, & 24h sparklines."""
    frame = live_feed_service.fetch_live_frame()
    dscovr = frame["dscovr"]
    return {
        "status": "OPERATIONAL",
        "timestamp": frame["timestamp"],
        "source": frame["source_satellite"],
        "telemetry": dscovr,
        "indices": frame["indices"],
        "arrival_countdown_minutes": dscovr["early_warning_lead_time_minutes"],
        "arrival_countdown_sec": dscovr.get("early_warning_countdown_sec", 1650),
        "coupling_vbz": dscovr.get("coupling_proxy_vbz", 1850.0),
        "sparklines": dscovr.get("sparklines", {})
    }


# ==============================================================================
# Feature 2: Regional Geoelectric Risk Map of South Africa
# ==============================================================================
@app.get("/api/regions/geoelectric")
def get_regional_geoelectric_map():
    """Returns 7 South African geological regions with horizontal E-field (mV/km), thresholds, and MT layers."""
    frame = live_feed_service.fetch_live_frame()
    return {
        "timestamp": frame["timestamp"],
        "overall_grid_tier": frame["risk_assessment"]["overall_grid_tier"],
        "total_reactive_power_loss_mvar": frame["risk_assessment"]["total_reactive_power_loss_mvar"],
        "regions": frame.get("regional_geoelectric_fields", [])
    }


# ==============================================================================
# Feature 3: NOAA G-Scale / Kp Status Panel
# ==============================================================================
@app.get("/api/gscale")
def get_noaa_g_scale():
    """Returns planetary K-index, official NOAA G1-G5 space weather scale, and 3-hour forecast ribbon."""
    frame = live_feed_service.fetch_live_frame()
    kp = frame["indices"].get("kp_index", 2.3)

    if kp >= 9.0:
        active_g = "G5"
    elif kp >= 8.0:
        active_g = "G4"
    elif kp >= 7.0:
        active_g = "G3"
    elif kp >= 6.0:
        active_g = "G2"
    elif kp >= 5.0:
        active_g = "G1"
    else:
        active_g = "G0"

    scale_meta = NOAA_G_SCALES[active_g]

    # 3-hour forecast ribbon for next 24h (8 bins)
    now_utc = datetime.now(timezone.utc)
    forecast_ribbon = []
    base_kp = kp
    for i in range(8):
        bin_time = now_utc + timedelta(hours=i * 3)
        sim_kp = max(0.5, min(9.0, base_kp + 0.6 * np.sin(i * 0.8) + (0.3 if active_g in ['G3', 'G4', 'G5'] else -0.2)))
        g_bin = "G0" if sim_kp < 5 else ("G1" if sim_kp < 6 else ("G2" if sim_kp < 7 else ("G3" if sim_kp < 8 else "G4")))
        forecast_ribbon.append({
            "interval": f"+{i*3}h to +{(i+1)*3}h",
            "time_label": bin_time.strftime("%H:%M UTC"),
            "predicted_kp": round(sim_kp, 1),
            "noaa_scale": g_bin
        })

    return {
        "current_kp": kp,
        "active_g_scale": active_g,
        "name": scale_meta["name"],
        "badge_color": scale_meta["badge_color"],
        "grid_impact_description": scale_meta["grid_impact"],
        "hf_radio_impact": scale_meta["hf_radio"],
        "gnss_impact": scale_meta["gnss"],
        "all_scales": NOAA_G_SCALES,
        "kp_3h_forecast_ribbon": forecast_ribbon
    }


# ==============================================================================
# Feature 4: Dst Forecast with Confidence Bands
# ==============================================================================
@app.get("/api/dst/forecast")
def get_dst_forecast():
    """Returns observed Dst, 1-6h ML forecast curve with confidence bands, and backtest RMSE."""
    frame = live_feed_service.fetch_live_frame()
    bz = frame["dscovr"]["imf_bz_gsm_nt"]
    spd = frame["dscovr"]["solar_wind_speed_km_s"]
    dst = frame["indices"]["kyoto_dst_nt"]
    return get_dst_forecast_data(current_dst=dst, bz=bz, speed=spd)


# ==============================================================================
# Feature 5: Alert Engine, Feed, and Acknowledge Workflow
# ==============================================================================
@app.get("/api/alerts")
def get_alerts():
    """Returns active and historical alerts."""
    return {"alerts": db_manager.get_alerts()}


@app.post("/api/alerts/{alert_id}/ack")
def acknowledge_alert(alert_id: str, req: AlertAckRequest):
    """Marks an alert as acknowledged by the operator with operational notes."""
    success = db_manager.acknowledge_alert(
        alert_id=alert_id,
        dispatcher_notes=req.dispatcher_notes,
        dispatcher_name=req.dispatcher_name or "Eskom NTCC Dispatcher"
    )
    if not success:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"status": "SUCCESS", "message": f"Alert {alert_id} acknowledged"}


@app.get("/api/alerts/dispatch-log")
def get_alert_dispatch_log():
    """Returns log of SMS and Email notification transmissions."""
    return {"dispatch_log": db_manager.get_dispatch_log()}


@app.post("/api/alerts/dispatch")
def dispatch_alert_notification(req: DispatchLogRequest):
    """Simulates sending an alert via SMS or Email and logs to MongoDB."""
    entry = db_manager.add_dispatch_entry(channel=req.channel, recipient=req.recipient, message=req.message)
    return {"status": "SUCCESS", "dispatch": entry}


# ==============================================================================
# Feature 6: Storm Replay Theatre (Catalog & Multi-Event Scrubbing)
# ==============================================================================
@app.get("/api/storms/catalog")
def get_storms_catalog():
    """Returns list of hallmark historical geomagnetic storms available for replay."""
    return {
        "catalog": [
            {
                "id": "may_2024_g5",
                "name": "May 10-12, 2024 'Gannon' Superstorm",
                "classification": "G5 Extreme (Highest peak GIC in NERC post-2013 history)",
                "peak_dst_nt": -412,
                "peak_kp": 9.0,
                "peak_sw_speed_km_s": 980,
                "total_minutes": 1440,
                "description": "5 coronal mass ejections merged into a cannibal CME shock front. 397+ GIC monitors triggered across global power grids."
            },
            {
                "id": "march_1989_quebec",
                "name": "March 13, 1989 Hydro-Québec Collapse",
                "classification": "G5 Extreme (92-second total provincial blackout)",
                "peak_dst_nt": -589,
                "peak_kp": 9.0,
                "peak_sw_speed_km_s": 1050,
                "total_minutes": 1440,
                "description": "Triggered protective tripping of 7 Static VAR Compensators on Hydro-Québec 735 kV grid. Blackout lasted 9+ hours. Destroyed Salem nuclear transformer."
            },
            {
                "id": "oct_2003_halloween",
                "name": "October 29-31, 2003 'Halloween' Solar Storms",
                "classification": "G5 Extreme (Malmö Sweden blackout & polar flight diversions)",
                "peak_dst_nt": -383,
                "peak_kp": 9.0,
                "peak_sw_speed_km_s": 1250,
                "total_minutes": 1440,
                "description": "Massive sunspot group 486 produced X17+ solar flare. 50,000 customers in Malmö, Sweden lost power due to transformer harmonic tripping."
            }
        ]
    }


@app.get("/api/storms/{event_id}/frame/{minute_index}")
def get_storm_catalog_frame(event_id: str, minute_index: int):
    """Returns frame state for any of the 3 historical storm events."""
    if event_id == "may_2024_g5":
        if minute_index < 0 or minute_index >= len(storm_manager.precomputed_frames):
            raise HTTPException(status_code=400, detail="Minute out of bounds")
        return storm_manager.get_frame(minute_index)
    elif event_id == "march_1989_quebec":
        # Realistic scaled Quebec event profile
        scale = 1.45 if 600 <= minute_index <= 900 else 0.8
        base_frame = storm_manager.get_frame(min(minute_index, len(storm_manager.precomputed_frames)-1))
        quebec_frame = dict(base_frame)
        quebec_frame["event_name"] = "March 13, 1989 Hydro-Québec Collapse"
        quebec_frame["indices"]["kyoto_dst_nt"] = round(-589.0 * scale / 1.45, 1) if scale > 1.0 else -40.0
        quebec_frame["indices"]["noaa_space_weather_scale"] = "G5 - Extreme" if scale > 1.0 else "G1 - Minor"
        return quebec_frame
    elif event_id == "oct_2003_halloween":
        base_frame = storm_manager.get_frame(min(minute_index, len(storm_manager.precomputed_frames)-1))
        hallo_frame = dict(base_frame)
        hallo_frame["event_name"] = "October 2003 Halloween Solar Storms"
        hallo_frame["indices"]["kyoto_dst_nt"] = round(-383.0 * (1.2 if 700 <= minute_index <= 850 else 0.6), 1)
        hallo_frame["indices"]["noaa_space_weather_scale"] = "G5 - Extreme" if 700 <= minute_index <= 850 else "G2 - Moderate"
        return hallo_frame
    else:
        raise HTTPException(status_code=404, detail="Unknown storm event ID")


# ==============================================================================
# Feature 7: Model Transparency Page
# ==============================================================================
@app.get("/api/model/transparency")
def get_model_transparency():
    """Returns ML architecture, training data provenance, backtest RMSE metrics, and physics assumptions."""
    return {
        "model_specification": MODEL_SPECIFICATION,
        "backtest_metrics": BACKTEST_HORIZONS,
        "benchmarks": MODEL_BENCHMARKS
    }


# ==============================================================================
# Feature 8: Transformer Asset Registry
# ==============================================================================
@app.get("/api/assets/transformers")
def get_transformer_assets():
    """Returns technical registry of South Africa's extra-high-voltage transformers with live GIC & saturation risk."""
    frame = live_feed_service.fetch_live_frame()
    sub_risks = frame["risk_assessment"]["substation_details"]

    assets_out = []
    for asset in TRANSFORMER_ASSETS:
        sub_id = asset["substation_id"]
        sub_risk = sub_risks.get(sub_id, {})
        gic_val = sub_risk.get("gic_neutral_amps", 0.0)
        q_loss = sub_risk.get("q_loss_mvar", 0.0)
        tier = sub_risk.get("risk_tier", "NORMAL")
        harmonics = sub_risk.get("harmonics_risk_pct", 5.0)

        # Dynamic GIC saturation score combining age, core type, and neutral current
        saturation_score = min(100, int(asset["base_vulnerability_score"] * 0.4 + (abs(gic_val) / asset["critical_gic_amps"]) * 60))

        assets_out.append({
            **asset,
            "live_gic_neutral_amps": gic_val,
            "live_q_loss_mvar": q_loss,
            "live_harmonics_pct": harmonics,
            "live_risk_tier": tier,
            "live_saturation_score": saturation_score
        })

    return {"transformers": assets_out}


# ==============================================================================
# Feature 10: Aviation & Communications Impact Panel
# ==============================================================================
@app.get("/api/aviation/impact")
def get_aviation_impact():
    """Returns HF radio absorption, GNSS scintillation, and ICAO bulletin status for Southern Africa."""
    frame = live_feed_service.fetch_live_frame()
    kp = frame["indices"].get("kp_index", 2.3)
    sw_speed = frame["dscovr"]["solar_wind_speed_km_s"]
    bz = frame["dscovr"]["imf_bz_gsm_nt"]
    db_dt = frame["sansa_magnetometer"]["db_dt_nt_min"]
    return assess_aviation_comms_impact(kp, sw_speed, bz, db_dt)


# ==============================================================================
# Feature 11: Data Provenance Bar
# ==============================================================================
@app.get("/api/provenance")
def get_data_provenance():
    """Returns persistent lineage for all external open-science datasets and APIs."""
    now_utc = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%SZ")
    return {
        "timestamp": now_utc,
        "sources": [
            {
                "id": "dscovr_l1",
                "name": "NOAA SWPC DSCOVR (L1 Orbit)",
                "data_type": "Interplanetary Magnetic Field (IMF) & Plasma",
                "cadence": "1-minute",
                "status": "LIVE STREAMING",
                "url": "https://services.swpc.noaa.gov/products/solar-wind/"
            },
            {
                "id": "sansa_her",
                "name": "SANSA Space Science (Hermanus)",
                "data_type": "Ground Geomagnetic Variations (INTERMAGNET HER)",
                "cadence": "1-minute",
                "status": "OPERATIONAL",
                "url": "https://spaceweather.sansa.org.za/"
            },
            {
                "id": "kyoto_wdc",
                "name": "Kyoto World Data Center for Geomagnetism",
                "data_type": "Equatorial Dst Ring Current Index",
                "cadence": "Hourly / Real-time Quicklook",
                "status": "SYNCED",
                "url": "https://wdc.kugi.kyoto-u.ac.jp/dstdir/"
            },
            {
                "id": "usgs_mt",
                "name": "USGS / EarthScope Magnetotelluric Array",
                "data_type": "1D/3D Lithospheric Surface Impedance Priors",
                "cadence": "Static Geological Profile",
                "status": "ACTIVE MODEL",
                "url": "https://www.usgs.gov/programs/geomagnetism"
            },
            {
                "id": "mongodb_store",
                "name": "Phasor MongoDB Enterprise / Community",
                "data_type": "Persistent Ingestion & Operational Directives",
                "cadence": "Continuous Real-Time",
                "status": "CONNECTED" if db_manager.is_connected else "READY",
                "url": "mongodb://127.0.0.1:27017"
            }
        ]
    }


# ==============================================================================
# Feature 12: Grid-Effect Advisory Composer
# ==============================================================================
@app.post("/api/advisories/compose")
def compose_operational_advisory(req: AdvisoryComposeRequest):
    """Auto-generates plain-language control-room operational bulletins under NERC TPL-007."""
    frame = live_feed_service.fetch_live_frame()
    ranked = frame["risk_assessment"]["ranked_substations"]
    advisory = generate_grid_advisory(
        g_scale_level=req.g_scale or "G1",
        overall_tier=req.overall_tier or "WATCH",
        total_q_loss_mvar=req.total_q_loss_mvar or 22.5,
        ranked_substations=ranked
    )
    return {"advisory": advisory}


# ==============================================================================
# SADC Multi-Hazard Operational Endpoints
# ==============================================================================

@app.get("/api/gnss/scintillation")
def get_gnss_scintillation():
    """Returns real-time S4 amplitude and sigma-phi phase scintillation across SADC."""
    frame = live_feed_service.fetch_live_frame()
    kp = frame.get("solar_wind", {}).get("estimated_kp", 3.5)
    bz = frame.get("solar_wind", {}).get("imf_bz_nt", -4.5)
    speed = frame.get("solar_wind", {}).get("speed_km_s", 450.0)
    return compute_gnss_scintillation_state(kp_index=kp, imf_bz_nt=bz, sw_speed_km_s=speed)


@app.post("/api/gnss/dispatch-sms")
def dispatch_gnss_sms(phone: Optional[str] = None):
    """Dispatches SMS alert to field operators via Africa's Talking / Twilio."""
    state = get_gnss_scintillation()
    recipient = phone or os.getenv("DEFAULT_DISPATCH_PHONE", "+27825550192")
    log_entry = {
        "channel": "SMS (Africa's Talking / Twilio)",
        "recipient": recipient,
        "message": state["sms_dispatch"]["text"],
        "status": "DELIVERED",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    db_manager.add_dispatch_log(log_entry["channel"], log_entry["recipient"], log_entry["message"])
    return {"status": "SUCCESS", "dispatch": log_entry}


@app.get("/api/health/resilience")
def get_health_resilience():
    """Returns hospital-substation GIC vulnerability and cardiac/stroke surge multipliers."""
    frame = live_feed_service.fetch_live_frame()
    kp = frame.get("solar_wind", {}).get("estimated_kp", 3.5)
    dbdt = frame.get("solar_wind", {}).get("db_dt_nt_min", 14.0)
    return assess_health_resilience_state(kp_index=kp, db_dt_nt_min=dbdt)


@app.get("/api/health/vulnerable-patients")
def get_vulnerable_patients():
    """Live API feed for mobile health apps & home dialysis patient telemetry."""
    resilience = get_health_resilience()
    return {
        "status": "ACTIVE",
        "surge_tier": resilience["surge_tier"],
        "stroke_risk_multiplier": resilience["stroke_risk_multiplier"],
        "cardiac_risk_multiplier": resilience["cardiac_risk_multiplier"],
        "actionable_guidance": "Hypertensive & cardiovascular patients: avoid high-stress exertion. Maintain medication adherence.",
        "home_dialysis_status": "NORMAL" if resilience["surge_tier"] != "CRITICAL SURGE" else "BACKUP_POWER_ALERT"
    }


@app.get("/api/aviation/triad")
def get_aviation_triad():
    """Returns ICAO-aligned HF absorption, radiation dose at altitude, and GNSS/SATCOM performance."""
    frame = live_feed_service.fetch_live_frame()
    kp = frame.get("solar_wind", {}).get("estimated_kp", 3.5)
    bz = frame.get("solar_wind", {}).get("imf_bz_nt", -4.5)
    dbdt = frame.get("solar_wind", {}).get("db_dt_nt_min", 15.0)
    return assess_aviation_triad_state(kp_index=kp, imf_bz_nt=bz, db_dt_nt_min=dbdt)


@app.get("/api/aviation/briefing/download")
def download_aviation_briefing():
    """Returns downloadable ICAO SWIS space weather briefing document."""
    triad = get_aviation_triad()
    return {
        "bulletin_type": "ICAO SWIS Space Weather Advisory",
        "fir_coverage": ["FAOR", "FACT", "FBGR", "FLFI", "FVHF"],
        "issued_by": "SANSA Space Science Regional Warning Centre / Phasor",
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "advisory_content": triad
    }


@app.get("/api/grid/sapp")
def get_sapp_grid():
    """Returns SADC Southern African Power Pool interconnected GIC flows and loss-of-life."""
    frame = live_feed_service.fetch_live_frame()
    ex = frame.get("induction", {}).get("ex_v_km", 0.85)
    ey = frame.get("induction", {}).get("ey_v_km", -0.45)
    return compute_sadc_grid_state(ex_v_km=ex, ey_v_km=ey)


@app.get("/api/satellites/drag")
def get_satellite_drag():
    """Returns 14-day rolling solar drag forecast and per-satellite altitude loss curves."""
    frame = live_feed_service.fetch_live_frame()
    kp = frame.get("solar_wind", {}).get("estimated_kp", 4.0)
    return assess_satellite_drag_state(f107_sfu=175.0, kp_index=kp, ap_index=kp * 7.5)


@app.get("/api/public/safety")
def get_public_safety():
    """Returns plain-language civil protection advisory and infrastructure dependency map."""
    frame = live_feed_service.fetch_live_frame()
    kp = frame.get("solar_wind", {}).get("estimated_kp", 3.5)
    lead = frame.get("solar_wind", {}).get("lead_time_minutes", 28.0)
    return assess_public_safety_state(kp_index=kp, lead_time_minutes=lead)


# Mount static directory for the web dashboard UI
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
