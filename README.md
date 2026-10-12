# The Thinking Experiment: IceCube Neutrino Observatory Interactive Simulation
### Commemorating the 2026 Nobel Prize in Physics (Francis Halzen)
*Authored for Vladimir Lopez · The Thinking Experiment · October 2026*

---

## 🌌 Overview

This interactive simulation suite brings the physics of the **IceCube Neutrino Observatory** and cosmic messengers to life. Designed for high school and AP Physics students, STEM educators, and seminar audiences, it models how Francis Halzen turned a cubic kilometer of ancient South Pole ice into the world's most sensitive neutrino telescope.

- **Live URL:** [https://thinking-experiment-sims.github.io/icecube-neutrino-simulation/](https://thinking-experiment-sims.github.io/icecube-neutrino-simulation/)
- **Design System:** Light Mode Only · Pure White (`#ffffff`) · Teal (`#0f7e9b`) · Amber (`#d67b19`)

---

## 🔬 The 6 Interactive Laboratory Modules

### 1. 🏫 Setup & Orientation
- Overview of the 2026 Nobel Prize in Physics awarded to Francis Halzen.
- Clear explanation of why neutrinos are unique cosmic messengers (uncharged, rarely interacting).
- High-level roadmap cards linking to all interactive modules with teacher demo prompts.

### 2. 🧊 IceCube 3D Detector (Digital Twin)
- **Geometry:** 86 vertical strings on a $125\text{ m}$ hexagonal grid, 5,160 Digital Optical Modules (DOMs), sensor depth from $1,450\text{ m}$ to $2,450\text{ m}$, and the central dense DeepCore subarray.
- **Nanosecond Time Scrubber:** Displays the arrival of Cherenkov light cones in real-time ($0\text{--}3,000\text{ ns}$).
- **Chromatic Rainbow Timing:** Maps arrival times to the standard IceCube color palette (**Red = Earliest**, Yellow, Green, Cyan, **Blue = Latest**).
- **Charge Proportional Sizing:** Spheres scale dynamically with detected photoelectrons.
- **Historic Presets:** One-click recreation of 2017 TXS 0506+056 (blazar muon track), 2013 Bert (PeV cascade), 2022 NGC 1068, 2023 Milky Way plane, and atmospheric background events.
- **Camera Presets:** 3D Perspective, Top-Down Celestial Sky Map, Side Depth Elevation, and DeepCore close-up.

### 3. 🔭 Cosmic Sources & Deflection Engine
- **Lorentz Force Deflection:** Shows charged cosmic-ray protons bending erratically in turbulent interstellar magnetic fields ($B \sim 0.1\text{--}10\text{ nG}$).
- **Straight Neutrino Geodesics:** Demonstrates why uncharged neutrinos point directly back to their cosmic accelerator.
- **NGC 1068 Dust Torus:** Shows high-energy gamma rays being absorbed while neutrinos pass through unaffected.

### 4. 🌊 Cherenkov Optics ("Sonic Boom for Light")
- **Wave Tank Simulator:** Generates expanding spherical electromagnetic wavelets at phase speed $c/n$.
- **Mach Shock Front:** Visualizes the onset of Cherenkov radiation when $\beta > 1/n$, calculating the exact emission angle:
  $$\cos \theta_c = \frac{1}{\beta n} \implies \theta_c \approx 41^\circ \text{ in ice}$$
- Interactive velocity and medium refractive index controls ($n = 1.31$ for Antarctic ice, $1.00$ vacuum, $1.33$ water, $1.50$ glass).

### 5. ⚡ Subatomic Collision (Deep Inelastic Scattering)
- **Quark-Level Feynman Canvas:** Interactive electroweak boson exchange.
- **Charged Current ($W^\pm$):** Produces outgoing charged leptons (muon track $\Delta\theta < 0.5^\circ$, electron cascade, or PeV tau double-bang).
- **Neutral Current ($Z^0$):** Uncharged neutrino flies on unseen, leaving only the hadronic shower $X$.
- **Inelasticity Slider ($y = E_{\text{had}} / E_{\nu}$):** Adjusts the energy split between the hadronic shower and the outgoing lepton.

### 6. 📊 5-Sigma Discovery Challenge (Background Rejection & Statistics)
- **Needle in a Haystack:** Compares $2,700\text{ Hz}$ surface atmospheric muons ($85\text{ billion/yr}$) and $100,000\text{/yr}$ atmospheric neutrinos against only $\sim 100\text{/yr}$ cosmic signal.
- **Active Filters:** Toggle Earth rock overburden (upgoing filter) and HESE outer DOM veto.
- **Poisson Significance Calculator:** Interactive $Z$-score and $p$-value solver comparing $4.2\sigma$ ("evidence") with $5.7\sigma$ ("discovery").

---

## 🚀 How to Run Locally

Because dependencies (`three.min.js`, `OrbitControls.js`) are bundled locally and KaTeX loads asynchronously from CDN with graceful unicode fallbacks:

```bash
cd ~/AI_Ecosystem/icecube-neutrino-simulation
python3 -m http.server 8080
```
Then navigate to `http://localhost:8080` in your web browser.

---

*Part of The Thinking Experiment simulation library: https://thinking-experiment-sims.github.io/interactive-physics/*
