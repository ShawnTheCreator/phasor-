"""
Satellite Drag & Low Earth Orbit (LEO) Orbital Decay Engine.

Models:
- 14-day rolling solar drag forecast (Solar Radio Flux F10.7, Planetary Ap, and Kp).
- Per-satellite 7-day altitude-loss curve using atmospheric drag formula:
    Fd = 0.5 * rho * v^2 * Cd * A
- SADC & African Earth Observation Satellites (e.g. ZA-Cube, EOSAT-1, SumbandilaSat)
  plus commercial mega-constellations (Starlink, OneWeb).
- Fleet risk map: altitude vs. atmospheric drag regime.
- Collision-avoidance conjunction safety bubble adjustment.
"""

from typing import Dict, Any, List
from datetime import datetime, timezone, timedelta
import math

# African & Commercial LEO Satellites
MONITORED_LEO_FLEET: List[Dict[str, Any]] = [
    {
        "id": "SAT-01",
        "name": "ZACube-2 (SANSA Nanosatellite)",
        "operator": "SANSA / CPUT",
        "norad_id": 43907,
        "nominal_altitude_km": 490,
        "mass_kg": 4.0,
        "drag_area_m2": 0.03,
        "cd": 2.2,
        "mission": "Marine Automatic Identification (AIS) & Fire Tracking",
    },
    {
        "id": "SAT-02",
        "name": "EOSAT-1 (African Resource Mgmt)",
        "operator": "SANSA",
        "norad_id": 98412,
        "nominal_altitude_km": 520,
        "mass_kg": 180.0,
        "drag_area_m2": 1.45,
        "cd": 2.1,
        "mission": "High-Resolution Agriculture & Drought Earth Observation",
    },
    {
        "id": "SAT-03",
        "name": "Starlink-3129 (LEO Broadband)",
        "operator": "SpaceX",
        "norad_id": 51920,
        "nominal_altitude_km": 540,
        "mass_kg": 260.0,
        "drag_area_m2": 2.20,
        "cd": 2.0,
        "mission": "Global Low-Latency Internet",
    },
    {
        "id": "SAT-04",
        "name": "International Space Station (ISS)",
        "operator": "NASA / International",
        "norad_id": 25544,
        "nominal_altitude_km": 418,
        "mass_kg": 450000.0,
        "drag_area_m2": 2500.0,
        "cd": 2.1,
        "mission": "Crewed Orbital Laboratory",
    },
]


def assess_satellite_drag_state(
    f107_sfu: float = 175.0,
    kp_index: float = 4.0,
    ap_index: float = 32.0
) -> Dict[str, Any]:
    """
    Computes thermospheric density, 14-day rolling solar indices,
    per-satellite decay curves, and collision avoidance bubble adjustments.
    """
    now = datetime.now(timezone.utc)

    # 1. 14-Day Rolling Forecast of F10.7, Kp, and Ap
    rolling_forecast = []
    base_f107 = f107_sfu
    base_kp = kp_index

    for day in range(14):
        # Forecast wave simulating solar active region rotation (27-day solar synodic period)
        phase = (day / 27.0) * 2 * math.pi
        sim_f107 = round(base_f107 + math.sin(phase) * 28.0 + (day * 0.8), 1)
        sim_kp = round(max(1.0, min(9.0, base_kp + math.sin(phase * 1.5) * 1.8)), 1)
        sim_ap = round(sim_kp * 7.5, 0)

        if sim_f107 >= 200.0 or sim_kp >= 6.0:
            tier = "CRITICAL DRAG"
            color = "#991b1b"
        elif sim_f107 >= 160.0 or sim_kp >= 4.0:
            tier = "ELEVATED"
            color = "#f59e0b"
        else:
            tier = "NOMINAL"
            color = "#10b981"

        rolling_forecast.append({
            "day": day + 1,
            "date": (now + timedelta(days=day)).strftime("%b %d"),
            "f107_sfu": sim_f107,
            "kp": sim_kp,
            "ap": sim_ap,
            "tier": tier,
            "color": color,
        })

    # 2. Per-Satellite 7-Day Altitude-Loss Prediction (NRLMSISE-00 density proxy)
    # rho_0 at 500 km ~ 1.0e-12 kg/m^3. Swells up to 5x-10x during G4/G5 storms.
    thermospheric_density_factor = 1.0 + (f107_sfu / 100.0) * 0.8 + (kp_index / 3.0) * 1.4

    satellites_output = []
    for sat in MONITORED_LEO_FLEET:
        # Orbital velocity at altitude: v = sqrt(mu / (R_e + h))
        r_orbit = 6371.0 + sat["nominal_altitude_km"]
        v_orbit_ms = math.sqrt(3.986e14 / (r_orbit * 1000.0))  # ~7600 m/s

        # Base atmospheric density scale height model: rho = rho_ref * exp(-(h - h_ref)/H)
        h_diff = sat["nominal_altitude_km"] - 400.0
        scale_height_km = 55.0
        base_rho = 2.8e-12 * math.exp(-h_diff / scale_height_km)
        active_rho = base_rho * thermospheric_density_factor

        # Drag acceleration: a_drag = 0.5 * rho * v^2 * (Cd * A / m)
        ballistic_coeff = (sat["cd"] * sat["drag_area_m2"]) / sat["mass_kg"]
        a_drag = 0.5 * active_rho * (v_orbit_ms**2) * ballistic_coeff  # m/s^2

        # 7-day altitude loss: dh/dt = -2 * a_drag * r / v
        dh_dt_m_per_day = abs(2.0 * a_drag * (r_orbit * 1000.0) / v_orbit_ms) * 86400.0
        seven_day_loss_m = round(dh_dt_m_per_day * 7.0, 1)

        # Generate 7-day decay trajectory curve
        decay_curve = []
        for d in range(8):
            loss = round(dh_dt_m_per_day * d, 1)
            decay_curve.append({
                "day": d,
                "altitude_km": round(sat["nominal_altitude_km"] - (loss / 1000.0), 3),
                "cumulative_drop_m": loss,
            })

        satellites_output.append({
            "id": sat["id"],
            "name": sat["name"],
            "operator": sat["operator"],
            "norad_id": sat["norad_id"],
            "nominal_altitude_km": sat["nominal_altitude_km"],
            "seven_day_altitude_loss_m": seven_day_loss_m,
            "mission": sat["mission"],
            "decay_curve": decay_curve,
            "requires_orbit_raise": seven_day_loss_m > 350.0,
        })

    # 3. Collision-Avoidance Bubble Adjustment
    if kp_index >= 6.0:
        conjunction_bubble_km = 3.5  # Widen to 3.5 km due to high drag ephemeris uncertainty
        bubble_status = "EXPANDED_CAUTION"
        bubble_advisory = "High atmospheric density uncertainty detected. Widen conjunction assessment safety bubble from 1.0 km to 3.5 km to prevent collision false alarms."
    elif kp_index >= 4.0:
        conjunction_bubble_km = 2.0
        bubble_status = "ADVISORY"
        bubble_advisory = "Moderate drag expansion. Expand conjunction bubble to 2.0 km."
    else:
        conjunction_bubble_km = 1.0
        bubble_status = "STANDARD"
        bubble_advisory = "Nominal atmospheric drag. Standard 1.0 km conjunction screening bubble in effect."

    return {
        "timestamp": now.isoformat(),
        "thermospheric_density_factor": round(thermospheric_density_factor, 2),
        "conjunction_bubble_km": conjunction_bubble_km,
        "bubble_status": bubble_status,
        "bubble_advisory": bubble_advisory,
        "rolling_14_day_forecast": rolling_forecast,
        "satellites": satellites_output,
    }
