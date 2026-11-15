import unittest
from main import (
    get_system_status,
    get_grid,
    get_storm_timeline,
    get_storm_frame,
    get_live_telemetry,
    get_magnetometer_sample,
    simulate_custom_efield,
    CustomSimulationRequest
)


class TestDirectAPI(unittest.TestCase):

    def test_status(self):
        status = get_system_status()
        self.assertEqual(status["status"], "OPERATIONAL")
        self.assertIn("NASA/NOAA DSCOVR", str(status["active_satellites"]))

    def test_grid(self):
        grid = get_grid()
        self.assertGreaterEqual(len(grid["substations"]), 10)
        self.assertGreaterEqual(len(grid["transmission_lines"]), 10)

    def test_storm_timeline(self):
        timeline_res = get_storm_timeline()
        self.assertIn("timeline", timeline_res)
        self.assertGreater(len(timeline_res["timeline"]), 50)

    def test_storm_frame(self):
        frame = get_storm_frame(780)
        self.assertEqual(frame["minute_index"], 780)
        self.assertIn("dscovr", frame)
        self.assertIn("grid_solution", frame)
        self.assertIn("risk_assessment", frame)
        self.assertGreater(frame["grid_solution"]["max_gic_amps"], 15.0)

    def test_custom_simulation(self):
        req = CustomSimulationRequest(ex_v_km=2.0, ey_v_km=-1.5)
        res = simulate_custom_efield(req)
        self.assertIn("solution", res)
        self.assertAlmostEqual(res["solution"]["sum_ground_currents"], 0.0, places=4)

    def test_hardware_magnetometer(self):
        sample = get_magnetometer_sample()
        self.assertIn("field_microteslas", sample)
        self.assertGreater(sample["field_microteslas"]["total_intensity_f_ut"], 20.0)


if __name__ == '__main__':
    unittest.main()
