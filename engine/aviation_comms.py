"""
Aviation & Communications Space Weather Impact Engine.

Models:
- High Frequency (HF) Radio Absorption (NOAA R-Scale / D-Region Absorption)
- GNSS / GPS Positioning Accuracy Error & L-Band Scintillation (S4 Index)
- ICAO Space Weather Bulletin Status for Johannesburg (FAOR) & Cape Town (FACT) Flight Information Regions (FIRs)
- Mirroring SANSA's role as one of four ICAO-designated global space-weather centres.
"""

from typing import Dict, Any


def assess_aviation_comms_impact(
    kp_index: float,
    sw_speed_km_s: float,
    imf_bz_nt: float,
    db_dt_nt_min: float
) -> Dict[str, Any]:
    """
    Computes aviation and satellite communication degradation indices.
    """
    # 1. HF Radio Absorption (R-Scale equivalent proxy from geomagnetic perturbation)
    if kp_index >= 8.5 or abs(db_dt_nt_min) > 120.0:
        hf_status = "BLACKOUT"
        hf_color = "#991b1b"
        hf_r_scale = "R3 - Strong"
        hf_desc = "Complete HF radio blackout on dayside aviation routes across Southern Africa (10–30 MHz degraded)."
    elif kp_index >= 7.0 or abs(db_dt_nt_min) > 60.0:
        hf_status = "DEGRADED"
        hf_color = "#ea580c"
        hf_r_scale = "R2 - Moderate"
        hf_desc = "Sporadic HF radio communication loss; trans-oceanic routes to Australia & South America affected."
    elif kp_index >= 5.0 or abs(db_dt_nt_min) > 25.0:
        hf_status = "ADVISORY"
        hf_color = "#f59e0b"
        hf_r_scale = "R1 - Minor"
        hf_desc = "Weak degradation of high-frequency radio signal signal-to-noise ratio."
    else:
        hf_status = "NOMINAL"
        hf_color = "#10b981"
        hf_r_scale = "R0 - Quiet"
        hf_desc = "Standard HF radio propagation across Johannesburg & Cape Town FIR airspace."

    # 2. GNSS Positioning Error & Scintillation (Total Electron Content Units - TECU)
    # Equatorial and auroral ionospheric bubbles produce scintillation on GPS L1/L2/L5
    base_error_m = 1.8
    if kp_index >= 8.0:
        gnss_error_m = round(base_error_m + (kp_index - 4) * 3.8, 1)
        s4_index = 0.82  # Severe scintillation
        gnss_status = "CRITICAL DEGRADATION"
        gnss_color = "#991b1b"
        gnss_desc = f"Positioning accuracy degraded to ~{gnss_error_m}m. RTK survey loss-of-lock. Aviation ADS-B timing drift."
    elif kp_index >= 6.0:
        gnss_error_m = round(base_error_m + (kp_index - 3) * 1.9, 1)
        s4_index = 0.55  # Moderate scintillation
        gnss_status = "MODERATE ERROR"
        gnss_color = "#ea580c"
        gnss_desc = f"Single-frequency GPS positioning error expanded to ~{gnss_error_m}m."
    elif kp_index >= 4.0:
        gnss_error_m = round(base_error_m + (kp_index - 2) * 0.8, 1)
        s4_index = 0.28  # Mild scintillation
        gnss_status = "ADVISORY"
        gnss_color = "#f59e0b"
        gnss_desc = f"Minor ionospheric delay variations (~{gnss_error_m}m positioning uncertainty)."
    else:
        gnss_error_m = 1.8
        s4_index = 0.12  # Nominal
        gnss_status = "NOMINAL"
        gnss_color = "#10b981"
        gnss_desc = "Nominal GNSS positioning accuracy (< 2.0m) and WAAS/EGNOS/SBAS differential lock."

    # 3. ICAO Space Weather Bulletin Status
    if kp_index >= 7.0:
        icao_bulletin = "WARNING"
        icao_code = "SWXC-WRNG"
        icao_msg = "ICAO SPACE WEATHER WARNING: GNSS & HF COMMS MODERATE TO SEVERE DEGRADATION IN EFFECT FOR FAOR & FACT FIRS."
    elif kp_index >= 5.0:
        icao_bulletin = "ADVISORY"
        icao_code = "SWXC-ADVS"
        icao_msg = "ICAO SPACE WEATHER ADVISORY: HF COMMS AND GNSS SLIGHT DEGRADATION FOR HIGHER LATITUDES IN FACT FIR."
    else:
        icao_bulletin = "ALL_CLEAR"
        icao_code = "SWXC-INFO"
        icao_msg = "ICAO SPACE WEATHER BULLETIN: NORMAL OPERATIONAL STATE FOR ALL FLIGHT INFORMATION REGIONS."

    return {
        "hf_radio": {
            "status": hf_status,
            "color": hf_color,
            "noaa_scale": hf_r_scale,
            "description": hf_desc,
            "frequency_band_impacted": "3 - 30 MHz"
        },
        "gnss_positioning": {
            "status": gnss_status,
            "color": gnss_color,
            "positioning_error_meters": gnss_error_m,
            "scintillation_s4_index": s4_index,
            "description": gnss_desc,
            "satcom_l_band_margin_db": round(max(0.5, 12.0 - s4_index * 8.0), 1)
        },
        "icao_bulletin": {
            "bulletin_level": icao_bulletin,
            "bulletin_code": icao_code,
            "affected_firs": ["FAOR (Johannesburg)", "FACT (Cape Town)"],
            "official_text": icao_msg,
            "designated_centre": "SANSA Space Science Hermanus (ICAO Global Space Weather Centre)"
        }
    }
