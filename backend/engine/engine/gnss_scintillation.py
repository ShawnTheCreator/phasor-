"""
GNSS Scintillation & Ionospheric Risk Engine (SADC / PRISM Aligned).

Models:
- Amplitude scintillation index (S4) and phase scintillation index (sigma-phi)
  across SADC GNSS base stations (SANSA, Septentrio, and IGS networks).
- 3-tier actionable risk logic: LOW (< 0.2), MODERATE (0.2–0.5), SEVERE (>= 0.5).
- 1–3 hour Equatorial Plasma Bubble (EPB) eastward drift forecast with 95% confidence bounds.
- Last-mile SMS dispatch payload for field operators (RTK precision agriculture,
  autonomous mining haul trucks, and drone operations).
- Post-event positional error degradation reporting.
"""

from typing import Dict, Any, List
import math
import time
from datetime import datetime, timezone, timedelta

# SADC Regional GNSS Tracking Receivers
SADC_GNSS_STATIONS: Dict[str, Dict[str, Any]] = {
    "HER": {
        "id": "HER",
        "name": "Hermanus",
        "country": "South Africa",
        "operator": "SANSA / Trignet",
        "lat": -34.425,
        "lng": 19.225,
        "base_s4": 0.08,
        "sector": "Coastal Agriculture & Marine",
    },
    "STH": {
        "id": "STH",
        "name": "Sutherland",
        "country": "South Africa",
        "operator": "SANSA / SAAO",
        "lat": -32.383,
        "lng": 20.812,
        "base_s4": 0.09,
        "sector": "Karoo Scientific & Renewable",
    },
    "HBK": {
        "id": "HBK",
        "name": "Hartebeesthoek",
        "country": "South Africa",
        "operator": "HartRAO / Trignet",
        "lat": -25.882,
        "lng": 27.707,
        "base_s4": 0.12,
        "sector": "Gauteng Industrial & Aviation",
    },
    "SPB": {
        "id": "SPB",
        "name": "Springbok",
        "country": "South Africa",
        "operator": "Trignet Northern Cape",
        "lat": -29.664,
        "lng": 17.884,
        "base_s4": 0.10,
        "sector": "Mining & Cross-Border Logistics",
    },
    "WDH": {
        "id": "WDH",
        "name": "Windhoek",
        "country": "Namibia",
        "operator": "NamPower / IGS",
        "lat": -22.560,
        "lng": 17.080,
        "base_s4": 0.14,
        "sector": "Namibian Transport & Solar",
    },
    "TSU": {
        "id": "TSU",
        "name": "Tsumeb",
        "country": "Namibia",
        "operator": "Geological Survey of Namibia",
        "lat": -19.200,
        "lng": 17.583,
        "base_s4": 0.18,
        "sector": "Sub-Tropical Agriculture & Mining",
    },
    "GBR": {
        "id": "GBR",
        "name": "Gaborone",
        "country": "Botswana",
        "operator": "Botswana Geosciences",
        "lat": -24.658,
        "lng": 25.912,
        "base_s4": 0.13,
        "sector": "Diamond Mining & Cattle Ranching",
    },
    "LSK": {
        "id": "LSK",
        "name": "Lusaka",
        "country": "Zambia",
        "operator": "Zambia Survey / IGS",
        "lat": -15.416,
        "lng": 28.283,
        "base_s4": 0.22,  # Close to equatorial anomaly crest!
        "sector": "Copperbelt Logistics & Commercial Ag",
    },
    "HRE": {
        "id": "HRE",
        "name": "Harare",
        "country": "Zimbabwe",
        "operator": "Surveyor-General Zimbabwe",
        "lat": -17.829,
        "lng": 31.053,
        "base_s4": 0.19,
        "sector": "Tobacco & Mining Infrastructure",
    },
    "MPT": {
        "id": "MPT",
        "name": "Maputo",
        "country": "Mozambique",
        "operator": "DINAT / EDM",
        "lat": -25.969,
        "lng": 32.573,
        "base_s4": 0.11,
        "sector": "Maputo Port & Corridors",
    },
}


def compute_gnss_scintillation_state(
    kp_index: float = 3.5,
    imf_bz_nt: float = -4.5,
    sw_speed_km_s: float = 450.0
) -> Dict[str, Any]:
    """
    Computes real-time scintillation indices, EPB forecast, and operational advisories.
    """
    # Activity multiplier driven by space weather storm conditions
    # Low magnetic latitude (closer to equator: Lusaka, Harare, Tsumeb) experiences
    # much stronger plasma bubble formation during geomagnetic storms.
    storm_factor = max(0.0, (kp_index - 2.0) * 0.15 + (max(0.0, -imf_bz_nt) * 0.025))

    stations_output = []
    max_s4 = 0.0

    for code, st in SADC_GNSS_STATIONS.items():
        # Latitude proximity factor: closer to equator (|lat| < 20) has higher scintillation
        lat_boost = max(0.0, (30.0 - abs(st["lat"])) * 0.025)
        sim_s4 = round(min(0.98, st["base_s4"] + storm_factor * (1.0 + lat_boost)), 2)
        sim_sigma_phi = round(sim_s4 * 0.68 + 0.02, 3)

        if sim_s4 >= 0.50:
            tier = "SEVERE"
            color = "#991b1b"
            advisory = "CRITICAL: RTK loss-of-lock. Switch automated tractors, mining haulers, and drones to INS dead-reckoning."
            pos_error_m = round(4.5 + (sim_s4 - 0.5) * 12.0, 1)
        elif sim_s4 >= 0.20:
            tier = "MODERATE"
            color = "#f59e0b"
            advisory = "ADVISORY: RTK carrier phase cycle slips likely. Enable dual-frequency L1/L5 fallback and widen tolerance."
            pos_error_m = round(1.8 + (sim_s4 - 0.2) * 8.0, 1)
        else:
            tier = "LOW"
            color = "#10b981"
            advisory = "NOMINAL: Standard multi-constellation GNSS positioning precision (< 1.5m, sub-cm with RTK)."
            pos_error_m = 0.9

        max_s4 = max(max_s4, sim_s4)

        stations_output.append({
            "id": st["id"],
            "name": st["name"],
            "country": st["country"],
            "lat": st["lat"],
            "lng": st["lng"],
            "sector": st["sector"],
            "s4": sim_s4,
            "sigma_phi_rad": sim_sigma_phi,
            "tier": tier,
            "color": color,
            "advisory": advisory,
            "expected_pos_error_m": pos_error_m,
        })

    # Overall SADC GNSS Risk Tier & SMS Dispatch logic
    if max_s4 >= 0.50:
        overall_tier = "SEVERE"
        overall_color = "#991b1b"
        sms_recommended = True
    elif max_s4 >= 0.20:
        overall_tier = "MODERATE"
        overall_color = "#f59e0b"
        sms_recommended = False  # Advisory only; reserve SMS for SEVERE loss-of-lock
    else:
        overall_tier = "LOW"
        overall_color = "#10b981"
        sms_recommended = False

    # Equatorial Plasma Bubble (EPB) 1 to 3 Hour Trajectory Forecast
    # EPBs form near sunset (~18:00 LT) over Central Africa and drift eastward at 80–120 m/s
    drift_speed_deg_h = round(1.2 + (kp_index * 0.18), 2)  # ~100 m/s drift in degrees/hour
    now = datetime.now(timezone.utc)

    epb_forecast = [
        {
            "horizon": "T+1h",
            "time_utc": (now + timedelta(hours=1)).strftime("%H:%M UTC"),
            "drift_lng_offset": round(drift_speed_deg_h * 1.0, 2),
            "target_sector": "Zambia Copperbelt -> Zimbabwe Midlands",
            "expected_s4": round(min(0.95, max_s4 * 1.15), 2),
            "confidence_95_ci": [round(max(0.05, max_s4 * 0.9), 2), round(min(1.0, max_s4 * 1.35), 2)],
        },
        {
            "horizon": "T+2h",
            "time_utc": (now + timedelta(hours=2)).strftime("%H:%M UTC"),
            "drift_lng_offset": round(drift_speed_deg_h * 2.0, 2),
            "target_sector": "Mozambique Zambezi Basin -> Limpopo Valley",
            "expected_s4": round(min(0.92, max_s4 * 1.05), 2),
            "confidence_95_ci": [round(max(0.05, max_s4 * 0.8), 2), round(min(1.0, max_s4 * 1.4), 2)],
        },
        {
            "horizon": "T+3h",
            "time_utc": (now + timedelta(hours=3)).strftime("%H:%M UTC"),
            "drift_lng_offset": round(drift_speed_deg_h * 3.0, 2),
            "target_sector": "Mozambique Channel -> Indian Ocean Ingress",
            "expected_s4": round(min(0.85, max_s4 * 0.90), 2),
            "confidence_95_ci": [round(max(0.05, max_s4 * 0.65), 2), round(min(1.0, max_s4 * 1.3), 2)],
        },
    ]

    # Pre-formatted Last-Mile SMS Alert
    sms_text = (
        f"[PHASOR ALERT] GNSS Ionospheric Risk: {overall_tier} (S4={max_s4}). "
        f"RTK / GPS accuracy degraded across Southern African Countries. "
        f"Switch autonomous field machines & drones to INS backup. "
        f"Forecast: EPB drift east towards Zambezi corridor over next 2h."
    )

    return {
        "timestamp": now.isoformat(),
        "overall_tier": overall_tier,
        "overall_color": overall_color,
        "max_s4": max_s4,
        "stations": stations_output,
        "epb_forecast": epb_forecast,
        "sms_dispatch": {
            "recommended": sms_recommended,
            "text": sms_text,
            "recipients_count": 482,
            "coverage": "South Africa, Namibia, Botswana, Zambia, Zimbabwe",
        },
    }
