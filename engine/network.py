"""
Lehtinen-Pirjola (1985) GIC Network Solver.

Implements the standard nodal admittance matrix formulation used internationally to compute
Geomagnetically Induced Currents (GIC) in power transmission grids driven by spatially
varying or uniform geoelectric fields.

Reference:
- Lehtinen, M., & Pirjola, R. (1985). Currents produced in earthed conductor networks by
  digitally-recorded ground conductivity and geomagnetic data. Annales Geophysicae, 3(4), 479-484.
- Ngwira, C. M., et al. (2009). Space Weather, 7(10), S10004.
"""

from typing import Dict, List, Tuple, Any
import numpy as np
from engine.grid_topology import SUBSTATIONS, TRANSMISSION_LINES, Substation, TransmissionLine


class GICNetworkSolver:
    """Solves for DC geomagnetically induced currents across the transmission grid."""

    def __init__(self, substations: Dict[str, Substation] = SUBSTATIONS, lines: List[TransmissionLine] = TRANSMISSION_LINES):
        self.substations = substations
        self.lines = lines
        self.node_ids = list(substations.keys())
        self.node_to_idx = {nid: i for i, nid in enumerate(self.node_ids)}
        self.n_nodes = len(self.node_ids)

        self._build_static_matrices()

    def _build_static_matrices(self):
        """Constructs static network admittance matrix Yn and earthing admittance Ye."""
        self.Y_n = np.zeros((self.n_nodes, self.n_nodes), dtype=float)
        self.Y_e = np.zeros((self.n_nodes, self.n_nodes), dtype=float)
        self.line_admittances = []
        self.line_displacements_km = []

        # Substation earthing admittance: Ye = diag(1 / R_total)
        # R_total = Re + (Rt / 3) for a 3-phase grounded bank
        for i, nid in enumerate(self.node_ids):
            sub = self.substations[nid]
            r_tot = sub.earthing_resistance_ohm + (sub.transformer_winding_resistance_ohm / 3.0)
            y_e_val = 1.0 / max(r_tot, 1e-4)
            self.Y_e[i, i] = y_e_val

        # Transmission lines admittance
        for line in self.lines:
            if line.from_substation not in self.node_to_idx or line.to_substation not in self.node_to_idx:
                continue

            i = self.node_to_idx[line.from_substation]
            j = self.node_to_idx[line.to_substation]

            # Parallel DC resistance for 3 phases: R_line = (r_km * L) / (3 * circuits)
            r_line = (line.resistance_ohm_per_km * line.length_km) / (3.0 * max(line.circuits, 1))
            y_line = 1.0 / max(r_line, 1e-4)

            # Build line displacement (dx North-South, dy East-West in km)
            sub_i = self.substations[line.from_substation]
            sub_j = self.substations[line.to_substation]

            # 1 deg latitude ~ 111.32 km
            # 1 deg longitude ~ 111.32 * cos(mid_lat) km
            mid_lat = np.radians((sub_i.latitude + sub_j.latitude) / 2.0)
            dx_km = (sub_j.latitude - sub_i.latitude) * 111.32
            dy_km = (sub_j.longitude - sub_i.longitude) * 111.32 * np.cos(mid_lat)

            self.line_admittances.append(y_line)
            self.line_displacements_km.append((dx_km, dy_km))

            # Assemble Yn (Kirchhoff nodal admittance)
            self.Y_n[i, i] += y_line
            self.Y_n[j, j] += y_line
            self.Y_n[i, j] -= y_line
            self.Y_n[j, i] -= y_line

        # System matrix A = Ye + Yn
        self.A_matrix = self.Y_e + self.Y_n

    def solve_gic(
        self,
        ex_v_km: float,
        ey_v_km: float
    ) -> Dict[str, Any]:
        """
        Solves GIC for a given geoelectric field vector (Ex, Ey) in V/km.

        Args:
            ex_v_km: North-South geoelectric field (positive North) in V/km.
            ey_v_km: East-West geoelectric field (positive East) in V/km.

        Returns:
            Dictionary containing:
                - substation_gic: Dict mapping substation ID -> GIC in Amperes (3-phase neutral current)
                - substation_per_phase_amps: Dict mapping substation ID -> Amperes per phase
                - line_currents: Dict mapping line ID -> current in Amperes
                - sum_ground_currents: Total net current into earth (must equal ~0 for conservation)
                - max_gic_amps: Maximum absolute GIC across the network
                - most_vulnerable_substation: ID of substation with highest GIC
        """
        # Source current vector J (entering nodes from line-induced EMF)
        J = np.zeros(self.n_nodes, dtype=float)
        line_induced_voltages = []

        for idx, line in enumerate(self.lines):
            i = self.node_to_idx[line.from_substation]
            j = self.node_to_idx[line.to_substation]
            y_line = self.line_admittances[idx]
            dx_km, dy_km = self.line_displacements_km[idx]

            # Induced line voltage V = integral(E . dl) = Ex * dx + Ey * dy
            v_induced = (ex_v_km * dx_km) + (ey_v_km * dy_km)
            line_induced_voltages.append(v_induced)

            # Node currents (positive enters node)
            J[i] -= y_line * v_induced
            J[j] += y_line * v_induced

        # Solve (Ye + Yn) * Ve = J for substation ground potentials Ve
        try:
            Ve = np.linalg.solve(self.A_matrix, J)
        except np.linalg.LinAlgError:
            Ve = np.linalg.lstsq(self.A_matrix, J, rcond=None)[0]

        # Calculate substation neutral grounding GIC: I_gic = Ve * Ye
        substation_gic: Dict[str, float] = {}
        substation_per_phase: Dict[str, float] = {}
        for i, nid in enumerate(self.node_ids):
            i_neutral = float(Ve[i] * self.Y_e[i, i])
            substation_gic[nid] = i_neutral
            substation_per_phase[nid] = i_neutral / 3.0

        # Calculate line currents: I_line = y_line * (Ve_i - Ve_j + V_induced)
        line_currents: Dict[str, float] = {}
        for idx, line in enumerate(self.lines):
            i = self.node_to_idx[line.from_substation]
            j = self.node_to_idx[line.to_substation]
            y_line = self.line_admittances[idx]
            v_ind = line_induced_voltages[idx]
            i_line = float(y_line * (Ve[i] - Ve[j] + v_ind))
            line_currents[line.id] = i_line

        # Kirchhoff verification: sum of all neutral ground currents must equal 0
        total_ground_sum = float(np.sum(list(substation_gic.values())))

        # Vulnerability sorting
        sorted_subs = sorted(
            substation_gic.items(),
            key=lambda item: abs(item[1]),
            reverse=True
        )
        max_sub_id, max_gic = sorted_subs[0]

        return {
            "ex_v_km": float(ex_v_km),
            "ey_v_km": float(ey_v_km),
            "e_magnitude_v_km": float(np.hypot(ex_v_km, ey_v_km)),
            "substation_gic_neutral_amps": substation_gic,
            "substation_per_phase_amps": substation_per_phase,
            "line_currents_amps": line_currents,
            "sum_ground_currents": total_ground_sum,
            "max_gic_amps": abs(max_gic),
            "most_vulnerable_substation": max_sub_id,
        }
