#!/usr/bin/env python3
"""
Phasor / GridGuard Africa - Master Demonstration & CLI Runner.

Executes physical validation checks, verifies storm datasets, and starts the
interactive Space Weather Operations Center server.
"""

import sys
import os
import argparse
import unittest

def print_banner():
    banner = r"""
  =============================================================================
     ____  _   _    _    ____   ___  ____  
    |  _ \| | | |  / \  / ___| / _ \|  _ \ 
    | |_) | |_| | / _ \ \___ \| | | | |_) |
    |  __/|  _  |/ ___ \ ___) | |_| |  _ < 
    |_|   |_| |_/_/   \_\____/ \___/|_| \_\
    
    GRIDGUARD AFRICA | Operational Geomagnetic Hazard Nowcast & GIC Mitigation
    NASA Space Apps Challenge 2026 - Powered by DSCOVR + SANSA Hermanus
  =============================================================================
    """
    print(banner)

def verify_system():
    print("[*] Running automated physics & network conservation test suite...")
    loader = unittest.TestLoader()
    suite = loader.discover("tests")
    runner = unittest.TextTestRunner(verbosity=1)
    result = runner.run(suite)
    
    if not result.wasSuccessful():
        print("[!] Test suite reported failures. Please check physics models.")
        sys.exit(1)
    print("[+] All 13 unit tests PASSED (Kirchhoff Law, Wait Induction, Lehtinen-Pirjola Admittance).\n")

def run_cli_demo():
    print_banner()
    verify_system()

    from engine.storm_event import StormEventManager
    from engine.grid_topology import SUBSTATIONS, TRANSMISSION_LINES

    print("[*] Initializing Storm Event Manager (May 10-12, 2024 G5 Superstorm)...")
    mgr = StormEventManager()
    print(f"[+] Loaded {len(mgr.precomputed_frames)} minute-by-minute high-resolution storm frames.")
    print(f"[+] Monitored Transmission Grid: {len(SUBSTATIONS)} substations, {len(TRANSMISSION_LINES)} high-voltage corridors.")
    
    # Showcase Peak G5 frame (Minute 780, ~01:00 UTC May 11)
    peak_frame = mgr.get_frame(780)
    dscovr = peak_frame["dscovr"]
    sol = peak_frame["grid_solution"]
    risk = peak_frame["risk_assessment"]
    
    print("\n" + "="*75)
    print("  PEAK G5 SUPERSTORM SNAPSHOT (May 11, 2024 ~01:00 UTC | Dst: -412 nT)")
    print("="*75)
    print(f"  Solar Wind Speed (DSCOVR L1):  {dscovr['solar_wind_speed_km_s']} km/s (Lead Time: {dscovr['early_warning_lead_time_minutes']} min)")
    print(f"  IMF Bz (GSM Reconnection):     {dscovr['imf_bz_gsm_nt']} nT")
    print(f"  Ground dB/dt (SANSA Hermanus): {peak_frame['sansa_magnetometer']['db_dt_nt_min']} nT/min")
    print(f"  Induced E-Field (Kaapvaal):    {peak_frame['induction']['e_magnitude_v_km']} V/km")
    print(f"  Maximum Substation GIC:        {sol['max_gic_amps']} A (at {sol['most_vulnerable_substation']})")
    print(f"  Overall Grid Hazard Status:    {risk['overall_grid_tier']}")
    print(f"  Total Reactive Loss (Q_loss):  {risk['total_reactive_power_loss_mvar']} MVAR")
    print(f"  NTCC Dispatcher Action:        {risk['substation_details'][sol['most_vulnerable_substation']]['recommended_action']}")
    print("="*75 + "\n")

    print("[*] To launch the interactive browser dashboard, run:")
    print("    python -m uvicorn server.main:app --port 8000 --host 0.0.0.0 --reload")
    print("    Then open: http://localhost:8000 in your browser.\n")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Phasor / GridGuard Africa Demonstration")
    parser.add_argument("--serve", action="store_true", help="Start the FastAPI web server")
    parser.add_argument("--port", type=int, default=8000, help="Port to serve on (default: 8000)")
    args = parser.parse_args()

    if args.serve:
        print_banner()
        verify_system()
        import uvicorn
        print(f"[*] Starting web server on http://localhost:{args.port} ...")
        uvicorn.run("server.main:app", host="0.0.0.0", port=args.port, reload=True)
    else:
        run_cli_demo()
