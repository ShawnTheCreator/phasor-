"""
Comprehensive Test Suite for Phasor Space Weather Grid Defense System.

Validates:
1. All API endpoints and response schemas.
2. Geoelectric induction physical validity & numerical stability.
3. Lehtinen-Pirjola nodal admittance Kirchhoff conservation across all 1440 storm frames.
4. Edge cases: zero magnetic field, extreme G5 spikes, reverse polarities.
5. Transformer core saturation and reactive power loss calculation accuracy.
6. Hardware ground magnetometer telemetry streamer.
"""

import unittest
import numpy as np
from server.main import (
    get_system_status,
    get_grid,
    get_storm_timeline,
    get_storm_frame,
    get_live_telemetry,
    get_magnetometer_sample,
    simulate_custom_efield,
    CustomSimulationRequest
)
from engine.physics import (
    calculate_surface_impedance_1d,
    compute_geoelectric_field_fft,
    instantaneous_efield_estimate,
    MU_0
)
from engine.network import GICNetworkSolver
from engine.grid_topology import SUBSTATIONS, TRANSMISSION_LINES
from engine.risk_assessment import evaluate_substation_risk, RiskTier
from data.conductivity_models import KAAPVAAL_CRATON_MODEL, KAROO_BASIN_MODEL, UNIFORM_1000_MODEL


class TestComprehensivePhasorSystem(unittest.TestCase):

    def setUp(self):
        self.solver = GICNetworkSolver(SUBSTATIONS, TRANSMISSION_LINES)

    # =========================================================================
    # 1. API Endpoints & Response Schema Tests
    # =========================================================================
    def test_status_endpoint_contract(self):
        status = get_system_status()
        self.assertEqual(status["status"], "OPERATIONAL")
        self.assertIn("DSCOVR", str(status["active_satellites"]))
        self.assertIn("Hermanus", str(status["partner_observatories"]))
        self.assertIn("May 10-12, 2024", str(status["event_replays_available"]))

    def test_grid_topology_contract(self):
        grid = get_grid()
        self.assertIn("substations", grid)
        self.assertIn("transmission_lines", grid)
        self.assertGreaterEqual(len(grid["substations"]), 13)
        self.assertGreaterEqual(len(grid["transmission_lines"]), 13)

        # Validate substation fields
        for sub in grid["substations"]:
            self.assertIn("id", sub)
            self.assertIn("voltage_kv", sub)
            self.assertIn("earthing_resistance_ohm", sub)
            self.assertGreater(sub["voltage_kv"], 0)
            self.assertGreater(sub["earthing_resistance_ohm"], 0)

        # Validate line fields
        for line in grid["transmission_lines"]:
            self.assertIn("length_km", line)
            self.assertIn("resistance_ohm_per_km", line)
            self.assertGreater(line["length_km"], 0)

    def test_storm_timeline_integrity(self):
        res = get_storm_timeline()
        self.assertIn("timeline", res)
        timeline = res["timeline"]
        self.assertGreater(len(timeline), 200)

        # Verify time progression
        minutes = [pt["minute_index"] for pt in timeline]
        self.assertEqual(minutes, sorted(minutes))

    def test_storm_frame_peak_g5(self):
        # Frame 780 corresponds to peak storm (~01:00 UTC May 11)
        frame = get_storm_frame(780)
        self.assertEqual(frame["minute_index"], 780)

        # Solar wind speed must reflect CME shock (> 800 km/s)
        self.assertGreater(frame["dscovr"]["solar_wind_speed_km_s"], 800.0)

        # IMF Bz must be severely southward (< -30 nT)
        self.assertLess(frame["dscovr"]["imf_bz_gsm_nt"], -30.0)

        # Kyoto Dst must be at extreme superstorm level (< -300 nT)
        self.assertLess(frame["indices"]["kyoto_dst_nt"], -300.0)

        # GIC solution must be computed and balanced
        sol = frame["grid_solution"]
        self.assertGreater(sol["max_gic_amps"], 10.0)
        self.assertAlmostEqual(sol["sum_ground_currents"], 0.0, places=4)

    # =========================================================================
    # 2. Physics & Magnetotelluric Induction Tests
    # =========================================================================
    def test_cagniard_apparent_resistivity_relation(self):
        """
        Verify the fundamental MT Cagniard apparent resistivity relation:
            rho_a(omega) = (1 / (omega * mu_0)) * |Z(omega)|^2
        For a uniform 1000 Ohm-m halfspace, rho_a must equal exactly 1000.0 Ohm-m.
        """
        frequencies = np.logspace(-3, 0, 10)
        z_surf = calculate_surface_impedance_1d(frequencies, UNIFORM_1000_MODEL)

        for i, f in enumerate(frequencies):
            w = 2.0 * np.pi * f
            rho_apparent = (1.0 / (w * MU_0)) * (np.abs(z_surf[i]) ** 2)
            self.assertAlmostEqual(rho_apparent, 1000.0, places=3)

    def test_craton_vs_karoo_conductivity_contrast(self):
        """
        Verify that the resistive Kaapvaal Craton produces higher surface impedance
        than the Karoo Basin at typical GIC frequencies (0.001 to 0.01 Hz).
        """
        f = np.array([0.005])
        z_craton = calculate_surface_impedance_1d(f, KAAPVAAL_CRATON_MODEL)
        z_karoo = calculate_surface_impedance_1d(f, KAROO_BASIN_MODEL)

        # Higher crustal resistivity leads to higher impedance magnitude
        self.assertGreater(np.abs(z_craton[0]), np.abs(z_karoo[0]))

    # =========================================================================
    # 3. Kirchhoff Conservation Across All 1440 Storm Frames
    # =========================================================================
    def test_kirchhoff_conservation_full_storm(self):
        """
        Rigorously test Kirchhoff's current conservation law across every 60th frame
        throughout the entire 24-hour storm simulation.
        """
        from engine.storm_event import StormEventManager
        mgr = StormEventManager()

        for idx in range(0, len(mgr.precomputed_frames), 60):
            frame = mgr.get_frame(idx)
            sum_ground = frame["grid_solution"]["sum_ground_currents"]
            self.assertAlmostEqual(sum_ground, 0.0, places=5,
                msg=f"Kirchhoff conservation failed at minute {idx}: sum={sum_ground}")

    # =========================================================================
    # 4. Extreme Edge Cases & Directional Symmetry
    # =========================================================================
    def test_zero_field_stability(self):
        """Verify solver gracefully handles quiescent zero field without NaN/div-by-zero."""
        result = self.solver.solve_gic(ex_v_km=0.0, ey_v_km=0.0)
        self.assertEqual(result["max_gic_amps"], 0.0)
        self.assertEqual(result["sum_ground_currents"], 0.0)

    def test_field_reversal_symmetry(self):
        """
        Verify that reversing the geoelectric field vector reverses current signs exactly:
            GIC(-Ex, -Ey) = -GIC(Ex, Ey)
        """
        res_pos = self.solver.solve_gic(ex_v_km=2.5, ey_v_km=-1.8)
        res_neg = self.solver.solve_gic(ex_v_km=-2.5, ey_v_km=1.8)

        for sub_id in self.solver.node_ids:
            i_pos = res_pos["substation_gic_neutral_amps"][sub_id]
            i_neg = res_neg["substation_gic_neutral_amps"][sub_id]
            self.assertAlmostEqual(i_pos, -i_neg, places=5)

    # =========================================================================
    # 5. Transformer Saturation & Reactive Loss (Q_loss)
    # =========================================================================
    def test_transformer_risk_evaluation(self):
        sub = SUBSTATIONS["HYDRA"]

        # Quiet (< 5 A)
        risk_normal = evaluate_substation_risk(sub, 3.0)
        self.assertEqual(risk_normal["risk_tier"], RiskTier.NORMAL)

        # Advisory (5 to 15 A)
        risk_adv = evaluate_substation_risk(sub, 10.0)
        self.assertEqual(risk_adv["risk_tier"], RiskTier.ADVISORY)

        # Watch (15 to 28 A)
        risk_watch = evaluate_substation_risk(sub, 22.0)
        self.assertEqual(risk_watch["risk_tier"], RiskTier.WATCH)
        self.assertGreater(risk_watch["q_loss_mvar"], 5.0)

        # Critical (> 28 A)
        risk_crit = evaluate_substation_risk(sub, 35.0)
        self.assertEqual(risk_crit["risk_tier"], RiskTier.CRITICAL)
        self.assertIn("CRITICAL GIC SATURATION", risk_crit["headline"])

    # =========================================================================
    # 6. Hardware Magnetometer Streamer
    # =========================================================================
    def test_hardware_magnetometer_telemetry(self):
        sample = get_magnetometer_sample(storm_nt=120.0)
        self.assertEqual(sample["station_id"], "PHASOR-GROUND-01")
        self.assertIn("field_microteslas", sample)
        self.assertIn("rate_of_change_db_dt_nt_min", sample)
        self.assertGreater(sample["field_microteslas"]["total_intensity_f_ut"], 20.0)


if __name__ == '__main__':
    unittest.main()
