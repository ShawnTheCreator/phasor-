"""
Tests for MongoDB Data Layer & Dynamic Live Space Weather Feed.
"""

import unittest
from data.db import MongoManager
from data.live_feed_service import LiveSpaceWeatherFeed
from main import (
    get_database_status,
    get_operational_directives,
    add_operational_directive,
    toggle_operational_directive,
    DirectiveRequest,
    DirectiveToggleRequest,
    get_live_telemetry
)


class TestMongoAndLiveFeed(unittest.TestCase):

    def setUp(self):
        self.db = MongoManager()
        self.feed = LiveSpaceWeatherFeed()

    def test_database_status_contract(self):
        status = get_database_status()
        self.assertIn("is_connected", status)
        self.assertIn("uri", status)
        self.assertIn("database", status)
        self.assertIn(status["status_label"], ["CONNECTED", "READY_FOR_CONNECTION"])

    def test_directives_crud_operations(self):
        # 1. Fetch directives
        directives_res = get_operational_directives()
        self.assertIn("directives", directives_res)
        initial_count = len(directives_res["directives"])
        self.assertGreaterEqual(initial_count, 1)

        # 2. Add directive
        req = DirectiveRequest(title="Emergency Islanding Test", description="Isolate 400kV corridor during extreme storm.")
        add_res = add_operational_directive(req)
        self.assertEqual(add_res["status"], "SUCCESS")
        self.assertEqual(add_res["directive"]["title"], "Emergency Islanding Test")

        # 3. Toggle directive
        dir_id = add_res["directive"]["_id"]
        toggle_res = toggle_operational_directive(dir_id, DirectiveToggleRequest(checked=False))
        self.assertEqual(toggle_res["status"], "SUCCESS")

    def test_live_feed_dynamic_frame(self):
        frame = get_live_telemetry()
        self.assertIn("timestamp", frame)
        self.assertIn("dscovr", frame)
        self.assertIn("grid_solution", frame)
        self.assertIn("risk_assessment", frame)

        # Check DSCOVR solar wind fields
        dscovr = frame["dscovr"]
        self.assertGreater(dscovr["solar_wind_speed_km_s"], 200.0)
        self.assertGreater(dscovr["early_warning_lead_time_minutes"], 10.0)

        # GIC solution verification
        sol = frame["grid_solution"]
        self.assertGreaterEqual(sol["max_gic_amps"], 0.0)
        self.assertAlmostEqual(sol["sum_ground_currents"], 0.0, places=4)


if __name__ == '__main__':
    unittest.main()
