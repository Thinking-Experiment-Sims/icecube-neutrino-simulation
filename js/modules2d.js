/**
 * modules2d.js - Interactive 2D Physics Visualizations
 * The Thinking Experiment Design System: Light Mode Only (Teal, Amber, White)
 * Authored for Vladimir Lopez · 2026
 * 
 * Implements:
 * 1. Module 1: Cosmic Engine (B-field deflection vs straight neutrino, photopion decay, dust torus)
 * 2. Module 2: Subatomic Collision (Quark-level DIS, CC W vs NC Z0, spectator quarks, inelasticity)
 * 3. Module 3: Cherenkov Wave Tank ("Sonic Boom for Light", Mach cone, South Pole ice optics)
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

    function init(canvasElem) {
      canvas = canvasElem;
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      resetSimulation();
      if (animId) cancelAnimationFrame(animId);
      animate();
    }

    function resetSimulation() {
      particles = [];
    }

    function emitParticles() {
      if (!canvas || particles.length > 90) return;

      const originX = 80;
      const originY = canvas.height / 2;

      // 1. Cosmic Ray Proton (Charged: bends in B-field)
      particles.push({
        type: 'proton',
        x: originX,
        y: originY + (Math.random() - 0.5) * 20,
        vx: 3.5,
        vy: (Math.random() - 0.5) * 1.2,
        charge: 1,
        energyPeV: 10,
        trail: [],
        color: '#dc2626' // Crimson
      });

      // 2. Escaping Neutrino from photopion decay (Neutral: straight line)
      if (activeChannel === 'both' || activeChannel === 'pions_charged') {
        particles.push({
          type: 'neutrino',
          x: originX,
          y: originY,
          vx: 4.8,
          vy: (Math.random() - 0.5) * 0.4,
          charge: 0,
          trail: [],
          color: '#d67b19' // Amber
        });
      }

      // 3. High-Energy Gamma Ray (Neutral: straight line, but absorbed by dust)
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
          color: '#0f7e9b' // Teal
        });
      }
    }

    function animate() {
      animId = requestAnimationFrame(animate);
      if (!ctx || !canvas) return;

      if (Math.random() < 0.12) emitParticles();

      // Light-mode background
      ctx.fillStyle = '#f7fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const agnX = 80;
      const agnY = canvas.height / 2;

      // Relativistic jet glow (Amber/warm)
      const jetGlow = ctx.createRadialGradient(agnX, agnY, 5, agnX, agnY, 65);
      jetGlow.addColorStop(0, 'rgba(214, 123, 25, 0.35)');
      jetGlow.addColorStop(0.5, 'rgba(214, 123, 25, 0.15)');
      jetGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = jetGlow;
      ctx.beginPath();
      ctx.arc(agnX, agnY, 65, 0, Math.PI * 2);
      ctx.fill();

      // Accretion disk core
      ctx.fillStyle = '#d67b19';
      ctx.beginPath();
      ctx.arc(agnX, agnY, 12, 0, Math.PI * 2);
      ctx.fill();

      // Label for source
      ctx.fillStyle = '#123140';
      ctx.font = '600 11px sans-serif';
      ctx.fillText('Cosmic Accelerator', agnX - 35, agnY + 30);
      ctx.font = '500 10px sans-serif';
      ctx.fillStyle = '#4b6570';
      ctx.fillText('(Blazar / AGN)', agnX - 22, agnY + 44);

      // Dust Torus (if enabled, e.g., NGC 1068 obscured AGN)
      if (hasDustTorus) {
        ctx.save();
        ctx.strokeStyle = 'rgba(180, 125, 60, 0.65)';
        ctx.fillStyle = 'rgba(220, 180, 130, 0.35)';
        ctx.lineWidth = 16;
        ctx.beginPath();
        ctx.ellipse(agnX + 35, agnY, 45, 95, Math.PI / 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fill();

        ctx.fillStyle = '#945812';
        ctx.font = '600 11px sans-serif';
        ctx.fillText('Dense Dust Torus (NGC 1068)', agnX - 20, agnY - 90);
        ctx.font = '500 10px sans-serif';
        ctx.fillText('Traps Gamma Rays, transparent to Neutrinos', agnX - 20, agnY - 76);
        ctx.restore();
      }

      // Draw Earth & IceCube Target at the far right
      const earthX = canvas.width - 75;
      const earthY = canvas.height / 2;
      ctx.fillStyle = '#0f7e9b';
      ctx.beginPath();
      ctx.arc(earthX, earthY, 36, 0, Math.PI * 2);
      ctx.fill();

      // Antarctic ice cap highlight
      ctx.fillStyle = '#e6f4f8';
      ctx.beginPath();
      ctx.arc(earthX, earthY + 20, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#123140';
      ctx.font = '600 11px sans-serif';
      ctx.fillText('Earth & IceCube', earthX - 44, earthY + 54);

      // Background Magnetic Field lines (subtle Teal waves)
      ctx.strokeStyle = 'rgba(15, 126, 155, 0.12)';
      ctx.lineWidth = 1.2;
      for (let y = 30; y < canvas.height; y += 42) {
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

        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 28) p.trail.shift();

        if (p.charge !== 0) {
          // Proton bends in magnetic field
          const bVal = Math.sin((p.x * 0.02) + (p.y * 0.03)) * bFieldStrength;
          p.vy += bVal * 0.08;
          p.x += p.vx;
          p.y += p.vy;
        } else {
          // Neutral particles travel in laser-straight lines
          p.x += p.vx;
          p.y += p.vy;

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
          ctx.lineWidth = p.type === 'neutrino' ? 2.5 : 1.5;
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
          ctx.fillStyle = 'rgba(214, 123, 25, 0.45)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
          ctx.fill();
        }

        if (p.x > canvas.width || p.y < 0 || p.y > canvas.height || (p.isAbsorbed && p.trail.length <= 1)) {
          particles.splice(i, 1);
        }
      }

      // Legend Card Overlay (Light mode card style)
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#c8dbe3';
      ctx.lineWidth = 1;
      ctx.fillRect(15, 15, 275, 96);
      ctx.strokeRect(15, 15, 275, 96);

      ctx.fillStyle = '#0f7e9b';
      ctx.font = '700 12px sans-serif';
      ctx.fillText('Cosmic Messenger Propagation', 25, 34);

      ctx.font = '600 11px sans-serif';
      ctx.fillStyle = '#dc2626';
      ctx.fillText('● Proton (q = +1): Bends in B-Field (Scrambled)', 25, 54);

      ctx.fillStyle = '#d67b19';
      ctx.fillText('● Neutrino (q = 0): Laser-Straight Line to Earth', 25, 72);

      ctx.fillStyle = '#0f7e9b';
      ctx.fillText(`● Gamma Ray: ${hasDustTorus ? 'Absorbed in Dust Torus' : 'Reaches Earth'}`, 25, 90);
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
    let inelasticityY = 0.28;
    let collisionProgress = 0;
    let isPlaying = true;

    function init(canvasElem) {
      canvas = canvasElem;
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      if (animId) cancelAnimationFrame(animId);
      animate();
    }

    function animate() {
      animId = requestAnimationFrame(animate);
      if (!ctx || !canvas) return;

      if (isPlaying) {
        collisionProgress += 0.007;
        if (collisionProgress > 1.25) collisionProgress = 0;
      }

      // Light-mode canvas
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const midY = h / 2;

      // Header Banner
      ctx.fillStyle = '#0f7e9b';
      ctx.font = '700 13px sans-serif';
      const eqText = currentMode === 'CC'
        ? `Charged Current (CC): ν_${flavor} + N → ${flavor === 'mu' ? 'μ⁻' : flavor === 'e' ? 'e⁻' : 'τ⁻'} + Hadronic Shower X (W± Exchange)`
        : `Neutral Current (NC): ν_${flavor} + N → ν_${flavor} + Hadronic Shower X (Z⁰ Exchange)`;
      ctx.fillText(eqText, 20, 28);

      const vTopX = w * 0.42;
      const vTopY = midY - 65;
      const vBotX = w * 0.42;
      const vBotY = midY + 45;

      // 1. Incoming Neutrino (Amber Line)
      ctx.strokeStyle = '#d67b19';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(w * 0.08, midY - 140);
      ctx.lineTo(vTopX, vTopY);
      ctx.stroke();

      ctx.fillStyle = '#d67b19';
      ctx.font = '700 12px sans-serif';
      ctx.fillText(`Incoming ν_${flavor}`, w * 0.08, midY - 150);

      // 2. Incoming Nucleon (Target nucleus in ice)
      const nucStartX = w * 0.08;
      const nucStartY = midY + 130;

      ctx.fillStyle = '#e6f4f8';
      ctx.strokeStyle = '#0f7e9b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(nucStartX + 50, nucStartY, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#123140';
      ctx.font = '700 11px sans-serif';
      ctx.fillText('Target Nucleon N in Ice', nucStartX + 5, nucStartY + 68);

      const q1Y = nucStartY - 22;
      const q2Y = nucStartY;
      const q3Y = nucStartY + 22;

      // Participating Quark
      ctx.strokeStyle = '#0f7e9b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(nucStartX + 50, q1Y);
      ctx.lineTo(vBotX, vBotY);
      ctx.stroke();

      // Spectator Quarks (unaffected)
      ctx.strokeStyle = '#7a94a0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(nucStartX + 50, q2Y);
      ctx.lineTo(w * 0.75, q2Y + 40);
      ctx.moveTo(nucStartX + 50, q3Y);
      ctx.lineTo(w * 0.75, q3Y + 60);
      ctx.stroke();

      ctx.fillStyle = '#4b6570';
      ctx.font = '500 11px sans-serif';
      ctx.fillText('2 Spectator Quarks (unaffected)', w * 0.48, q3Y + 65);

      // 3. Virtual Boson Propagator (Wavy line between vertices)
      ctx.strokeStyle = currentMode === 'CC' ? '#d67b19' : '#0f7e9b';
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

      ctx.fillStyle = currentMode === 'CC' ? '#d67b19' : '#0f7e9b';
      ctx.font = '700 12px sans-serif';
      ctx.fillText(currentMode === 'CC' ? 'W± Boson (80.4 GeV)' : 'Z⁰ Boson (91.2 GeV)', vTopX + 16, midY - 10);

      // 4. Outgoing Lepton
      const lepEndX = w * 0.88;
      const lepEndY = midY - 140;

      if (currentMode === 'CC') {
        if (flavor === 'mu') {
          // Muon Track: long line
          ctx.strokeStyle = '#095f76';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(vTopX, vTopY);
          ctx.lineTo(lepEndX, lepEndY);
          ctx.stroke();

          ctx.fillStyle = '#095f76';
          ctx.font = '700 12px sans-serif';
          ctx.fillText(`Outgoing Muon μ⁻ (${((1 - inelasticityY) * 100).toFixed(0)}% energy)`, lepEndX - 90, lepEndY - 12);
          ctx.font = '500 11px sans-serif';
          ctx.fillStyle = '#4b6570';
          ctx.fillText('→ Kilometers-long Cherenkov Track', lepEndX - 90, lepEndY + 4);
        } else if (flavor === 'e') {
          // Electron Cascade: compact burst
          ctx.fillStyle = 'rgba(214, 123, 25, 0.25)';
          ctx.beginPath();
          ctx.arc(vTopX + 60, vTopY - 30, 45, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#d67b19';
          ctx.stroke();

          ctx.fillStyle = '#d67b19';
          ctx.font = '700 12px sans-serif';
          ctx.fillText(`Outgoing Electron e⁻ (${((1 - inelasticityY) * 100).toFixed(0)}% energy)`, vTopX + 115, vTopY - 40);
          ctx.font = '500 11px sans-serif';
          ctx.fillStyle = '#4b6570';
          ctx.fillText('→ Electromagnetic Shower (<10m)', vTopX + 115, vTopY - 24);
        } else if (flavor === 'tau') {
          // Tau Lepton: Double Bang
          ctx.strokeStyle = '#0f7e9b';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(vTopX, vTopY);
          ctx.lineTo(vTopX + 85, vTopY - 45);
          ctx.stroke();

          ctx.fillStyle = 'rgba(15, 126, 155, 0.25)';
          ctx.beginPath();
          ctx.arc(vTopX + 85, vTopY - 45, 30, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#0f7e9b';
          ctx.font = '700 12px sans-serif';
          ctx.fillText('Tau τ⁻ Lepton Flight & 2nd Bang', vTopX + 125, vTopY - 50);
          ctx.font = '500 11px sans-serif';
          ctx.fillStyle = '#4b6570';
          ctx.fillText('→ 50m flight per PeV of energy', vTopX + 125, vTopY - 35);
        }
      } else {
        // Neutral Current
        ctx.strokeStyle = 'rgba(214, 123, 25, 0.6)';
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(vTopX, vTopY);
        ctx.lineTo(lepEndX, lepEndY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#d67b19';
        ctx.font = '700 12px sans-serif';
        ctx.fillText(`Outgoing ν_${flavor} (Invisible, Carries ${((1 - inelasticityY) * 100).toFixed(0)}% Energy)`, lepEndX - 180, lepEndY - 10);
      }

      // 5. Hadronic Cascade X
      const hadX = w * 0.72;
      const hadY = vBotY + 15;

      ctx.fillStyle = 'rgba(15, 126, 155, 0.2)';
      ctx.beginPath();
      ctx.arc(hadX, hadY, 40 + inelasticityY * 40, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#0f7e9b';
      ctx.lineWidth = 1.5;
      for (let k = -3; k <= 3; k++) {
        ctx.beginPath();
        ctx.moveTo(vBotX, vBotY);
        ctx.lineTo(hadX + 35 + Math.cos(k * 0.3) * 35, hadY + Math.sin(k * 0.3) * 35);
        ctx.stroke();
      }

      ctx.fillStyle = '#0f7e9b';
      ctx.font = '700 12px sans-serif';
      ctx.fillText(`Hadronic Cascade X (${(inelasticityY * 100).toFixed(0)}% Energy)`, hadX + 45, hadY);
      ctx.font = '500 11px sans-serif';
      ctx.fillStyle = '#4b6570';
      ctx.fillText('Fragmented quarks emit Cherenkov light', hadX + 45, hadY + 16);

      // Inelasticity Readout Card
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#c8dbe3';
      ctx.fillRect(w - 250, h - 90, 235, 78);
      ctx.strokeRect(w - 250, h - 90, 235, 78);

      ctx.fillStyle = '#123140';
      ctx.font = '600 11px sans-serif';
      ctx.fillText(`Inelasticity y = E_had / E_tot = ${inelasticityY.toFixed(2)}`, w - 235, h - 68);
      ctx.fillStyle = '#0f7e9b';
      ctx.fillText(`Hadronic Shower Energy: ${(inelasticityY * 100).toFixed(0)}%`, w - 235, h - 50);
      ctx.fillStyle = '#d67b19';
      ctx.fillText(`Outgoing Lepton Energy: ${((1 - inelasticityY) * 100).toFixed(0)}%`, w - 235, h - 32);
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
      if (animId) cancelAnimationFrame(animId);
      animate();
    }

    function animate() {
      animId = requestAnimationFrame(animate);
      if (!ctx || !canvas) return;

      const w = canvas.width;
      const h = canvas.height;
      const midY = h / 2;

      const cLightCanvas = 3.6;
      const cMedium = cLightCanvas / refractiveIndex;
      const vParticle = beta * cLightCanvas;

      particleX += vParticle;
      if (particleX > w - 40) {
        particleX = 50;
        wavelets = [];
      }

      if (wavelets.length === 0 || (particleX - wavelets[wavelets.length - 1].originX) >= 12) {
        wavelets.push({
          originX: particleX,
          originY: midY,
          radius: 0
        });
      }

      for (let i = 0; i < wavelets.length; i++) {
        wavelets[i].radius += cMedium;
      }

      // Soft light glacial ice tank background
      ctx.fillStyle = '#edf6f9';
      ctx.fillRect(0, 0, w, h);

      const thresholdBeta = 1 / refractiveIndex;
      const isCherenkovActive = beta > thresholdBeta;
      const thetaC = isCherenkovActive ? Math.acos(1 / (beta * refractiveIndex)) : null;

      // Draw all expanding wavelets
      ctx.lineWidth = 1.2;
      for (let i = 0; i < wavelets.length; i++) {
        const wv = wavelets[i];
        if (wv.radius > w) continue;

        const alpha = Math.max(0.05, 0.45 - (wv.radius / (w * 0.75)));
        ctx.strokeStyle = `rgba(15, 126, 155, ${alpha.toFixed(2)})`;
        ctx.beginPath();
        ctx.arc(wv.originX, wv.originY, wv.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // If Cherenkov active: Draw coherent conical Mach shock front!
      if (isCherenkovActive && thetaC !== null && wavelets.length > 5) {
        const coneLength = particleX - 50;

        ctx.strokeStyle = '#d67b19';
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
        ctx.fillStyle = 'rgba(214, 123, 25, 0.12)';
        ctx.beginPath();
        ctx.moveTo(particleX, midY);
        ctx.lineTo(50, midY - coneLength * Math.sin(thetaC));
        ctx.lineTo(50, midY + coneLength * Math.sin(thetaC));
        ctx.closePath();
        ctx.fill();

        // Angle indicator arc
        const deg = (thetaC * (180 / Math.PI)).toFixed(1);
        ctx.strokeStyle = '#0f7e9b';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(particleX, midY, 45, Math.PI, Math.PI + thetaC, false);
        ctx.stroke();

        ctx.fillStyle = '#0f7e9b';
        ctx.font = '700 12px sans-serif';
        ctx.fillText(`θ_c = ${deg}°`, particleX - 88, midY - 25);
      }

      // Draw Relativistic Charged Particle
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(particleX, midY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Velocity vector arrow
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(particleX, midY);
      ctx.lineTo(particleX + 28, midY);
      ctx.stroke();

      // Telemetry HUD Card
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#c8dbe3';
      ctx.fillRect(15, 15, 300, 115);
      ctx.strokeRect(15, 15, 300, 115);

      ctx.fillStyle = '#0f7e9b';
      ctx.font = '700 12px sans-serif';
      ctx.fillText('Cherenkov Radiation Optics', 25, 34);

      ctx.font = '500 11px sans-serif';
      ctx.fillStyle = '#123140';
      ctx.fillText(`Refractive Index n: ${refractiveIndex.toFixed(2)} (c_ice = ${(Physics.C_LIGHT / refractiveIndex / 1e6).toFixed(0)}k km/s)`, 25, 54);
      ctx.fillText(`Particle Speed β = v/c: ${beta.toFixed(3)}`, 25, 72);
      ctx.fillText(`Threshold Speed 1/n: ${thresholdBeta.toFixed(3)}`, 25, 90);

      if (isCherenkovActive) {
        ctx.fillStyle = '#1a7f4e';
        ctx.font = '700 11px sans-serif';
        ctx.fillText(`Condition MET (β > 1/n): cos(θ_c) = 1/(βn) → ${(thetaC * 180 / Math.PI).toFixed(1)}°`, 25, 112);
      } else {
        ctx.fillStyle = '#dc2626';
        ctx.font = '700 11px sans-serif';
        ctx.fillText('Condition NOT MET (β < 1/n): Subluminal (No Cherenkov shockwave)', 25, 112);
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

      const rawAtmosphericMuonsPerYr = 8.5e10;
      const rawAtmosphericNeutrinosPerYr = 100000;
      const rawAstrophysicalPerYr = 100;

      const muonRejection = isEarthFilterActive ? 1e-9 : 1.0;
      const vetoRejection = isHESEVetoActive ? 0.05 : 1.0;

      const survivingMuonBkg = Math.round(rawAtmosphericMuonsPerYr * observationYears * muonRejection);
      const survivingAtmNeutrinos = Math.round(rawAtmosphericNeutrinosPerYr * observationYears * (isHESEVetoActive ? 0.003 : 1.0));
      const totalBackground = survivingMuonBkg + survivingAtmNeutrinos;

      const signalAstrophysical = Math.round(rawAstrophysicalPerYr * observationYears);
      const totalObserved = totalBackground + signalAstrophysical;

      const stats = Physics.calculateSignificance(totalObserved, totalBackground);

      container.innerHTML = `
        <div class="discovery-lab-grid">
          <div class="lab-box">
            <h4>1. The Needle in a Haystack: Flux Comparison</h4>
            <p style="font-size: 0.85rem; color: var(--muted); line-height: 1.45;">Compare the immense background flux entering the cubic kilometer detector with the rare cosmic signal.</p>
            <div class="rate-bar-container">
              <div class="rate-bar-row">
                <div class="rate-bar-header">
                  <span style="color: var(--danger);">Atmospheric Muons (Surface):</span>
                  <span>~2,700/sec (85 Billion/yr)</span>
                </div>
                <div class="bar-track">
                  <div class="bar-progress" style="width: 100%; background: var(--danger);"></div>
                </div>
              </div>
              <div class="rate-bar-row">
                <div class="rate-bar-header">
                  <span style="color: var(--accent-amber-dark);">Atmospheric Neutrinos:</span>
                  <span>~100,000 per year</span>
                </div>
                <div class="bar-track">
                  <div class="bar-progress" style="width: 18%; background: var(--accent-amber);"></div>
                </div>
              </div>
              <div class="rate-bar-row">
                <div class="rate-bar-header">
                  <span style="color: var(--primary-teal-dark);">Astrophysical Cosmic Signal:</span>
                  <span style="font-weight: 700; color: var(--primary-teal-dark);">Only ~100 per year!</span>
                </div>
                <div class="bar-track">
                  <div class="bar-progress" style="width: 3%; background: var(--primary-teal);"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="lab-box">
            <h4>2. Active Background Rejection Filters</h4>
            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
              <label class="toggle-option">
                <input type="checkbox" id="checkEarthFilter" ${isEarthFilterActive ? 'checked' : ''}>
                <span><strong>Earth Overburden (Upgoing Filter):</strong> Uses 12,742 km of planetary rock to absorb downward atmospheric muons.</span>
              </label>
              <label class="toggle-option">
                <input type="checkbox" id="checkHESEVeto" ${isHESEVetoActive ? 'checked' : ''}>
                <span><strong>Outer DOM Veto (HESE):</strong> Flags events starting inside the ice, rejecting incoming atmospheric debris.</span>
              </label>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.35rem; margin-top: 0.5rem;">
              <div style="display: flex; justify-content: space-between; font-size: 0.84rem; font-weight: 600;">
                <span>Observation Period:</span>
                <span class="val-badge">${observationYears} Years</span>
              </div>
              <input type="range" id="sliderYears" min="1" max="15" value="${observationYears}">
            </div>
          </div>

          <div class="lab-box" style="grid-column: 1 / -1;">
            <h4>3. Statistical Significance (The 5-Sigma Standard)</h4>
            <div class="significance-badge-box">
              <div class="sig-metric">
                <span class="sig-number" style="color: ${stats.isDiscovery ? 'var(--success)' : stats.isStrongEvidence ? 'var(--accent-amber)' : 'var(--danger)'};">
                  ${stats.zScore.toFixed(2)} σ
                </span>
                <span class="sig-label">Significance (Li & Ma)</span>
              </div>
              <div class="sig-metric">
                <span class="sig-number" style="color: var(--primary-teal-dark);">
                  ${stats.pValue < 1e-4 ? stats.pValue.toExponential(2) : stats.pValue.toFixed(4)}
                </span>
                <span class="sig-label">p-value (Chance of Fluke)</span>
              </div>
              <div class="sig-metric">
                <span class="sig-number" style="color: var(--accent-amber-dark);">
                  ${signalAstrophysical}
                </span>
                <span class="sig-label">Cosmic Neutrinos Detected</span>
              </div>
            </div>

            <div class="verdict-box ${stats.isDiscovery ? 'verdict-discovery' : stats.isStrongEvidence ? 'verdict-evidence' : 'verdict-building'}" style="margin-top: 0.6rem;">
              ${stats.isDiscovery 
                ? '🏆 FORMAL DISCOVERY (Z ≥ 5.0σ): Milestone achieved! Meets the gold standard of physics discoveries (such as the 2013 Bert & Ernie event and 2023 Milky Way galactic plane evidence).' 
                : stats.isStrongEvidence 
                ? '🔬 STRONG EVIDENCE (4.0σ ≤ Z < 5.0σ): Highly compelling signal (like NGC 1068 at 4.2σ), but convention requires 5σ for definitive discovery.'
                : '⏳ EVIDENCE BUILDING (Z < 4.0σ): Background contamination too high. Enable Earth shielding and outer veto filters to isolate the signal!'}
            </div>
          </div>
        </div>
      `;

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

if (typeof window !== 'undefined') {
  window.Modules2D = Modules2D;
}
