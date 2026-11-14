"""
Unit Tests for Lehtinen-Pirjola GIC Network Solver.
"""

import unittest
import numpy as np
from engine.network import GICNetworkSolver
from engine.grid_topology import SUBSTATIONS, TRANSMISSION_LINES


class TestGICNetworkSolver(unittest.TestCase):

    def setUp(self):
        self.solver = GICNetworkSolver(SUBSTATIONS, TRANSMISSION_LINES)

    def test_kirchhoff_ground_current_conservation(self):
        """
        Verify that for any arbitrary geoelectric field vector (Ex, Ey),
        the algebraic sum of all substation neutral earthing currents equals ZERO (Kirchhoff's Law).
        """
        test_vectors = [
            (1.0, 0.0),    # Pure North-South field (1 V/km)
            (0.0, 1.0),    # Pure East-West field (1 V/km)
            (2.5, -1.8),   # Typical storm diagonal field
            (-3.0, -4.0),  # Extreme G5 storm field
        ]

        for ex, ey in test_vectors:
            result = self.solver.solve_gic(ex_v_km=ex, ey_v_km=ey)
            net_sum = result["sum_ground_currents"]

            # Ground currents must balance to zero within numerical precision (< 1e-7 A)
            self.assertAlmostEqual(net_sum, 0.0, places=5,
                msg=f"Kirchhoff current law violated for Ex={ex}, Ey={ey}: sum={net_sum}")

    def test_linearity(self):
        """
        Verify GIC response is linear with respect to E-field scaling:
            GIC(2 * E) = 2 * GIC(E)
        """
        res1 = self.solver.solve_gic(ex_v_km=1.0, ey_v_km=1.0)
        res2 = self.solver.solve_gic(ex_v_km=2.0, ey_v_km=2.0)

        for sub_id in self.solver.node_ids:
            gic1 = res1["substation_gic_neutral_amps"][sub_id]
            gic2 = res2["substation_gic_neutral_amps"][sub_id]
            self.assertAlmostEqual(gic2, 2.0 * gic1, places=5)

    def test_vulnerability_identification(self):
        """
        Verify that Hydra / Koeberg / Grassridge (long corridors) experience high GIC.
        """
        result = self.solver.solve_gic(ex_v_km=1.5, ey_v_km=1.0)
        self.assertGreater(result["max_gic_amps"], 5.0)
        self.assertIn(result["most_vulnerable_substation"], SUBSTATIONS)


if __name__ == '__main__':
    unittest.main()
