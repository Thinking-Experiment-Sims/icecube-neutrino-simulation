/**
 * main.js - Master Application Coordinator
 * The Thinking Experiment: IceCube Neutrino Observatory
 * Commemorating the 2026 Nobel Prize in Physics (Francis Halzen)
 * Authored for Vladimir Lopez · 2026
 */

window.App = (() => {
  let activeTab = 'overview';
  let activePresetKey = 'txs0506_2017';
  let isPlayingScrubber = false;
  let scrubberCurrentTimeNs = 3000;
  let scrubberMaxTimeNs = 3000;
  let scrubberAnimationId = null;
  let lastAudioTickTime = 0;
  let isTeacherMode = false;
  let is3DInitialized = false;

  const TAB_BANNERS = {
    overview: {
      title: "1. Laboratory Orientation & Nobel Prize Setup",
      desc: "Understand why Francis Halzen built a 1-billion-ton neutrino detector under the South Pole ice, how ghost particles reveal hidden black holes, and how to use each interactive simulation module."
    },
    detector: {
      title: "2. IceCube 3D Detector (Digital Twin)",
      desc: "Interact with all 86 strings and 5,160 optical sensors frozen 1.5–2.5 km under Antarctic ice. Drag to rotate in 3D, scrub time to observe Cherenkov light cones expand, and compare historic discoveries."
    },
    sources: {
      title: "3. Cosmic Sources & Deflection Engine",
      desc: "Compare how charged protons bend in intergalactic magnetic fields while neutral neutrinos travel in straight geodesics from blazars and obscured black holes directly to Earth."
    },
    cherenkov: {
      title: "4. Cherenkov Optics Wave Tank",
      desc: "Observe the optical 'sonic boom for light' created when a charged particle moves faster than the phase velocity of light in polar ice (v > c/n), deriving the Mach cone angle θ_c = arccos(1 / (βn))."
    },
    dis: {
      title: "5. Subatomic Collision (Deep Inelastic Scattering)",
      desc: "Explore electroweak boson exchange when a cosmic neutrino strikes an atomic nucleus in the ice. Compare Charged Current (W± muon tracks and electron cascades) with Neutral Current (Z⁰ showers)."
    },
    sigmalab: {
      title: "6. 5-Sigma Discovery Challenge",
      desc: "Investigate how physicists reject 85 billion surface atmospheric muons per year using planetary rock shielding and outer veto sensors to confirm a 5.7σ discovery of cosmic neutrinos."
    }
  };

  function init() {
    setupHeaderControls();
    setupScenarioTabs();
    setupDetectorControls();
    setupSourcesControls();
    setupCherenkovControls();
    setupDISControls();

    // Start on Overview tab
    selectTab('overview');

    // Trigger initial KaTeX rendering if available
    setTimeout(() => {
      if (window.renderMathInElement) {
        window.renderMathInElement(document.body);
      }
    }, 200);
  }

  // --- Header Controls (Mode, Audio, Fullscreen) ---
  function setupHeaderControls() {
    const btnStudent = document.getElementById('btnModeStudent');
    const btnTeacher = document.getElementById('btnModeTeacher');
    const teacherNotes = document.getElementById('teacherOverviewNotes');

    if (btnStudent && btnTeacher) {
      btnStudent.onclick = () => {
        isTeacherMode = false;
        btnStudent.classList.add('active');
        btnTeacher.classList.remove('active');
        if (teacherNotes) teacherNotes.style.display = 'none';
      };

      btnTeacher.onclick = () => {
        isTeacherMode = true;
        btnTeacher.classList.add('active');
        btnStudent.classList.remove('active');
        if (teacherNotes) teacherNotes.style.display = 'block';
      };
    }

    // Audio Toggle
    const btnAudio = document.getElementById('btnAudioToggle');
    const audioIcon = document.getElementById('audioIcon');
    const audioLabel = document.getElementById('audioLabel');

    if (btnAudio) {
      btnAudio.onclick = () => {
        const isMuted = SoundFX.isMuted();
        SoundFX.setMuted(!isMuted);
        const nowMuted = SoundFX.isMuted();

        if (nowMuted) {
          btnAudio.classList.remove('active');
          if (audioIcon) audioIcon.textContent = '🔇';
          if (audioLabel) audioLabel.textContent = 'Audio: OFF';
        } else {
          btnAudio.classList.add('active');
          if (audioIcon) audioIcon.textContent = '🔊';
          if (audioLabel) audioLabel.textContent = 'Audio: ON';
          SoundFX.playDomHit(0.5, 5);
        }
      };
    }

    // Fullscreen Toggle
    const btnFullscreen = document.getElementById('btnFullscreen');
    if (btnFullscreen) {
      btnFullscreen.onclick = () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      };
    }
  }

  // --- Scenario Tab Navigation ---
  function setupScenarioTabs() {
    const tabs = document.querySelectorAll('.scenario-nav .scenario-tab');
    tabs.forEach(btn => {
      btn.onclick = () => {
        const target = btn.getAttribute('data-tab');
        selectTab(target);
      };
    });
  }

  function selectTab(tabKey) {
    activeTab = tabKey;

    // Update navigation buttons
    const tabs = document.querySelectorAll('.scenario-nav .scenario-tab');
    tabs.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update Banner Title & Description
    const bannerTitle = document.getElementById('bannerTitle');
    const bannerDesc = document.getElementById('bannerDesc');
    if (TAB_BANNERS[tabKey]) {
      if (bannerTitle) bannerTitle.textContent = TAB_BANNERS[tabKey].title;
      if (bannerDesc) bannerDesc.textContent = TAB_BANNERS[tabKey].desc;
    }

    // Switch panels
    const panels = {
      overview: document.getElementById('panelOverview'),
      detector: document.getElementById('panelDetector'),
      sources: document.getElementById('panelSources'),
      cherenkov: document.getElementById('panelCherenkov'),
      dis: document.getElementById('panelDIS'),
      sigmalab: document.getElementById('panelSigma')
    };

    Object.keys(panels).forEach(key => {
      if (panels[key]) {
        panels[key].classList.toggle('active', key === tabKey);
      }
    });

    // Trigger specific tab initializers
    if (tabKey === 'detector') {
      const container3d = document.getElementById('viewport3dContainer');
      if (container3d) {
        if (!is3DInitialized) {
          Renderer3D.init(container3d);
          is3DInitialized = true;
          loadPreset(activePresetKey);
        } else {
          setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
          }, 50);
        }
      }
    } else if (tabKey === 'sources') {
      const cvs = document.getElementById('canvasSources');
      if (cvs) {
        cvs.width = cvs.parentElement.clientWidth || 800;
        cvs.height = cvs.parentElement.clientHeight || 480;
        Modules2D.CosmicEngine.init(cvs);
      }
    } else if (tabKey === 'cherenkov') {
      const cvs = document.getElementById('canvasCherenkov');
      if (cvs) {
        cvs.width = cvs.parentElement.clientWidth || 800;
        cvs.height = cvs.parentElement.clientHeight || 480;
        Modules2D.CherenkovWaveTank.init(cvs);
      }
      updateCherenkovCalculations();
    } else if (tabKey === 'dis') {
      const cvs = document.getElementById('canvasDIS');
      if (cvs) {
        cvs.width = cvs.parentElement.clientWidth || 800;
        cvs.height = cvs.parentElement.clientHeight || 480;
        Modules2D.SubatomicDIS.init(cvs);
      }
    } else if (tabKey === 'sigmalab') {
      const labDiv = document.getElementById('containerSigmaLab');
      if (labDiv) {
        Modules2D.DiscoveryLab.init(labDiv);
      }
    }

    // Re-render KaTeX math if elements switched
    setTimeout(() => {
      if (window.renderMathInElement) {
        window.renderMathInElement(document.body);
      }
    }, 80);
  }

  // --- 3D Detector Controls ---
  function setupDetectorControls() {
    const btnPlay = document.getElementById('btnPlayPause');
    const scrubber = document.getElementById('scrubberTime');
    const dispTime = document.getElementById('dispTime');

    if (btnPlay && scrubber) {
      btnPlay.onclick = () => {
        isPlayingScrubber = !isPlayingScrubber;
        btnPlay.textContent = isPlayingScrubber ? '❚❚' : '▶';
        if (isPlayingScrubber) {
          if (scrubberCurrentTimeNs >= scrubberMaxTimeNs) {
            scrubberCurrentTimeNs = 0;
          }
          runScrubberAnimation(scrubber, dispTime, btnPlay);
        } else {
          cancelAnimationFrame(scrubberAnimationId);
        }
      };

      scrubber.oninput = (e) => {
        scrubberCurrentTimeNs = parseFloat(e.target.value);
        if (dispTime) dispTime.textContent = `${Math.round(scrubberCurrentTimeNs)} ns`;
        Renderer3D.updateHitsDisplay(scrubberCurrentTimeNs, scrubberMaxTimeNs);
      };
    }

    // Historic Presets
    const presetBtns = document.querySelectorAll('#panelDetector .pill-btn[data-preset]');
    presetBtns.forEach(btn => {
      btn.onclick = () => {
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const pKey = btn.getAttribute('data-preset');
        loadPreset(pKey);
      };
    });

    // Camera Views
    const camBtns = document.querySelectorAll('#panelDetector .pill-btn[data-cam]');
    camBtns.forEach(btn => {
      btn.onclick = () => {
        camBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const camView = btn.getAttribute('data-cam');
        Renderer3D.setCameraPreset(camView);
      };
    });
  }

  function runScrubberAnimation(slider, display, playBtn) {
    function step() {
      if (!isPlayingScrubber) return;

      scrubberCurrentTimeNs += 18;
      if (scrubberCurrentTimeNs > scrubberMaxTimeNs) {
        scrubberCurrentTimeNs = scrubberMaxTimeNs;
        isPlayingScrubber = false;
        playBtn.textContent = '▶';
      }

      slider.value = scrubberCurrentTimeNs;
      if (display) display.textContent = `${Math.round(scrubberCurrentTimeNs)} ns`;

      Renderer3D.updateHitsDisplay(scrubberCurrentTimeNs, scrubberMaxTimeNs);

      // Play accessible audio sonification
      if (!SoundFX.isMuted()) {
        const now = performance.now();
        if (now - lastAudioTickTime > 120) {
          const normT = scrubberCurrentTimeNs / scrubberMaxTimeNs;
          SoundFX.playDomHit(normT, 12);
          lastAudioTickTime = now;
        }
      }

      if (isPlayingScrubber) {
        scrubberAnimationId = requestAnimationFrame(step);
      }
    }

    scrubberAnimationId = requestAnimationFrame(step);
  }

  function loadPreset(presetKey) {
    activePresetKey = presetKey;
    const sim = Detector.simulateEvent(presetKey);
    if (!sim) return;

    scrubberMaxTimeNs = sim.maxTimeNs || 3000;
    const scrubber = document.getElementById('scrubberTime');
    if (scrubber) {
      scrubber.max = scrubberMaxTimeNs;
      scrubber.value = scrubberMaxTimeNs;
    }
    scrubberCurrentTimeNs = scrubberMaxTimeNs;

    const dispTime = document.getElementById('dispTime');
    if (dispTime) dispTime.textContent = `${Math.round(scrubberCurrentTimeNs)} ns`;

    // Update Telemetry & HUD
    const hudName = document.getElementById('hudEventName');
    const hudEnergy = document.getElementById('hudEnergy');
    const hudTopo = document.getElementById('hudTopology');
    const hudHits = document.getElementById('hudDOMHits');
    const hudSpan = document.getElementById('hudTimeSpan');
    const badgeEnergy = document.getElementById('badgePresetEnergy');

    if (hudName) hudName.textContent = sim.preset.title;
    if (hudEnergy) hudEnergy.textContent = `${sim.preset.energyTeV >= 1000 ? (sim.preset.energyTeV / 1000).toFixed(1) + ' PeV' : sim.preset.energyTeV + ' TeV'}`;
    if (badgeEnergy) badgeEnergy.textContent = hudEnergy ? hudEnergy.textContent : '';
    if (hudTopo) hudTopo.textContent = sim.preset.topology;
    if (hudHits) hudHits.textContent = `${sim.hitDOMCount} / 5,160`;
    if (hudSpan) hudSpan.textContent = `~${Math.round(sim.maxTimeNs)} ns`;

    Renderer3D.setEventGeometry(sim.event);
    Renderer3D.updateHitsDisplay(scrubberCurrentTimeNs, scrubberMaxTimeNs);
  }

  // --- Sources Controls ---
  function setupSourcesControls() {
    const sliderB = document.getElementById('sliderBField');
    const valB = document.getElementById('valBField');
    const checkDust = document.getElementById('checkDustTorus');
    const selectChan = document.getElementById('selectChannel');

    if (sliderB) {
      sliderB.oninput = (e) => {
        if (valB) valB.textContent = `${parseFloat(e.target.value).toFixed(1)} nG`;
        Modules2D.CosmicEngine.setBField(e.target.value);
      };
    }

    if (checkDust) {
      checkDust.onchange = (e) => {
        Modules2D.CosmicEngine.setDustTorus(e.target.checked);
      };
    }

    if (selectChan) {
      selectChan.onchange = (e) => {
        Modules2D.CosmicEngine.setChannel(e.target.value);
      };
    }
  }

  // --- Cherenkov Controls ---
  function setupCherenkovControls() {
    const sliderBeta = document.getElementById('sliderBeta');
    const selectIndex = document.getElementById('selectIndex');

    if (sliderBeta) {
      sliderBeta.oninput = (e) => {
        Modules2D.CherenkovWaveTank.setBeta(e.target.value);
        updateCherenkovCalculations();
      };
    }

    if (selectIndex) {
      selectIndex.onchange = (e) => {
        Modules2D.CherenkovWaveTank.setIndex(e.target.value);
        updateCherenkovCalculations();
      };
    }
  }

  function updateCherenkovCalculations() {
    const sliderBeta = document.getElementById('sliderBeta');
    const selectIndex = document.getElementById('selectIndex');
    const valBeta = document.getElementById('valBeta');
    const valTh = document.getElementById('valThreshold');
    const valAngle = document.getElementById('valCherenkovAngle');
    const valStatus = document.getElementById('valShockStatus');

    if (!sliderBeta || !selectIndex) return;

    const beta = parseFloat(sliderBeta.value);
    const n = parseFloat(selectIndex.value);
    const threshold = 1 / n;

    if (valBeta) valBeta.textContent = beta.toFixed(3);
    if (valTh) valTh.textContent = `${threshold.toFixed(3)} c`;

    if (beta > threshold) {
      const cosTheta = 1 / (beta * n);
      const angleRad = Math.acos(Math.min(1.0, cosTheta));
      const angleDeg = (angleRad * (180 / Math.PI)).toFixed(1);
      if (valAngle) valAngle.innerHTML = `&theta;<sub>c</sub> &approx; ${angleDeg}&deg;`;
      if (valStatus) {
        valStatus.textContent = 'ACTIVE (β > 1/n)';
        valStatus.style.color = 'var(--success)';
      }
    } else {
      if (valAngle) valAngle.textContent = 'None (Subluminal)';
      if (valStatus) {
        valStatus.textContent = 'INACTIVE (β < 1/n)';
        valStatus.style.color = 'var(--danger)';
      }
    }
  }

  // --- Subatomic DIS Controls ---
  function setupDISControls() {
    const selectFlavor = document.getElementById('selectFlavor');
    const selectMode = document.getElementById('selectMode');
    const sliderY = document.getElementById('sliderY');
    const valY = document.getElementById('valY');

    if (selectFlavor) {
      selectFlavor.onchange = (e) => {
        Modules2D.SubatomicDIS.setFlavor(e.target.value);
      };
    }

    if (selectMode) {
      selectMode.onchange = (e) => {
        Modules2D.SubatomicDIS.setMode(e.target.value);
      };
    }

    if (sliderY) {
      sliderY.oninput = (e) => {
        if (valY) valY.textContent = parseFloat(e.target.value).toFixed(2);
        Modules2D.SubatomicDIS.setInelasticity(e.target.value);
      };
    }
  }

  // Auto-initialize when window loads
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    selectTab,
    loadPreset
  };
})();
