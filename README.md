# PHASOR: Space Weather Grid Defense System
### Operational Geomagnetic Hazard Nowcast & Transformer Core Saturation Protection for African Power Grids

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![NASA Space Apps 2026](https://img.shields.io/badge/NASA%20Space%20Apps-2026-orange.svg)](https://www.spaceappschallenge.org/)
[![SANSA Partner](https://img.shields.io/badge/Agency%20Partner-SANSA%20South%20Africa-0284c7.svg)](https://www.sansa.org.za/)
[![Tests Passing](https://img.shields.io/badge/Tests-13%2F13%20Passing-brightgreen.svg)]()

---

## 1. Executive Summary

**PHASOR** is an end-to-end operational space-weather nowcast and early-warning platform engineered to defend high-voltage electrical transmission grids against **Geomagnetically Induced Currents (GICs)**. 

By coupling real-time upstream solar wind telemetry from **NASA's DSCOVR satellite** at the L1 Lagrange point with ground geomagnetic observatories from the **South African National Space Agency (SANSA)**, PHASOR calculates the surface geoelectric field induction across Southern Africa's resistive Precambrian lithosphere and predicts individual substation transformer saturation risk with a **15- to 45-minute early warning window**.

---

## 2. System Architecture

```
                                  [ NASA DSCOVR Satellite (L1 Orbit) ]
                                                │
                                    15–45 min Early Warning
                                    (V_sw, Density, IMF Bz)
                                                ▼
  [ SANSA Hermanus Observatory ] ───► [ INGESTION & PIPELINE ] ◄─── [ DIY Ground Magnetometer ]
                                                │                    (Raspberry Pi + RM3100)
                                                ▼
                                [ 1D GEOELECTRIC INDUCTION ]
                                  (Wait Multi-Layer Craton)
                                                │
                                       Ex, Ey (V/km)
                                                ▼
                                  [ LEHTINEN-PIRJOLA SOLVER ]
                                    (Nodal Admittance Yn)
                                                │
                                      I_GIC (Amps/phase)
                                                ▼
                                    [ RISK & ALERT ENGINE ]
                               (Core Saturation & Q_loss MVAR)
                                                │
                                                ▼
                             [ SPACE WEATHER OPERATIONS CENTER ]
                           (Interactive Map, Scrubber, Bulletins)
```

---

## 3. Physics & Mathematical Formulation

### 3.1 1D Multi-Layer Lithospheric Surface Impedance
For an $N$-layer horizontally stratified Earth conductivity profile (Kaapvaal Craton: resistive Archean shield overlying conductive upper mantle), the surface impedance $Z_1(\omega)$ is solved via **Wait's recursive algorithm**:

$$k_j = \sqrt{i \omega \mu_0 \sigma_j}, \quad \eta_j = \frac{i \omega \mu_0}{k_j}$$

$$Z_j(\omega) = \eta_j \frac{Z_{j+1} + \eta_j \tanh(k_j h_j)}{\eta_j + Z_{j+1} \tanh(k_j h_j)}, \quad Z_N = \eta_N$$

### 3.2 Plane-Wave Geoelectric Field Induction
The horizontal geoelectric field components ($E_x$ North, $E_y$ East in V/km) are solved in the frequency domain from geomagnetic field variations ($B_x, B_y$ in nT) via Fast Fourier Transform:

$$\tilde{E}_x(\omega) = \frac{Z_1(\omega)}{\mu_0} \tilde{B}_y(\omega), \quad \tilde{E}_y(\omega) = -\frac{Z_1(\omega)}{\mu_0} \tilde{B}_x(\omega)$$

### 3.3 Lehtinen-Pirjola (1985) Transmission Network Solution
For an interconnected power grid with substation grounding admittances $\mathbf{Y}_e = \text{diag}(1/R_{\text{total}})$ and grid line admittances $\mathbf{Y}_n$:

$$(\mathbf{Y}_e + \mathbf{Y}_n) \mathbf{V}_e = \mathbf{J}$$

$$\mathbf{I}_{\text{GIC}} = \mathbf{Y}_e \mathbf{V}_e, \quad \text{where } \sum_{i=1}^N I_{\text{GIC}, i} = 0 \text{ (Kirchhoff Conservation)}$$

### 3.4 Transformer Core Saturation & Reactive Power Loss
Quasi-DC GICs shift transformer core excitation into half-cycle saturation, generating severe reactive power deficits:

$$Q_{\text{loss}} \approx k_q \cdot V_{\text{pu}} \cdot I_{\text{GIC, phase}} \quad (\text{MVAR})$$

---

## 4. Key Features

- **Historic May 10–12, 2024 G5 Storm Replay:** Pre-compiled 1,440-minute dataset capturing the Mother's Day G5 superstorm (Dst $-412$ nT) with 1-click timeline scrubbing.
- **L1 Upstream Early Warning:** Real-time advance calculation ($t_{\text{lead}} = D_{L1} / V_{sw}$) giving dispatchers up to 45 minutes of advance warning.
- **Substation-Level Risk Tiers:** Automated classification (NORMAL, ADVISORY, WATCH, CRITICAL) mapped to actionable NTCC dispatcher mitigation bulletins.
- **DIY Raspberry Pi Ground Station:** Working hardware driver (`hardware/pi_magnetometer.py`) for PNI RM3100 3-axis magneto-inductive sensors with fallback geophysics emulator.
- **100% Offline-Safe:** Zero external cloud dependencies required during live competition demos; runs cleanly in any local browser.

---

## 5. Quickstart & Installation

### 5.1 Prerequisites
- Python 3.10+
- `numpy`, `fastapi`, `uvicorn` (all pre-installed in environment)

### 5.2 Run Automated Verification & CLI Demo
```bash
python run_demo.py
```
This executes all 13 unit tests verifying Kirchhoff current conservation and Wait's induction equations, compiles the May 2024 storm metrics, and displays the peak G5 snapshot.

### 5.3 Launch the Web Operations Dashboard
```bash
python run_demo.py --serve
# Or directly:
python -m uvicorn server.main:app --port 8000 --host 0.0.0.0 --reload
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser to view the interactive Space Weather Grid Defense Operations Center.

### 5.4 Test the DIY Ground Magnetometer Streamer
```bash
python hardware/pi_magnetometer.py
```

---

## 6. Project Layout

```
Phasor/
├── engine/
│   ├── physics.py          # 1D Wait recursive MT impedance & FFT E-field engine
│   ├── network.py          # Lehtinen-Pirjola nodal admittance GIC solver
│   ├── grid_topology.py    # 400kV & 765kV Southern African transmission network
│   ├── risk_assessment.py  # Transformer saturation, Q_loss MVAR, and alert rules
│   └── storm_event.py      # May 2024 storm replay and live stream orchestrator
├── data/
│   ├── may_2024_g5_storm.json # 1,440-min calibrated DSCOVR, SANSA, & Dst dataset
│   ├── conductivity_models.py # Kaapvaal Craton & Karoo lithosphere resistivity
│   └── sansa_stations.py   # Hermanus, Sutherland, Hartebeesthoek observatory metadata
├── hardware/
│   └── pi_magnetometer.py  # Raspberry Pi + PNI RM3100 magnetometer driver
├── server/
│   ├── main.py             # FastAPI REST endpoints & WebSocket simulation
│   └── static/             # Frontend Operations Dashboard
│       ├── index.html      # Mission-control user interface
│       ├── app.js          # Interactive SVG map, timeline scrubber, & charts
│       └── style.css       # Clean styling
├── tests/
│   ├── test_physics.py     # Analytical Cagniard & Wait formula verification
│   ├── test_network.py     # Kirchhoff current law conservation verification
│   └── test_direct_api.py  # FastAPI endpoints & data integrity tests
├── docs/
│   ├── PITCH_SCRIPT.md     # 30-Second Nominee Video Pitch Script & Storyboard
│   └── PROJECT_PAGE.md     # Full NASA Space Apps project page submission text
├── run_demo.py             # Master CLI verification & demo runner
└── README.md
```

---

## 7. Scientific References & Data Sources

1. **Ngwira, C. M., McKinnell, L. A., Cilliers, P. J., & Gaunt, C. T. (2009).** *Modeling geomagnetically induced currents in the South African electric power network.* Space Weather, 7(10), S10004.
2. **Gaunt, C. T., & Coetzee, G. (2007).** *Transformer failures in regions using power systems at mid-latitudes.* International Conference on Power Systems Transients (IPST).
3. **Lehtinen, M., & Pirjola, R. (1985).** *Currents produced in earthed conductor networks by digitally-recorded ground conductivity and geomagnetic data.* Annales Geophysicae, 3(4), 479-484.
4. **NASA DSCOVR Mission:** *PlasMag & Faraday Cup Real-Time Solar Wind Telemetry.* NOAA Space Weather Prediction Center.
5. **SANSA Space Science:** *Hermanus Geomagnetic Observatory (HER) Vector Telemetry.* INTERMAGNET Network.
6. **Kyoto World Data Center for Geomagnetism:** *Equatorial Dst Index.*

---

## 8. License

Distributed under the **MIT License**. See `LICENSE` for details.
