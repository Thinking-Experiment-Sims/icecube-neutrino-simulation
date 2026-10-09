# The Thinking Experiment: IceCube Neutrino Observatory Interactive Simulation
### Commemorating the 2026 Nobel Prize in Physics (Francis Halzen)
*Authored for Vladimir Lopez · The Thinking Experiment · October 2026*

---

## 🌌 Overview

This interactive simulation suite brings the physics of the **IceCube Neutrino Observatory** and cosmic messengers to life. Designed for high school physics students, STEM educators, and seminar audiences, it models how Francis Halzen turned a cubic kilometer of ancient South Pole ice into the world's most sensitive neutrino telescope.

### 🏆 Key Scientific Discoveries Simulated
- **2013 First Extraterrestrial Neutrinos ("Bert & Ernie"):** 1.04 PeV and 1.14 PeV cascades in deep ice ($5.7\sigma$ discovery).
- **2017 TXS 0506+056 (Multimessenger Alert):** 290 TeV upgoing muon neutrino coincident with a flaring blazar 4 billion light-years away.
- **2022 Active Galaxy NGC 1068:** 79 neutrinos ($4.2\sigma$ evidence) from an obscured supermassive black hole shielded by dense dust.
- **2023 / 2026 The Milky Way in Neutrinos:** 60,000 cascade events isolated with machine learning ($5.7\sigma$ galactic plane emission).

---

## 🔬 The Simulation Modules

### 1. 🎙️ Guided Seminar Walkthrough (Default Mode)
- **14-step presentation run-of-show** directly synchronized with the seminar deck and seminar guide.
- Step-by-step speaker notes, key numerical data cards, and classroom inquiry prompts.
- Automatically transitions and animates the live 3D and 2D physics engines as you advance through the slides.

### 2. 🧊 IceCube 3D Detector (Digital Twin)
- **Geometry:** 86 vertical strings on a $125\text{ m}$ hexagonal grid, 5,160 Digital Optical Modules (DOMs), sensor depth from $1,450\text{ m}$ to $2,450\text{ m}$, and the central dense DeepCore subarray.
- **Nanosecond Time Scrubber:** Displays the arrival of Cherenkov light cones in real-time ($0\text{--}3,000\text{ ns}$).
- **Chromatic Rainbow Timing:** Maps arrival times to the standard IceCube color palette (**Red = Earliest**, Yellow, Green, Cyan, **Blue = Latest**).
- **Charge Proportional Sizing:** Spheres scale dynamically with detected photoelectrons.
- **Historic Presets:** One-click recreation of the 2013, 2017, 2022, 2023, and atmospheric background events.
- **Camera Presets:** 3D Perspective, Top-Down Celestial Sky Map, Side Depth Elevation, and DeepCore close-up.

### 3. 🔭 Cosmic Engine (Sources & Multimessenger Propagation)
- **4th-order Runge-Kutta Lorentz Force Integration:** Shows charged cosmic-ray protons bending erratically in turbulent galactic magnetic fields ($B \sim 0.1\text{--}10\text{ nG}$).
- **Straight Neutrino Geodesics:** Demonstrates why uncharged neutrinos point directly back to the accelerator.
- **Photopion Production ($p + \gamma \to \Delta^+$):** Interactive decay branching into neutral pions ($\pi^0 \to 2\gamma$) and charged pions ($\pi^+ \to \mu^+ \nu_\mu$).
- **NGC 1068 Dust Torus:** Shows high-energy gamma rays being absorbed while neutrinos pass through unaffected.

### 4. ⚡ Subatomic Collision (Deep Inelastic Scattering Explorer)
- **Quark-Level Feynman Canvas:** Interactive electroweak boson exchange.
- **Charged Current ($W^\pm$):** Produces outgoing charged leptons (muon track $\Delta\theta < 0.5^\circ$, electron cascade, or PeV tau double-bang).
- **Neutral Current ($Z^0$):** Uncharged neutrino flies on unseen, leaving only the hadronic shower $X$.
- **Inelasticity Slider ($y = E_{\text{had}} / E_{\nu}$):** Adjusts the energy split between hadronic vertex and outgoing lepton.
- **Spectator Quarks:** Visualizes the 2 spectator quarks that shatter to form the hadronic spray.

### 5. 🌊 Cherenkov Optics ("Sonic Boom for Light")
- **Wave Tank Simulator:** Generates expanding spherical electromagnetic wavelets at phase speed $c/n$.
- **Mach Shock Front:** Visualizes the onset of Cherenkov radiation when $\beta > 1/n$, calculating the exact emission angle:
  $$\cos \theta_c = \frac{1}{\beta n} \implies \theta_c \approx 41^\circ \text{ in ice}$$
- **South Pole Ice Profile:** Explores shallow bubble ice, clear deep clathrate ice, and the historic volcanic dust layer ($2,000\text{--}2,100\text{ m}$).

### 6. 📊 5-Sigma Discovery Challenge (Background Rejection & Statistics)
- **Needle in a Haystack:** Compares $2,700\text{ Hz}$ surface atmospheric muons ($85\text{ billion/yr}$) and $100,000\text{/yr}$ atmospheric neutrinos against only $\sim 100\text{/yr}$ cosmic signal.
- **Active Filters:** Toggle Earth rock overburden (upgoing filter) and HESE outer DOM veto.
- **Poisson Significance Calculator:** Interactive $Z$-score and $p$-value solver comparing $4.2\sigma$ ("evidence") with $5.7\sigma$ ("discovery").

### 7. 🔊 Accessible PER Audio Sonification
- Muted by default to respect classroom and seminar settings.
- Dual visual-audio coding (flashing DOMs accompany every tone).
- Micro-pings for Cherenkov photon hits, linear arpeggios for muon tracks, and deep resonant sub-bass booms for PeV cascades.

---

## 🚀 How to Run

Because all dependencies (`three.min.js`, `OrbitControls.js`) are bundled locally, the simulation runs **100% offline**:

1. **Direct Browser Open:**
   - Double-click [`index.html`](file:///c:/Users/vladi/AI%20Projects/IceCube-Neutrino-Simulation/index.html) in Windows File Explorer or open it in Microsoft Edge/Chrome.
2. **Local HTTP Server (Optional):**
   ```powershell
   cd "c:\Users\vladi\AI Projects\IceCube-Neutrino-Simulation"
   python -m http.server 8080
   ```
   Then navigate to `http://localhost:8080` in any web browser.

---

*Part of The Thinking Experiment simulation library: https://thinking-experiment-sims.github.io*
