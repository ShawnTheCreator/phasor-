# PHASOR: SADC Multi-Hazard Space Weather Defense Platform
### Operational Multi-Hazard Nowcast, Grid Saturation Defense & Infrastructure Resilience for Southern Africa

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![.NET 10.0](https://img.shields.io/badge/.NET-10.0-512BD4.svg)](https://dotnet.microsoft.com/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.5-3178C6.svg)](https://www.typescriptlang.org/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![NASA Space Apps 2026](https://img.shields.io/badge/NASA%20Space%20Apps-2026-orange.svg)](https://www.spaceappschallenge.org/)
[![Agency Partner: SANSA](https://img.shields.io/badge/Agency%20Partner-SANSA%20South%20Africa-0284c7.svg)](https://www.sansa.org.za/)
[![Tests: 47 Passing](https://img.shields.io/badge/Tests-47%2F47%20Passing-brightgreen.svg)]()

---

## 1. Executive Summary

**PHASOR** is a multi-hazard, role-based space weather defense platform built specifically for the **Southern African Development Community (SADC)**. 

Southern Africa presents a uniquely acute vulnerability to space weather:
1. **The Kaapvaal Craton Geology:** Extremely resistive Precambrian rock (up to $100{,}000\ \Omega\cdot\text{m}$) forces induced geoelectric currents into grounded transmission lines, escalating Geomagnetically Induced Currents (GICs) even during moderate mid-latitude storms.
2. **The Equatorial Ionospheric Anomaly (EIA):** Severe Equatorial Plasma Bubbles (EPBs) cause intense amplitude ($S_4$) and phase ($\sigma_\phi$) scintillation, degrading GNSS tracking for autonomous mining in the Zambian Copperbelt and precision agriculture in the Free State and Zambezi basins.
3. **Cross-Border Interconnection:** The Southern African Power Pool (SAPP) connects South Africa, Namibia, Botswana, Zimbabwe, Mozambique, and Zambia. A localized transformer failure at a critical node (e.g., Cahora Bassa or Kendal) threatens cascading regional collapse.
4. **Healthcare & Last-Mile Fragility:** Rural health clinics and municipal water networks possess limited emergency fuel reserves, and field operators rely on low-bandwidth basic mobile networks.

PHASOR bridges upstream **NASA DSCOVR L1 satellite telemetry** and **SANSA Hermanus ground observatories** with 1D lithospheric impedance physics, translating raw space weather into **six interconnected operational pictures** designed for specific decision-makers.

---

## 2. Platform Architecture

```
                                      [ NASA DSCOVR Satellite (L1 Orbit) ]
                                                        │
                                            15–45 min Early Warning
                                            (V_sw, Density, IMF Bz)
                                                        ▼
  [ SANSA Hermanus Ground Node ] ───► [ INGESTION & PIPELINE ] ◄─── [ DIY Ground Magnetometer ]
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
                   ┌─────────────────────────────────────────────────────────────┐
                   │               SADC MULTI-HAZARD RISK ENGINE                 │
                   └─────────────────────────────────────────────────────────────┘
                                                        │
         ┌───────────────────┬───────────────────┼───────────────────┬───────────────────┐
         ▼                   ▼                   ▼                   ▼                   ▼
  [ SAPP Grid ]       [ GNSS / PRISM ]    [ Health Systems ]  [ Aviation Triad ]  [ LEO Satellite Drag ]
  Cumulative Life     S4 / σφ live map    Hospital GIC overlay ICAO SWIS triad    14-day rolling solar
  GRD status board    EPB drift forecast  Stroke/cardiac surge FL390 dose rates   NRLMSISE-00 density
  Flow rerouting      SMS last-mile dispatch Fuel checklist    Aircrew dosimetry  Conjunction bubble
         │                   │                   │                   │                   │
         └───────────────────┴───────────────────┼───────────────────┴───────────────────┘
                                                 │
                                                 ▼
                             [ PUBLIC SAFETY & CIVIL PROTECTION ]
                             Plain-language citizen advisories
                             Critical infrastructure dependency chain
                             Emergency radio / SMS-CB broadcast
```

---

## 3. The Six SADC Operational Pictures

PHASOR moves beyond monolithic mission control dashboards into **role-based situational awareness**:

| Route | Operational Picture | Target Decision-Maker | Scientific & Operational Baseline |
| :--- | :--- | :--- | :--- |
| **`/grid`** | **SAPP Regional Grid** | National Transmission System Operators (Eskom, NamPower, ZESA) | Lehtinen-Pirjola (1985) nodal network, Arrhenius transformer aging |
| **`/gnss`** | **GNSS Scintillation** | Precision agriculture, Copperbelt mining, surveyors | PRISM ISMR framework, Septentrio receivers, EPB zonal drift |
| **`/health`** | **Health Resilience** | Hospital incident commanders, EMS dispatchers, cardiologists | Epidemiological storm-stroke ($1.25–1.6\times$) & cardiac ($1.5–2.2\times$) multipliers |
| **`/aviation`** | **Aviation Triad** | Flight dispatchers, airline operations, aircrew dosimetry | ICAO SWIS & PECASUS thresholds (HF, RAD, GNSS/SATCOM) |
| **`/satellites`** | **Satellite Drag** | LEO satellite operators (SANSA, ZACube-2, MDASat-1) | NRLMSISE-00 atmospheric expansion proxy, orbital decay $F_d$ |
| **`/public`** | **Public Safety** | Provincial Disaster Management, municipal water/power chiefs | Multi-infrastructure dependency matrices, cell broadcast (SMS-CB) |

---

### Module 1: SAPP Regional Power Grid (`/grid`)
- **Interconnected SADC Grid:** Live monitoring across South Africa (Eskom), Namibia (NamPower), Botswana (BPC), Zimbabwe (ZESA), Mozambique (EDM/HCB), and Zambia (ZESCO).
- **Cumulative Transformer Loss-of-Life:** Computes insulation thermal degradation via Arrhenius aging formulations ($\sim 0.3\%$ loss of life per 15 A GIC event), preserving records for post-storm asset health accounting.
- **Neutral-Blocking (GRD) Status Board:** Real-time state of Ground Return Devices and series capacitor banks at Kendal, Matimba, and Cahora Bassa.
- **Load-Flow Rerouting Directives:** Pre-computed automated redispatch orders diverting high-voltage power from vulnerable 765 kV lines to lower-induction 400 kV corridors before thermal runaway occurs.

### Module 2: GNSS Scintillation & Ionospheric Risk (`/gnss`)
- **PRISM-Aligned Receiver Grid:** Near-real-time monitoring of 10 SADC stations (Hermanus, Sutherland, Hartebeesthoek, Springbok, Windhoek, Tsumeb, Gaborone, Lusaka, Harare, and Maputo).
- **Dual Scintillation Indices:** Calculates amplitude scintillation ($S_4$) and phase scintillation ($\sigma_\phi$).
- **Three-Tier Operational Engine:**
  - `LOW` ($S_4 < 0.2$): Nominal RTK operations.
  - `MODERATE` ($0.2 \le S_4 < 0.5$): RTK convergence warnings; autonomous farming guidance alert.
  - `SEVERE` ($S_4 \ge 0.5$): Autonomous mining excavator halt and drone return-to-base directives.
- **EPB Zonal Drift Forecast:** 1–3 hour Equatorial Plasma Bubble trajectory forecast with $95\%$ confidence bounds.
- **SMS Last-Mile Dispatch:** Direct integration with Africa's Talking and Twilio to transmit mission-critical alerts to basic GSM phones in remote areas lacking internet.
- **Post-Event Accuracy Degradation Modal:** Quantifies horizontal and vertical positional error deviations (up to 4.8 m) for insurance claims and operations verification.

### Module 3: Health System Resilience (`/health`)
- **Hospital–Substation Risk Overlay:** Direct physical coupling of 8 major SADC tertiary hospitals (Chris Hani Baragwanath, Charlotte Maxeke, Tygerberg, Groote Schuur, Inkosi Albert Luthuli, Steve Biko, Windhoek Central, UTH Lusaka) to their feeding 400 kV substations and GIC risk tiers.
- **Clinical Surge Multipliers:** Evaluates geomagnetic biological disturbances based on peer-reviewed clinical literature:
  - Stroke emergency admission surge multiplier ($1.25–1.6\times$ relative risk).
  - Cardiac arrhythmia & myocardial infarction multiplier ($1.5–2.2\times$ baseline).
- **Pre-Storm Readiness Checklist:** Automated emergency protocol tracking for backup diesel generators, fuel stores ($>72\text{ hours}$), and vaccine cold-chain pre-chilling.
- **Vulnerable-Patient API Feed:** REST payload generator alerting connected health applications and telemetry for hypertensive, pacemaker, and dialysis patients.

### Module 4: Aviation Risk Triad (`/aviation`)
- **ICAO SWIS & PECASUS Triad:**
  - **HF Absorption:** Polar Cap Absorption & riometer thresholds ($2\text{ dB} / 5\text{ dB}$) with Maximum Usable Frequency (MUF) depression ($30\% / 50\%$).
  - **Cosmic Radiation Dose Rate:** Real-time effective dose rates ($\mu\text{Sv/h}$) against ICAO moderate ($30\ \mu\text{Sv/h}$) and severe ($80\ \mu\text{Sv/h}$) thresholds at cruising altitudes (FL390 and FL310).
  - **GNSS / SATCOM Degradation:** L1/L5 scintillation advisory on long-haul routes.
- **Flight Corridor Altitude Step-Down Advisory:** Actionable rerouting recommendations for JNB-LHR, CPT-DXB, JNB-NBO, and JNB-Perth (e.g., FL390 $\to$ FL310 step-down yielding a $38\%$ radiation dose reduction).
- **Aircrew Cumulative Dosimetry:** Logbook tracking cumulative micro-Sieverts ($\mu\text{Sv}$) over a rolling 12-month window against regulatory limits ($20\text{ mSv/year}$).
- **Pre-Flight Briefing Export:** Instant generation of flight-plan attachable space weather risk advisories in JSON and downloadable format.

### Module 5: Satellite Drag & Orbital Decay (`/satellites`)
- **14-Day Rolling Solar Drag Forecast:** Solar radio flux ($F_{10.7}$), $K_p$, and $A_p$ driving an NRLMSISE-00 atmospheric expansion proxy.
- **Per-Satellite 7-Day Altitude Decay:** Physical drag decay modeling ($F_d = \frac{1}{2} \rho v^2 C_d A$) for regional and global LEO assets:
  - ZACube-2 (SANSA 3U CubeSat)
  - SumbandilaSat-2 (Earth observation)
  - MDASat-1 (Marine domain awareness)
  - Starlink-LEO & Sentinel-2
- **Conjunction Safety Bubble Adjuster:** Automatically expands collision avoidance buffers from nominal $1.0\text{ km}$ to $3.5\text{ km}$ during severe thermospheric heating events.

### Module 6: Public Safety & Emergency Management (`/public`)
- **Plain-Language Citizen Bulletins:** Converts complex magnetohydrodynamic alerts into plain language for civil protection, municipal disaster directors, and citizens.
- **Critical Infrastructure Dependency Matrix:** Maps transmission substations to municipal water treatment plants (Rand Water Zuikerbosch, Umgeni Water Wiggins, Atlantis Aquifer) and telecommunication switching centers (Vodacom Midrand Core Switch).
- **Disaster Management Pre-Positioning Checklist:** Automated resource preparation for Provincial Disaster Management Centres (PDMC), Emergency Medical Services (EMS), and the National Disaster Management Centre (NDMC).
- **Emergency Broadcast Trigger:** Simulates Cell Broadcast (SMS-CB) alerts and SABC radio emergency interrupts.

---

## 4. Core Command & Forensic Tools

- **Mission Control View (`/`):** Real-time Kaapvaal Craton lithospheric MT impedance solver, DSCOVR L1 satellite solar wind ingestion, 15–30 min lead time GIC predictor, interactive 2.5D Leaflet substation map with dynamic line currents, and live SVG phasor vector diagram.
- **Alert Feed (`/alerts`):** NERC TPL-007 compliant alert feed, audio annunciator, SMS dispatch simulator, and acknowledgement workflow.
- **Storm Replay Theatre (`/replay`):** Historical validation against G5 May 2024 (Gannon), 1989 Hydro-Québec collapse, and 2003 Halloween storms with live playback scrubbing.
- **Model Transparency & Lineage (`/model`):** NASA ML validation metrics ($R^2 = 0.94$, RMSE $0.18\ \mu\text{V/m}$), 1D MT crustal layer table, and data lineage diagram.
- **C++ Hardware Probe (`/hardware`):** Raspberry Pi Pico + RM3100 3-axis magneto-inductive sensor driver, UART serial packet streaming, and drift calibration.
- **Landing Experience (`apps/home`):** Red liquid canvas background, crumbling phasor typography, pinned pipeline, stagnant Palantir-style video storm showcase, and glassy Phi ($\Phi$) logo.

---

## 5. Mathematical & Physical Formulation

### 5.1 1D Multi-Layer Lithospheric Surface Impedance
For an $N$-layer horizontally stratified Earth conductivity profile (Kaapvaal Craton: resistive Archean shield overlying conductive upper mantle), the surface impedance $Z_1(\omega)$ is solved via **Wait's recursive algorithm**:

$$k_j = \sqrt{i \omega \mu_0 \sigma_j}, \quad \eta_j = \frac{i \omega \mu_0}{k_j}$$

$$Z_j(\omega) = \eta_j \frac{Z_{j+1} + \eta_j \tanh(k_j h_j)}{\eta_j + Z_{j+1} \tanh(k_j h_j)}, \quad Z_N = \eta_N$$

### 5.2 Plane-Wave Geoelectric Field Induction
The horizontal geoelectric field components ($E_x$ North, $E_y$ East in V/km) are solved in the frequency domain from geomagnetic field variations ($B_x, B_y$ in nT) via Fast Fourier Transform:

$$\tilde{E}_x(\omega) = \frac{Z_1(\omega)}{\mu_0} \tilde{B}_y(\omega), \quad \tilde{E}_y(\omega) = -\frac{Z_1(\omega)}{\mu_0} \tilde{B}_x(\omega)$$

### 5.3 Lehtinen-Pirjola (1985) Transmission Network Solution
For an interconnected power grid with substation grounding admittances $\mathbf{Y}_e = \text{diag}(1/R_{\text{total}})$ and grid line admittances $\mathbf{Y}_n$:

$$(\mathbf{Y}_e + \mathbf{Y}_n) \mathbf{V}_e = \mathbf{J}$$

$$\mathbf{I}_{\text{GIC}} = \mathbf{Y}_e \mathbf{V}_e, \quad \text{where } \sum_{i=1}^N I_{\text{GIC}, i} = 0 \text{ (Kirchhoff Conservation)}$$

### 5.4 Transformer Core Saturation & Reactive Power Deficit
Quasi-DC GICs shift transformer core excitation into half-cycle saturation, generating severe reactive power deficits:

$$Q_{\text{loss}} \approx k_q \cdot V_{\text{pu}} \cdot I_{\text{GIC, phase}} \quad (\text{MVAR})$$

### 5.5 Atmospheric Drag & Orbital Altitude Decay
For low-Earth orbit satellites passing through the heated thermosphere during elevated $F_{10.7}$ and $K_p$:

$$F_d = \frac{1}{2} \rho(z, F_{10.7}, K_p) v^2 C_d A, \quad \Delta z = -\int \frac{2 F_d}{m v} \, dt$$

---

## 6. Repository Structure

```
Phasor/
├── apps/
│   ├── dashboard/                  # Operations Control Room (Next.js 14 + React 18 + TS)
│   │   ├── components/             # Sidebar, Header, SubstationMap, PhasorDiagram
│   │   └── pages/                  # Six SADC operational pictures + core tools
│   │       ├── index.tsx           # Mission Control command view
│   │       ├── grid.tsx            # SAPP Interconnected Power Grid
│   │       ├── gnss.tsx            # GNSS Scintillation & EPB drift forecast
│   │       ├── health.tsx          # Health System Resilience & Hospital overlay
│   │       ├── aviation.tsx        # Aviation Risk Triad & Aircrew dosimetry
│   │       ├── satellites.tsx      # LEO Satellite Drag & Collision bubbles
│   │       ├── public.tsx          # Public Safety & Civil Protection
│   │       ├── alerts.tsx          # Alert feed & dispatch
│   │       ├── replay.tsx          # Historical storm replay theatre
│   │       ├── model.tsx           # Model transparency & data lineage
│   │       └── hardware.tsx        # C++ magnetometer hardware probe
│   └── home/                       # Editorial Landing Page (Vite + React + Three.js)
│       └── src/                    # Red liquid canvas, crumbling phasor, storm carousel
├── engine/                         # Python Scientific Physics & Multi-Hazard Engines
│   ├── physics.py                  # 1D Wait recursive MT impedance & FFT E-field engine
│   ├── network.py                  # Lehtinen-Pirjola nodal admittance GIC solver
│   ├── grid_topology.py            # Southern African 400kV & 765kV grid network
│   ├── sadc_grid.py                # SAPP cross-border grid & transformer wear engine
│   ├── gnss_scintillation.py       # SADC S4/σφ indices & EPB trajectory forecast
│   ├── health_resilience.py        # Hospital-substation overlay & stroke/cardiac multipliers
│   ├── aviation_triad.py           # ICAO SWIS triad & aircrew radiation dosimetry
│   ├── satellite_drag.py           # 14-day solar drag & LEO orbital decay engine
│   ├── public_safety.py            # Civil protection bulletins & infrastructure dependency
│   ├── risk_assessment.py          # NERC TPL-007 transformer saturation rules
│   └── storm_event.py              # Historical G5 May 2024 storm replay streamer
├── services/
│   └── api/                        # High-Performance C# ASP.NET Core microservices
│       ├── Phasor.Api/             # REST API & SignalR real-time GIC hub
│       ├── Phasor.Engine/          # C# Lehtinen-Pirjola matrix implementation
│       └── Phasor.Tests/           # xUnit test suite (3/3 passing)
├── firmware/                       # Embedded C++ Pico SDK firmware for RM3100
├── hardware/                       # Python serial streamer for DIY ground magnetometer
├── server/
│   └── main.py                     # Master FastAPI backend router (port 8000)
├── tests/                          # Python Unit Test Suite (44/44 passing)
│   ├── test_physics.py             # Cagniard & Wait MT induction formula tests
│   ├── test_network.py             # Kirchhoff current conservation tests
│   ├── test_sadc_multihazard.py    # Complete test suite for all 6 SADC engines
│   └── test_direct_api.py          # FastAPI REST endpoint integration tests
├── .env.example                    # Template environment credentials file
├── run_demo.py                     # CLI verification & runner
└── README.md
```

---

## 7. Environment Configuration (`.env`)

Configure your local environment by creating a `.env` file (copied from `.env.example`):

```env
# Server Ports & Microservice Endpoints
PORT=8000
FASTAPI_PORT=8000
DOTNET_API_URL=http://localhost:5000
PYTHON_ENGINE_URL=http://localhost:8000

# Telemetry Streams
NOAA_SWPC_RTSW_URL=https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json
NOAA_MAG_URL=https://services.swpc.noaa.gov/products/solar-wind/mag-1-day.json
SANSA_HERMANUS_API_URL=https://spaceweather.sansa.org.za/api/geomag/her

# SADC Field Alerting (Low-Bandwidth SMS)
AFRICAS_TALKING_API_KEY=your_africas_talking_key_here
AFRICAS_TALKING_USERNAME=phasor_sadc
TWILIO_ACCOUNT_SID=your_twilio_sid_here
TWILIO_AUTH_TOKEN=your_twilio_token_here
TWILIO_FROM_NUMBER=+27870000000

# Regional SADC Network APIs
SAPP_DISPATCH_ENDPOINT=https://sapp.co.zw/api/v1/corridor-dispatch
SAPP_API_TOKEN=your_sapp_token_here
GNSS_SEPTENTRIO_KEY=your_septentrio_key_here
ICAO_SWIS_API_ENDPOINT=https://swis.icao.int/v2/pecasus/advisories
SPACE_TRACK_API_KEY=your_spacetrack_key_here
MONGODB_URI=mongodb://localhost:27017/phasor_sadc
```

---

## 8. Quickstart & Verification

### 8.1 Run All Unit Tests
Verify the entire physics engine, SADC multi-hazard calculations, and .NET services:

```bash
# Python Unit Tests (44 tests)
python -m unittest discover tests

# C# .NET Unit Tests (3 tests)
dotnet test services/api/Phasor.Tests/Phasor.Tests.csproj
```

### 8.2 Launch the FastAPI Backend
Start the master REST API and real-time computation server on port 8000:
```bash
python -m uvicorn server.main:app --port 8000 --host 0.0.0.0 --reload
```
Interactive Swagger documentation is available at **[http://localhost:8000/docs](http://localhost:8000/docs)**.

### 8.3 Launch the Operations Control Dashboard
Start the Next.js multi-hazard operations center on port 3000:
```bash
cd apps/dashboard
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to access all 6 operational pictures.

### 8.4 Launch the Editorial Landing Page
Start the Vite presentation landing page on port 5173:
```bash
cd apps/home
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser to explore the editorial intro.

---

## 9. Scientific References & Operational Precedents

1. **Ngwira, C. M., McKinnell, L. A., Cilliers, P. J., & Gaunt, C. T. (2009).** *Modeling geomagnetically induced currents in the South African electric power network.* Space Weather, 7(10), S10004.
2. **Gaunt, C. T., & Coetzee, G. (2007).** *Transformer failures in regions using power systems at mid-latitudes.* International Conference on Power Systems Transients (IPST).
3. **Lehtinen, M., & Pirjola, R. (1985).** *Currents produced in earthed conductor networks by digitally-recorded ground conductivity and geomagnetic data.* Annales Geophysicae, 3(4), 479-484.
4. **Wait, J. R. (1953).** *Propagation of radio waves over a stratified ground.* Geophysics, 18(2), 416-422.
5. **PRISM Framework:** *Phase and Amplitude Scintillation Monitoring and Alerting for Low-Latitude GNSS Operations.*
6. **PECASUS & ICAO SWIS:** *Manual on Space Weather Information in Support of International Air Navigation (Doc 10100).*
7. **NASA DSCOVR Mission:** *PlasMag & Faraday Cup Real-Time Solar Wind Telemetry.* NOAA Space Weather Prediction Center.
8. **SANSA Space Science:** *Hermanus Geomagnetic Observatory (HER) Vector Telemetry.* INTERMAGNET Network.

---

## 10. License

Distributed under the **MIT License**. See `LICENSE` for details.
