"""
Southern African High-Voltage Transmission Network Topology.

Represents the core 400 kV and 765 kV transmission grid of South Africa and
interconnections to the Southern African Power Pool (SAPP).

Substation parameters and transmission line data are based on published Eskom transmission
topologies (Ngwira et al. 2009; Bernhardi et al. 2008; Gaunt & Coetzee 2007).
"""

from typing import Dict, List, NamedTuple, Any
import numpy as np


class Substation(NamedTuple):
    id: str
    name: str
    province: str
    latitude: float
    longitude: float
    voltage_kv: float
    earthing_resistance_ohm: float  # Substation grid grounding resistance (Re)
    transformer_winding_resistance_ohm: float  # Phase winding DC resistance (Rt)
    transformer_type: str  # Auto-transformer, Three-phase bank, or Generator Step-Up (GSU)
    critical_threshold_amps: float  # GIC threshold for severe core saturation


class TransmissionLine(NamedTuple):
    id: str
    name: str
    from_substation: str
    to_substation: str
    voltage_kv: float
    length_km: float
    resistance_ohm_per_km: float  # DC resistance per phase (Ohm/km)
    circuits: int  # Single or double circuit


def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Computes great-circle distance in kilometers between two lat/lon points."""
    r = 6371.0  # Earth radius in km
    phi1 = np.radians(lat1)
    phi2 = np.radians(lat2)
    dphi = np.radians(lat2 - lat1)
    dlambda = np.radians(lon2 - lon1)

    a = np.sin(dphi / 2.0)**2 + np.cos(phi1) * np.cos(phi2) * np.sin(dlambda / 2.0)**2
    c = 2.0 * np.arctan2(np.sqrt(a), np.sqrt(1.0 - a))
    return float(r * c)


# Core High-Voltage Substations
SUBSTATIONS: Dict[str, Substation] = {
    "KENDAL": Substation(
        id="KENDAL",
        name="Kendal Thermal Hub",
        province="Mpumalanga",
        latitude=-26.090,
        longitude=28.970,
        voltage_kv=400.0,
        earthing_resistance_ohm=0.15,
        transformer_winding_resistance_ohm=0.45,
        transformer_type="GSU / 3-Phase Core",
        critical_threshold_amps=25.0
    ),
    "MATIMBA": Substation(
        id="MATIMBA",
        name="Matimba / Lephalale",
        province="Limpopo",
        latitude=-23.668,
        longitude=27.609,
        voltage_kv=400.0,
        earthing_resistance_ohm=0.20,
        transformer_winding_resistance_ohm=0.40,
        transformer_type="GSU / Auto-transformer",
        critical_threshold_amps=25.0
    ),
    "KOEBERG": Substation(
        id="KOEBERG",
        name="Koeberg Nuclear Hub",
        province="Western Cape",
        latitude=-33.677,
        longitude=18.432,
        voltage_kv=400.0,
        earthing_resistance_ohm=0.12,
        transformer_winding_resistance_ohm=0.50,
        transformer_type="GSU / 1-Phase Units Bank",
        critical_threshold_amps=20.0
    ),
    "MAJUBA": Substation(
        id="MAJUBA",
        name="Majuba Power Station",
        province="Mpumalanga",
        latitude=-27.100,
        longitude=29.771,
        voltage_kv=765.0,
        earthing_resistance_ohm=0.18,
        transformer_winding_resistance_ohm=0.35,
        transformer_type="765kV Auto-transformer",
        critical_threshold_amps=30.0
    ),
    "APOLLO": Substation(
        id="APOLLO",
        name="Apollo Converter & Hub",
        province="Gauteng",
        latitude=-25.922,
        longitude=28.281,
        voltage_kv=400.0,
        earthing_resistance_ohm=0.10,
        transformer_winding_resistance_ohm=0.38,
        transformer_type="HVDC / 400kV Auto",
        critical_threshold_amps=25.0
    ),
    "PERSEUS": Substation(
        id="PERSEUS",
        name="Perseus Central Pivot",
        province="Free State",
        latitude=-28.390,
        longitude=26.270,
        voltage_kv=765.0,
        earthing_resistance_ohm=0.14,
        transformer_winding_resistance_ohm=0.30,
        transformer_type="765kV / 400kV Auto Bank",
        critical_threshold_amps=35.0
    ),
    "BETA": Substation(
        id="BETA",
        name="Beta 765kV Super-Grid",
        province="Free State",
        latitude=-28.252,
        longitude=26.650,
        voltage_kv=765.0,
        earthing_resistance_ohm=0.12,
        transformer_winding_resistance_ohm=0.28,
        transformer_type="765kV Inter-tie",
        critical_threshold_amps=35.0
    ),
    "HYDRA": Substation(
        id="HYDRA",
        name="Hydra Junction (De Aar)",
        province="Northern Cape",
        latitude=-30.710,
        longitude=24.030,
        voltage_kv=765.0,
        earthing_resistance_ohm=0.22,
        transformer_winding_resistance_ohm=0.32,
        transformer_type="765kV Karoo Major Cross",
        critical_threshold_amps=28.0
    ),
    "GRASSRIDGE": Substation(
        id="GRASSRIDGE",
        name="Grassridge Coastal",
        province="Eastern Cape",
        latitude=-33.720,
        longitude=25.630,
        voltage_kv=400.0,
        earthing_resistance_ohm=0.25,
        transformer_winding_resistance_ohm=0.48,
        transformer_type="400kV Auto Bank",
        critical_threshold_amps=22.0
    ),
    "BIGHORN": Substation(
        id="BIGHORN",
        name="Bighorn Mining Corridor",
        province="North West",
        latitude=-25.680,
        longitude=27.350,
        voltage_kv=400.0,
        earthing_resistance_ohm=0.18,
        transformer_winding_resistance_ohm=0.42,
        transformer_type="Industrial Step-down",
        critical_threshold_amps=25.0
    ),
    "TUTUKA": Substation(
        id="TUTUKA",
        name="Tutuka Generation",
        province="Mpumalanga",
        latitude=-26.775,
        longitude=29.351,
        voltage_kv=400.0,
        earthing_resistance_ohm=0.16,
        transformer_winding_resistance_ohm=0.44,
        transformer_type="GSU / 400kV",
        critical_threshold_amps=25.0
    ),
    "ARIES": Substation(
        id="ARIES",
        name="Aries Solar Gateway",
        province="Northern Cape",
        latitude=-29.500,
        longitude=21.130,
        voltage_kv=400.0,
        earthing_resistance_ohm=0.30,
        transformer_winding_resistance_ohm=0.45,
        transformer_type="400kV Renewable Link",
        critical_threshold_amps=20.0
    ),
    "KOKERBOOM": Substation(
        id="KOKERBOOM",
        name="Kokerboom (SAPP Namibia)",
        province="Namibia Border",
        latitude=-26.530,
        longitude=18.120,
        voltage_kv=400.0,
        earthing_resistance_ohm=0.35,
        transformer_winding_resistance_ohm=0.55,
        transformer_type="400kV Regional Interconnect",
        critical_threshold_amps=18.0
    )
}

# Major Long-Distance Transmission Corridors
TRANSMISSION_LINES: List[TransmissionLine] = [
    # North-South 765kV Backbone (Highest GIC exposure due to long lines)
    TransmissionLine("L1", "Majuba-Beta 765kV", "MAJUBA", "BETA", 765.0, 335.0, 0.018, 1),
    TransmissionLine("L2", "Beta-Perseus 765kV", "BETA", "PERSEUS", 765.0, 42.0, 0.018, 2),
    TransmissionLine("L3", "Perseus-Hydra 765kV", "PERSEUS", "HYDRA", 765.0, 340.0, 0.018, 1),
    TransmissionLine("L4", "Hydra-Koeberg Corridors", "HYDRA", "KOEBERG", 400.0, 620.0, 0.025, 2),

    # Eastern Cape South Link
    TransmissionLine("L5", "Hydra-Grassridge 400kV", "HYDRA", "GRASSRIDGE", 400.0, 360.0, 0.028, 2),

    # Highveld Generation & Gauteng Load Center
    TransmissionLine("L6", "Kendal-Apollo 400kV", "KENDAL", "APOLLO", 400.0, 75.0, 0.030, 2),
    TransmissionLine("L7", "Tutuka-Majuba 400kV", "TUTUKA", "MAJUBA", 400.0, 55.0, 0.030, 2),
    TransmissionLine("L8", "Tutuka-Kendal 400kV", "TUTUKA", "KENDAL", 400.0, 85.0, 0.030, 2),
    TransmissionLine("L9", "Apollo-Perseus 400kV", "APOLLO", "PERSEUS", 400.0, 340.0, 0.028, 1),

    # Northern & North-West Links
    TransmissionLine("L10", "Matimba-Bighorn 400kV", "MATIMBA", "BIGHORN", 400.0, 230.0, 0.028, 2),
    TransmissionLine("L11", "Bighorn-Apollo 400kV", "BIGHORN", "APOLLO", 400.0, 98.0, 0.030, 2),

    # Western Solar & Namibia Cross-Border Interconnection
    TransmissionLine("L12", "Hydra-Aries 400kV", "HYDRA", "ARIES", 400.0, 320.0, 0.030, 1),
    TransmissionLine("L13", "Aries-Kokerboom 400kV", "ARIES", "KOKERBOOM", 400.0, 440.0, 0.032, 1),
]


def get_grid_summary() -> Dict[str, Any]:
    """Returns a serializable dictionary of the network topology."""
    return {
        "substations": [
            {
                "id": s.id,
                "name": s.name,
                "province": s.province,
                "latitude": s.latitude,
                "longitude": s.longitude,
                "voltage_kv": s.voltage_kv,
                "earthing_resistance_ohm": s.earthing_resistance_ohm,
                "transformer_type": s.transformer_type,
                "critical_threshold_amps": s.critical_threshold_amps
            }
            for s in SUBSTATIONS.values()
        ],
        "transmission_lines": [
            {
                "id": l.id,
                "name": l.name,
                "from_substation": l.from_substation,
                "to_substation": l.to_substation,
                "voltage_kv": l.voltage_kv,
                "length_km": l.length_km,
                "resistance_ohm_per_km": l.resistance_ohm_per_km,
                "circuits": l.circuits
            }
            for l in TRANSMISSION_LINES
        ]
    }
