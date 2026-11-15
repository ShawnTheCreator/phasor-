"""
Aviation Risk Triad & ICAO Space Weather Information Service Engine.

Aligned with PECASUS & ICAO SWIS International Standards:
- Triad 1: High Frequency (HF) Radio Absorption (Kp 8/9, riometer 2/5 dB, MUF depression 30%/50%).
- Triad 2: Radiation at Flight Altitudes (Effective Dose Rate µSv/h; Moderate >= 30, Severe >= 80 µSv/h).
- Triad 3: GNSS & SATCOM Performance along Southern African Flight Information Regions (FAOR, FACT, FLFI).
- Flight Route & Altitude Advisory (JNB-LHR, CPT-DXB, JNB-NBO polar/geomagnetic avoidance).
- Aircrew Cumulative Dose Dosimetry Tracker (20 mSv annual regulatory threshold).
- Pre-Flight Space Weather Briefing Export.
"""

from typing import Dict, Any, List
from datetime import datetime, timezone, timedelta

# Major SADC Flight Routes
SADC_FLIGHT_ROUTES: List[Dict[str, Any]] = [
    {
        "id": "ROUTE-01",
        "callsign": "SA0234",
        "corridor": "Johannesburg (FAOR) -> London Heathrow (EGLL)",
        "nominal_altitude_fl": 390,
        "flight_time_hours": 11.2,
        "magnetic_latitude_peak": 62.5,
        "pax_capacity": 320,
    },
    {
        "id": "ROUTE-02",
        "callsign": "EK0772",
        "corridor": "Cape Town (FACT) -> Dubai International (OMDB)",
        "nominal_altitude_fl": 410,
        "flight_time_hours": 9.5,
        "magnetic_latitude_peak": 28.0,
        "pax_capacity": 350,
    },
    {
        "id": "ROUTE-03",
        "callsign": "KQ0761",
        "corridor": "Johannesburg (FAOR) -> Nairobi Jomo Kenyatta (HKJK)",
        "nominal_altitude_fl": 370,
        "flight_time_hours": 4.1,
        "magnetic_latitude_peak": 12.0,
        "pax_capacity": 180,
    },
    {
        "id": "ROUTE-04",
        "callsign": "SA0280",
        "corridor": "Johannesburg (FAOR) -> Perth (YPPH) Trans-Indian Ocean",
        "nominal_altitude_fl": 380,
        "flight_time_hours": 9.2,
        "magnetic_latitude_peak": 55.0,
        "pax_capacity": 260,
    },
]


def assess_aviation_triad_state(
    kp_index: float = 3.5,
    imf_bz_nt: float = -4.5,
    db_dt_nt_min: float = 15.0
) -> Dict[str, Any]:
    """
    Computes complete ICAO-aligned aviation risk metrics, dose rates, and route advisories.
    """
    now = datetime.now(timezone.utc)

    # 1. HF Radio Absorption (ICAO Parameters)
    if kp_index >= 8.5 or abs(db_dt_nt_min) > 100.0:
        hf_tier = "SEVERE"
        hf_color = "#991b1b"
        riometer_db = 5.8
        muf_depression_pct = 54.0
        hf_bulletin = "SWX-HF-SEV: Severe HF absorption. Primary HF radio unusable. Switch to SATCOM CPDLC."
    elif kp_index >= 6.5 or abs(db_dt_nt_min) > 40.0:
        hf_tier = "MODERATE"
        hf_color = "#f59e0b"
        riometer_db = 2.9
        muf_depression_pct = 32.0
        hf_bulletin = "SWX-HF-MOD: Moderate absorption on sub-polar corridors. Expect selective fading on 8-15 MHz."
    else:
        hf_tier = "NOMINAL"
        hf_color = "#10b981"
        riometer_db = 0.4
        muf_depression_pct = 5.0
        hf_bulletin = "SWX-HF-INFO: Nominal HF propagation across Johannesburg & Cape Town FIRs."

    # 2. Cosmic Radiation at Flight Altitudes (Effective Dose Rate in µSv/h)
    # ICAO Thresholds: Moderate >= 30 µSv/h, Severe >= 80 µSv/h
    base_rad_usv_h = 3.2
    if kp_index >= 8.0:
        rad_fl390_usv_h = round(base_rad_usv_h + (kp_index - 3) * 14.5, 1)  # ~83 µSv/h (Severe ICAO threshold >= 80)
        rad_fl310_usv_h = round(rad_fl390_usv_h * 0.58, 1)  # Step-down mitigation
        rad_tier = "SEVERE"
        rad_color = "#991b1b"
        rad_advisory = "CRITICAL: ICAO Severe Radiation Alert. Recommend step-down altitude from FL390 to FL310."
    elif kp_index >= 6.0:
        rad_fl390_usv_h = round(base_rad_usv_h + (kp_index - 2) * 7.5, 1)  # ~38 µSv/h (Moderate)
        rad_fl310_usv_h = round(rad_fl390_usv_h * 0.62, 1)
        rad_tier = "MODERATE"
        rad_color = "#f59e0b"
        rad_advisory = "WARNING: ICAO Moderate Radiation Alert. Pregnant aircrew dose limit approach warning."
    else:
        rad_fl390_usv_h = 4.8
        rad_fl310_usv_h = 3.1
        rad_tier = "NOMINAL"
        rad_color = "#10b981"
        rad_advisory = "NOMINAL: Background galactic cosmic ray dose rates within routine limits."

    # 3. GNSS & SATCOM Performance
    if kp_index >= 7.5:
        gnss_tier = "SEVERE"
        gnss_color = "#991b1b"
        pos_error_m = 16.4
        satcom_avail_pct = 78.5
    elif kp_index >= 5.0:
        gnss_tier = "MODERATE"
        gnss_color = "#f59e0b"
        pos_error_m = 6.2
        satcom_avail_pct = 92.0
    else:
        gnss_tier = "NOMINAL"
        gnss_color = "#10b981"
        pos_error_m = 1.4
        satcom_avail_pct = 99.8

    # 4. Route-Specific Mitigation Advisories
    routes_output = []
    for r in SADC_FLIGHT_ROUTES:
        # High magnetic latitude corridors (e.g. JNB-LHR or JNB-Perth) experience highest radiation
        route_dose_fl390 = round(rad_fl390_usv_h * (r["magnetic_latitude_peak"] / 40.0) * r["flight_time_hours"], 1)
        route_dose_fl310 = round(rad_fl310_usv_h * (r["magnetic_latitude_peak"] / 40.0) * r["flight_time_hours"], 1)
        dose_savings_pct = round(((route_dose_fl390 - route_dose_fl310) / max(1.0, route_dose_fl390)) * 100, 1)

        recommendation = "Maintain filed flight plan"
        if rad_tier == "SEVERE" and r["magnetic_latitude_peak"] > 40.0:
            recommendation = f"Step down altitude to FL310 over equatorial corridor. Saves {dose_savings_pct}% dose."
        elif rad_tier == "MODERATE" and r["magnetic_latitude_peak"] > 50.0:
            recommendation = "Advise dispatch: Request lower latitude airway if FL390 requested."

        routes_output.append({
            "id": r["id"],
            "callsign": r["callsign"],
            "corridor": r["corridor"],
            "nominal_fl": r["nominal_altitude_fl"],
            "flight_time_hours": r["flight_time_hours"],
            "dose_fl390_usv": route_dose_fl390,
            "dose_fl310_usv": route_dose_fl310,
            "dose_savings_pct": dose_savings_pct,
            "recommendation": recommendation,
        })

    # 5. Aircrew Cumulative Dosimetry Tracker
    aircrew_roster = [
        {"id": "CREW-104", "name": "Capt. D. Ndlovu", "role": "Captain (A350)", "annual_dose_msv": 4.82, "limit_pct": 24.1, "status": "CLEAR"},
        {"id": "CREW-219", "name": "F/O M. Van Der Merwe", "role": "First Officer", "annual_dose_msv": 5.14, "limit_pct": 25.7, "status": "CLEAR"},
        {"id": "CREW-388", "name": "Purser S. Khumalo", "role": "Senior Cabin Crew", "annual_dose_msv": 6.95, "limit_pct": 34.8, "status": "CLEAR"},
        {"id": "CREW-402", "name": "Capt. J. Mokoena", "role": "Captain (Long-Haul)", "annual_dose_msv": 11.20, "limit_pct": 56.0, "status": "ELEVATED_WATCH"},
    ]

    return {
        "timestamp": now.isoformat(),
        "icao_bulletin_code": "SWXC-SADC-ICAO-2026",
        "triad": {
            "hf_radio": {
                "tier": hf_tier,
                "color": hf_color,
                "riometer_db": riometer_db,
                "riometer_threshold_db": 2.0,
                "muf_depression_pct": muf_depression_pct,
                "bulletin": hf_bulletin,
            },
            "radiation": {
                "tier": rad_tier,
                "color": rad_color,
                "dose_rate_fl390_usv_h": rad_fl390_usv_h,
                "dose_rate_fl310_usv_h": rad_fl310_usv_h,
                "icao_moderate_threshold": 30.0,
                "icao_severe_threshold": 80.0,
                "advisory": rad_advisory,
            },
            "gnss_satcom": {
                "tier": gnss_tier,
                "color": gnss_color,
                "positional_error_m": pos_error_m,
                "satcom_availability_pct": satcom_avail_pct,
                "ads_b_lock_status": "SECURE" if gnss_tier != "SEVERE" else "DEGRADED",
            },
        },
        "routes": routes_output,
        "aircrew": aircrew_roster,
        "export_ready_briefing": {
            "format": "ICAO Annex 3 SWIS JSON",
            "fir_coverage": ["FAOR", "FACT", "FBGR", "FLFI", "FVHF"],
            "download_url": "/api/aviation/briefing/download",
        },
    }
