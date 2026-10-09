/**
 * guidedWalkthrough.js - Interactive Seminar Presentation Controller
 * Authored for "The Thinking Experiment" · Vladimir Lopez · 2026
 * 
 * Synchronizes the 14-step seminar presentation deck and guide with live physics simulations:
 * - Slide text, speaker notes, and classroom inquiry questions
 * - Automated state transitions in the 3D and 2D physics engines
 * - Next / Previous slide controls, slide jumper, and keyboard navigation
 */

const GuidedWalkthrough = (() => {
  let currentStep = 0;
  let onStepChangeCallback = null;

  const STEPS = [
    {
      id: 1,
      title: "Ghost Particles at the South Pole",
      badge: "The Hook",
      slideRef: "Deck Slides 1-2 · Seminar Guide 0:00 - 3:00",
      contentHtml: `
        <div class="step-card-header">
          <h3>65 Billion Neutrinos per Fingernail per Second</h3>
        </div>
        <p class="lead-text">Right now, about <strong>65 billion neutrinos</strong> pass through every square centimeter of your body every second. Almost none of them will ever touch a single atom of you.</p>
        <div class="key-fact-box">
          <div class="fact-item">
            <span class="fact-num">65×10⁹</span>
            <span class="fact-desc">Neutrinos per cm² per second from the Sun</span>
          </div>
          <div class="fact-item">
            <span class="fact-num">~0</span>
            <span class="fact-desc">Interactions with your body in an entire human lifetime</span>
          </div>
        </div>
        <div class="prompt-box">
          <strong>The Central Question for Students:</strong> If neutrinos pass through an entire light-year of solid lead without stopping, how could anyone build a detector on Earth to catch them?
        </div>
      `,
      speakerNotes: "Open by showing your fingernail. Ask the room: 'How many particles are passing through your thumb right now?' It sounds like science fiction, but it sets up why Francis Halzen needed a gigantic detector.",
      action: () => {
        // Switch to overview of 3D detector with subtle rotation
        if (window.App) window.App.switchView('detector');
        Renderer3D.setCameraPreset('overview');
      }
    },

    {
      id: 2,
      title: "The 2026 Nobel Prize in Physics",
      badge: "The Announcement",
      slideRef: "Deck Slides 3-4 · Seminar Guide 3:00 - 7:00",
      contentHtml: `
        <div class="step-card-header">
          <h3>Francis Halzen (Solo Laureate)</h3>
        </div>
        <p class="lead-text">Awarded October 6, 2026, by the Royal Swedish Academy of Sciences in Stockholm.</p>
        <div class="quote-card">
          <em>"For decisive contributions to the IceCube Neutrino Observatory and the discovery of high-energy neutrinos of astrophysical origin."</em>
        </div>
        <div class="key-fact-box">
          <div class="fact-item">
            <span class="fact-num">1 of 1</span>
            <span class="fact-desc">Sole laureate: the first solo physics prize since 1992</span>
          </div>
          <div class="fact-item">
            <span class="fact-num">38 Years</span>
            <span class="fact-desc">From initial 1988 proposal to 2026 Nobel Prize</span>
          </div>
        </div>
        <p>A particle theorist at the University of Wisconsin–Madison who proposed using natural Antarctic ice to solve a 100-year-old cosmic ray mystery.</p>
      `,
      speakerNotes: "Keep the biographical remarks brief. Note that Halzen is 82 and when asked what he would do after the Nobel call, he answered: 'I'm working on a proposal.'",
      action: () => {
        if (window.App) window.App.switchView('detector');
        Renderer3D.setCameraPreset('overview');
      }
    },

    {
      id: 3,
      title: "The Particle: What is a Neutrino?",
      badge: "Fundamental Physics",
      slideRef: "Deck Slide 5 · Seminar Guide 7:00 - 15:00",
      contentHtml: `
        <div class="step-card-header">
          <h3>The Ghost of the Standard Model</h3>
        </div>
        <ul class="particle-prop-list">
          <li><strong>No Electric Charge:</strong> Electromagnetic fields cannot bend or stop it.</li>
          <li><strong>Almost Massless:</strong> Less than a millionth the mass of an electron.</li>
          <li><strong>Weak Nuclear Force Only:</strong> (Plus minuscule gravity). Cross-section is astronomically tiny: $\\sigma \\sim 10^{-38}\\text{ cm}^2$.</li>
          <li><strong>Three Flavors:</strong> Electron ($\\nu_e$), Muon ($\\nu_\\mu$), and Tau ($\\nu_\\tau$). They oscillate across cosmic baselines, arriving at Earth in a 1:1:1 ratio.</li>
        </ul>
      `,
      speakerNotes: "Connect to previous physics: Takaaki Kajita and Arthur McDonald won the 2015 Nobel Prize for discovering neutrino oscillations (proving neutrinos have mass).",
      action: () => {
        if (window.App) window.App.switchView('dis');
      }
    },

    {
      id: 4,
      title: "The Cosmic Puzzle: Lost Messengers",
      badge: "Astrophysics",
      slideRef: "Deck Slide 6 · Seminar Guide 7:00 - 15:00",
      contentHtml: `
        <div class="step-card-header">
          <h3>Why Cosmic Rays Hide Their Birthplaces</h3>
        </div>
        <p class="lead-text">Cosmic rays (protons) have bombarded Earth for over a century, but magnetic fields destroy their directional memory.</p>
        <table class="messenger-table">
          <thead>
            <tr><th>Messenger</th><th>Bent by B-Fields?</th><th>Absorbed by Dust/Light?</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Cosmic Rays (Protons)</strong></td><td class="bad">YES (severely deflected)</td><td>At highest energies</td></tr>
            <tr><td><strong>Gamma Rays (Photons)</strong></td><td class="good">NO (straight path)</td><td class="bad">YES (blocked by dust)</td></tr>
            <tr><td><strong>Neutrinos</strong></td><td class="good">NO (straight path)</td><td class="good">NO (escapes everything!)</td></tr>
          </tbody>
        </table>
        <p><strong>Conclusion:</strong> Only neutrinos act as direct postcards with a return address to extreme cosmic accelerators.</p>
      `,
      speakerNotes: "Show the 2D Cosmic Engine below. Drag the magnetic field slider to show students how protons loop erratically while neutrinos fly laser-straight.",
      action: () => {
        if (window.App) window.App.switchView('sources');
      }
    },

    {
      id: 5,
      title: "The Source: Photopion Production",
      badge: "Feynman Diagram 1",
      slideRef: "Deck Slide 7 · Nobel Scientific Background Fig. 1",
      contentHtml: `
        <div class="step-card-header">
          <h3>From Cosmic Rays to Neutrinos</h3>
        </div>
        <p class="lead-text">Near the cosmic accelerator, an energetic proton collides with ambient photons:</p>
        <div class="equation-banner">
          $$p + \\gamma \\longrightarrow \\Delta^+ (1232)$$
        </div>
        <p>The short-lived $\\Delta^+$ resonance splits the cosmic message into two distinct channels:</p>
        <ul>
          <li><strong>Neutral Pions ($\\pi^0 \\to \\gamma \\gamma$):</strong> Creates ultra-high-energy gamma rays, often trapped by dust.</li>
          <li><strong>Charged Pions ($\\pi^+ \\to \\mu^+ \\nu_\\mu \\to e^+ \\nu_e \\bar{\\nu}_\\mu \\nu_\\mu$):</strong> Creates high-energy neutrinos that escape into the cosmos.</li>
        </ul>
      `,
      speakerNotes: "Explain the colors: Amber lines are neutrinos, teal wavy lines are gamma rays. If dust surrounds the black hole, gamma rays never reach Earth.",
      action: () => {
        if (window.App) window.App.switchView('sources');
      }
    },

    {
      id: 6,
      title: "Halzen's Idea (1988): Clear Antarctic Ice",
      badge: "The Innovation",
      slideRef: "Deck Slide 8 · Seminar Guide 7:00 - 15:00",
      contentHtml: `
        <div class="step-card-header">
          <h3>Using the Earth as a Detector</h3>
        </div>
        <p class="lead-text">Below 1,400 meters, extreme ice pressure collapses all air bubbles into transparent clathrate crystals. The ice is clearer than any glass on Earth.</p>
        <p>When a rare neutrino collides with an ice atom, it creates a relativistic charged particle moving faster than light in ice ($c/n_{\\text{ice}}$), producing a faint blue conical glow: <strong>Cherenkov Radiation</strong>.</p>
        <div class="formula-card">
          $$\\cos(\\theta_c) = \\frac{1}{\\beta n} \\quad \\implies \\quad \\theta_c \\approx 41^\\circ \\text{ in ice}$$
        </div>
      `,
      speakerNotes: "Demo analogy: A boat wake or supersonic jet sonic boom. When a charged particle outruns light in a medium, an electromagnetic shockwave forms.",
      action: () => {
        if (window.App) window.App.switchView('cherenkov');
      }
    },

    {
      id: 7,
      title: "The Detector: Deep Inelastic Scattering",
      badge: "Feynman Diagram 2",
      slideRef: "Deck Slide 9 · Nobel Scientific Background Fig. 2",
      contentHtml: `
        <div class="step-card-header">
          <h3>How a Neutrino Makes Light</h3>
        </div>
        <p class="lead-text">The incoming neutrino interacts with a single quark inside an oxygen or hydrogen nucleus, leaving 2 spectator quarks:</p>
        <ul>
          <li><strong>Charged Current ($W^\\pm$):</strong> The neutrino becomes a charged lepton. A muon travels kilometers, leaving a sharp <strong>linear track</strong> ($\Delta\\theta < 0.5^\\circ$). Electrons and taus make spherical <strong>cascades</strong>.</li>
          <li><strong>Neutral Current ($Z^0$):</strong> The neutrino flies on unseen. Only the shattered hadronic cascade glows.</li>
        </ul>
      `,
      speakerNotes: "Point out the difference between tracks and cascades. Tracks give pinpoint pointing resolution for astronomy; cascades measure total energy with high precision.",
      action: () => {
        if (window.App) window.App.switchView('dis');
      }
    },

    {
      id: 8,
      title: "The Instrument: 1 km³ of Instrumented Ice",
      badge: "The Observatory",
      slideRef: "Deck Slide 10 · Seminar Guide 15:00 - 20:00",
      contentHtml: `
        <div class="step-card-header">
          <h3>IceCube Digital Twin (South Pole Array)</h3>
        </div>
        <div class="key-fact-box">
          <div class="fact-item"><span class="fact-num">1 km³</span><span class="fact-desc">Instrumented ice (1 gigaton)</span></div>
          <div class="fact-item"><span class="fact-num">5,160</span><span class="fact-desc">Digital Optical Modules (DOMs)</span></div>
          <div class="fact-item"><span class="fact-num">86</span><span class="fact-desc">Vertical strings in hot-water drilled holes</span></div>
          <div class="fact-item"><span class="fact-num">1,450–2,450 m</span><span class="fact-desc">Sensor depth below surface</span></div>
        </div>
        <p>Built between 2004 and 2010 using enhanced hot-water drills. Funded primarily by the US National Science Foundation with 450 scientists across 14 nations.</p>
      `,
      speakerNotes: "Switch to the 3D IceCube detector view. Rotate the array with your mouse to show the hexagonal string arrangement and the dense center DeepCore array.",
      action: () => {
        if (window.App) window.App.switchView('detector');
        Renderer3D.setCameraPreset('overview');
      }
    },

    {
      id: 9,
      title: "2013 Discovery: First Cosmic Neutrinos",
      badge: "Milestone 1",
      slideRef: "Deck Slide 11 · Science (2013)",
      contentHtml: `
        <div class="step-card-header">
          <h3>The Universe Glows in Neutrinos ("Bert & Ernie")</h3>
        </div>
        <p class="lead-text">Two serendipitous events with energies over 1 PeV ($10^{15}\\text{ eV}$, nicknamed Bert and Ernie) turned up in early data. A dedicated search revealed 28 extraterrestrial neutrinos (21 cascades, 7 tracks).</p>
        <p>In 2014, with additional data, the significance crossed <strong>5.7σ</strong>: the definitive discovery of high-energy cosmic neutrinos!</p>
      `,
      speakerNotes: "Trigger the preset below to see 'Bert' (1.04 PeV cascade). Point out the giant glowing ball of DOMs spanning hundreds of meters.",
      action: () => {
        if (window.App) {
          window.App.switchView('detector');
          window.App.loadPreset('bert_2013');
        }
      }
    },

    {
      id: 10,
      title: "2017 Milestone: First Named Blazar Source",
      badge: "Milestone 2",
      slideRef: "Deck Slide 12 · Science (2018)",
      contentHtml: `
        <div class="step-card-header">
          <h3>TXS 0506+056 (Multimessenger Astronomy)</h3>
        </div>
        <p class="lead-text">On September 22, 2017, a <strong>290 TeV upgoing muon neutrino</strong> crossed IceCube. Automated alert systems dispatched global coordinates in 43 seconds.</p>
        <p>Telescopes worldwide swung toward the coordinates: NASA's Fermi-LAT and MAGIC found that blazar <strong>TXS 0506+056</strong> (4 billion light-years away) was flaring with gamma rays at 7 times its baseline!</p>
      `,
      speakerNotes: "Notice the chromatic time progression in the 3D display: Red hits at the bottom, Blue hits at the top. The particle traveled UPWARD through Earth, proving it was a neutrino.",
      action: () => {
        if (window.App) {
          window.App.switchView('detector');
          window.App.loadPreset('txs0506_2017');
        }
      }
    },

    {
      id: 11,
      title: "2022 Milestone: Active Galaxy NGC 1068",
      badge: "Milestone 3",
      slideRef: "Deck Slide 13 · Science (2022)",
      contentHtml: `
        <div class="step-card-header">
          <h3>Neutrinos from an Obscured Black Hole</h3>
        </div>
        <p class="lead-text">IceCube observed an excess of <strong>79 neutrinos</strong> (1 to 10 TeV) originating from NGC 1068, 47 million light-years away, at <strong>4.2σ significance</strong>.</p>
        <p>MAGIC detected no TeV gamma rays because dense dust surrounds the 15-million-solar-mass black hole. <em>Neutrinos revealed what light was completely blind to!</em></p>
      `,
      speakerNotes: "Discuss the difference between 4.2 sigma ('strong evidence') and 5 sigma ('discovery'). Explain why dust traps gamma rays but allows neutrinos to pass freely.",
      action: () => {
        if (window.App) {
          window.App.switchView('detector');
          window.App.loadPreset('ngc1068_2022');
        }
      }
    },

    {
      id: 12,
      title: "2023/2026 Milestone: The Milky Way",
      badge: "Milestone 4",
      slideRef: "Deck Slide 14 · Science (2023) & PRL (2026)",
      contentHtml: `
        <div class="step-card-header">
          <h3>Our Home Galaxy in Neutrinos</h3>
        </div>
        <p class="lead-text">Machine learning algorithms filtered 60,000 cascade events accumulated over 10 years, unveiling diffuse neutrino emission along the plane of the Milky Way at 4.5σ in 2023.</p>
        <p>In 2026, 12 years of cumulative data passed <strong>5.7σ</strong>, establishing our own galaxy as an active cosmic particle accelerator.</p>
      `,
      speakerNotes: "Notice that the Milky Way appears as a diffuse glow rather than bright point sources, indicating widespread cosmic ray interactions with galactic interstellar gas.",
      action: () => {
        if (window.App) {
          window.App.switchView('detector');
          window.App.loadPreset('milkyway_2023');
        }
      }
    },

    {
      id: 13,
      title: "What Comes Next & Global Network",
      badge: "The Future",
      slideRef: "Deck Slide 15 · Nature (2025)",
      contentHtml: `
        <div class="step-card-header">
          <h3>IceCube-Gen2 & Ocean Telescopes</h3>
        </div>
        <ul>
          <li><strong>IceCube-Gen2:</strong> Proposed 8 km³ instrumented volume to study extreme PeV accelerators.</li>
          <li><strong>KM3NeT:</strong> Water Cherenkov telescope deep in the Mediterranean Sea (observed a >100 PeV event candidate in 2025).</li>
          <li><strong>Baikal-GVD, P-ONE, TRIDENT:</strong> Subsea and freshwater arrays completing full-sky coverage.</li>
        </ul>
      `,
      speakerNotes: "Point out that IceCube looks primarily at the northern sky (through Earth), while KM3NeT in the Mediterranean has a clear view of the Southern sky, including the Galactic Center.",
      action: () => {
        if (window.App) window.App.switchView('sigmalab');
      }
    },

    {
      id: 14,
      title: "Questions for the Room & Classroom Activities",
      badge: "Discussion & PER",
      slideRef: "Deck Slide 17 · Seminar Guide Activities",
      contentHtml: `
        <div class="step-card-header">
          <h3>Discussion & Classroom Inquiry Labs</h3>
        </div>
        <div class="inquiry-grid">
          <div class="inquiry-card">
            <h4>1. Sonic Boom for Light</h4>
            <p>Connect water wake / boat waves to Cherenkov cone angles. When $\beta > 1/n$, why does light form a shock wave?</p>
          </div>
          <div class="inquiry-card">
            <h4>2. Rare Event Counting</h4>
            <p>Why did Halzen need a gigaton of ice? If each student rolls a 100-sided die, how long until a rare hit occurs?</p>
          </div>
          <div class="inquiry-card">
            <h4>3. What Does 4σ vs 5σ Mean?</h4>
            <p>Why was NGC 1068 (4.2σ) called 'evidence' while the 2026 Milky Way (5.7σ) was crowned a 'discovery'?</p>
          </div>
          <div class="inquiry-card">
            <h4>4. Big Science & Credit</h4>
            <p>450 people built and ran IceCube, but the Nobel rules cap a prize at 3 individuals. How should credit work?</p>
          </div>
        </div>
      `,
      speakerNotes: "Open the floor to students. The question of single laureate vs 400-person collaboration is always a lively discussion starter for teachers and students.",
      action: () => {
        if (window.App) window.App.switchView('sigmalab');
      }
    }
  ];

  function init(containerElement, onStepChange) {
    onStepChangeCallback = onStepChange;
    renderStep(0, containerElement);
  }

  function renderStep(index, container) {
    if (index < 0 || index >= STEPS.length) return;
    currentStep = index;
    const step = STEPS[index];

    container.innerHTML = `
      <div class="walkthrough-nav">
        <span class="step-counter">Slide ${step.id} of ${STEPS.length}</span>
        <span class="step-badge">${step.badge}</span>
        <div class="nav-buttons">
          <button class="btn-step" id="btnPrevStep" ${index === 0 ? 'disabled' : ''}>← Previous</button>
          <button class="btn-step btn-primary" id="btnNextStep" ${index === STEPS.length - 1 ? 'disabled' : ''}>Next →</button>
        </div>
      </div>

      <div class="walkthrough-body">
        <div class="slide-reference">${step.slideRef}</div>
        <h2 class="step-title">${step.title}</h2>
        <div class="step-content">${step.contentHtml}</div>

        <div class="speaker-notes-drawer">
          <div class="notes-header">
            <span>🎙️ Speaker Notes & Presentation Guide:</span>
          </div>
          <p class="notes-body">${step.speakerNotes}</p>
        </div>
      </div>
    `;

    // Bind navigation buttons
    const btnPrev = container.querySelector('#btnPrevStep');
    const btnNext = container.querySelector('#btnNextStep');

    if (btnPrev) btnPrev.onclick = () => goToStep(currentStep - 1, container);
    if (btnNext) btnNext.onclick = () => goToStep(currentStep + 1, container);

    // Execute step action (simulation synchronization)
    if (step.action) {
      step.action();
    }

    if (onStepChangeCallback) {
      onStepChangeCallback(currentStep, step);
    }
  }

  function goToStep(index, container) {
    renderStep(index, container);
  }

  return {
    init,
    goToStep,
    getCurrentStep: () => currentStep,
    getTotalSteps: () => STEPS.length
  };
})();

// Export for module/browser compatibility
if (typeof window !== 'undefined') {
  window.GuidedWalkthrough = GuidedWalkthrough;
}
