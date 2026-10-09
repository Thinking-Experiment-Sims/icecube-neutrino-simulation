/**
 * modules2d.js - Interactive 2D Physics Visualizations
 * Authored for "The Thinking Experiment" · Vladimir Lopez · 2026
 * 
 * Implements:
 * 1. Module 1: Cosmic Engine (B-field deflection vs straight neutrino, photopion decay, dust torus)
 * 2. Module 2: Subatomic Collision (Quark-level DIS, CC W vs NC Z0, spectator quarks, inelasticity)
 * 3. Module 3: Cherenkov Wave Tank ("Sonic Boom for Light", Mach cone, South Pole ice stratigraphy)
 * 4. Module 5: 5-Sigma Discovery Lab (Rate comparison, Earth rock filter, Poisson significance)
 */

const Modules2D = (() => {

  // =========================================================================
  // MODULE 1: THE COSMIC ENGINE (Sources & Magnetic Fields)
  // =========================================================================
  const CosmicEngine = (() => {
    let canvas, ctx;
    let animId = null;
    let bFieldStrength = 2.5; // nG
    let hasDustTorus = true;
    let activeChannel = 'both'; // 'both', 'pions_charged', 'pions_neutral'
    let particles = [];
    let sourceAngle = 0;

    function init(canvasElem) {
      canvas = canvasElem;
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      resetSimulation();
      animate();
    }

    function resetSimulation() {
      particles = [];
    }

    function emitParticles() {
      if (particles.length > 90) return;

      // Accelerating shock front at (x=80, y=canvas.height/2)
      const originX = 80;
      const originY = canvas.height / 2;

      // 1. Cosmic Ray Proton
      particles.push({
        type: 'proton',
        x: originX,
        y: originY + (Math.random() - 0.5) * 20,
        vx: 3.5,
        vy: (Math.random() - 0.5) * 1.2,
        charge: 1,
        energyPeV: 10,
        trail: [],
        color: '#ff4444'
      });

      // 2. Escaping Neutrino from photopion decay
      if (activeChannel === 'both' || activeChannel === 'pions_charged') {
        particles.push({
          type: 'neutrino',
          x: originX,
          y: originY,
          vx: 4.8,
          vy: (Math.random() - 0.5) * 0.4,
          charge: 0,
          trail: [],
          color: '#ffaa00'
        });
      }

      // 3. High-Energy Gamma Ray
      if (activeChannel === 'both' || activeChannel === 'pions_neutral') {
        particles.push({
          type: 'gamma',
          x: originX,
          y: originY,
          vx: 4.8,
          vy: (Math.random() - 0.5) * 0.4,
          charge: 0,
          isAbsorbed: false,
          trail: [],
          color: '#00f3ff'
        });
      }
    }

    function animate() {
      animId = requestAnimationFrame(animate);
      if (!ctx || !canvas) return;

      // Periodic emission
      if (Math.random() < 0.12) emitParticles();

      // Clear with dark cosmic backdrop
      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Cosmic Accelerator (Blazar / AGN)
      const agnX = 80;
      const agnY = canvas.height / 2;

      // Relativistic jet glow
      const jetGlow = ctx.createRadialGradient(agnX, agnY, 5, agnX, agnY, 65);
      jetGlow.addColorStop(0, '#ffffff');
      jetGlow.addColorStop(0.3, '#ffaa00');
      jetGlow.addColorStop(0.7, 'rgba(255, 68, 0, 0.4)');
      jetGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = jetGlow;
      ctx.beginPath();
      ctx.arc(agnX, agnY, 65, 0, Math.PI * 2);
      ctx.fill();

      // Accretion disk core
      ctx.fillStyle = '#ffeedd';
      ctx.beginPath();
      ctx.arc(agnX, agnY, 12, 0, Math.PI * 2);
      ctx.fill();

      // Dust Torus (if enabled, e.g., NGC 1068 obscured AGN)
      if (hasDustTorus) {
        ctx.save();
        ctx.strokeStyle = 'rgba(180, 130, 70, 0.55)';
        ctx.fillStyle = 'rgba(100, 70, 35, 0.28)';
        ctx.lineWidth = 18;
        ctx.beginPath();
        ctx.ellipse(agnX + 35, agnY, 45, 95, Math.PI / 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = '#caa376';
        ctx.font = '11px sans-serif';
        ctx.fillText('Dense Dust Torus (NGC 1068)', agnX - 20, agnY - 90);
        ctx.fillText('Traps Gamma Rays', agnX - 20, agnY - 76);
        ctx.restore();
      }

      // Draw Earth & IceCube Target at the far right
      const earthX = canvas.width - 70;
      const earthY = canvas.height / 2;
      ctx.fillStyle = '#1e4b85';
      ctx.beginPath();
      ctx.arc(earthX, earthY, 38, 0, Math.PI * 2);
      ctx.fill();

      // Antarctic ice cap highlight
      ctx.fillStyle = '#d2f3ff';
      ctx.beginPath();
      ctx.arc(earthX, earthY + 22, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#00f3ff';
      ctx.font = '11px sans-serif';
      ctx.fillText('Earth & IceCube', earthX - 42, earthY + 54);

      // Background Magnetic Field lines
      ctx.strokeStyle = 'rgba(60, 100, 160, 0.15)';
      ctx.lineWidth = 1;
      for (let y = 30; y < canvas.height; y += 45) {
        ctx.beginPath();
        for (let x = 160; x < canvas.width - 100; x += 15) {
          const dy = Math.sin((x * 0.02) + (y * 0.03)) * (bFieldStrength * 3.5);
          if (x === 160) ctx.moveTo(x, y + dy);
          else ctx.lineTo(x, y + dy);
        }
        ctx.stroke();
      }

      // Update and Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Store trail
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 28) p.trail.shift();

        // Physics update
        if (p.charge !== 0) {
          // Proton bends in magnetic field
          const bVal = Math.sin((p.x * 0.02) + (p.y * 0.03)) * bFieldStrength;
          p.vy += bVal * 0.08;
          // Friction/dispersion in turbulent field
          p.x += p.vx;
          p.y += p.vy;
        } else {
          // Neutral particles (neutrinos & gammas) travel in laser-straight lines
          p.x += p.vx;
          p.y += p.vy;

          // Check if gamma ray hits dust torus
          if (p.type === 'gamma' && hasDustTorus && !p.isAbsorbed) {
            const distFromTorus = Math.hypot(p.x - (agnX + 35), p.y - agnY);
            if (distFromTorus < 55 && Math.random() < 0.85) {
              p.isAbsorbed = true;
            }
          }
        }

        // Draw Trail
        if (p.trail.length > 1 && !p.isAbsorbed) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let t = 1; t < p.trail.length; t++) {
            ctx.lineTo(p.trail[t].x, p.trail[t].y);
          }
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.type === 'neutrino' ? 2 : 1.5;
          ctx.stroke();
        }

        // Draw particle head
        if (!p.isAbsorbed) {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.type === 'neutrino' ? 3.5 : 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Absorption flash in dust
          ctx.fillStyle = 'rgba(255, 180, 50, 0.4)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
          ctx.fill();
        }

        // Remove if off-screen or absorbed
        if (p.x > canvas.width || p.y < 0 || p.y > canvas.height || (p.isAbsorbed && p.trail.length <= 1)) {
          particles.splice(i, 1);
        }
      }

      // Legend & Telemetry Overlay
      ctx.fillStyle = 'rgba(10, 15, 28, 0.75)';
      ctx.fillRect(10, 10, 260, 95);
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.3)';
      ctx.strokeRect(10, 10, 260, 95);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Cosmic Messenger Propagation', 20, 28);

      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#ff4444';
      ctx.fillText('Proton (q=+1): Bends in B-Field', 20, 48);

      ctx.fillStyle = '#ffaa00';
      ctx.fillText('Neutrino (q=0): Straight Geodesic', 20, 66);

      ctx.fillStyle = '#00f3ff';
      ctx.fillText(`Gamma Ray: ${hasDustTorus ? 'Absorbed by Dust' : 'Straight Line'}`, 20, 84);
    }

    return {
      init,
      setBField: (val) => { bFieldStrength = parseFloat(val); },
      setDustTorus: (val) => { hasDustTorus = !!val; },
      setChannel: (val) => { activeChannel = val; resetSimulation(); }
    };
  })();

  // =========================================================================
  // MODULE 2: SUBATOMIC COLLISION (Deep Inelastic Scattering)
  // =========================================================================
  const SubatomicDIS = (() => {
    let canvas, ctx;
    let animId = null;
    let flavor = 'mu'; // 'e', 'mu', 'tau'
    let currentMode = 'CC'; // 'CC' (W exchange) or 'NC' (Z0 exchange)
    let inelasticityY = 0.28; // fraction of energy to hadronic cascade
    let collisionProgress = 0; // 0 to 1
    let isPlaying = true;

    function init(canvasElem) {
      canvas = canvasElem;
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      animate();
    }

    function animate() {
      animId = requestAnimationFrame(animate);
      if (!ctx || !canvas) return;

      if (isPlaying) {
        collisionProgress += 0.007;
        if (collisionProgress > 1.25) collisionProgress = 0;
      }

      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const midY = h / 2;

      // Title & Equations
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      const eqText = currentMode === 'CC'
        ? `Charged Current (CC): ν_${flavor} + N → ${flavor === 'mu' ? 'μ⁻' : flavor === 'e' ? 'e⁻' : 'τ⁻'} + Hadronic Shower X (W± Propagator)`
        : `Neutral Current (NC): ν_${flavor} + N → ν_${flavor} + Hadronic Shower X (Z⁰ Propagator)`;
      ctx.fillText(eqText, 20, 25);

      // Vertex Coordinates
      const vTopX = w * 0.42;
      const vTopY = midY - 65;
      const vBotX = w * 0.42;
      const vBotY = midY + 45;

      // 1. Incoming Neutrino (Amber Line)
      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(w * 0.08, midY - 140);
      ctx.lineTo(vTopX, vTopY);
      ctx.stroke();

      ctx.fillStyle = '#ffaa00';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`Incoming ν_${flavor}`, w * 0.08, midY - 150);

      // 2. Incoming Nucleon (Proton / Oxygen Nucleus) with 3 Valence Quarks
      const nucStartX = w * 0.08;
      const nucStartY = midY + 130;

      // Outer nucleon boundary glow
      ctx.fillStyle = 'rgba(30, 80, 140, 0.22)';
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(nucStartX + 50, nucStartY, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#00f3ff';
      ctx.font = '11px sans-serif';
      ctx.fillText('Target Nucleon N', nucStartX + 10, nucStartY + 68);

      // Three quarks: 1 participating quark + 2 spectator quarks
      const q1Y = nucStartY - 22; // Participating quark
      const q2Y = nucStartY;     // Spectator 1
      const q3Y = nucStartY + 22; // Spectator 2

      // Quark 1 line (goes to bottom vertex)
      ctx.strokeStyle = '#2277bb';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(nucStartX + 50, q1Y);
      ctx.lineTo(vBotX, vBotY);
      ctx.stroke();

      // Spectator quarks continue straight forward
      ctx.strokeStyle = 'rgba(100, 180, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(nucStartX + 50, q2Y);
      ctx.lineTo(w * 0.75, q2Y + 40);
      ctx.moveTo(nucStartX + 50, q3Y);
      ctx.lineTo(w * 0.75, q3Y + 60);
      ctx.stroke();

      // Spectator quarks label
      ctx.fillStyle = '#88c2ff';
      ctx.font = '11px sans-serif';
      ctx.fillText('2 Spectator Quarks (unaffected)', w * 0.48, q3Y + 65);

      // 3. Virtual Boson Propagator (Wavy line between top and bottom vertices)
      const bosonProgress = Math.max(0, Math.min(1, (collisionProgress - 0.2) / 0.3));
      ctx.strokeStyle = currentMode === 'CC' ? '#ff3366' : '#9955ff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const waveSteps = 24;
      for (let s = 0; s <= waveSteps; s++) {
        const u = s / waveSteps;
        const wx = vTopX + Math.sin(u * Math.PI * 6) * 10;
        const wy = vTopY + u * (vBotY - vTopY);
        if (s === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.stroke();

      // Propagator label
      ctx.fillStyle = currentMode === 'CC' ? '#ff3366' : '#9955ff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(currentMode === 'CC' ? 'W± Boson (80.4 GeV)' : 'Z⁰ Boson (91.2 GeV)', vTopX + 16, midY - 10);

      // 4. Outgoing Lepton (Top right)
      const lepEndX = w * 0.88;
      const lepEndY = midY - 140;

      if (currentMode === 'CC') {
        if (flavor === 'mu') {
          // Muon Track: long continuous white beam
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(vTopX, vTopY);
          ctx.lineTo(lepEndX, lepEndY);
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText(`Outgoing Muon μ⁻ (${((1 - inelasticityY) * 100).toFixed(0)}% energy)`, lepEndX - 90, lepEndY - 12);
          ctx.font = '11px sans-serif';
          ctx.fillText('→ Produces Kilometers-Long Cherenkov Track', lepEndX - 90, lepEndY + 4);
        } else if (flavor === 'e') {
          // Electron Cascade: spherical burst of light
          ctx.fillStyle = 'rgba(255, 100, 200, 0.4)';
          ctx.beginPath();
          ctx.arc(vTopX + 60, vTopY - 30, 45, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ff77cc';
          ctx.stroke();

          ctx.fillStyle = '#ff77cc';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText(`Outgoing Electron e⁻ (${((1 - inelasticityY) * 100).toFixed(0)}% energy)`, vTopX + 115, vTopY - 40);
          ctx.font = '11px sans-serif';
          ctx.fillText('→ Electromagnetic Shower (<10m)', vTopX + 115, vTopY - 24);
        } else if (flavor === 'tau') {
          // Tau Lepton: short flight gap then second decay burst ("Double Bang")
          ctx.strokeStyle = '#00f3ff';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(vTopX, vTopY);
          ctx.lineTo(vTopX + 85, vTopY - 45);
          ctx.stroke();

          // Second bang
          ctx.fillStyle = 'rgba(0, 243, 255, 0.4)';
          ctx.beginPath();
          ctx.arc(vTopX + 85, vTopY - 45, 30, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#00f3ff';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText('Tau τ⁻ Lepton Flight & 2nd Bang', vTopX + 125, vTopY - 50);
          ctx.font = '11px sans-serif';
          ctx.fillText('→ 50m flight per PeV of energy', vTopX + 125, vTopY - 35);
        }
      } else {
        // Neutral Current: Outgoing invisible neutrino
        ctx.strokeStyle = 'rgba(255, 170, 0, 0.45)';
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(vTopX, vTopY);
        ctx.lineTo(lepEndX, lepEndY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`Outgoing ν_${flavor} (Invisible, Carries ${(1 - inelasticityY) * 100}% Energy)`, lepEndX - 150, lepEndY - 10);
      }

      // 5. Hadronic Cascade X (Bottom right)
      // Shattered quarks fragment into hadrons (pions, protons)
      const hadX = w * 0.72;
      const hadY = vBotY + 15;

      ctx.fillStyle = 'rgba(0, 243, 255, 0.35)';
      ctx.beginPath();
      ctx.arc(hadX, hadY, 40 + inelasticityY * 40, 0, Math.PI * 2);
      ctx.fill();

      // Hadronic spray lines
      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 1.5;
      for (let k = -3; k <= 3; k++) {
        ctx.beginPath();
        ctx.moveTo(vBotX, vBotY);
        ctx.lineTo(hadX + 35 + Math.cos(k * 0.3) * 35, hadY + Math.sin(k * 0.3) * 35);
        ctx.stroke();
      }

      ctx.fillStyle = '#00f3ff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`Hadronic Cascade X (${(inelasticityY * 100).toFixed(0)}% Energy)`, hadX + 45, hadY);
      ctx.font = '11px sans-serif';
      ctx.fillText('Fragmented quarks emit Cherenkov light', hadX + 45, hadY + 16);

      // Inelasticity Readout Drawer
      ctx.fillStyle = 'rgba(10, 20, 35, 0.85)';
      ctx.fillRect(w - 240, h - 85, 225, 75);
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.3)';
      ctx.strokeRect(w - 240, h - 85, 225, 75);

      ctx.fillStyle = '#ffffff';
      ctx.font = '11px sans-serif';
      ctx.fillText(`Inelasticity y = E_had / E_tot = ${inelasticityY.toFixed(2)}`, w - 225, h - 65);
      ctx.fillText(`Hadronic Energy: ${(inelasticityY * 100).toFixed(0)}%`, w - 225, h - 48);
      ctx.fillText(`Lepton Energy: ${((1 - inelasticityY) * 100).toFixed(0)}%`, w - 225, h - 31);
    }

    return {
      init,
      setFlavor: (f) => { flavor = f; },
      setMode: (m) => { currentMode = m; },
      setInelasticity: (y) => { inelasticityY = parseFloat(y); }
    };
  })();

  // =========================================================================
  // MODULE 3: CHERENKOV & ICE OPTICS ("Sonic Boom for Light")
  // =========================================================================
  const CherenkovWaveTank = (() => {
    let canvas, ctx;
    let animId = null;
    let beta = 0.95; // v/c
    let refractiveIndex = 1.31; // deep Antarctic ice
    let wavelets = [];
    let particleX = 50;

    function init(canvasElem) {
      canvas = canvasElem;
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      animate();
    }

    function animate() {
      animId = requestAnimationFrame(animate);
      if (!ctx || !canvas) return;

      const w = canvas.width;
      const h = canvas.height;
      const midY = h / 2;

      // Phase velocity of light in medium (relative to canvas scale)
      // c_medium = c / n
      const cLightCanvas = 3.6;
      const cMedium = cLightCanvas / refractiveIndex;
      const vParticle = beta * cLightCanvas;

      // Move particle
      particleX += vParticle;
      if (particleX > w - 40) {
        particleX = 50;
        wavelets = [];
      }

      // Emit spherical EM wavelet every few frames
      if (wavelets.length === 0 || (particleX - wavelets[wavelets.length - 1].originX) >= 12) {
        wavelets.push({
          originX: particleX,
          originY: midY,
          radius: 0
        });
      }

      // Expand wavelets at phase speed c/n
      for (let i = 0; i < wavelets.length; i++) {
        wavelets[i].radius += cMedium;
      }

      // Clear Canvas
      ctx.fillStyle = '#060913';
      ctx.fillRect(0, 0, w, h);

      // Check Cherenkov condition: beta > 1/n
      const thresholdBeta = 1 / refractiveIndex;
      const isCherenkovActive = beta > thresholdBeta;
      const thetaC = isCherenkovActive ? Math.acos(1 / (beta * refractiveIndex)) : null;

      // Draw all expanding wavelets
      ctx.lineWidth = 1.2;
      for (let i = 0; i < wavelets.length; i++) {
        const wv = wavelets[i];
        if (wv.radius > w) continue;

        // Fade with radius
        const alpha = Math.max(0.04, 0.45 - (wv.radius / (w * 0.75)));
        ctx.strokeStyle = `rgba(0, 243, 255, ${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(wv.originX, wv.originY, wv.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // If Cherenkov active: Draw coherent conical Mach shock front!
      if (isCherenkovActive && thetaC !== null && wavelets.length > 5) {
        // Shock front envelope lines tangent to wavelets
        const coneLength = particleX - 50;
        const tanAngle = Math.tan(Math.PI / 2 - thetaC);

        ctx.strokeStyle = '#00f3ff';
        ctx.lineWidth = 2.5;

        // Top shock line
        ctx.beginPath();
        ctx.moveTo(particleX, midY);
        ctx.lineTo(50, midY - coneLength * Math.sin(thetaC));
        ctx.stroke();

        // Bottom shock line
        ctx.beginPath();
        ctx.moveTo(particleX, midY);
        ctx.lineTo(50, midY + coneLength * Math.sin(thetaC));
        ctx.stroke();

        // Shaded Cherenkov light cone
        ctx.fillStyle = 'rgba(0, 243, 255, 0.12)';
        ctx.beginPath();
        ctx.moveTo(particleX, midY);
        ctx.lineTo(50, midY - coneLength * Math.sin(thetaC));
        ctx.lineTo(50, midY + coneLength * Math.sin(thetaC));
        ctx.closePath();
        ctx.fill();

        // Angle indicator arc
        const deg = (thetaC * (180 / Math.PI)).toFixed(1);
        ctx.strokeStyle = '#ffaa00';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(particleX, midY, 45, Math.PI, Math.PI + thetaC, false);
        ctx.stroke();

        ctx.fillStyle = '#ffaa00';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`θ_c = ${deg}°`, particleX - 85, midY - 25);
      }

      // Draw Relativistic Charged Particle
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(particleX, midY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Velocity vector arrow
      ctx.strokeStyle = '#ff3366';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(particleX, midY);
      ctx.lineTo(particleX + 30, midY);
      ctx.stroke();

      // Formula and Telemetry HUD
      ctx.fillStyle = 'rgba(10, 20, 35, 0.85)';
      ctx.fillRect(15, 15, 290, 115);
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.35)';
      ctx.strokeRect(15, 15, 290, 115);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('Cherenkov Radiation ("Sonic Boom for Light")', 25, 34);

      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#00f3ff';
      ctx.fillText(`Refractive Index n: ${refractiveIndex.toFixed(2)} (c_ice = ${(Physics.C_LIGHT / refractiveIndex / 1e6).toFixed(0)}k km/s)`, 25, 54);
      ctx.fillText(`Particle Speed β = v/c: ${beta.toFixed(3)}`, 25, 72);
      ctx.fillText(`Threshold Speed 1/n: ${thresholdBeta.toFixed(3)}`, 25, 90);

      if (isCherenkovActive) {
        ctx.fillStyle = '#00ff66';
        ctx.fillText(`Condition MET (β > 1/n): cos(θ_c) = 1/(βn) → ${(thetaC * 180 / Math.PI).toFixed(1)}°`, 25, 110);
      } else {
        ctx.fillStyle = '#ff4444';
        ctx.fillText('Condition NOT MET (β < 1/n): Subluminal (No Cherenkov Glow)', 25, 110);
      }
    }

    return {
      init,
      setBeta: (val) => { beta = parseFloat(val); },
      setIndex: (val) => { refractiveIndex = parseFloat(val); }
    };
  })();

  // =========================================================================
  // MODULE 5: THE 5-SIGMA DISCOVERY LAB (Statistics & Filtering)
  // =========================================================================
  const DiscoveryLab = (() => {
    let container;
    let observationYears = 10;
    let isEarthFilterActive = true;
    let isHESEVetoActive = true;

    function init(containerElem) {
      container = containerElem;
      render();
    }

    function render() {
      if (!container) return;

      // Event counts based on physics rates in document:
      // - Down-going atmospheric muons: ~2.7 kHz => 8.5e10 per year
      // - Atmospheric neutrinos: ~100,000 per year
      // - Astrophysical cosmic neutrinos: ~100 per year

      const rawAtmosphericMuonsPerYr = 8.5e10;
      const rawAtmosphericNeutrinosPerYr = 100000;
      const rawAstrophysicalPerYr = 100;

      // Filtering efficiency
      // Earth shielding removes downward atmospheric muons (reduction 1e-6)
      const muonRejection = isEarthFilterActive ? 1e-9 : 1.0;
      const vetoRejection = isHESEVetoActive ? 0.05 : 1.0;

      const survivingMuonBkg = Math.round(rawAtmosphericMuonsPerYr * observationYears * muonRejection);
      const survivingAtmNeutrinos = Math.round(rawAtmosphericNeutrinosPerYr * observationYears * (isHESEVetoActive ? 0.003 : 1.0));
      const totalBackground = survivingMuonBkg + survivingAtmNeutrinos;

      const signalAstrophysical = Math.round(rawAstrophysicalPerYr * observationYears);
      const totalObserved = totalBackground + signalAstrophysical;

      // Statistical significance calculation
      const stats = Physics.calculateSignificance(totalObserved, totalBackground);

      container.innerHTML = `
        <div class="discovery-lab-grid">
          <div class="lab-card">
            <h4>1. The 1-in-a-Billion Needle in a Haystack</h4>
            <p class="card-desc">Compare the immense background flux entering the cubic kilometer detector with the rare cosmic signal.</p>
            <div class="rate-comparison-bars">
              <div class="rate-row">
                <span class="rate-label">Atmospheric Muons (Surface):</span>
                <span class="rate-val">~2,700 per second (85 Billion/yr)</span>
                <div class="bar-fill" style="width: 100%; background: #ff4444;"></div>
              </div>
              <div class="rate-row">
                <span class="rate-label">Atmospheric Neutrinos:</span>
                <span class="rate-val">~100,000 per year</span>
                <div class="bar-fill" style="width: 15%; background: #ffaa00;"></div>
              </div>
              <div class="rate-row">
                <span class="rate-label">Astrophysical Cosmic Signal:</span>
                <span class="rate-val">Only ~100 per year!</span>
                <div class="bar-fill" style="width: 1.5%; background: #00f3ff;"></div>
              </div>
            </div>
          </div>

          <div class="lab-card">
            <h4>2. Active Background Rejection Filters</h4>
            <div class="filter-toggles">
              <label class="toggle-row">
                <input type="checkbox" id="checkEarthFilter" ${isEarthFilterActive ? 'checked' : ''}>
                <span><strong>Earth Overburden (Upgoing Filter):</strong> Uses 12,742 km of planetary rock to absorb downward atmospheric muons.</span>
              </label>
              <label class="toggle-row">
                <input type="checkbox" id="checkHESEVeto" ${isHESEVetoActive ? 'checked' : ''}>
                <span><strong>Outer DOM Veto (HESE):</strong> Flags events starting inside the ice, rejecting incoming atmospheric debris.</span>
              </label>
            </div>
            <div class="years-slider-row">
              <label>Observation Time: <strong id="yearsVal">${observationYears} Years</strong></label>
              <input type="range" id="sliderYears" min="1" max="15" value="${observationYears}">
            </div>
          </div>

          <div class="lab-card highlight-card">
            <h4>3. Discovery Significance (The 5-Sigma Standard)</h4>
            <div class="stats-summary">
              <div class="stat-box">
                <span class="stat-number" style="color: ${stats.isDiscovery ? '#00ff66' : stats.isStrongEvidence ? '#ffaa00' : '#ff4444'};">
                  ${stats.zScore.toFixed(2)} σ
                </span>
                <span class="stat-label">Significance (Li & Ma)</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">${stats.pValue < 1e-4 ? stats.pValue.toExponential(2) : stats.pValue.toFixed(4)}</span>
                <span class="stat-label">p-value (Chance of Fluke)</span>
              </div>
              <div class="stat-box">
                <span class="stat-number">${signalAstrophysical}</span>
                <span class="stat-label">Cosmic Neutrinos Found</span>
              </div>
            </div>

            <div class="verdict-banner ${stats.isDiscovery ? 'banner-discovery' : stats.isStrongEvidence ? 'banner-evidence' : 'banner-insufficient'}">
              ${stats.isDiscovery 
                ? '🏆 FORMAL DISCOVERY (Z ≥ 5.0σ): Milestone achieved! Meets the gold standard of physics discoveries (like 2014 & 2026 Milky Way confirmation).' 
                : stats.isStrongEvidence 
                ? '🔬 STRONG EVIDENCE (4.0σ ≤ Z < 5.0σ): Compelling signal (like NGC 1068 at 4.2σ), but convention requires 5σ for definitive discovery.'
                : '⏳ EVIDENCE BUILDING (Z < 4.0σ): Insufficient data or background rejection. Needs more observation time.'}
            </div>
          </div>
        </div>
      `;

      // Event listeners
      const checkEarth = container.querySelector('#checkEarthFilter');
      const checkVeto = container.querySelector('#checkHESEVeto');
      const sliderY = container.querySelector('#sliderYears');

      if (checkEarth) checkEarth.onchange = (e) => { isEarthFilterActive = e.target.checked; render(); };
      if (checkVeto) checkVeto.onchange = (e) => { isHESEVetoActive = e.target.checked; render(); };
      if (sliderY) sliderY.oninput = (e) => { observationYears = parseInt(e.target.value); render(); };
    }

    return {
      init,
      render
    };
  })();

  return {
    CosmicEngine,
    SubatomicDIS,
    CherenkovWaveTank,
    DiscoveryLab
  };
})();

// Export for module/browser compatibility
if (typeof window !== 'undefined') {
  window.Modules2D = Modules2D;
}
