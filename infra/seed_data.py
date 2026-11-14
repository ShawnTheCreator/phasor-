#!/usr/bin/env python3
"""
Seed MongoDB database with real NASA Space Apps 2026 data:
- May 10-12, 2024 'Gannon' G5 Superstorm (1,440 1-minute samples)
- South African High-Voltage Substation & Transformer Assets
- Operational Directives & Active Baseline Alerts
"""

import os
import json
import sys
from pathlib import Path

try:
    from pymongo import MongoClient
except ImportError:
    print("Warning: pymongo not installed. Install with `pip install pymongo` to seed live MongoDB.")
    sys.exit(0)

MONGO_URI = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017/phasor_spaceweather")
DB_NAME = "phasor_spaceweather"

ROOT_DIR = Path(__file__).resolve().parent.parent
STORM_FILE = ROOT_DIR / "data" / "may_2024_g5_storm.json"

TRANSFORMERS = [
    {
        "id": "TX_HYDRA_765_01",
        "substation_id": "SUB_HYDRA",
        "name": "Hydra 765/400 kV Single-Phase Bank 1",
        "province": "Northern Cape",
        "voltage_kv": 765,
        "mva_rating": 800,
        "core_design": "Single-phase shell-form",
        "age_years": 38,
        "geomagnetic_lat_deg": -32.5,
        "neutral_resistance_ohms": 0.25,
        "critical_gic_amps": 18.0,
        "base_vulnerability_score": 92,
        "mitigation_equipment": "Neutral blocking device proposed (NERC Tier 1)"
    },
    {
        "id": "TX_PERSEUS_765_01",
        "substation_id": "SUB_PERSEUS",
        "name": "Perseus 765/400 kV Step-Up Autotransformer",
        "province": "Free State",
        "voltage_kv": 765,
        "mva_rating": 1000,
        "core_design": "5-limb core-form",
        "age_years": 42,
        "geomagnetic_lat_deg": -28.2,
        "neutral_resistance_ohms": 0.31,
        "critical_gic_amps": 22.0,
        "base_vulnerability_score": 88,
        "mitigation_equipment": "Perseus Static Var Compensator (+250 MVAR)"
    },
    {
        "id": "TX_ARIADNE_400_01",
        "substation_id": "SUB_ARIADNE",
        "name": "Ariadne 400/132 kV Grid Intertie",
        "province": "KwaZulu-Natal",
        "voltage_kv": 400,
        "mva_rating": 500,
        "core_design": "3-limb core-form",
        "age_years": 26,
        "geomagnetic_lat_deg": -29.8,
        "neutral_resistance_ohms": 0.45,
        "critical_gic_amps": 35.0,
        "base_vulnerability_score": 64,
        "mitigation_equipment": "Standard neutral grounding reactor"
    },
    {
        "id": "TX_KOEBERG_400_01",
        "substation_id": "SUB_KOEBERG",
        "name": "Koeberg Unit 1 Generator Step-Up (GSU)",
        "province": "Western Cape",
        "voltage_kv": 400,
        "mva_rating": 1100,
        "core_design": "Single-phase shell-form",
        "age_years": 40,
        "geomagnetic_lat_deg": -33.6,
        "neutral_resistance_ohms": 0.18,
        "critical_gic_amps": 20.0,
        "base_vulnerability_score": 90,
        "mitigation_equipment": "Dedicated neutral DC current monitor + gas detector"
    }
]

OPERATIONAL_DIRECTIVES = [
    {
        "id": "dir-1",
        "title": "Cancel Scheduled 765 kV Line Maintenance",
        "description": "Keep all parallel corridors in service to maximize network admittance and lower per-phase GIC flow.",
        "checked": True,
        "criticality": "HIGH"
    },
    {
        "id": "dir-2",
        "title": "Dispatch Max Dynamic Reactive Power (SVC / Statcom)",
        "description": "Pre-position Perseus and Hermes Static Var Compensators in automatic voltage control mode to offset Q-loss.",
        "checked": True,
        "criticality": "CRITICAL"
    },
    {
        "id": "dir-3",
        "title": "Constrain High-Vulnerability Transformer Real Loading",
        "description": "Back off Hydra and Beta 765/400 kV autotransformers to <=75% nominal MVA to preserve thermal margin under half-cycle saturation.",
        "checked": False,
        "criticality": "CRITICAL"
    },
    {
        "id": "dir-4",
        "title": "Alert SADC Intertie Coordinators (Motraco / ZESA)",
        "description": "Issue regional space weather advisory to neighboring Southern African power pools via bilateral dispatch channels.",
        "checked": False,
        "criticality": "MEDIUM"
    }
]


def seed():
    print(f"[Seed] Connecting to MongoDB: {MONGO_URI}")
    try:
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=4000)
        client.admin.command('ping')
        db = client[DB_NAME]
        print("[Seed] Successfully connected to MongoDB!")

        # 1. Seed Transformer Assets
        db.transformer_assets.drop()
        db.transformer_assets.insert_many(TRANSFORMERS)
        print(f"[Seed] Inserted {len(TRANSFORMERS)} high-voltage transformer assets.")

        # 2. Seed Operational Directives
        db.operational_directives.drop()
        db.operational_directives.insert_many(OPERATIONAL_DIRECTIVES)
        print(f"[Seed] Inserted {len(OPERATIONAL_DIRECTIVES)} operational grid directives.")

        # 3. Seed Storm Catalog
        if STORM_FILE.exists():
            with open(STORM_FILE, "r", encoding="utf-8") as f:
                storm_data = json.load(f)
                records = storm_data.get("records", [])
                db.storm_catalog.drop()
                db.storm_catalog.insert_one({
                    "event_name": storm_data.get("event_name"),
                    "description": storm_data.get("description"),
                    "start_time": storm_data.get("start_time"),
                    "end_time": storm_data.get("end_time"),
                    "total_records": len(records)
                })
                print(f"[Seed] Loaded storm catalog: {storm_data.get('event_name')} ({len(records)} records)")
        else:
            print(f"[Seed] Notice: {STORM_FILE} not found; skipping storm seed.")

        print("[Seed] Completed database initialization successfully.")
    except Exception as e:
        print(f"[Seed] Error or MongoDB not reachable: {e}")


if __name__ == "__main__":
    seed()
