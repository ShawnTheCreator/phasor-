"""
Unit tests for SADC Multi-Hazard Operational Engines.
Covers:
1. GNSS Scintillation & S4 risk tiers
2. Health System Resilience & Hospital GIC overlay
3. Aviation Risk Triad (ICAO SWIS standards)
4. SADC & SAPP Grid Interconnection & Loss-of-Life
5. Satellite Drag & Orbital Decay
6. Public Safety & Infrastructure Dependencies
"""

import unittest
from engine.gnss_scintillation import compute_gnss_scintillation_state, SADC_GNSS_STATIONS
from engine.health_resilience import assess_health_resilience_state, SADC_HOSPITAL_INFRASTRUCTURE
from engine.aviation_triad import assess_aviation_triad_state, SADC_FLIGHT_ROUTES
from engine.sadc_grid import compute_sadc_grid_state, SAPP_SUBSTATIONS
from engine.satellite_drag import assess_satellite_drag_state, MONITORED_LEO_FLEET
from engine.public_safety import assess_public_safety_state, CRITICAL_INFRASTRUCTURE_NODES


class TestSADCMultiHazardEngines(unittest.TestCase):

    def test_gnss_scintillation_quiet_vs_storm(self):
        # Quiet conditions
        quiet = compute_gnss_scintillation_state(kp_index=1.5, imf_bz_nt=1.0)
        self.assertIn(quiet["overall_tier"], ["LOW", "MODERATE"])
        self.assertFalse(quiet["sms_dispatch"]["recommended"])

        # G5 Storm conditions
        storm = compute_gnss_scintillation_state(kp_index=9.0, imf_bz_nt=-28.0)
        self.assertEqual(storm["overall_tier"], "SEVERE")
        self.assertTrue(storm["sms_dispatch"]["recommended"])
        self.assertGreaterEqual(storm["max_s4"], 0.50)
        self.assertEqual(len(storm["stations"]), len(SADC_GNSS_STATIONS))
        self.assertEqual(len(storm["epb_forecast"]), 3)

    def test_health_resilience_multipliers(self):
        quiet = assess_health_resilience_state(kp_index=2.0, db_dt_nt_min=5.0)
        self.assertEqual(quiet["stroke_risk_multiplier"], 1.0)
        self.assertEqual(quiet["cardiac_risk_multiplier"], 1.0)

        storm = assess_health_resilience_state(kp_index=8.5, db_dt_nt_min=120.0)
        self.assertGreater(storm["stroke_risk_multiplier"], 1.4)
        self.assertGreater(storm["cardiac_risk_multiplier"], 1.8)
        self.assertEqual(storm["surge_tier"], "CRITICAL SURGE")
        self.assertGreater(storm["at_risk_hospitals_count"], 0)
        self.assertEqual(len(storm["readiness_checklist"]), 4)

    def test_aviation_triad_icao_thresholds(self):
        quiet = assess_aviation_triad_state(kp_index=2.0)
        self.assertEqual(quiet["triad"]["hf_radio"]["tier"], "NOMINAL")
        self.assertEqual(quiet["triad"]["radiation"]["tier"], "NOMINAL")

        storm = assess_aviation_triad_state(kp_index=8.5, db_dt_nt_min=110.0)
        self.assertEqual(storm["triad"]["hf_radio"]["tier"], "SEVERE")
        self.assertEqual(storm["triad"]["radiation"]["tier"], "SEVERE")
        self.assertGreaterEqual(storm["triad"]["radiation"]["dose_rate_fl390_usv_h"], 80.0)
        self.assertEqual(len(storm["routes"]), len(SADC_FLIGHT_ROUTES))
        self.assertTrue(len(storm["aircrew"]) > 0)

    def test_sadc_grid_loss_of_life(self):
        grid = compute_sadc_grid_state(ex_v_km=1.2, ey_v_km=-0.9, storm_duration_hours=6.0)
        self.assertGreater(grid["total_sapp_q_loss_mvar"], 0)
        self.assertEqual(len(grid["substations"]), len(SAPP_SUBSTATIONS))
        for s in grid["substations"]:
            self.assertIn("cumulative_loss_of_life_pct", s)
            self.assertIn("has_neutral_blocking", s)
        self.assertTrue(len(grid["rerouting_advisories"]) > 0)

    def test_satellite_drag_decay_curves(self):
        drag = assess_satellite_drag_state(f107_sfu=210.0, kp_index=7.0, ap_index=80.0)
        self.assertEqual(len(drag["rolling_14_day_forecast"]), 14)
        self.assertEqual(len(drag["satellites"]), len(MONITORED_LEO_FLEET))
        self.assertEqual(drag["conjunction_bubble_km"], 3.5)
        for sat in drag["satellites"]:
            self.assertEqual(len(sat["decay_curve"]), 8)
            self.assertGreater(sat["seven_day_altitude_loss_m"], 0)

    def test_public_safety_briefings(self):
        safety = assess_public_safety_state(kp_index=8.5, lead_time_minutes=35.0)
        self.assertEqual(safety["severity"], "SEVERE")
        self.assertIn("SEVERE", safety["headline"])
        self.assertEqual(len(safety["critical_infrastructure_dependencies"]), len(CRITICAL_INFRASTRUCTURE_NODES))
        self.assertTrue(len(safety["emergency_checklist"]) > 0)


if __name__ == "__main__":
    unittest.main()
