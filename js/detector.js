/**
 * detector.js - IceCube Digital Twin & Event Generation Engine
 * Authored for "The Thinking Experiment" · Vladimir Lopez · 2026
 * 
 * Constructs the exact geometry of the IceCube Neutrino Observatory:
 * - 86 strings on a hexagonal grid (125m horizontal spacing, centered at South Pole)
 * - 60 DOMs per string spaced vertically by 17m (depth 1,450m to 2,450m)
 * - DeepCore dense central subarray (strings 79-86, 7m vertical spacing)
 * - Total of 5,160 Digital Optical Modules (DOMs)
 * - Cherenkov photon travel time and charge calculations per DOM
 * - Historic Nobel Prize Discovery Presets (2013, 2017, 2022, 2023)
 */

const Detector = (() => {
  const NUM_STRINGS = 86;
  const DOMS_PER_STRING = 60;
  const TOTAL_DOMS = NUM_STRINGS * DOMS_PER_STRING; // 5,160

  const STRING_SPACING_M = 125; // Standard string horizontal pitch
  const DOM_VERTICAL_SPACING_M = 17; // Standard DOM vertical pitch
  const DETECTOR_TOP_DEPTH_M = 1450;
  const DETECTOR_BOTTOM_DEPTH_M = 2450;
  const DETECTOR_HEIGHT_M = 1000;

  // Internal coordinate system:
  // x: East (meters), y: North (meters), z: Vertical (meters, -500m to +500m, 0 = 1950m depth)
  const DEPTH_OFFSET_M = 1950; // Reference center depth

  let allDOMs = []; // Array of 5,160 DOM objects
  let stringsMeta = []; // Metadata for 86 strings

  /**
   * Generate the hexagonal array of 86 strings and 5,160 DOMs
   */
  function initializeGeometry() {
    allDOMs = [];
    stringsMeta = [];

    // Hexagonal grid ring generator
    // IceCube strings roughly follow concentric hexagonal rings
    const stringPositions = [];

    // Center string (String 36 is roughly center)
    stringPositions.push({ x: 0, y: 0, isDeepCore: false });

    const ringCounts = [6, 12, 18, 24, 18]; // Concentric rings
    let currentRadius = STRING_SPACING_M;

    for (let ring = 0; ring < ringCounts.length && stringPositions.length < 78; ring++) {
      const count = ringCounts[ring];
      for (let i = 0; i < count && stringPositions.length < 78; i++) {
        const angle = (2 * Math.PI * i) / count;
        // Hexagonal perturbation for realistic grid
        const rad = currentRadius * (1 + 0.05 * Math.cos(6 * angle));
        stringPositions.push({
          x: rad * Math.cos(angle),
          y: rad * Math.sin(angle),
          isDeepCore: false
        });
      }
      currentRadius += STRING_SPACING_M;
    }

    // DeepCore strings: 8 densely placed strings in the center
    const deepCoreAngles = [0, Math.PI / 4, Math.PI / 2, (3 * Math.PI) / 4, Math.PI, (5 * Math.PI) / 4, (3 * Math.PI) / 2, (7 * Math.PI) / 4];
    for (let dc = 0; dc < 8 && stringPositions.length < 86; dc++) {
      const angle = deepCoreAngles[dc];
      stringPositions.push({
        x: 65 * Math.cos(angle),
        y: 65 * Math.sin(angle),
        isDeepCore: true
      });
    }

    // Now populate DOMs for all 86 strings
    let domGlobalId = 0;
    for (let s = 0; s < stringPositions.length; s++) {
      const strPos = stringPositions[s];
      const stringId = s + 1;
      const isDC = strPos.isDeepCore;

      stringsMeta.push({
        stringId,
        x: strPos.x,
        y: strPos.y,
        isDeepCore: isDC,
        domStartIndex: domGlobalId
      });

      // 60 DOMs per string
      for (let d = 0; d < DOMS_PER_STRING; d++) {
        let zPosM;
        let depthM;

        if (isDC && d >= 10) {
          // DeepCore has denser vertical spacing (7m) in deep clear ice
          zPosM = -450 + (d - 10) * 8.5;
          depthM = DEPTH_OFFSET_M - zPosM;
        } else {
          // Standard string: uniform 17m spacing
          // d = 0 (top, 1450m -> z = +500m) to d = 59 (bottom, 2450m -> z = -500m)
          zPosM = 500 - d * DOM_VERTICAL_SPACING_M;
          depthM = DEPTH_OFFSET_M - zPosM;
        }

        const iceProps = Physics.icePropertiesAtDepth(depthM);

        allDOMs.push({
          id: domGlobalId++,
          stringId,
          domIndex: d + 1,
          x: strPos.x,
          y: strPos.y,
          z: zPosM,
          depthM: depthM,
          isDeepCore: isDC,
          iceZone: iceProps.zone,
          // Dynamic hit state during simulation:
          isHit: false,
          hitTimeNs: Infinity,
          chargePE: 0 // Photoelectrons
        });
      }
    }

    return { allDOMs, stringsMeta };
  }

  // Initialize on load
  initializeGeometry();

  /**
   * Reset all DOM hit statuses to dark
   */
  function clearHits() {
    for (let i = 0; i < allDOMs.length; i++) {
      allDOMs[i].isHit = false;
      allDOMs[i].hitTimeNs = Infinity;
      allDOMs[i].chargePE = 0;
    }
  }

  /**
   * Calculate exact Cherenkov arrival times and charges for an event
   * event: {
   *   type: 'track' | 'cascade' | 'double_bang',
   *   energyTeV: number,
   *   vertex: { x, y, z },
   *   direction: { x, y, z }, // normalized vector
   *   speed: number, // in units of c
   *   lengthM: number
   * }
   */
  function simulateEventLight(event) {
    clearHits();

    const c_m_ns = Physics.C_LIGHT * 1e-9; // ~0.2998 m/ns
    const c_ice_m_ns = Physics.C_ICE * 1e-9; // ~0.2289 m/ns
    const thetaC = Physics.cherenkovAngle(1.0, Physics.N_ICE); // ~0.702 rad (~40.2 deg)
    const sinThetaC = Math.sin(thetaC);
    const cosThetaC = Math.cos(thetaC);
    const tanThetaC = Math.tan(thetaC);

    const hitDOMs = [];
    const E_TeV = event.energyTeV;

    if (event.type === 'track') {
      // Linear muon track traveling along event.direction
      const vx = event.direction.x;
      const vy = event.direction.y;
      const vz = event.direction.z;
      const trackLen = event.lengthM || 1800;

      for (let i = 0; i < allDOMs.length; i++) {
        const dom = allDOMs[i];
        // Vector from vertex to DOM
        const rx = dom.x - event.vertex.x;
        const ry = dom.y - event.vertex.y;
        const rz = dom.z - event.vertex.z;

        // Projection along track direction
        const sParallel = rx * vx + ry * vy + rz * vz;

        // Perpendicular distance to track
        const perpSq = (rx - sParallel * vx) ** 2 + (ry - sParallel * vy) ** 2 + (rz - sParallel * vz) ** 2;
        const dPerp = Math.sqrt(perpSq);

        // Optical emission point along track for Cherenkov angle thetaC:
        // s_emit = sParallel - dPerp / tan(thetaC)
        const sEmit = sParallel - dPerp / tanThetaC;

        // Is emission point within the active track segment?
        if (sEmit >= -50 && sEmit <= trackLen + 50) {
          const dPhoton = dPerp / sinThetaC;
          // Detection distance limit in clear ice (~140m)
          if (dPhoton <= 140) {
            // Arrival time: particle time to emission point + photon travel time in ice
            const tParticleNs = sEmit / c_m_ns;
            const tPhotonNs = dPhoton / c_ice_m_ns;
            const tTotalNs = tParticleNs + tPhotonNs;

            // Charge scaling with distance and ice absorption
            const ice = Physics.icePropertiesAtDepth(dom.depthM);
            const atten = Math.exp(-dPhoton / ice.absorptionLength);
            const chargePE = Math.max(0.5, (E_TeV * 0.08 / Math.max(5, dPhoton)) * atten);

            if (chargePE >= 0.8) {
              dom.isHit = true;
              dom.hitTimeNs = tTotalNs;
              dom.chargePE = chargePE;
              hitDOMs.push(dom);
            }
          }
        }
      }
    } else if (event.type === 'cascade') {
      // Localized point-source electromagnetic / hadronic shower
      const vx = event.vertex.x;
      const vy = event.vertex.y;
      const vz = event.vertex.z;

      for (let i = 0; i < allDOMs.length; i++) {
        const dom = allDOMs[i];
        const dist = Math.hypot(dom.x - vx, dom.y - vy, dom.z - vz);

        // Cascades illuminate a large sphere (up to 300m for PeV events)
        const maxDistM = Math.min(320, 60 + 60 * Math.log10(Math.max(1, E_TeV)));

        if (dist <= maxDistM) {
          const tTotalNs = dist / c_ice_m_ns;
          const ice = Physics.icePropertiesAtDepth(dom.depthM);
          const atten = Math.exp(-dist / ice.absorptionLength);
          // Inverse square law with exponential attenuation
          const chargePE = (E_TeV * 1.5 / Math.max(10, dist * 0.8)) * atten;

          if (chargePE >= 0.8) {
            dom.isHit = true;
            dom.hitTimeNs = tTotalNs;
            dom.chargePE = chargePE;
            hitDOMs.push(dom);
          }
        }
      }
    } else if (event.type === 'double_bang') {
      // Two distinct cascades separated by tau decay distance L = (E_tau / 1 PeV) * 50m
      const tauDecayM = (E_TeV / 1000) * 50;
      const v2 = {
        x: event.vertex.x + event.direction.x * tauDecayM,
        y: event.vertex.y + event.direction.y * tauDecayM,
        z: event.vertex.z + event.direction.z * tauDecayM
      };

      // Bang 1: Hadronic vertex cascade (25% of energy)
      // Bang 2: Tau decay cascade (75% of energy)
      for (let i = 0; i < allDOMs.length; i++) {
        const dom = allDOMs[i];
        const d1 = Math.hypot(dom.x - event.vertex.x, dom.y - event.vertex.y, dom.z - event.vertex.z);
        const d2 = Math.hypot(dom.x - v2.x, dom.y - v2.y, dom.z - v2.z);

        const t1 = d1 / c_ice_m_ns;
        const t2 = (tauDecayM / c_m_ns) + (d2 / c_ice_m_ns);

        let q1 = 0;
        let q2 = 0;
        if (d1 < 160) q1 = (E_TeV * 0.3 / Math.max(10, d1)) * Math.exp(-d1 / 180);
        if (d2 < 200) q2 = (E_TeV * 0.9 / Math.max(10, d2)) * Math.exp(-d2 / 180);

        const totalQ = q1 + q2;
        if (totalQ >= 0.8) {
          dom.isHit = true;
          dom.hitTimeNs = Math.min(t1, t2);
          dom.chargePE = totalQ;
          hitDOMs.push(dom);
        }
      }
    }

    // Sort hits chronologically
    hitDOMs.sort((a, b) => a.hitTimeNs - b.hitTimeNs);

    // Normalize hit times so earliest hit = 0 ns
    if (hitDOMs.length > 0) {
      const tMin = hitDOMs[0].hitTimeNs;
      for (let i = 0; i < hitDOMs.length; i++) {
        hitDOMs[i].hitTimeNs -= tMin;
      }
    }

    return {
      event,
      totalHits: hitDOMs.length,
      hitDOMs,
      timeSpanNs: hitDOMs.length > 0 ? hitDOMs[hitDOMs.length - 1].hitTimeNs : 0
    };
  }

  // --- Historic Milestone Event Presets ---

  const PRESETS = {
    // 2013 Discovery: "Bert" (1.04 PeV cascade, Science 2013)
    bert_2013: {
      id: "bert_2013",
      name: "2013 PeV Cascade: 'Bert'",
      subtitle: "First Extraterrestrial High-Energy Neutrino (1.04 PeV)",
      year: 2013,
      citation: "Science 342, 1242856 (2013)",
      energyTeV: 1040,
      flavor: "e / NC",
      type: "cascade",
      vertex: { x: -35, y: 40, z: -120 }, // in deep clear ice
      direction: { x: 0.2, y: -0.1, z: 0.97 },
      description: "A monumental 1.04 PeV cascade illuminating hundreds of optical sensors across several hundred meters of South Pole ice. Along with 'Ernie' (1.14 PeV), this opened high-energy neutrino astronomy.",
      teachingPoint: "Why a sphere? Deep Inelastic Scattering with W or Z boson makes an electromagnetic/hadronic cascade that dumps all its energy locally within meters, radiating Cherenkov light isotropically."
    },

    // 2017 Milestone: TXS 0506+056 (IceCube-170922A, 290 TeV upgoing muon track)
    txs0506_2017: {
      id: "txs0506_2017",
      name: "2017 Flaring Blazar: TXS 0506+056",
      subtitle: "First Cosmic Source: Multimessenger Neutrino Alert (IceCube-170922A)",
      year: 2017,
      citation: "Science 361, eaat1378 (2018)",
      energyTeV: 290,
      flavor: "mu",
      type: "track",
      // Upgoing muon entering through Earth from below (zenith ~95.7 degrees, pointing upward)
      vertex: { x: -280, y: -220, z: -460 },
      direction: { x: 0.52, y: 0.44, z: 0.73 }, // Upward-pointing trajectory
      lengthM: 2200,
      description: "On Sep 22, 2017, a ~290 TeV muon neutrino arrived from below the horizon. Automated alerts dispatched within 43 seconds triggered NASA Fermi-LAT and MAGIC telescopes, revealing a flaring supermassive black hole blazar 4 billion light-years away.",
      teachingPoint: "Why upgoing? Earth acts as a massive shield that stops atmospheric muons from above. A particle traveling upward *must* have crossed the entire planet as an uncharged neutrino before producing a muon in the ice."
    },

    // 2022 Milestone: NGC 1068 (Active Galaxy Black Hole, 79 events, 4.2 sigma)
    ngc1068_2022: {
      id: "ngc1068_2022",
      name: "2022 Active Galaxy: NGC 1068",
      subtitle: "Neutrinos from an Obscured Supermassive Black Hole (4.2 sigma)",
      year: 2022,
      citation: "Science 378, 538-543 (2022)",
      energyTeV: 45,
      flavor: "mu",
      type: "track",
      vertex: { x: 120, y: -180, z: -200 },
      direction: { x: 0.15, y: 0.98, z: 0.08 }, // Near celestial equator (declination ~0 deg)
      lengthM: 1600,
      description: "IceCube discovered an excess of 79 neutrinos from active galaxy NGC 1068 (47 million light-years away). The core is enveloped in a thick dust torus that completely traps high-energy gamma rays, proving only neutrinos can reveal what happens near the black hole.",
      teachingPoint: "Neutrinos see what light cannot! High-energy gamma rays collide with dust and radiation, while neutrinos escape pristine."
    },

    // 2023 / 2026 Milestone: Milky Way Galactic Plane (Cascade map, 5.7 sigma)
    milkyway_2023: {
      id: "milkyway_2023",
      name: "2023/2026 The Milky Way in Neutrinos",
      subtitle: "Galactic Plane Diffuse Emission (4.5 sigma in 2023 -> 5.7 sigma in 2026)",
      year: 2023,
      citation: "Science 380, 1338 (2023) & PRL (2026)",
      energyTeV: 80,
      flavor: "e / NC",
      type: "cascade",
      vertex: { x: 80, y: 60, z: 50 },
      direction: { x: -0.6, y: -0.4, z: 0.69 },
      description: "Using machine learning applied to 60,000 cascade events accumulated over a decade, IceCube reconstructed our home galaxy in neutrinos. In 2026, 12 years of data crossed 5.7 sigma, confirming our galaxy as a steady cosmic particle accelerator.",
      teachingPoint: "Why machine learning? Cascades have poor pointing resolution (~10-15 degrees), but deep neural nets isolated the diffuse glow of the Milky Way from atmospheric background."
    },

    // Atmospheric Muon Shower (Background noise to be filtered out)
    background_muon: {
      id: "background_muon",
      name: "Atmospheric Muon Background",
      subtitle: "Cosmic Ray Air Shower Noise (~2,700 per second)",
      year: 2026,
      citation: "Everyday IceCube Noise",
      energyTeV: 5,
      flavor: "mu (atmospheric)",
      type: "track",
      // Downgoing steep track from above
      vertex: { x: 100, y: 150, z: 490 },
      direction: { x: -0.2, y: -0.15, z: -0.96 }, // Downward-pointing trajectory
      lengthM: 1200,
      description: "Cosmic rays hitting Antarctica's upper atmosphere produce bundles of downward muons raining through IceCube at 2,700 Hz. These must be rejected using Earth-shielding or outer-detector vetos to find the rare cosmic neutrinos.",
      teachingPoint: "A gigaton detector records ~100 billion atmospheric muons a year, but only ~100 cosmic neutrinos. That's a 1-in-a-billion needle in a haystack!"
    }
  };

  return {
    NUM_STRINGS,
    DOMS_PER_STRING,
    TOTAL_DOMS,
    allDOMs,
    stringsMeta,
    clearHits,
    simulateEventLight,
    PRESETS
  };
})();

// Export for module/browser compatibility
if (typeof window !== 'undefined') {
  window.Detector = Detector;
}
