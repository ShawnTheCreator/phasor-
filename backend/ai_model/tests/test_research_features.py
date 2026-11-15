"""
Unit & Integration Tests for the 12 Research-Backed Features of Phasor.
"""

import unittest
from main import (
    app,
    get_solar_wind_console,
    get_regional_geoelectric_map,
    get_noaa_g_scale,
    get_dst_forecast,
    get_alerts,
    acknowledge_alert,
    get_alert_dispatch_log,
    dispatch_alert_notification,
    get_storms_catalog,
    get_storm_catalog_frame,
    get_model_transparency,
    get_transformer_assets,
    get_aviation_impact,
    get_data_provenance,
    compose_operational_advisory,
    AlertAckRequest,
    DispatchLogRequest,
    AdvisoryComposeRequest
)
from engine.physics import instantaneous_efield_estimate
from engine.network import GICNetworkSolver
from engine.ml_transparency import get_dst_forecast_data, BACKTEST_HORIZONS
from engine.aviation_comms import assess_aviation_comms_impact
from data.conductivity_models import SOUTH_AFRICA_REGIONS


class TestResearchBackedFeatures(unittest.TestCase):

    def test_feature_1_solar_wind_console(self):
        """Feature 1: Live Solar Wind Console (Bz, Vsw, density, pressure, countdown, sparklines)."""
        res = get_solar_wind_console()
        self.assertEqual(res["status"], "OPERATIONAL")
        telemetry = res["telemetry"]
        self.assertIn("imf_bz_gsm_nt", telemetry)
        self.assertIn("solar_wind_speed_km_s", telemetry)
        self.assertIn("proton_density_n_cm3", telemetry)
        self.assertIn("dynamic_pressure_npa", telemetry)
        self.assertIn("sparklines", telemetry)
        self.assertIn("early_warning_lead_time_minutes", telemetry)
        self.assertGreater(telemetry["early_warning_lead_time_minutes"], 0)
        self.assertIn("bz", telemetry["sparklines"])
        self.assertEqual(len(telemetry["sparklines"]["bz"]), 24)

    def test_feature_2_regional_geoelectric_map(self):
        """Feature 2: Regional Geoelectric Risk Map of South Africa (7 regions)."""
        res = get_regional_geoelectric_map()
        self.assertIn("regions", res)
        regions = res["regions"]
        self.assertEqual(len(regions), 7)
        region_ids = [r["id"] for r in regions]
        self.assertIn("REG_KAAPVAAL", region_ids)
        self.assertIn("REG_KAROO", region_ids)
        self.assertIn("REG_CAPE_FOLD", region_ids)
        for r in regions:
            self.assertIn("e_field_mv_km", r)
            self.assertIn("threshold_mv_km", r)
            self.assertIn("risk_tier", r)
            self.assertIn("layers", r)

    def test_feature_3_noaa_g_scale(self):
        """Feature 3: NOAA G-Scale / Kp Status Panel & 3h Forecast Ribbon."""
        res = get_noaa_g_scale()
        self.assertIn("current_kp", res)
        self.assertIn("active_g_scale", res)
        self.assertIn("grid_impact_description", res)
        self.assertIn("kp_3h_forecast_ribbon", res)
        self.assertEqual(len(res["kp_3h_forecast_ribbon"]), 8)

    def test_feature_4_dst_forecast(self):
        """Feature 4: Dst Forecast with Confidence Bands & Backtest RMSE."""
        res = get_dst_forecast()
        self.assertIn("current_dst_nt", res)
        self.assertIn("observed_past_24h", res)
        self.assertIn("forecast_6h", res)
        self.assertEqual(len(res["forecast_6h"]), 6)
        # Check confidence bands
        for f in res["forecast_6h"]:
            self.assertLessEqual(f["lower_bound_nt"], f["predicted_dst_nt"])
            self.assertGreaterEqual(f["upper_bound_nt"], f["predicted_dst_nt"])
            self.assertGreater(f["rmse_nt"], 0)

    def test_feature_5_alert_engine_and_ack(self):
        """Feature 5: Alert Engine, Feed, and Acknowledge Workflow."""
        alerts = get_alerts()["alerts"]
        self.assertGreater(len(alerts), 0)
        first_alert = alerts[0]
        alert_id = first_alert["_id"]

        ack_req = AlertAckRequest(dispatcher_notes="Test acknowledge notes", dispatcher_name="Shift Dispatcher")
        ack_res = acknowledge_alert(alert_id, ack_req)
        self.assertEqual(ack_res["status"], "SUCCESS")

        # Dispatch log
        log_res = get_alert_dispatch_log()
        self.assertIn("dispatch_log", log_res)

        # Dispatch notification
        disp_req = DispatchLogRequest(channel="SMS", recipient="+27 82 000 0000", message="Test alert SMS")
        disp_res = dispatch_alert_notification(disp_req)
        self.assertEqual(disp_res["status"], "SUCCESS")

    def test_feature_6_storm_replay_catalog(self):
        """Feature 6: Storm Replay Theatre (May 2024, March 1989 Quebec, Oct 2003 Halloween)."""
        catalog = get_storms_catalog()["catalog"]
        self.assertEqual(len(catalog), 3)
        ids = [c["id"] for c in catalog]
        self.assertIn("may_2024_g5", ids)
        self.assertIn("march_1989_quebec", ids)
        self.assertIn("oct_2003_halloween", ids)

        # Frame test for each storm
        frame_may = get_storm_catalog_frame("may_2024_g5", 780)
        self.assertIn("indices", frame_may)

        frame_quebec = get_storm_catalog_frame("march_1989_quebec", 780)
        self.assertEqual(frame_quebec["event_name"], "March 13, 1989 Hydro-Québec Collapse")

        frame_hallo = get_storm_catalog_frame("oct_2003_halloween", 780)
        self.assertEqual(frame_hallo["event_name"], "October 2003 Halloween Solar Storms")

    def test_feature_7_model_transparency(self):
        """Feature 7: Model Architecture, Training Provenance, & Physics Engine Assumptions."""
        res = get_model_transparency()
        self.assertIn("model_specification", res)
        self.assertIn("backtest_metrics", res)
        self.assertIn("benchmarks", res)
        spec = res["model_specification"]
        self.assertEqual(spec["architecture"], "Bidirectional Long Short-Term Memory (Bi-LSTM)")
        self.assertIn("physics_engine_assumptions", spec)

    def test_feature_8_transformer_registry(self):
        """Feature 8: Transformer Asset Registry (13 Eskom EHV transformers)."""
        res = get_transformer_assets()
        self.assertIn("transformers", res)
        xfmrs = res["transformers"]
        self.assertEqual(len(xfmrs), 13)
        for x in xfmrs:
            self.assertIn("core_design", x)
            self.assertIn("age_years", x)
            self.assertIn("geomagnetic_lat_deg", x)
            self.assertIn("live_saturation_score", x)
            self.assertIn("live_gic_neutral_amps", x)

    def test_feature_10_aviation_comms(self):
        """Feature 10: Aviation & Communications Impact Panel."""
        res = get_aviation_impact()
        self.assertIn("hf_radio", res)
        self.assertIn("gnss_positioning", res)
        self.assertIn("icao_bulletin", res)
        self.assertIn("positioning_error_meters", res["gnss_positioning"])

    def test_feature_11_provenance(self):
        """Feature 11: Data Provenance Bar."""
        res = get_data_provenance()
        self.assertIn("sources", res)
        self.assertEqual(len(res["sources"]), 5)

    def test_feature_12_advisory_composer(self):
        """Feature 12: Grid-Effect Advisory Composer."""
        req = AdvisoryComposeRequest(g_scale="G4", overall_tier="CRITICAL", total_q_loss_mvar=85.0)
        res = compose_operational_advisory(req)
        self.assertIn("advisory", res)
        adv = res["advisory"]
        self.assertIn("title", adv)
        self.assertIn("operational_recommendations", adv)
        self.assertGreater(len(adv["operational_recommendations"]), 0)


if __name__ == "__main__":
    unittest.main()
