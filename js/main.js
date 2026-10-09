/**
 * main.js - Master Application Coordinator
 * The Thinking Experiment: IceCube Neutrino Observatory
 * Authored for Vladimir Lopez · 2026
 */

window.App = (() => {
  let currentMode = 'guided'; // 'guided' (default) or 'sandbox'
  let currentView = 'detector'; // 'detector', 'sources', 'dis', 'cherenkov', 'sigmalab'
  let activePresetKey = 'txs0506_2017';
  let currentEventSimulation = null;

  // 3D Playback Scrubber State
  let isPlayingScrubber = false;
  let scrubberCurrentTimeNs = 3000;
  let scrubberMaxTimeNs = 3000;
  let scrubberAnimationId = null;
  let lastAudioTickTime = 0;

  function init() {
    setupHeaderControls();
    setupModeSwitcher();

    // Initialize Guided Seminar Walkthrough (Default mode as requested)
    const sidebar = document.getElementById('walkthroughSidebar');
    if (sidebar) {
      GuidedWalkthrough.init(sidebar, onWalkthroughStepChanged);
    }

    // Default view is the 3D IceCube detector displaying TXS 0506+056
    mountView('detector');
    loadPreset(activePresetKey);
  }

  function setupHeaderControls() {
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
          audioIcon.textContent = '🔇';
          audioLabel.textContent = 'Audio: OFF';
        } else {
          btnAudio.classList.add('active');
          audioIcon.textContent = '🔊';
          audioLabel.textContent = 'Audio: ON';
          // Play a gentle confirmation ping
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

  function setupModeSwitcher() {
    const btnGuided = document.getElementById('modeGuided');
    const btnSandbox = document.getElementById('modeSandbox');
    const viewGuided = document.getElementById('viewGuided');
    const viewSandbox = document.getElementById('viewSandbox');

    if (btnGuided && btnSandbox) {
      btnGuided.onclick = () => {
        currentMode = 'guided';
        btnGuided.classList.add('active');
        btnSandbox.classList.remove('active');
        viewGuided.style.display = 'flex';
        viewSandbox.style.display = 'none';
        mountView(currentView);
      };

      btnSandbox.onclick = () => {
        currentMode = 'sandbox';
        btnSandbox.classList.add('active');
        btnGuided.classList.remove('active');
        viewGuided.style.display = 'none';
        viewSandbox.style.display = 'flex';
        setupSandboxTabs();
        mountView(currentView);
      };
    }
  }

  function setupSandboxTabs() {
    const tabs = document.querySelectorAll('.sandbox-tab-bar .tab-btn');
    tabs.forEach(btn => {
      btn.onclick = () => {
        tabs.forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        const targetTab = btn.getAttribute('data-tab');
        switchView(targetTab);
      };
    });
  }

  function onWalkthroughStepChanged(stepIndex, stepData) {
    // Synchronize simulation display based on step requirements
    // (stepData.action in guidedWalkthrough already calls switchView if needed)
  }

  /**
   * Switch the active simulation module
   */
  function switchView(viewName) {
    currentView = viewName;

    // Update active tab button in sandbox bar if visible
    const tabs = document.querySelectorAll('.sandbox-tab-bar .tab-btn');
    tabs.forEach(btn => {
      if (btn.getAttribute('data-tab') === viewName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    mountView(viewName);
  }

  /**
   * Mount template content into the active view container
   */
  function mountView(viewName) {
    const targetContainer = currentMode === 'guided'
      ? document.getElementById('activeSimContainer')
      : document.getElementById('sandboxContent');

    if (!targetContainer) return;
    targetContainer.innerHTML = '';

    if (viewName === 'detector') {
      const tmpl = document.getElementById('detectorTemplate');
      if (tmpl) {
        targetContainer.innerHTML = tmpl.innerHTML;
        bindDetectorControls(targetContainer);
        const vp = targetContainer.querySelector('#viewport3d');
        if (vp) Renderer3D.init(vp);
        loadPreset(activePresetKey);
      }
    } else if (viewName === 'sources') {
      const tmpl = document.getElementById('sourcesTemplate');
      if (tmpl) {
        targetContainer.innerHTML = tmpl.innerHTML;
        const cvs = targetContainer.querySelector('#canvasSources');
        if (cvs) {
          cvs.width = cvs.parentElement.clientWidth || 800;
          cvs.height = (cvs.parentElement.clientHeight - 64) || 500;
          Modules2D.CosmicEngine.init(cvs);
        }
        bindSourcesControls(targetContainer);
      }
    } else if (viewName === 'dis') {
      const tmpl = document.getElementById('disTemplate');
      if (tmpl) {
        targetContainer.innerHTML = tmpl.innerHTML;
        const cvs = targetContainer.querySelector('#canvasDIS');
        if (cvs) {
          cvs.width = cvs.parentElement.clientWidth || 800;
          cvs.height = (cvs.parentElement.clientHeight - 64) || 500;
          Modules2D.SubatomicDIS.init(cvs);
        }
        bindDISControls(targetContainer);
      }
    } else if (viewName === 'cherenkov') {
      const tmpl = document.getElementById('cherenkovTemplate');
      if (tmpl) {
        targetContainer.innerHTML = tmpl.innerHTML;
        const cvs = targetContainer.querySelector('#canvasCherenkov');
        if (cvs) {
          cvs.width = cvs.parentElement.clientWidth || 800;
          cvs.height = (cvs.parentElement.clientHeight - 64) || 500;
          Modules2D.CherenkovWaveTank.init(cvs);
        }
        bindCherenkovControls(targetContainer);
      }
    } else if (viewName === 'sigmalab') {
      const tmpl = document.getElementById('sigmalabTemplate');
      if (tmpl) {
        targetContainer.innerHTML = tmpl.innerHTML;
        const labDiv = targetContainer.querySelector('#containerSigmaLab');
        if (labDiv) Modules2D.DiscoveryLab.init(labDiv);
      }
    }
  }

  // --- 3D Detector Controls Binding ---
  function bindDetectorControls(container) {
    const btnPlay = container.querySelector('#btnPlayPause');
    const scrubber = container.querySelector('#scrubberTime');
    const dispTime = container.querySelector('#dispTime');

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

    // Presets
    const presetBtns = container.querySelectorAll('.btn-preset');
    presetBtns.forEach(btn => {
      btn.onclick = () => {
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const pKey = btn.getAttribute('data-preset');
        loadPreset(pKey);
      };
    });

    // Camera Views
    const camBtns = container.querySelectorAll('.btn-cam');
    camBtns.forEach(btn => {
      btn.onclick = () => {
        const camView = btn.getAttribute('data-cam');
        Renderer3D.setCameraPreset(camView);
      };
    });
  }

  function runScrubberAnimation(slider, display, playBtn) {
    function step() {
      if (!isPlayingScrubber) return;

      scrubberCurrentTimeNs += 18; // Speed step in ns per frame
      if (scrubberCurrentTimeNs > scrubberMaxTimeNs) {
        scrubberCurrentTimeNs = scrubberMaxTimeNs;
        isPlayingScrubber = false;
        playBtn.textContent = '▶';
      }

      slider.value = scrubberCurrentTimeNs;
      if (display) display.textContent = `${Math.round(scrubberCurrentTimeNs)} ns`;
      Renderer3D.updateHitsDisplay(scrubberCurrentTimeNs, scrubberMaxTimeNs);

      // Audio cues during playback
      if (scrubberCurrentTimeNs - lastAudioTickTime > 120) {
        lastAudioTickTime = scrubberCurrentTimeNs;
        const norm = scrubberMaxTimeNs > 0 ? scrubberCurrentTimeNs / scrubberMaxTimeNs : 0;
        SoundFX.playDomHit(norm, 2);
      }

      if (isPlayingScrubber) {
        scrubberAnimationId = requestAnimationFrame(step);
      }
    }
    scrubberAnimationId = requestAnimationFrame(step);
  }

  function loadPreset(presetKey) {
    activePresetKey = presetKey;
    const preset = Detector.PRESETS[presetKey];
    if (!preset) return;

    // Simulate Cherenkov light in the detector array
    currentEventSimulation = Detector.simulateEventLight(preset);

    // Update scrubber bounds
    scrubberMaxTimeNs = Math.max(1000, currentEventSimulation.timeSpanNs + 100);
    scrubberCurrentTimeNs = scrubberMaxTimeNs; // show fully developed event initially

    const scrubber = document.getElementById('scrubberTime');
    const dispTime = document.getElementById('dispTime');
    if (scrubber) {
      scrubber.max = scrubberMaxTimeNs;
      scrubber.value = scrubberCurrentTimeNs;
    }
    if (dispTime) dispTime.textContent = `${Math.round(scrubberCurrentTimeNs)} ns`;

    // Update 3D Visuals
    Renderer3D.setEventGeometry(preset);
    Renderer3D.updateHitsDisplay(scrubberCurrentTimeNs, scrubberMaxTimeNs);

    // Update Telemetry HUD
    const hudTitle = document.getElementById('hudEventTitle');
    const hudName = document.getElementById('hudEventName');
    const hudEnergy = document.getElementById('hudEnergy');
    const hudTopo = document.getElementById('hudTopology');
    const hudHits = document.getElementById('hudDOMHits');
    const hudTime = document.getElementById('hudTimeSpan');

    if (hudName) hudName.textContent = preset.name;
    if (hudEnergy) hudEnergy.textContent = `${preset.energyTeV} TeV (${preset.flavor})`;
    if (hudTopo) hudTopo.textContent = preset.type === 'track' ? 'Muon Cherenkov Track' : 'Spherical Cascade';
    if (hudHits) hudHits.textContent = `${currentEventSimulation.totalHits} / 5,160 DOMs`;
    if (hudTime) hudTime.textContent = `~${Math.round(currentEventSimulation.timeSpanNs)} ns`;

    // Sound effect on load
    if (preset.type === 'cascade') {
      SoundFX.playCascadeBoom(preset.energyTeV);
    } else {
      SoundFX.playMuonStreak();
    }
  }

  // --- 2D Controls Bindings ---
  function bindSourcesControls(container) {
    const sliderB = container.querySelector('#sliderBField');
    const valB = container.querySelector('#valBField');
    const checkDust = container.querySelector('#checkDustTorus');
    const selChan = container.querySelector('#selectChannel');

    if (sliderB) {
      sliderB.oninput = (e) => {
        valB.textContent = `${e.target.value} nG`;
        Modules2D.CosmicEngine.setBField(e.target.value);
      };
    }
    if (checkDust) {
      checkDust.onchange = (e) => Modules2D.CosmicEngine.setDustTorus(e.target.checked);
    }
    if (selChan) {
      selChan.onchange = (e) => Modules2D.CosmicEngine.setChannel(e.target.value);
    }
  }

  function bindDISControls(container) {
    const selFlavor = container.querySelector('#selectFlavor');
    const selMode = container.querySelector('#selectMode');
    const sliderY = container.querySelector('#sliderY');
    const valY = container.querySelector('#valY');

    if (selFlavor) selFlavor.onchange = (e) => Modules2D.SubatomicDIS.setFlavor(e.target.value);
    if (selMode) selMode.onchange = (e) => Modules2D.SubatomicDIS.setMode(e.target.value);
    if (sliderY) {
      sliderY.oninput = (e) => {
        valY.textContent = e.target.value;
        Modules2D.SubatomicDIS.setInelasticity(e.target.value);
      };
    }
  }

  function bindCherenkovControls(container) {
    const sliderB = container.querySelector('#sliderBeta');
    const valB = container.querySelector('#valBeta');
    const selIdx = container.querySelector('#selectIndex');

    if (sliderB) {
      sliderB.oninput = (e) => {
        valB.textContent = parseFloat(e.target.value).toFixed(3);
        Modules2D.CherenkovWaveTank.setBeta(e.target.value);
      };
    }
    if (selIdx) {
      selIdx.onchange = (e) => Modules2D.CherenkovWaveTank.setIndex(e.target.value);
    }
  }

  // Initialize on DOM load
  window.addEventListener('DOMContentLoaded', init);

  return {
    switchView,
    loadPreset
  };
})();
