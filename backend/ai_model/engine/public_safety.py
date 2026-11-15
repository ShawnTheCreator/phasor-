"""
Public Safety & Emergency Management View Engine.

Models:
- Plain-language non-technical public advisory generator for citizens, municipalities,
  and civil protection agencies.
- Critical-Infrastructure Dependency Map:
    Transmission Grid Substations -> Water Pumping Stations (Rand Water, Umgeni Water)
    -> Telecommunication Cellular Hubs -> Emergency Dispatch Control Rooms.
- Resource Pre-Positioning Checklist for municipal disaster management directors.
"""

from typing import Dict, Any, List
from datetime import datetime, timezone

# SADC Critical Infrastructure Dependencies
CRITICAL_INFRASTRUCTURE_NODES: List[Dict[str, Any]] = [
    {
        "id": "INFRA-01",
        "name": "Rand Water Zuikerbosch Pumping Station",
        "sector": "Municipal Water Supply",
        "serves_population": "11 Million (Gauteng)",
        "feeding_substation": "Eikenhof Main 400kV",
        "backup_power_hours": 18,
        "vulnerability": "Pumping failure within 18h if 400kV feeder trips.",
    },
    {
        "id": "INFRA-02",
        "name": "Umgeni Water Wiggins Treatment Plant",
        "sector": "Potable Water & Sanitation",
        "serves_population": "3.5 Million (eThekwini Durban)",
        "feeding_substation": "Georgedale Main 400kV",
        "backup_power_hours": 24,
        "vulnerability": "Water pressure loss across eThekwini coastal basin.",
    },
    {
        "id": "INFRA-03",
        "name": "Vodacom Midrand Data Centre & Core Switch",
        "sector": "Telecommunications & Cellular",
        "serves_population": "45 Million SADC subscribers",
        "feeding_substation": "Hartebeesthoek 400kV",
        "backup_power_hours": 48,
        "vulnerability": "Voice & emergency 112 / 10111 routing resilience.",
    },
    {
        "id": "INFRA-04",
        "name": "Cape Town Water Resilience Atlantis Aquifer",
        "sector": "Groundwater Extraction",
        "serves_population": "4.6 Million (Cape Town)",
        "feeding_substation": "Koeberg / Acacia 400kV",
        "backup_power_hours": 36,
        "vulnerability": "Groundwater pump shutdown if Western Cape grid separates.",
    },
]


def assess_public_safety_state(
    kp_index: float = 3.5,
    lead_time_minutes: float = 28.0
) -> Dict[str, Any]:
    """
    Generates non-technical explainable briefings and disaster management checklists.
    """
    now = datetime.now(timezone.utc)

    # 1. Plain-Language Public Advisory
    if kp_index >= 8.0:
        headline = "SEVERE SPACE WEATHER WARNING: Strong Solar Storm Shock Front Approaching"
        plain_desc = (
            f"A major coronal mass ejection from the Sun is scheduled to reach Earth in approximately {int(lead_time_minutes)} minutes. "
            "High-voltage electrical networks across Southern Africa are on high alert. "
            "Citizens may experience temporary GPS navigation errors (up to 15 meters) and intermittent cellular data slowdowns. "
            "Municipal water and medical emergency services have activated backup protocols. "
            "Action: Charge personal electronic devices, keep medical equipment batteries fully loaded, and avoid precision GPS-dependent outdoor operations."
        )
        severity = "SEVERE"
        color = "#991b1b"
    elif kp_index >= 6.0:
        headline = "MODERATE SPACE WEATHER ADVISORY: Geomagnetic Disturbance Expected"
        plain_desc = (
            f"Solar wind disturbance arriving in ~{int(lead_time_minutes)} minutes. Power grids remain stable under active monitoring. "
            "Drone pilots and survey teams should anticipate GPS drift. Routine domestic activities remain unaffected."
        )
        severity = "MODERATE"
        color = "#f59e0b"
    else:
        headline = "SPACE WEATHER ALL-CLEAR: Nominal Space Environment"
        plain_desc = "Solar wind parameters are quiet. All electrical grids, satellites, GPS, and communication systems are operating normally across Southern Africa."
        severity = "NOMINAL"
        color = "#10b981"

    # 2. Resource Pre-Positioning Checklist for Emergency Managers
    checklist = [
        {
            "item": "Pre-Position Mobile Diesel Generators at High-Priority Water Pump Stations",
            "agency": "Provincial Disaster Management Centres (PDMC)",
            "priority": "HIGH",
            "status": "READY",
        },
        {
            "item": "Verify Satellite Phone (Iridium/Inmarsat) Communication with Emergency 112 Centres",
            "agency": "Emergency Medical Services (EMS)",
            "priority": "HIGH",
            "status": "VERIFIED",
        },
        {
            "item": "Broadcast Plain-Language Civil Protection Advisory via SABC Radio & SMS",
            "agency": "National Disaster Management Centre (NDMC)",
            "priority": "MEDIUM",
            "status": "SCHEDULED" if kp_index >= 6.0 else "STANDBY",
        },
    ]

    return {
        "timestamp": now.isoformat(),
        "headline": headline,
        "plain_description": plain_desc,
        "severity": severity,
        "color": color,
        "lead_time_minutes": lead_time_minutes,
        "critical_infrastructure_dependencies": CRITICAL_INFRASTRUCTURE_NODES,
        "emergency_checklist": checklist,
    }
