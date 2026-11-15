"""
SANSA & Regional Geomagnetic Observatory Metadata (Southern Africa).

These observatories supply 1-second to 1-minute vector geomagnetic field
telemetry (Bx, By, Bz, and total intensity F) to INTERMAGNET and the SANSA
Space Weather Regional Warning Centre (RWC Africa).
"""

from typing import Dict, Any

SANSA_OBSERVATORIES: Dict[str, Dict[str, Any]] = {
    "HER": {
        "code": "HER",
        "name": "Hermanus Magnetic Observatory",
        "operator": "South African National Space Agency (SANSA)",
        "latitude": -34.425,
        "longitude": 19.225,
        "elevation_m": 26,
        "craton_region": "karoo",
        "description": "SANSA Space Science Directorate & Africa Regional Warning Centre (RWC)."
    },
    "STH": {
        "code": "STH",
        "name": "Sutherland Observatory",
        "operator": "SANSA / SAAO",
        "latitude": -32.383,
        "longitude": 20.812,
        "elevation_m": 1798,
        "craton_region": "karoo",
        "description": "High-altitude Karoo observatory co-located with astronomical facilities."
    },
    "HBK": {
        "code": "HBK",
        "name": "Hartebeesthoek Observatory",
        "operator": "SANSA / HartRAO",
        "latitude": -25.882,
        "longitude": 27.707,
        "elevation_m": 1415,
        "craton_region": "kaapvaal",
        "description": "Located within the industrial heartland near Pretoria/Johannesburg."
    },
    "TSU": {
        "code": "TSU",
        "name": "Tsumeb Observatory",
        "operator": "University of Goettingen / Geological Survey of Namibia",
        "latitude": -19.200,
        "longitude": 17.583,
        "elevation_m": 1315,
        "craton_region": "kaapvaal",
        "description": "Northern sub-tropical benchmark for Southern African Power Pool (SAPP)."
    }
}
