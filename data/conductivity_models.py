"""
Regional Earth Conductivity & Lithospheric Resistivity Models.

References:
- Ngwira, C. M., McKinnell, L. A., Cilliers, P. J., & Gaunt, C. T. (2009).
  Modeling geomagnetically induced currents in the South African electric power network.
  Space Weather, 7(10), S10004.
- Bernhardi, E. H., Cilliers, P. J., & Gaunt, C. T. (2008).
  Improvement in the modeling of geomagnetically induced currents in Southern Africa.
  South African Journal of Science.
"""

from typing import List, Dict, NamedTuple


class EarthLayer(NamedTuple):
    thickness_km: float  # Thickness in kilometers (0.0 or inf for bottom half-space)
    resistivity_ohm_m: float  # Resistivity in Ohm-meters (rho = 1 / sigma)


class RegionalConductivityModel:
    def __init__(self, name: str, description: str, layers: List[EarthLayer]):
        self.name = name
        self.description = description
        self.layers = layers

    def to_dict(self) -> Dict:
        return {
            "name": self.name,
            "description": self.description,
            "layers": [
                {"thickness_km": l.thickness_km, "resistivity_ohm_m": l.resistivity_ohm_m}
                for l in self.layers
            ]
        }


# Standard 3-layer model for Southern African Kaapvaal Craton (Ngwira et al., 2009)
KAAPVAAL_CRATON_MODEL = RegionalConductivityModel(
    name="Kaapvaal Craton (Resistive Shield)",
    description="Precambrian crystalline shield underlying Gauteng, Mpumalanga, Limpopo and Free State. "
                "High resistivity causes enhanced geoelectric field induction.",
    layers=[
        EarthLayer(thickness_km=10.0, resistivity_ohm_m=2000.0),   # Upper weathered crust
        EarthLayer(thickness_km=30.0, resistivity_ohm_m=10000.0),  # Granitic Archean basement
        EarthLayer(thickness_km=0.0, resistivity_ohm_m=100.0),     # Conductive upper mantle
    ]
)

# Karoo Basin Model (sedimentary cover over resistive bedrock)
KAROO_BASIN_MODEL = RegionalConductivityModel(
    name="Karoo Basin (Sedimentary / Dolerite)",
    description="Thick sedimentary sequences in Eastern/Western/Northern Cape overlaying resistive basement.",
    layers=[
        EarthLayer(thickness_km=5.0, resistivity_ohm_m=250.0),     # Karoo Supergroup sediments
        EarthLayer(thickness_km=25.0, resistivity_ohm_m=4000.0),   # Mid-crust
        EarthLayer(thickness_km=0.0, resistivity_ohm_m=80.0),      # Upper mantle
    ]
)

# Regional Models for Feature 2: Regional Geoelectric Risk Map of South Africa
CAPE_FOLD_BELT_MODEL = RegionalConductivityModel(
    name="Cape Fold Belt / Western Cape",
    description="Folded marine sandstones & shales with coastal salt-water boundary. Hosts Koeberg Nuclear Station.",
    layers=[
        EarthLayer(thickness_km=4.0, resistivity_ohm_m=350.0),
        EarthLayer(thickness_km=22.0, resistivity_ohm_m=2500.0),
        EarthLayer(thickness_km=0.0, resistivity_ohm_m=60.0),
    ]
)

BUSHVELD_COMPLEX_MODEL = RegionalConductivityModel(
    name="Bushveld Complex (Northern)",
    description="World's largest layered ultramafic igneous intrusion. High mineral content in Limpopo/Mpumalanga.",
    layers=[
        EarthLayer(thickness_km=8.0, resistivity_ohm_m=1200.0),
        EarthLayer(thickness_km=28.0, resistivity_ohm_m=6000.0),
        EarthLayer(thickness_km=0.0, resistivity_ohm_m=120.0),
    ]
)

KWAZULU_NATAL_COAST_MODEL = RegionalConductivityModel(
    name="KwaZulu-Natal Marine Corridor",
    description="Coastal marine sedimentary zone with intense coast-effect enhancement perpendicular to coastline.",
    layers=[
        EarthLayer(thickness_km=3.0, resistivity_ohm_m=180.0),
        EarthLayer(thickness_km=20.0, resistivity_ohm_m=1800.0),
        EarthLayer(thickness_km=0.0, resistivity_ohm_m=50.0),
    ]
)

NAMAQUALAND_TERRANE_MODEL = RegionalConductivityModel(
    name="Namaqualand Metamorphic Terrane",
    description="Proterozoic granulite-facies metamorphic complex with anomalous subsurface conductivity anomalies.",
    layers=[
        EarthLayer(thickness_km=6.0, resistivity_ohm_m=1600.0),
        EarthLayer(thickness_km=26.0, resistivity_ohm_m=8000.0),
        EarthLayer(thickness_km=0.0, resistivity_ohm_m=90.0),
    ]
)

EASTERN_CAPE_ALBANY_MODEL = RegionalConductivityModel(
    name="Eastern Cape / Albany Belt",
    description="Transitional sedimentary and metamorphic belt between Karoo basin and Indian Ocean shoreline.",
    layers=[
        EarthLayer(thickness_km=5.0, resistivity_ohm_m=500.0),
        EarthLayer(thickness_km=24.0, resistivity_ohm_m=3200.0),
        EarthLayer(thickness_km=0.0, resistivity_ohm_m=75.0),
    ]
)

# Uniform 1000 Ohm-m reference model (Quebec / standard test comparison)
UNIFORM_1000_MODEL = RegionalConductivityModel(
    name="Standard Uniform Halfspace (1000 Ohm-m)",
    description="Standard benchmark uniform conductivity model for comparative validation.",
    layers=[
        EarthLayer(thickness_km=0.0, resistivity_ohm_m=1000.0),
    ]
)

REGIONAL_MODELS = {
    "kaapvaal": KAAPVAAL_CRATON_MODEL,
    "karoo": KAROO_BASIN_MODEL,
    "cape_fold": CAPE_FOLD_BELT_MODEL,
    "bushveld": BUSHVELD_COMPLEX_MODEL,
    "kzn_coast": KWAZULU_NATAL_COAST_MODEL,
    "namaqualand": NAMAQUALAND_TERRANE_MODEL,
    "eastern_cape": EASTERN_CAPE_ALBANY_MODEL,
    "uniform_1000": UNIFORM_1000_MODEL
}

# 7 Operational Grid Regions for Feature 2 Map
SOUTH_AFRICA_REGIONS = [
    {
        "id": "REG_KAAPVAAL",
        "name": "Kaapvaal Craton (Highveld)",
        "model_key": "kaapvaal",
        "provinces": ["Gauteng", "Mpumalanga", "Free State North"],
        "lat_center": -26.2,
        "lon_center": 28.5,
        "effective_resistivity_ohm_m": 2500.0,
        "primary_substations": ["MAJUBA", "TUTUKA", "KENDAL", "APOLLO", "LETHABO"],
        "corridor_voltage_kv": 765,
        "threshold_mv_km": 800.0,
        "vulnerability_rationale": "Extremely resistive Archean granite shield induces 3x higher geoelectric fields."
    },
    {
        "id": "REG_KAROO",
        "name": "Karoo Central Basin",
        "model_key": "karoo",
        "provinces": ["Northern Cape South", "Free State South"],
        "lat_center": -30.6,
        "lon_center": 24.0,
        "effective_resistivity_ohm_m": 850.0,
        "primary_substations": ["HYDRA", "PERSEUS", "BETA"],
        "corridor_voltage_kv": 765,
        "threshold_mv_km": 600.0,
        "vulnerability_rationale": "Longest 765 kV transmission lines in Africa connect across this basin."
    },
    {
        "id": "REG_CAPE_FOLD",
        "name": "Cape Fold Belt & Western Coast",
        "model_key": "cape_fold",
        "provinces": ["Western Cape"],
        "lat_center": -33.5,
        "lon_center": 19.0,
        "effective_resistivity_ohm_m": 450.0,
        "primary_substations": ["KOEBERG", "DROERIVIER", "MULDERSRVLEI"],
        "corridor_voltage_kv": 400,
        "threshold_mv_km": 400.0,
        "vulnerability_rationale": "Koeberg Nuclear Station GSU transformers critical for Cape power supply."
    },
    {
        "id": "REG_BUSHVELD",
        "name": "Bushveld Complex (North)",
        "model_key": "bushveld",
        "provinces": ["Limpopo", "North West"],
        "lat_center": -24.0,
        "lon_center": 27.5,
        "effective_resistivity_ohm_m": 1200.0,
        "primary_substations": ["MATIMBA", "MEDUPI", "BIGHORN"],
        "corridor_voltage_kv": 400,
        "threshold_mv_km": 500.0,
        "vulnerability_rationale": "Concentration of direct coal-fired base-load generation hubs."
    },
    {
        "id": "REG_KZN",
        "name": "KwaZulu-Natal Marine Coastal Belt",
        "model_key": "kzn_coast",
        "provinces": ["KwaZulu-Natal"],
        "lat_center": -29.2,
        "lon_center": 31.0,
        "effective_resistivity_ohm_m": 280.0,
        "primary_substations": ["CAMDEN", "INGULA", "CHICHELEY"],
        "corridor_voltage_kv": 400,
        "threshold_mv_km": 350.0,
        "vulnerability_rationale": "Severe coastal boundary effect orthogonal to coastline enhances current ingress."
    },
    {
        "id": "REG_NAMAQUA",
        "name": "Namaqualand & Northern Intertie",
        "model_key": "namaqualand",
        "provinces": ["Northern Cape North"],
        "lat_center": -29.0,
        "lon_center": 18.5,
        "effective_resistivity_ohm_m": 1600.0,
        "primary_substations": ["ARIES", "HELIOS", "KUDU_INTERTIE"],
        "corridor_voltage_kv": 400,
        "threshold_mv_km": 550.0,
        "vulnerability_rationale": "SAPP cross-border intertie with high solar PV and transmission corridor length."
    },
    {
        "id": "REG_EASTERN_CAPE",
        "name": "Eastern Cape / Albany Intertie",
        "model_key": "eastern_cape",
        "provinces": ["Eastern Cape"],
        "lat_center": -33.2,
        "lon_center": 26.0,
        "effective_resistivity_ohm_m": 520.0,
        "primary_substations": ["GRASSRIDGE", "POSEIDON", "NEPTUNE"],
        "corridor_voltage_kv": 400,
        "threshold_mv_km": 420.0,
        "vulnerability_rationale": "Terminal end of southern transmission corridor supplying heavy automotive manufacturing."
    }
]
