# NASA Space Apps Challenge 2026 — Project Page Submission

**Project Title:** PHASOR: Real-Time Geomagnetic Hazard Nowcast & Grid Defense  
**Challenge Addressed:** Space Weather Early Warning / The Sun Touches Everything / The Next Frontier  
**Target Award Category:** Best Use of Science / Global Connection / Best Use of Data  
**Location:** South Africa (SANSA Local Event / Universal Event)  

---

## 1. Short Project Summary (High-Concept Pitch)
**PHASOR** is the first operational, asset-level Geomagnetically Induced Current (GIC) nowcasting platform designed for African power transmission networks. By fusing real-time solar wind telemetry from NASA’s DSCOVR satellite at the L1 Lagrange point with ground geomagnetic observatories from the South African National Space Agency (SANSA), PHASOR transforms raw space weather feeds into real-time transformer core-saturation alerts—providing grid operators with a **15- to 45-minute early warning window** before critical assets face thermal breakdown and voltage instability.

---

## 2. The Problem & Why It Matters (Impact)
During intense coronal mass ejections (CMEs), fluctuations in Earth's geomagnetic field ($dB/dt$) induce quasi-DC geoelectric fields in the ground. These fields drive Geomagnetically Induced Currents (GICs) through long-distance high-voltage transmission lines and into transformer neutral earthing points.

While space-weather risk has traditionally been viewed as an Arctic or high-latitude problem (e.g., Quebec 1989, Malmö 2003), peer-reviewed research (Gaunt & Coetzee 2007; Ngwira et al. 2009) confirmed that **Southern Africa’s highly resistive Precambrian craton (Kaapvaal Craton) dramatically amplifies geoelectric induction**, causing dangerous GICs even at mid-latitudes. 

Large autotransformers cost upwards of **\$3M–\$5M USD** and take **12 to 24 months to replace**. A catastrophic failure during a storm would devastate hospitals, mines, water pumping systems, and communities across the Southern African Power Pool (SAPP). Despite SANSA issuing regional storm warnings during the May 2024 G5 solar storm, grid operators had no real-time, asset-level tool to know *which specific substation was approaching saturation*. **PHASOR solves this gap.**

---

## 3. How PHASOR Works (Creativity & Engineering)
PHASOR implements an automated four-stage physical and operational pipeline:

```
[ NASA DSCOVR Satellite (L1) ] ──┐
                                 ├──> [ 1D Layered Induction ] ──> [ Lehtinen-Pirjola ] ──> [ Transformer ] ──> [ NTCC Alert ]
[ SANSA Magnetometer (Hermanus) ]┤      (Wait Recursive MT)          (Network Solver)          (Core Saturation)   (Mitigation)
[ DIY Pi Ground Magnetometer ]  ──┘
```

1. **Space Telemetry & Ground Ingestion:** Ingests upstream solar wind velocity ($V_{sw}$), proton density, and interplanetary magnetic field ($B_z$) from NASA DSCOVR at L1, yielding a 15–45 minute propagation lead time before shock arrival at Earth.
2. **Geoelectric Field Induction Engine:** Couples ground geomagnetic variations ($dB/dt$) with regional 3-layer lithospheric conductivity models of the Kaapvaal Craton using Wait's recursive magnetotelluric plane-wave formulation:
   $$E_x(\omega) = \frac{Z(\omega)}{\mu_0} B_y(\omega), \quad E_y(\omega) = -\frac{Z(\omega)}{\mu_0} B_x(\omega)$$
3. **Transmission Grid Nodal Solver:** Implements the Lehtinen-Pirjola (1985) nodal admittance matrix method:
   $$(\mathbf{Y}_e + \mathbf{Y}_n) \mathbf{V}_e = \mathbf{J}$$
   solving exact 3-phase neutral GICs across 13 core transmission hubs (400 kV and 765 kV) in Southern Africa while strictly satisfying Kirchhoff's current conservation law ($\sum I_{\text{GIC}} = 0$).
4. **Actionable Asset Protection:** Evaluates half-cycle core saturation, reactive power deficit ($Q_{\text{loss}} \approx k_q \cdot I_{\text{GIC}}$ in MVAR), and harmonic distortion risk, generating actionable dispatcher bulletins (e.g., deploying static VAR compensators, re-routing line loads).

---

## 4. Space Agency & Open Data Sources (Relevance & Provenance)

| Agency | Dataset / Mission | Exact Usage in PHASOR |
|---|---|---|
| **NASA / NOAA** | **DSCOVR PlasMag & Faraday Cup** | Upstream $V_{sw}$, density, dynamic pressure, and $B_z$ for 15–45 min early warning |
| **NASA** | **DONKI Space Weather Database (api.nasa.gov)** | CME event tracking and solar flare cataloging |
| **SANSA** | **Hermanus Magnetic Observatory (HER)** | High-resolution 1-minute vector magnetic field ($B_x, B_y$) ground truth (INTERMAGNET) |
| **Kyoto WDC** | **Kyoto Dst Index / OMNIWeb** | Global ring-current storm intensity calibration |
| **Eskom / Academic** | **Published Transmission Topologies** | Substation earthing resistances, winding impedances, and line coordinates (Ngwira et al. 2009) |

---

## 5. Scientific Validity & Testing (Validity)
- **Mathematical Rigor:** The system includes a full automated test suite (`tests/`) verifying that the Wait recursive algorithm matches the exact analytical Cagniard solution for a uniform halfspace within 0.01% error, and confirms strict Kirchhoff ground current conservation across all storm states.
- **Historical Superstorm Benchmark:** Pre-compiled with a complete 1,440-minute dataset of the **May 10–12, 2024 G5 Mother's Day Solar Superstorm**, capturing the exact Dst plunge to -412 nT and corresponding 15–35 A GIC spikes at Hydra and Koeberg junctions.
- **Operational Domain Review:** Reviewed for operational realism with insights from a certified master electrician, ensuring that alert thresholds and mitigation recommendations (e.g. deferring corridor switching, monitoring dissolved gas analysis) match actual high-voltage substation protocols.

---

## 6. The Hardware Layer: DIY Ground Magnetometer
To complement space-based feeds, we designed and built a working DIY ground magnetometer prototype using a **Raspberry Pi + PNI RM3100 3-axis magneto-inductive sensor** (~$40 bill of materials). The sensor samples local microtesla variation in the lab, demonstrating an end-to-end telemetry chain: **Space Sensor (DSCOVR) &rarr; Ground Sensor (Pi) &rarr; Physics Engine &rarr; Grid Action**.

---

## 7. Public Deliverables
- **Live Interactive Dashboard:** Fully functional web-based operations center with 24h storm timeline scrubber, geoelectric vector compass, interactive transmission map, and real-time asset telemetry.
- **Open-Source Repository:** Available on GitHub under the MIT License with full documentation, tests, and reproducibility scripts.
- **30-Second Nominee Video:** Concise, high-impact demonstration highlighting the problem, the live app, the hardware sensor, and the real-world grid impact.
