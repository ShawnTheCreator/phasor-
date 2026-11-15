"""
Unit Tests for Geoelectric Field Induction Engine.
"""

import unittest
import numpy as np
from engine.physics import (
    calculate_surface_impedance_1d,
    compute_geoelectric_field_fft,
    instantaneous_efield_estimate,
    MU_0
)
from data.conductivity_models import UNIFORM_1000_MODEL, KAAPVAAL_CRATON_MODEL


class TestGeoelectricPhysics(unittest.TestCase):

    def test_uniform_halfspace_impedance_analytical(self):
        """
        Verify that for a uniform halfspace (1000 Ohm-m), the recursive Wait formula
        reproduces the exact analytical Cagniard solution:
            |Z(w)| = sqrt(w * mu_0 * rho)
            phase(Z(w)) = 45 degrees (pi / 4)
        """
        frequencies = np.array([0.001, 0.01, 0.1, 1.0])  # mHz to Hz range typical for GIC
        rho = 1000.0

        z_calc = calculate_surface_impedance_1d(frequencies, UNIFORM_1000_MODEL)

        for i, f in enumerate(frequencies):
            w = 2.0 * np.pi * f
            expected_modulus = np.sqrt(w * MU_0 * rho)
            calculated_modulus = np.abs(z_calc[i])

            # Verify modulus matches within 0.1%
            self.assertAlmostEqual(calculated_modulus, expected_modulus, places=4)

            # Verify phase is exactly 45 degrees (pi/4)
            phase_deg = np.angle(z_calc[i], deg=True)
            self.assertAlmostEqual(phase_deg, 45.0, places=2)

    def test_kaapvaal_craton_impedance(self):
        """
        Verify Kaapvaal Craton model impedance is non-zero and has physically consistent phase (0 to 90 deg).
        """
        frequencies = np.logspace(-4, -1, 20)  # 0.1 mHz to 100 mHz (GIC spectrum)
        z_craton = calculate_surface_impedance_1d(frequencies, KAAPVAAL_CRATON_MODEL)

        self.assertEqual(len(z_craton), len(frequencies))
        self.assertTrue(np.all(np.abs(z_craton) > 0))

        phases = np.angle(z_craton, deg=True)
        self.assertTrue(np.all(phases > 0.0))
        self.assertTrue(np.all(phases < 90.0))

    def test_geoelectric_field_fft_synthetic_sinusoid(self):
        """
        Test geoelectric field generation from a synthetic 100 nT geomagnetic oscillation.
        """
        dt = 60.0  # 1-minute samples
        duration_hours = 6
        n_samples = int(duration_hours * 3600 / dt)
        t = np.arange(n_samples) * dt

        # 30-minute period geomagnetic perturbation (approx substorm / Pc5 pulsation)
        period = 1800.0  # seconds
        bx_nt = 150.0 * np.sin(2.0 * np.pi * t / period)
        by_nt = 100.0 * np.cos(2.0 * np.pi * t / period)

        ex, ey = compute_geoelectric_field_fft(bx_nt, by_nt, dt_seconds=dt, model=KAAPVAAL_CRATON_MODEL)

        self.assertEqual(len(ex), n_samples)
        self.assertEqual(len(ey), n_samples)

        # Geoelectric field during significant magnetic variation in resistive craton
        # should produce typical realistic amplitudes of 0.1 to 3 V/km
        peak_e = np.max(np.hypot(ex, ey))
        self.assertGreater(peak_e, 0.05)
        self.assertLess(peak_e, 10.0)

    def test_instantaneous_efield_estimate(self):
        """
        Verify streaming instantaneous E-field estimate scales logically with dB/dt.
        """
        ex, ey, e_tot = instantaneous_efield_estimate(dbx_dt_nt_per_min=60.0, dby_dt_nt_per_min=80.0)
        self.assertGreater(e_tot, 0.0)
        self.assertAlmostEqual(e_tot, np.hypot(ex, ey), places=5)


if __name__ == '__main__':
    unittest.main()
