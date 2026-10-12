# Ghost Particle Lab: Interactive Seminar Presentation
### Commemorating the 2026 Nobel Prize in Physics (Francis Halzen)
*Authored for Vladimir Lopez · The Thinking Experiment · October 2026*

---

## 🌌 Overview

An interactive presentation suite designed for high school and AP Physics seminars and classrooms, breaking down Francis Halzen's **2026 Nobel Prize in Physics** for the **IceCube Neutrino Observatory**.

- **Live URL:** [https://thinking-experiment-sims.github.io/icecube-neutrino-simulation/](https://thinking-experiment-sims.github.io/icecube-neutrino-simulation/)
- **Design System:** Light Mode Only · Pure White (`#ffffff`) · Teal (`#0f7e9b`) · Amber (`#d67b19`)

---

## 🔬 Presentation Slides

### 1 · Messengers (Who Keeps the Return Address?)
- **Cosmic Engine:** Real-time simulation of an active galactic nucleus (AGN/blazar) accelerating cosmic ray protons, producing neutral pions ($\pi^0 \to 2\gamma$) and charged pions ($\pi^+ \to \mu^+ \nu_\mu$).
- **Deflection & Absorption:** Charged protons bend and scatter in turbulent interstellar magnetic fields ($B$), and gamma rays are absorbed by the dense dust torus (NGC 1068).
- **Angular Histograms:** Demonstrates why uncharged neutrinos point directly back to the true celestial coordinates within $\pm 0.0^\circ$.

### 2 · Collisions & Hadronic Cascades (Deep Inelastic Scattering)
- **Split Collision Channels:** Interactive Feynman diagram clearly separating:
  1. $\nu_\mu$ Charged Current ($W^\pm$): Kilometers-long muon track + vertex hadronic cascade.
  2. $\nu_e$ Charged Current ($W^\pm$): Overlapping electromagnetic cascade + hadronic shower.
  3. $\nu_\tau$ Charged Current ($W^\pm$): "Double Bang" signature with $50\text{ m/PeV}$ tau flight.
  4. Neutral Current ($Z^0$): Outgoing neutral neutrino is invisible; only the hadronic cascade is detected.
- **Hadronic Cascade Breakdown:** Explains quark knockout, color flux tube snapping (QCD confinement), vacuum pair creation, hadronization into pions, and Cherenkov emission.
- **Inelasticity Slider:** Real-time adjustment of $y = E_{\text{had}} / E_{\nu}$.

### 3 · Ice Detector (Figure 3 & Cherenkov Light)
- **Official Nobel Schematic:** High-resolution reproduction of **Figure 3** from the Nobel Committee's Scientific Background report (*Figure credit: IceCube Collaboration*).
- **Live Cherenkov Simulation:** Interactive side-view of strings and sensors in deep ice showing the Cherenkov shockwave cone ($\cos \theta_c = \frac{1}{\beta n} \approx 41^\circ$) and nanosecond rainbow timing.

### 4 · Why a Cubic Kilometer (Scale & Earth Absorption)
- **Logarithmic Scale Ruler:** Compares benchtop detectors ($1\text{ m}$) to IceCube ($1\text{ km}^3$) and IceCube-Gen2 ($\sim 8\text{ km}^3$).
- **Earth Transmission Plot:** Calculates neutrino survival through the Earth's mantle and core as a function of energy.

### 5 · How Sure is Sure (5-Sigma Discovery Challenge)
- **Gaussian Discovery Bell Curves:** Background vs. Signal distributions with $3\sigma$ (Evidence) and $5\sigma$ (Discovery) thresholds.
- **Systematic Error Modeler:** Demonstrates how background modeling errors degrade significance.
- **Historical Results Table:** Real Nobel paper results from 2014, 2022, 2023, and 2026.

---

## 🚀 Local Run

```bash
cd ~/AI_Ecosystem/icecube-neutrino-simulation
python3 -m http.server 8080
```
Then open `http://localhost:8080` in any web browser.

---

*Part of The Thinking Experiment simulation library: https://thinking-experiment-sims.github.io/interactive-physics/*
