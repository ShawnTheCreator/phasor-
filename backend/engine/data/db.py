"""
MongoDB Database Connector & Persistence Layer for Phasor.

Handles:
- Automatic connection to local or remote MongoDB (via MONGO_URI).
- Resilient fallback with auto-reconnect when MongoDB becomes available.
- Collections:
    - telemetry_stream: live NASA/DSCOVR and SANSA ground sensor frames.
    - operational_directives: NTCC dispatcher directives and action notes.
    - grid_substations: substation topology and live GIC amplitudes.
    - storm_events: historical catalog and replay frames.
"""

import os
import time
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

import os
import time
import re
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

try:
    from pymongo import MongoClient, ASCENDING, DESCENDING
    from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
    PYMONGO_AVAILABLE = True
except ImportError:
    PYMONGO_AVAILABLE = False
    MongoClient = None

MONGO_URI = os.getenv("MONGODB_URI") or os.getenv("MONGO_URI") or "mongodb://127.0.0.1:27017"
MONGO_DB_NAME = os.getenv("MONGODB_DB_NAME") or os.getenv("MONGO_DB_NAME") or "phasor"


class MongoManager:
    def __init__(self, uri: str = MONGO_URI, db_name: str = MONGO_DB_NAME):
        self.uri = uri
        self.db_name = db_name
        self.client: Optional[Any] = None
        self.db: Optional[Any] = None
        self.is_connected = False
        self.last_error = ""
        self._last_connect_attempt = 0.0
        self._connect_cooldown_sec = 10.0

        # Fallback local in-memory store for directives when MongoDB is offline
        self.fallback_directives: List[Dict[str, Any]] = [
            {
                "_id": "dir_1",
                "title": "Deploy Static VAR Compensators at Perseus",
                "description": "Mitigate reactive power loss (Q_loss: 22.5 MVAR) caused by half-cycle core saturation along the 765 kV transmission backbone.",
                "checked": True,
                "created_at": "2026-11-14T12:00:00Z"
            },
            {
                "_id": "dir_2",
                "title": "Monitor Transformer Dissolved Gas Analysis (DGA)",
                "description": "Inspect Hydra and Koeberg 765kV/400kV transformer banks for core tank hot-spot heating and harmonic vibration.",
                "checked": True,
                "created_at": "2026-11-14T12:15:00Z"
            },
            {
                "_id": "dir_3",
                "title": "Verify Ground Magnetometer Telemetry (SANSA HER)",
                "description": "Confirm rate of change dB/dt exceeding 100 nT/min on local Raspberry Pi RM3100 sensor and Hermanus regional baseline.",
                "checked": True,
                "created_at": "2026-11-14T12:30:00Z"
            },
            {
                "_id": "dir_4",
                "title": "Eskom NTCC Dispatcher Coordination Protocol",
                "description": "Actionable operational directive reviewed with certified electrician for high-voltage substation switching safety.",
                "checked": False,
                "created_at": "2026-11-14T13:00:00Z"
            }
        ]

        # Fallback local alerts for Feature 5 (Alert Engine & Acknowledge Workflow)
        self.fallback_alerts: List[Dict[str, Any]] = [
            {
                "_id": "alt_1",
                "region_id": "REG_KAAPVAAL",
                "region_name": "Kaapvaal Craton (Highveld)",
                "level": "CRITICAL",
                "trigger_metric": "Geoelectric Field Proxy",
                "trigger_value": "1,840 mV/km (Threshold: 800 mV/km)",
                "recommended_action": "Defer non-essential 765 kV line switching. Place Perseus SVC on maximum reactive power support.",
                "status": "UNACKNOWLEDGED",
                "acknowledged_by": None,
                "acknowledged_at": None,
                "dispatcher_notes": "",
                "created_at": "2026-11-14T14:10:00Z"
            },
            {
                "_id": "alt_2",
                "region_id": "REG_KAROO",
                "region_name": "Karoo Central Basin (Hydra-Beta)",
                "level": "WATCH",
                "trigger_metric": "Transformer Neutral GIC",
                "trigger_value": "26.8 A (Threshold: 20 A)",
                "recommended_action": "Inspect Hydra 765/400 kV transformer bank DGA metrics and oil temperature.",
                "status": "ACKNOWLEDGED",
                "acknowledged_by": "Lukas Juarez (Hydra Dispatch)",
                "acknowledged_at": "2026-11-14T14:22:00Z",
                "dispatcher_notes": "Corridor switching held. Shunt reactors engaged on Beta intertie.",
                "created_at": "2026-11-14T14:15:00Z"
            },
            {
                "_id": "alt_3",
                "region_id": "REG_CAPE_FOLD",
                "region_name": "Cape Fold Belt (Koeberg Nuclear)",
                "level": "ADVISORY",
                "trigger_metric": "Ground dB/dt (SANSA HER)",
                "trigger_value": "94 nT/min (Threshold: 60 nT/min)",
                "recommended_action": "Notify Koeberg Control Room to monitor Generator Step-Up (GSU) excitation.",
                "status": "UNACKNOWLEDGED",
                "acknowledged_by": None,
                "acknowledged_at": None,
                "dispatcher_notes": "",
                "created_at": "2026-11-14T14:30:00Z"
            }
        ]

        # Dispatch log for mock SMS / Email notifications
        self.fallback_dispatch_log: List[Dict[str, Any]] = [
            {
                "_id": "disp_1",
                "channel": "SMS",
                "recipient": "+27 82 555 0192 (Eskom NTCC Shift Sup)",
                "message": "[PHASOR ALERT] CRITICAL: Kaapvaal geoelectric field 1,840 mV/km. G5 conditions imminent.",
                "dispatched_at": "2026-11-14T14:10:05Z",
                "status": "DELIVERED"
            },
            {
                "_id": "disp_2",
                "channel": "EMAIL",
                "recipient": "eskom-ntcc-shift@eskom.co.za",
                "message": "[PHASOR BULLETIN] WATCH: Hydra 765kV Neutral GIC 26.8 A. Q_loss ~22.5 MVAR projected.",
                "dispatched_at": "2026-11-14T14:15:12Z",
                "status": "DELIVERED"
            },
            {
                "_id": "disp_3",
                "channel": "EMAIL",
                "recipient": "sansa-spaceweather@sansa.org.za",
                "message": "[PHASOR BULLETIN] ADVISORY: SANSA Hermanus ground dB/dt reached 94 nT/min.",
                "dispatched_at": "2026-11-14T14:30:02Z",
                "status": "DELIVERED"
            }
        ]

        self.connect()

    def _mask_uri(self, uri_str: str) -> str:
        """Hides passwords in connection string for safe UI presentation."""
        # Clean out localhost references to clean IP or masked string
        cleaned = uri_str.replace("localhost", "127.0.0.1")
        return re.sub(r'://([^:]+):([^@]+)@', r'://\1:••••••••@', cleaned)

    def reconfigure(self, uri: str, db_name: Optional[str] = None) -> bool:
        """Dynamically reconfigures MongoDB connection parameters and reconnects."""
        if uri and uri.strip():
            self.uri = uri.strip()
        if db_name and db_name.strip():
            self.db_name = db_name.strip()
        self._last_connect_attempt = 0.0
        return self.connect()

    def connect(self) -> bool:
        """Attempts to establish connection to MongoDB with a short non-blocking timeout."""
        if not PYMONGO_AVAILABLE:
            self.is_connected = False
            self.last_error = "pymongo package not available"
            return False

        now = time.time()
        self._last_connect_attempt = now

        # Cleanly close previous client if any
        if self.client is not None:
            try:
                self.client.close()
            except Exception:
                pass
            self.client = None

        try:
            # 800ms server selection timeout for snappy check without blocking server
            self.client = MongoClient(self.uri, serverSelectionTimeoutMS=800)
            self.client.admin.command('ping')
            self.db = self.client[self.db_name]
            self.is_connected = True
            self.last_error = ""

            # Ensure indexes on telemetry and directives
            self.db.telemetry_stream.create_index([("timestamp", DESCENDING)])
            self.db.operational_directives.create_index([("created_at", DESCENDING)])

            # Seed default directives if collection is empty
            if self.db.operational_directives.count_documents({}) == 0:
                self.db.operational_directives.insert_many(self.fallback_directives)

            print(f"[MongoDB] Successfully connected to {self._mask_uri(self.uri)} (Database: {self.db_name})")
            return True
        except Exception as e:
            self.is_connected = False
            self.last_error = str(e)
            if self.client is not None:
                try:
                    self.client.close()
                except Exception:
                    pass
                self.client = None
            return False

    def check_connection(self) -> Dict[str, Any]:
        """Returns live connection status and document metrics with cooldown protection."""
        now = time.time()
        if not self.is_connected and (now - self._last_connect_attempt > self._connect_cooldown_sec):
            self.connect()

        telemetry_count = 0
        directives_count = len(self.fallback_directives)

        if self.is_connected and self.db is not None:
            try:
                telemetry_count = self.db.telemetry_stream.count_documents({})
                directives_count = self.db.operational_directives.count_documents({})
            except Exception:
                self.is_connected = False

        masked_uri = self._mask_uri(self.uri)
        return {
            "is_connected": self.is_connected,
            "uri": masked_uri,
            "database": self.db_name,
            "status_label": "CONNECTED" if self.is_connected else "READY_FOR_CONNECTION",
            "message": f"Connected to MongoDB ({self.db_name})" if self.is_connected else f"Ready to connect to MongoDB ({masked_uri})",
            "telemetry_records_count": telemetry_count,
            "directives_count": directives_count
        }

    def save_telemetry_frame(self, frame: Dict[str, Any]) -> bool:
        """Persists a live space-weather and GIC frame to MongoDB."""
        now = time.time()
        if not self.is_connected and (now - self._last_connect_attempt > self._connect_cooldown_sec):
            self.connect()

        if self.is_connected and self.db is not None:
            try:
                doc = dict(frame)
                doc["_ingested_at"] = datetime.now(timezone.utc).isoformat()
                self.db.telemetry_stream.insert_one(doc)
                return True
            except Exception as e:
                self.last_error = str(e)
                return False
        return False

    def get_directives(self) -> List[Dict[str, Any]]:
        """Retrieves operational directives from MongoDB or fallback store."""
        now = time.time()
        if not self.is_connected and (now - self._last_connect_attempt > self._connect_cooldown_sec):
            self.connect()

        if self.is_connected and self.db is not None:
            try:
                cursor = self.db.operational_directives.find().sort("created_at", DESCENDING)
                directives = []
                for doc in cursor:
                    doc["_id"] = str(doc["_id"])
                    directives.append(doc)
                return directives
            except Exception:
                pass
        return self.fallback_directives

    def add_directive(self, title: str, description: str = "") -> Dict[str, Any]:
        """Inserts a new operational directive into MongoDB."""
        now_str = datetime.now(timezone.utc).isoformat()
        new_doc = {
            "title": title,
            "description": description or "Logged by Dispatcher &bull; Synchronized with Eskom NTCC & SANSA RWC.",
            "checked": True,
            "created_at": now_str
        }

        now = time.time()
        if not self.is_connected and (now - self._last_connect_attempt > self._connect_cooldown_sec):
            self.connect()

        if self.is_connected and self.db is not None:
            try:
                res = self.db.operational_directives.insert_one(new_doc)
                new_doc["_id"] = str(res.inserted_id)
                return new_doc
            except Exception as e:
                self.last_error = str(e)

        # Fallback local in-memory store
        new_doc["_id"] = f"dir_{int(time.time())}"
        self.fallback_directives.insert(0, new_doc)
        return new_doc

    def toggle_directive(self, directive_id: str, checked: bool) -> bool:
        """Updates directive checked status in MongoDB."""
        now = time.time()
        if not self.is_connected and (now - self._last_connect_attempt > self._connect_cooldown_sec):
            self.connect()

        if self.is_connected and self.db is not None:
            try:
                from bson.objectid import ObjectId
                try:
                    obj_id = ObjectId(directive_id)
                    self.db.operational_directives.update_one({"_id": obj_id}, {"$set": {"checked": checked}})
                except Exception:
                    self.db.operational_directives.update_one({"_id": directive_id}, {"$set": {"checked": checked}})
                return True
            except Exception:
                pass

        for d in self.fallback_directives:
            if d["_id"] == directive_id:
                d["checked"] = checked
                return True
        return False

    # Feature 5: Alert Engine & Acknowledge Workflow
    def get_alerts(self) -> List[Dict[str, Any]]:
        """Retrieves active space weather and grid alerts."""
        now = time.time()
        if not self.is_connected and (now - self._last_connect_attempt > self._connect_cooldown_sec):
            self.connect()

        if self.is_connected and self.db is not None:
            try:
                cursor = self.db.alerts.find().sort("created_at", DESCENDING)
                alerts = []
                for doc in cursor:
                    doc["_id"] = str(doc["_id"])
                    alerts.append(doc)
                if alerts:
                    return alerts
            except Exception:
                pass
        return self.fallback_alerts

    def acknowledge_alert(self, alert_id: str, dispatcher_notes: str, dispatcher_name: str = "Control Room Dispatcher") -> bool:
        """Marks an alert as acknowledged with operator notes in MongoDB."""
        now_str = datetime.now(timezone.utc).isoformat()
        now = time.time()
        if not self.is_connected and (now - self._last_connect_attempt > self._connect_cooldown_sec):
            self.connect()

        if self.is_connected and self.db is not None:
            try:
                from bson.objectid import ObjectId
                update_fields = {
                    "status": "ACKNOWLEDGED",
                    "acknowledged_by": dispatcher_name,
                    "acknowledged_at": now_str,
                    "dispatcher_notes": dispatcher_notes
                }
                try:
                    obj_id = ObjectId(alert_id)
                    self.db.alerts.update_one({"_id": obj_id}, {"$set": update_fields})
                except Exception:
                    self.db.alerts.update_one({"_id": alert_id}, {"$set": update_fields})
                return True
            except Exception:
                pass

        for alt in self.fallback_alerts:
            if alt["_id"] == alert_id:
                alt["status"] = "ACKNOWLEDGED"
                alt["acknowledged_by"] = dispatcher_name
                alt["acknowledged_at"] = now_str
                alt["dispatcher_notes"] = dispatcher_notes
                return True
        return False

    def add_alert(self, region_id: str, region_name: str, level: str, trigger_metric: str, trigger_value: str, recommended_action: str) -> Dict[str, Any]:
        """Creates a new threshold alert."""
        now_str = datetime.now(timezone.utc).isoformat()
        new_alt = {
            "region_id": region_id,
            "region_name": region_name,
            "level": level,
            "trigger_metric": trigger_metric,
            "trigger_value": trigger_value,
            "recommended_action": recommended_action,
            "status": "UNACKNOWLEDGED",
            "acknowledged_by": None,
            "acknowledged_at": None,
            "dispatcher_notes": "",
            "created_at": now_str
        }

        now = time.time()
        if not self.is_connected and (now - self._last_connect_attempt > self._connect_cooldown_sec):
            self.connect()

        if self.is_connected and self.db is not None:
            try:
                res = self.db.alerts.insert_one(new_alt)
                new_alt["_id"] = str(res.inserted_id)
                return new_alt
            except Exception:
                pass

        new_alt["_id"] = f"alt_{int(time.time())}"
        self.fallback_alerts.insert(0, new_alt)
        return new_alt

    def get_dispatch_log(self) -> List[Dict[str, Any]]:
        """Retrieves SMS and Email mock notification dispatch records."""
        now = time.time()
        if not self.is_connected and (now - self._last_connect_attempt > self._connect_cooldown_sec):
            self.connect()

        if self.is_connected and self.db is not None:
            try:
                cursor = self.db.dispatch_log.find().sort("dispatched_at", DESCENDING)
                logs = []
                for doc in cursor:
                    doc["_id"] = str(doc["_id"])
                    logs.append(doc)
                if logs:
                    return logs
            except Exception:
                pass
        return self.fallback_dispatch_log

    def add_dispatch_entry(self, channel: str, recipient: str, message: str) -> Dict[str, Any]:
        """Logs an SMS / Email alert transmission."""
        now_str = datetime.now(timezone.utc).isoformat()
        entry = {
            "channel": channel.upper(),
            "recipient": recipient,
            "message": message,
            "dispatched_at": now_str,
            "status": "DELIVERED"
        }

        now = time.time()
        if not self.is_connected and (now - self._last_connect_attempt > self._connect_cooldown_sec):
            self.connect()

        if self.is_connected and self.db is not None:
            try:
                res = self.db.dispatch_log.insert_one(entry)
                entry["_id"] = str(res.inserted_id)
                return entry
            except Exception:
                pass

        entry["_id"] = f"disp_{int(time.time())}"
        self.fallback_dispatch_log.insert(0, entry)
        return entry


# Global singleton instance
db_manager = MongoManager()
