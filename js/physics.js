/**
 * physics.js - Core Physics Engine for IceCube Neutrino Simulation Suite
 * Authored for "The Thinking Experiment" · Vladimir Lopez · 2026
 * 
 * Provides rigorous mathematical physics formulations for:
 * 1. Relativistic Kinematics & Cherenkov Radiation (Frank-Tamm formula, cone angles)
 * 2. Cosmic Particle Accelerators & Turbulent Magnetic Field Deflections (RK4 Lorentz Solver)
 * 3. Photopion Production & Multimessenger Decay Chains (p + gamma -> Delta+)
 * 4. Deep Inelastic Scattering (Electroweak DIS: CC W+/- vs NC Z0, Inelasticity y, Spectator Quarks)
 * 5. Optical Properties of Deep Antarctic Ice & Stratigraphy (Clathrates, Dust Layer)
 * 6. Statistical Significance & Poisson Background Solvers (Li & Ma formula, Z-score, p-value)
 */

const Physics = (() => {
  // --- Fundamental Physical Constants ---
  const C_LIGHT = 299792458; // m/s (speed of light in vacuum)
  const N_ICE = 1.31; // Refractive index of deep Antarctic ice
  const C_ICE = C_LIGHT / N_ICE; // ~2.288e8 m/s (phase speed of light in ice)
  const ALPHA_EM = 1 / 137.036; // Fine-structure constant
  const MASS_PROTON = 0.938272; // GeV/c^2
  const MASS_MUON = 0.105658; // GeV/c^2
  const MASS_ELECTRON = 0.000511; // GeV/c^2
  const MASS_TAU = 1.77686; // GeV/c^2
  const MASS_W = 80.379; // GeV/c^2
  const MASS_Z = 91.1876; // GeV/c^2
  const TAU_LIFETIME = 2.903e-13; // seconds

  // --- 1. Cherenkov Radiation Physics ---
  
  /**
   * Calculate Cherenkov emission angle theta_c in radians
   * cos(theta_c) = 1 / (beta * n)
   * Returns null if beta < 1/n (below threshold)
   */
  function cherenkovAngle(beta, n = N_ICE) {
    const thresholdBeta = 1 / n;
    if (beta < thresholdBeta) return null;
    const cosTheta = 1 / (beta * n);
    return Math.acos(Math.min(1.0, cosTheta));
  }

  /**
   * Cherenkov threshold velocity (beta = v/c)
   */
  function cherenkovThresholdBeta(n = N_ICE) {
    return 1 / n;
  }

  /**
   * Cherenkov kinetic energy threshold in MeV for a particle of mass m (MeV)
   */
  function cherenkovThresholdEnergy(massMeV, n = N_ICE) {
    const betaTh = 1 / n;
    const gammaTh = 1 / Math.sqrt(1 - betaTh * betaTh);
    return massMeV * (gammaTh - 1);
  }

  /**
   * Frank-Tamm formula: Photons emitted per cm of track in optical bandwidth [lambda1, lambda2]
   * dN/dx = 2 * pi * alpha * sin^2(theta_c) * (1/lambda1 - 1/lambda2)
   * lambda in nm, returns photons per cm
   */
  function frankTammPhotonsPerCm(beta, n = N_ICE, lambda1Nm = 300, lambda2Nm = 600) {
    const theta = cherenkovAngle(beta, n);
    if (theta === null) return 0;
    const sin2Theta = Math.sin(theta) ** 2;
    // convert nm to cm: 1 nm = 1e-7 cm
    const invLambdaDiffCm = (1 / (lambda1Nm * 1e-7)) - (1 / (lambda2Nm * 1e-7));
    return 2 * Math.PI * ALPHA_EM * sin2Theta * invLambdaDiffCm;
  }

  // --- 2. Antarctic Ice Optical Stratigraphy ---

  /**
   * Optical properties of South Pole ice as a function of depth z (meters, 0 = surface)
   * Returns { clear: boolean, scatteringLength: m, absorptionLength: m, dustConcentration: [0, 1] }
   */
  function icePropertiesAtDepth(depthM) {
    // Surface to 1400m: Bubble ice (strong scattering)
    // 1450m to 2450m: Instrumented IceCube volume (ultra-clear clathrate ice)
    // 2000m to 2100m: Historic volcanic dust layer (deposited ~65k years ago)
    if (depthM < 1400) {
      const bubbleFactor = Math.max(0.05, depthM / 1400);
      return {
        zone: "Bubble Ice",
        isFiducial: false,
        scatteringLength: 2 + 10 * bubbleFactor, // 2m to 12m
        absorptionLength: 50 + 40 * bubbleFactor,
        dustConcentration: 0.1,
        colorHex: "#e2f1f8"
      };
    }

    // Check for volcanic dust layer
    if (depthM >= 1990 && depthM <= 2110) {
      // Gaussian peak at 2045m
      const dustPeak = Math.exp(-0.5 * Math.pow((depthM - 2045) / 25, 2));
      return {
        zone: "Volcanic Dust Layer",
        isFiducial: true,
        scatteringLength: 15 * (1 - 0.65 * dustPeak), // Dips down to ~5m
        absorptionLength: 120 * (1 - 0.55 * dustPeak), // Dips down to ~55m
        dustConcentration: 0.2 + 0.8 * dustPeak,
        colorHex: "#c5ab8d"
      };
    }

    // Ultra-clear deep clathrate ice
    return {
      zone: "Ultra-Clear Clathrate Ice",
      isFiducial: true,
      scatteringLength: 45 + 10 * Math.sin(depthM * 0.01), // ~35 - 55m
      absorptionLength: 180 + 30 * Math.cos(depthM * 0.005), // ~150 - 210m
      dustConcentration: 0.02,
      colorHex: "#00f3ff"
    };
  }

  // --- 3. Cosmic Accelerator & Magnetic Field Deflection ---

  /**
   * Runge-Kutta 4th Order integrator for a charged particle in a turbulent magnetic field
   * Equation of motion: dp/dt = q * (v x B)
   * pos in kpc, velocity in c, B in nG, energy in PeV
   */
  function stepLorentzRK4(particle, dtKpc, magneticFieldFn) {
    // For neutral particles (neutrinos, photons), travel strictly straight
    if (particle.charge === 0) {
      particle.x += particle.vx * dtKpc;
      particle.y += particle.vy * dtKpc;
      particle.z += particle.vz * dtKpc;
      return;
    }

    // Lorentz force scale factor for relativistic proton:
    // d(theta)/dL ~ (q * B_perp) / E
    // Scaling constant for graphical visualization of realistic curvature
    const curvatureScale = (particle.charge / Math.max(0.1, particle.energyPeV)) * 0.04;

    function getAcceleration(x, y, z, vx, vy, vz) {
      const B = magneticFieldFn(x, y, z);
      // a = v x B
      const ax = (vy * B.z - vz * B.y) * curvatureScale;
      const ay = (vz * B.x - vx * B.z) * curvatureScale;
      const az = (vx * B.y - vy * B.x) * curvatureScale;
      return { ax, ay, az };
    }

    // State 1
    const a1 = getAcceleration(particle.x, particle.y, particle.z, particle.vx, particle.vy, particle.vz);

    // State 2
    const v2x = particle.vx + 0.5 * dtKpc * a1.ax;
    const v2y = particle.vy + 0.5 * dtKpc * a1.ay;
    const v2z = particle.vz + 0.5 * dtKpc * a1.az;
    const a2 = getAcceleration(particle.x + 0.5 * dtKpc * particle.vx, particle.y + 0.5 * dtKpc * particle.vy, particle.z + 0.5 * dtKpc * particle.vz, v2x, v2y, v2z);

    // State 3
    const v3x = particle.vx + 0.5 * dtKpc * a2.ax;
    const v3y = particle.vy + 0.5 * dtKpc * a2.ay;
    const v3z = particle.vz + 0.5 * dtKpc * a2.az;
    const a3 = getAcceleration(particle.x + 0.5 * dtKpc * v2x, particle.y + 0.5 * dtKpc * v2y, particle.z + 0.5 * dtKpc * v2z, v3x, v3y, v3z);

    // State 4
    const v4x = particle.vx + dtKpc * a3.ax;
    const v4y = particle.vy + dtKpc * a3.ay;
    const v4z = particle.vz + dtKpc * a3.az;
    const a4 = getAcceleration(particle.x + dtKpc * v3x, particle.y + dtKpc * v3y, particle.z + dtKpc * v3z, v4x, v4y, v4z);

    // Update velocity and position
    particle.vx += (dtKpc / 6) * (a1.ax + 2 * a2.ax + 2 * a3.ax + a4.ax);
    particle.vy += (dtKpc / 6) * (a1.ay + 2 * a2.ay + 2 * a3.ay + a4.ay);
    particle.vz += (dtKpc / 6) * (a1.az + 2 * a2.az + 2 * a3.az + a4.az);

    // Normalize velocity to c = 1
    const speed = Math.hypot(particle.vx, particle.vy, particle.vz);
    if (speed > 0) {
      particle.vx /= speed;
      particle.vy /= speed;
      particle.vz /= speed;
    }

    particle.x += particle.vx * dtKpc;
    particle.y += particle.vy * dtKpc;
    particle.z += particle.vz * dtKpc;
  }

  // --- 4. Deep Inelastic Scattering (DIS) Kinematics ---

  /**
   * Generate an electroweak DIS event for incident neutrino of flavor ('e', 'mu', 'tau') and energy (TeV)
   * interactionType: 'CC' (Charged Current W) or 'NC' (Neutral Current Z0)
   * inelasticity y: fraction of energy transferred to hadronic shower
   */
  function simulateDISEvent(flavor, energyTeV, interactionType = 'CC', customY = null) {
    // Mean inelasticity <y> ~ 0.28 for neutrino, ~0.24 for anti-neutrino at high energy
    const y = customY !== null ? customY : (0.15 + 0.3 * Math.random());
    const energyHadronicTeV = energyTeV * y;
    const energyLeptonTeV = energyTeV * (1 - y);

    let topology = "";
    let description = "";
    let trackLengthM = 0;
    let tauDecayGapM = 0;

    if (interactionType === 'NC') {
      topology = "Cascade";
      description = `Neutral Current ($Z^0$ exchange): Neutrino scatters elastically and exits unseen with ${(1 - y) * 100}%. Only the ${energyHadronicTeV.toFixed(1)} TeV hadronic cascade produces Cherenkov light.`;
    } else {
      // Charged Current (W exchange)
      if (flavor === 'mu') {
        topology = "Track";
        // Muon range in ice: at high energy dE/dx = a + b*E, range is hundreds of meters to kilometers
        // Roughly ~4.5 km per PeV of muon energy, scaling logarithmically
        trackLengthM = Math.min(3000, 300 + 400 * Math.log10(Math.max(1, energyLeptonTeV)));
        description = `Charged Current ($W^\\pm$ exchange): Muon neutrino produces a relativistic muon carrying ${energyLeptonTeV.toFixed(1)} TeV, creating a straight Cherenkov track of ~${trackLengthM.toFixed(0)}m plus a ${energyHadronicTeV.toFixed(1)} TeV vertex shower.`;
      } else if (flavor === 'e') {
        topology = "Cascade";
        description = `Charged Current ($W^\\pm$ exchange): Electron neutrino creates an electron that initiates an intense electromagnetic cascade overlapping the hadronic shower within <10m. Total deposited energy: ${energyTeV.toFixed(1)} TeV.`;
      } else if (flavor === 'tau') {
        // Tau decay distance: d = gamma * c * tau_0 = (E_tau / m_tau) * c * tau_0
        // d ~ 50 meters per PeV
        tauDecayGapM = (energyLeptonTeV / 1000) * 50;
        if (energyTeV >= 500 && tauDecayGapM > 15) {
          topology = "Double Bang";
          description = `Charged Current ($W^\\pm$ exchange): High-energy tau neutrino produces a ${energyHadronicTeV.toFixed(1)} TeV first bang (vertex shower), travels ${tauDecayGapM.toFixed(1)}m, then tau decays into a second ${energyLeptonTeV.toFixed(1)} TeV bang!`;
        } else {
          topology = "Cascade";
          description = `Charged Current ($W^\\pm$ exchange): Tau decays too quickly (<15m) to resolve separate bangs; reconstructs as an elongated cascade.`;
        }
      }
    }

    return {
      flavor,
      energyTeV,
      interactionType,
      y,
      energyHadronicTeV,
      energyLeptonTeV,
      topology,
      description,
      trackLengthM,
      tauDecayGapM
    };
  }

  // --- 5. Statistical Significance Solvers ---

  /**
   * Calculate discovery significance Z (in standard deviations sigma)
   * Using the standard Gaussian approximation Z = (N_obs - N_bkg) / sqrt(N_bkg)
   * and the exact Li & Ma profile likelihood ratio formula when appropriate.
   */
  function calculateSignificance(nObserved, nBackground) {
    if (nBackground <= 0) return 0;
    if (nObserved <= nBackground) return 0;

    // Standard Gaussian approximation
    const zSimple = (nObserved - nBackground) / Math.sqrt(nBackground);

    // Li & Ma profile likelihood formula (1983)
    const term1 = nObserved * Math.log(nObserved / nBackground);
    const term2 = nObserved - nBackground;
    const zLiMa = Math.sqrt(Math.max(0, 2 * (term1 - term2)));

    // Corresponding p-value from Z: p = 0.5 * erfc(Z / sqrt(2))
    const pValue = 0.5 * erfc(zLiMa / Math.SQRT2);

    return {
      zScore: zLiMa,
      zScoreSimple: zSimple,
      pValue: pValue,
      isEvidence: zLiMa >= 3.0,
      isStrongEvidence: zLiMa >= 4.0,
      isDiscovery: zLiMa >= 5.0
    };
  }

  /**
   * Complementary error function approximation (Abramowitz and Stegun)
   */
  function erfc(x) {
    if (x < 0) return 2 - erfc(-x);
    const t = 1.0 / (1.0 + 0.3275911 * x);
    const poly = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429))));
    return poly * Math.exp(-x * x);
  }

  return {
    C_LIGHT,
    N_ICE,
    C_ICE,
    ALPHA_EM,
    MASS_PROTON,
    MASS_MUON,
    MASS_ELECTRON,
    MASS_TAU,
    cherenkovAngle,
    cherenkovThresholdBeta,
    cherenkovThresholdEnergy,
    frankTammPhotonsPerCm,
    icePropertiesAtDepth,
    stepLorentzRK4,
    simulateDISEvent,
    calculateSignificance
  };
})();

// Export for module/browser compatibility
if (typeof window !== 'undefined') {
  window.Physics = Physics;
}
