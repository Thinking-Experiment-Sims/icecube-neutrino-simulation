/**
 * presentation.js - Ghost Particle Lab Interactive Presentation Controller
 * The Thinking Experiment Design System (Light Mode Only)
 * Authored for Vladimir Lopez · October 2026
 */

(function () {
  "use strict";

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  // Theme Colors
  const C = {
    surface: "#ffffff",
    ink: "#123140",
    muted: "#4b6570",
    line: "#c8dbe3",
    teal: "#0f7e9b",
    tealDeep: "#095f76",
    amber: "#d67b19",
    amberText: "#b8650f",
    crimson: "#dc2626",
    chip: "#eaf5f9",
    iceBlue: "#0f7e9b"
  };

  const FB = "'IBM Plex Sans', system-ui, -apple-system, sans-serif";
  const FD = "'Inter', system-ui, -apple-system, sans-serif";

  function ctx(id, w, h) {
    const c = $(id);
    if (!c) return null;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = w * dpr;
    c.height = h * dpr;
    const g = c.getContext("2d");
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    return g;
  }

  function gauss() {
    let u = 0, v = 0;
    while (!u) u = Math.random();
    v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function erfc(x) {
    const z = Math.abs(x), t = 1 / (1 + 0.5 * z);
    const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
    return x >= 0 ? r : 2 - r;
  }

  function sci(x) {
    if (!(x > 0)) return "0";
    const e = Math.floor(Math.log10(x));
    let m = x / Math.pow(10, e);
    if (m >= 9.95) {
      m = 1;
      return m.toFixed(1) + "×10<sup>" + (e + 1 < 0 ? "−" + (-(e + 1)) : e + 1) + "</sup>";
    }
    return m.toFixed(1) + "×10<sup>" + (e < 0 ? "−" + (-e) : e) + "</sup>";
  }

  function bindRange(id, out, fmt, cb) {
    const r = $(id), o = $(out);
    if (!r || !o) return;
    const f = () => {
      o.innerHTML = fmt(+r.value);
      if (cb) cb(+r.value);
    };
    r.addEventListener("input", f);
    f();
  }

  function row(dl, items) {
    if (!dl) return;
    dl.innerHTML = items.map((i) => "<dt>" + i[0] + "</dt><dd>" + i[1] + "</dd>").join("");
  }

  // =========================================================================
  // SLIDE 1: MESSENGERS (Cosmic Engine & Arrival Direction Histograms)
  // =========================================================================
  const S1 = {
    W: 900, H: 380, SX: 80, DX: 825, v: 420, B: 35, tau: 1.5,
    show: { cr: true, g: true, n: true },
    run: true, parts: [], flash: [], acc: { cr: 0, g: 0, n: 0 }, rate: 9, nb: 45,
    hist: {}, em: {}, fin: {}, ar: {}, ss: {}
  };

  function seedParticles1() {
    for (let i = 0; i < 22; i++) {
      const types = ["cr", "g", "n"];
      const t = types[i % 3];
      const startX = S1.SX + 35 + Math.random() * (S1.DX - S1.SX - 90);
      const dy = t === "cr" ? Math.sin((startX * 0.02) + ((S1.H / 2) * 0.03)) * (S1.B * 0.35) : (Math.random() - 0.5) * 8;
      const p = {
        t,
        x: startX,
        y: S1.H / 2 + dy,
        a: (Math.random() - 0.5) * 0.03,
        tr: [],
        dead: 0,
        checkedDust: startX > S1.SX + 80
      };
      for (let s = 8; s >= 0; s--) {
        p.tr.push([p.x - s * 8, p.y]);
      }
      S1.parts.push(p);
    }
  }

  function reset1() {
    ["cr", "g", "n"].forEach((k) => {
      S1.hist[k] = new Array(S1.nb).fill(0);
      S1.em[k] = 0; S1.fin[k] = 0; S1.ar[k] = 0; S1.ss[k] = 0;
    });
    S1.parts = []; S1.flash = [];
  }
  reset1();
  seedParticles1();

  const g1 = ctx("#c1", S1.W, S1.H);
  const gh = ctx("#h1", 900, 170);

  function spawn1(t) {
    S1.em[t]++;
    const p = {
      t,
      x: S1.SX,
      y: S1.H / 2 + (t === "cr" ? (Math.random() - 0.5) * 12 : 0),
      a: (Math.random() - 0.5) * 0.05,
      tr: [],
      dead: 0,
      checkedDust: false
    };
    S1.parts.push(p);
  }

  function upd1(dt) {
    if (!S1.run) return;
    ["cr", "g", "n"].forEach((k) => {
      if (!S1.show[k]) return;
      S1.acc[k] += S1.rate * dt;
      while (S1.acc[k] >= 1) {
        S1.acc[k] -= 1;
        spawn1(k);
      }
    });

    const torusX = S1.SX + 40, torusY = S1.H / 2;

    for (const p of S1.parts) {
      p.x += Math.cos(p.a) * S1.v * dt;
      p.y += Math.sin(p.a) * S1.v * dt;

      // Dust Torus absorption for Gamma Rays
      if (p.t === "g" && !p.checkedDust && !p.dead) {
        const distTorus = Math.hypot(p.x - torusX, p.y - torusY);
        if (distTorus < 55) {
          p.checkedDust = true;
          // Absorption probability based on optical depth tau: 1 - exp(-tau)
          if (Math.random() < (1 - Math.exp(-S1.tau))) {
            p.dead = 1;
            S1.fin.g++;
            S1.flash.push({ x: p.x, y: p.y, l: 0.65, c: "ab" });
          }
        }
      }

      // Protons curve in turbulent magnetic field
      if (p.t === "cr" && p.x > 150 && p.x < S1.DX) {
        const bVal = Math.sin((p.x * 0.02) + (p.y * 0.03)) * (S1.B / 100);
        p.a += (bVal * 0.065 + gauss() * (S1.B / 100) * 0.035) * Math.sqrt(dt * 60);
      }

      p.tr.push([p.x, p.y]);
      if (p.tr.length > 20) p.tr.shift();

      if (p.x >= S1.DX) {
        p.dead = 1;
        S1.fin[p.t]++;
        S1.ar[p.t]++;
        const deg = (p.a * 180) / Math.PI;
        S1.ss[p.t] += deg * deg;
        let b = Math.floor((deg + 45) / 2);
        if (b >= 0 && b < S1.nb) S1.hist[p.t][b]++;
        S1.flash.push({ x: S1.DX, y: p.y, l: 0.7, c: p.t });
      } else if (p.y < 0 || p.y > S1.H) {
        p.dead = 1;
        S1.fin[p.t]++;
      }
    }

    S1.parts = S1.parts.filter((p) => !p.dead);
    for (const f of S1.flash) f.l -= dt;
    S1.flash = S1.flash.filter((f) => f.l > 0);
  }

  function col1(k) {
    return k === "cr" ? C.crimson : k === "g" ? C.teal : C.amber;
  }

  function draw1() {
    if (!g1) return;
    const g = g1, W = S1.W, H = S1.H;
    g.clearRect(0, 0, W, H);
    g.fillStyle = C.surface;
    g.fillRect(0, 0, W, H);

    const agnX = S1.SX, agnY = H / 2;
    const earthX = S1.DX, earthY = H / 2;

    // 1. Continuous Intergalactic Magnetic Field Wave Lines (Teal)
    g.strokeStyle = "rgba(15, 126, 155, " + Math.max(0.04, 0.04 + (S1.B / 100) * 0.22) + ")";
    g.lineWidth = 1.3;
    for (let y = 35; y < H; y += 38) {
      g.beginPath();
      for (let x = 160; x <= earthX - 40; x += 15) {
        const dy = Math.sin((x * 0.02) + (y * 0.03)) * (S1.B * 0.35);
        if (x === 160) g.moveTo(x, y + dy);
        else g.lineTo(x, y + dy);
      }
      g.stroke();
    }

    // 2. Relativistic Jet Beam Glow (Amber)
    const jetGlow = g.createRadialGradient(agnX, agnY, 4, agnX, agnY, 75);
    jetGlow.addColorStop(0, "rgba(214, 123, 25, 0.35)");
    jetGlow.addColorStop(0.5, "rgba(214, 123, 25, 0.12)");
    jetGlow.addColorStop(1, "transparent");
    g.fillStyle = jetGlow;
    g.beginPath();
    g.arc(agnX, agnY, 75, 0, Math.PI * 2);
    g.fill();

    // Collimated Relativistic Jet Beam along line of sight
    g.fillStyle = "rgba(214, 123, 25, 0.10)";
    g.beginPath();
    g.moveTo(agnX, agnY - 4);
    g.lineTo(agnX + 160, agnY - 28);
    g.lineTo(agnX + 160, agnY + 28);
    g.lineTo(agnX, agnY + 4);
    g.closePath();
    g.fill();

    // 3. Dense Dust Torus (NGC 1068 style, tilted ellipse around AGN)
    const torusX = agnX + 40, torusY = agnY;
    g.save();
    g.strokeStyle = "rgba(180, 125, 60, " + Math.min(0.85, 0.35 + (S1.tau / 4) * 0.50) + ")";
    g.fillStyle = "rgba(220, 180, 130, " + Math.min(0.55, 0.12 + (S1.tau / 4) * 0.40) + ")";
    g.lineWidth = 16;
    g.beginPath();
    g.ellipse(torusX, torusY, 48, 105, Math.PI / 8, 0, Math.PI * 2);
    g.stroke();
    g.fill();
    g.restore();

    // Dust Torus label
    g.fillStyle = "#945812";
    g.font = "700 12px " + FD;
    g.textAlign = "center";
    g.fillText("Dense Dust Torus (NGC 1068)", torusX + 15, agnY - 92);
    g.font = "500 11px " + FB;
    g.fillStyle = C.muted;
    g.fillText("Traps γ-rays · Transparent to ν", torusX + 15, agnY - 76);

    // 4. Cosmic Accelerator Core (Accretion disk + Black hole event horizon)
    g.fillStyle = C.amber;
    g.beginPath();
    g.arc(agnX, agnY, 12, 0, Math.PI * 2);
    g.fill();

    g.fillStyle = C.ink;
    g.beginPath();
    g.arc(agnX, agnY, 5, 0, Math.PI * 2);
    g.fill();

    g.fillStyle = C.ink;
    g.font = "700 12px " + FD;
    g.textAlign = "center";
    g.fillText("Cosmic Accelerator", agnX, agnY + 44);
    g.font = "500 11px " + FB;
    g.fillStyle = C.muted;
    g.fillText("(Blazar / AGN)", agnX, agnY + 58);

    // 5. Earth & IceCube Target at the far right
    g.fillStyle = C.teal;
    g.beginPath();
    g.arc(earthX, earthY, 36, 0, Math.PI * 2);
    g.fill();

    // Polar ice cap highlight
    g.fillStyle = "#eaf5f9";
    g.beginPath();
    g.arc(earthX, earthY + 20, 16, 0, Math.PI * 2);
    g.fill();

    // IceCube detector marker
    g.fillStyle = C.amber;
    g.beginPath();
    g.arc(earthX, earthY + 22, 4, 0, Math.PI * 2);
    g.fill();

    g.fillStyle = C.ink;
    g.font = "700 12px " + FD;
    g.textAlign = "center";
    g.fillText("Earth & IceCube", earthX, earthY + 54);

    // 6. Header sub-annotations
    g.fillStyle = C.muted;
    g.font = "600 12px " + FB;
    g.textAlign = "center";
    g.fillText("Turbulent magnetic fields B (deflects & scrambles protons)", 480, 22);

    // 7. Particle Trajectories & Trails
    for (const p of S1.parts) {
      const cl = col1(p.t);
      g.strokeStyle = cl;
      g.lineWidth = p.t === "n" ? 2.8 : 1.8;
      g.globalAlpha = 0.65;
      g.beginPath();
      p.tr.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])));
      g.stroke();
      g.globalAlpha = 1;

      g.fillStyle = cl;
      g.beginPath();
      g.arc(p.x, p.y, p.t === "n" ? 4.5 : 3.5, 0, Math.PI * 2);
      g.fill();
    }

    // 8. Flashes: Absorption bursts in dust vs Detector hits on Earth
    for (const f of S1.flash) {
      g.globalAlpha = Math.max(0, f.l);
      if (f.c === "ab") {
        // Orange burst in dust torus
        g.strokeStyle = C.amber;
        g.lineWidth = 2.5;
        g.beginPath();
        g.arc(f.x, f.y, 6 + (0.65 - f.l) * 26, 0, Math.PI * 2);
        g.stroke();

        g.fillStyle = "rgba(214, 123, 25, 0.4)";
        g.beginPath();
        g.arc(f.x, f.y, 8, 0, Math.PI * 2);
        g.fill();
      } else {
        // Hit on Earth detector
        g.fillStyle = col1(f.c);
        g.beginPath();
        g.arc(f.x, f.y, 5 + (0.7 - f.l) * 9, 0, Math.PI * 2);
        g.fill();
      }
      g.globalAlpha = 1;
    }

    // 9. On-canvas Legend Card
    g.fillStyle = "rgba(255, 255, 255, 0.92)";
    g.strokeStyle = C.line;
    g.lineWidth = 1;
    g.fillRect(180, H - 76, 420, 64);
    g.strokeRect(180, H - 76, 420, 64);

    g.textAlign = "left";
    g.font = "600 11.5px " + FB;
    [
      ["cr", "Cosmic ray (p, q = +1): Bends in B-field (arrival direction scrambled)"],
      ["g", "Gamma ray (γ, q = 0): Straight line, absorbed by dense dust torus"],
      ["n", "Neutrino (ν, q = 0): Laser-straight line directly pointing to source"]
    ].forEach((a, i) => {
      g.fillStyle = col1(a[0]);
      g.beginPath();
      g.arc(195, H - 60 + i * 18, 4.5, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = C.ink;
      g.fillText(a[1], 208, H - 56 + i * 18);
    });

    drawHist1();
  }

  function drawHist1() {
    if (!gh) return;
    const g = gh, W = 900, H = 170;
    g.clearRect(0, 0, W, H);
    g.fillStyle = C.surface;
    g.fillRect(0, 0, W, H);

    const names = { cr: "Protons (Cosmic Rays)", g: "Gamma Rays", n: "Neutrinos (Point-Source)" };
    const pw = 270, gap = 45, x0 = 20;

    ["cr", "g", "n"].forEach((k, pi) => {
      const px = x0 + pi * (pw + gap), top = 30, hh = 92, tot = S1.ar[k];
      const h = S1.hist[k];
      const mx = Math.max(0.08, tot ? Math.max(...h) / tot : 0);

      g.fillStyle = col1(k);
      g.font = "700 13px " + FD;
      g.textAlign = "left";
      g.fillText(names[k], px, 18);

      g.strokeStyle = C.line;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(px, top + hh);
      g.lineTo(px + pw, top + hh);
      g.stroke();

      // Zero-angle line
      g.setLineDash([3, 3]);
      g.beginPath();
      g.moveTo(px + pw / 2, top);
      g.lineTo(px + pw / 2, top + hh);
      g.stroke();
      g.setLineDash([]);

      const bw = pw / S1.nb;
      if (tot) {
        h.forEach((v, i) => {
          const bh = (v / tot / mx) * hh;
          g.fillRect(px + i * bw + 0.5, top + hh - bh, bw - 1, bh);
        });
      }

      g.fillStyle = C.muted;
      g.font = "12px " + FB;
      g.textAlign = "center";
      g.fillText("−45°", px + 10, top + hh + 16);
      g.fillText("0° (True Origin)", px + pw / 2, top + hh + 16);
      g.fillText("+45°", px + pw - 10, top + hh + 16);
    });

    g.fillStyle = C.muted;
    g.font = "600 12px " + FB;
    g.textAlign = "center";
    g.fillText("Arrival direction distribution at Earth detector", 450, H - 3);
  }

  function read1() {
    const dl = $("#r1");
    const names = { cr: "Protons (Cosmic rays)", g: "Gamma rays", n: "Neutrinos" };
    const it = [];
    ["cr", "g", "n"].forEach((k) => {
      const a = S1.ar[k], f = S1.fin[k];
      const sp = a >= 5 ? "±" + Math.sqrt(S1.ss[k] / a).toFixed(1) + "°" : "Collecting...";
      it.push([names[k] + " reached Earth", f >= 5 ? Math.round((a / f) * 100) + "%" : "n/a"]);
      it.push([names[k] + " angular spread", sp]);
    });
    row(dl, it);
  }

  bindRange("#rB", "#oB", (v) => v + "%", (v) => { S1.B = v; });
  bindRange("#rT", "#oT", (v) => v.toFixed(1), (v) => { S1.tau = v; });

  [["#sCr", "cr"], ["#sG", "g"], ["#sN", "n"]].forEach((a) => {
    const el = $(a[0]);
    if (el) el.addEventListener("change", (e) => { S1.show[a[1]] = e.target.checked; });
  });

  const bPause = $("#bPause");
  if (bPause) {
    bPause.addEventListener("click", (e) => {
      S1.run = !S1.run;
      e.target.textContent = S1.run ? "Pause" : "Resume";
    });
  }

  const bClear = $("#bClear");
  if (bClear) bClear.addEventListener("click", reset1);

  // =========================================================================
  // SLIDE 2: SUBATOMIC COLLISIONS & HADRONIC CASCADE (Deep Inelastic Scattering)
  // =========================================================================
  const S2 = {
    mode: "mu_cc", // "mu_cc", "e_cc", "tau_cc", "nc"
    y: 0.28,       // inelasticity fraction (energy to hadronic cascade)
    step: 0,       // walkthrough step (0=all, 1=knockout, 2=string, 3=hadronize, 4=light)
    time: 0
  };

  const gDIS = ctx("#cDIS", 900, 380);

  function updateInelasticityHUD() {
    const yValDisplay = $("#yValDisplay");
    const yPercentHad = $("#yPercentHad");
    const yPercentLep = $("#yPercentLep");
    const splitHadBar = $("#splitHadBar");
    const splitLepBar = $("#splitLepBar");
    const hadPct = Math.round(S2.y * 100);
    const lepPct = 100 - hadPct;
    if (yValDisplay) yValDisplay.textContent = S2.y.toFixed(2);
    if (yPercentHad) yPercentHad.textContent = hadPct + "%";
    if (yPercentLep) yPercentLep.textContent = lepPct + "%";
    if (splitHadBar) {
      splitHadBar.style.width = hadPct + "%";
      splitHadBar.textContent = "Hadron Cascade: " + hadPct + "%";
    }
    if (splitLepBar) {
      splitLepBar.style.width = lepPct + "%";
      splitLepBar.textContent = "Outgoing Lepton: " + lepPct + "%";
    }
  }

  function drawDIS() {
    if (!gDIS) return;
    const g = gDIS, W = 900, H = 380;
    g.clearRect(0, 0, W, H);
    g.fillStyle = C.surface;
    g.fillRect(0, 0, W, H);

    const vTopX = 350, vTopY = 125;
    const vBotX = 350, vBotY = 240;

    // Header equation
    g.font = "700 13.5px " + FD;
    g.fillStyle = C.tealDeep;
    let eq = "";
    if (S2.mode === "mu_cc") eq = "Muon Neutrino Charged Current: ν_μ + N → μ⁻ + Hadronic Shower X (W⁺ Boson Exchange)";
    else if (S2.mode === "e_cc") eq = "Electron Neutrino Charged Current: ν_e + N → e⁻ + Hadronic Shower X (W⁺ Boson Exchange)";
    else if (S2.mode === "tau_cc") eq = "Tau Neutrino Charged Current: ν_τ + N → τ⁻ + Hadronic Shower X (Double Bang Signature)";
    else eq = "Neutral Current (All Flavors): ν + N → ν + Hadronic Shower X (Z⁰ Boson Exchange)";
    g.fillText(eq, 25, 26);

    // 1. Incoming Neutrino (Amber line)
    g.strokeStyle = C.amber;
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(45, 90);
    g.lineTo(vTopX, vTopY);
    g.stroke();

    g.fillStyle = C.amber;
    g.font = "700 12.5px " + FD;
    let inLabel = S2.mode === "mu_cc" ? "Incoming ν_μ" : S2.mode === "e_cc" ? "Incoming ν_e" : S2.mode === "tau_cc" ? "Incoming ν_τ" : "Incoming ν_l";
    g.fillText(inLabel, 45, 78);

    // 2. Target Nucleon (Proton / Neutron in Oxygen/Hydrogen ice nucleus)
    const nucCenterX = 120, nucCenterY = 275, nucR = 44;
    g.fillStyle = C.chip;
    g.strokeStyle = C.teal;
    g.lineWidth = 1.6;
    g.beginPath();
    g.arc(nucCenterX, nucCenterY, nucR, 0, Math.PI * 2);
    g.fill();
    g.stroke();

    g.fillStyle = C.ink;
    g.font = "700 12px " + FD;
    g.fillText("Target Nucleon N in Ice", nucCenterX - 48, nucCenterY + 62);

    // 3 Valence Quarks
    const q1Y = nucCenterY - 20; // Struck quark q
    const q2Y = nucCenterY;     // Spectator 1
    const q3Y = nucCenterY + 20; // Spectator 2

    // Struck quark line to bottom vertex
    g.strokeStyle = C.tealDeep;
    g.lineWidth = 2.8;
    g.beginPath();
    g.moveTo(nucCenterX, q1Y);
    g.lineTo(vBotX, vBotY);
    g.stroke();

    g.fillStyle = C.tealDeep;
    g.font = "600 11.5px " + FB;
    g.fillText("Struck Quark q (u or d)", nucCenterX + 45, q1Y - 8);

    // 2 Spectator Quarks
    g.strokeStyle = C.muted;
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(nucCenterX, q2Y);
    g.lineTo(600, 305);
    g.moveTo(nucCenterX, q3Y);
    g.lineTo(600, 328);
    g.stroke();

    g.fillStyle = C.muted;
    g.font = "500 11px " + FB;
    g.fillText("2 Spectator Quarks (unaffected)", 420, 346);

    // 3. Virtual Boson Propagator (Wavy line between vertices)
    const isW = S2.mode !== "nc";
    g.strokeStyle = isW ? C.amber : C.teal;
    g.lineWidth = 2.6;
    g.beginPath();
    const waves = 20;
    for (let s = 0; s <= waves; s++) {
      const u = s / waves;
      const wx = vTopX + Math.sin(u * Math.PI * 6) * 10;
      const wy = vTopY + u * (vBotY - vTopY);
      if (s === 0) g.moveTo(wx, wy);
      else g.lineTo(wx, wy);
    }
    g.stroke();

    g.fillStyle = isW ? C.amberText : C.tealDeep;
    g.font = "700 12px " + FD;
    g.fillText(isW ? "W⁺ Boson (80.4 GeV)" : "Z⁰ Boson (91.2 GeV)", vTopX + 16, (vTopY + vBotY) / 2 + 4);

    // 4. Outgoing Lepton at Top Right
    const lepEndX = 780, lepEndY = 80;

    if (S2.mode === "mu_cc") {
      // Outgoing Muon Track
      g.strokeStyle = C.tealDeep;
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(vTopX, vTopY);
      g.lineTo(lepEndX, lepEndY);
      g.stroke();

      g.fillStyle = C.tealDeep;
      g.font = "700 13px " + FD;
      g.fillText("Outgoing Muon μ⁻", lepEndX - 100, lepEndY - 14);
      g.font = "500 11.5px " + FB;
      g.fillStyle = C.muted;
      g.fillText("Carries " + ((1 - S2.y) * 100).toFixed(0) + "% energy → Kilometers-long Cherenkov Track", lepEndX - 240, lepEndY + 6);
    } else if (S2.mode === "e_cc") {
      // Outgoing Electron Cascade
      const eGlow = g.createRadialGradient(vTopX + 50, vTopY - 25, 4, vTopX + 50, vTopY - 25, 40);
      eGlow.addColorStop(0, "rgba(214, 123, 25, 0.45)");
      eGlow.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = eGlow;
      g.beginPath();
      g.arc(vTopX + 50, vTopY - 25, 40, 0, Math.PI * 2);
      g.fill();

      g.strokeStyle = C.amber;
      g.lineWidth = 2;
      g.stroke();

      g.fillStyle = C.amberText;
      g.font = "700 13px " + FD;
      g.fillText("Outgoing Electron e⁻ Cascade", vTopX + 105, vTopY - 30);
      g.font = "500 11.5px " + FB;
      g.fillStyle = C.muted;
      g.fillText("Bremsstrahlung shower (<10m) overlaps with hadronic shower", vTopX + 105, vTopY - 14);
    } else if (S2.mode === "tau_cc") {
      // Outgoing Tau Double Bang
      g.strokeStyle = C.teal;
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(vTopX, vTopY);
      g.lineTo(vTopX + 85, vTopY - 45);
      g.stroke();

      const tauGlow = g.createRadialGradient(vTopX + 85, vTopY - 45, 4, vTopX + 85, vTopY - 45, 28);
      tauGlow.addColorStop(0, "rgba(15, 126, 155, 0.45)");
      tauGlow.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = tauGlow;
      g.beginPath();
      g.arc(vTopX + 85, vTopY - 45, 28, 0, Math.PI * 2);
      g.fill();

      g.fillStyle = C.tealDeep;
      g.font = "700 13px " + FD;
      g.fillText("Tau τ⁻ Decay (2nd Cascade)", vTopX + 125, vTopY - 48);
      g.font = "500 11.5px " + FB;
      g.fillStyle = C.muted;
      g.fillText("Double Bang signature: ~50m flight path per PeV", vTopX + 125, vTopY - 32);
    } else {
      // Neutral Current (Invisible Neutrino)
      g.setLineDash([7, 6]);
      g.strokeStyle = C.amber;
      g.lineWidth = 2.5;
      g.beginPath();
      g.moveTo(vTopX, vTopY);
      g.lineTo(lepEndX, lepEndY);
      g.stroke();
      g.setLineDash([]);

      g.fillStyle = C.amberText;
      g.font = "700 13px " + FD;
      g.fillText("Outgoing Neutrino ν_l (Invisible)", lepEndX - 180, lepEndY - 14);
      g.font = "500 11.5px " + FB;
      g.fillStyle = C.muted;
      g.fillText("Zero electric charge: escapes undetected without light", lepEndX - 240, lepEndY + 6);
    }

    // 5. Hadronic Cascade X at Bottom Right
    const hadX = 640, hadY = vBotY + 12;
    const hadR = 34 + S2.y * 36;

    const hadGlow = g.createRadialGradient(hadX, hadY, 4, hadX, hadY, hadR);
    hadGlow.addColorStop(0, "rgba(15, 126, 155, 0.45)");
    hadGlow.addColorStop(0.7, "rgba(15, 126, 155, 0.15)");
    hadGlow.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = hadGlow;
    g.beginPath();
    g.arc(hadX, hadY, hadR, 0, Math.PI * 2);
    g.fill();

    // Fragmentation hadron lines
    g.strokeStyle = C.teal;
    g.lineWidth = 1.6;
    for (let k = -4; k <= 4; k++) {
      g.beginPath();
      g.moveTo(vBotX, vBotY);
      g.lineTo(hadX + 28 + Math.cos(k * 0.25) * 30, hadY + Math.sin(k * 0.25) * 30);
      g.stroke();
    }

    g.fillStyle = C.tealDeep;
    g.font = "700 13px " + FD;
    g.fillText("Hadronic Cascade X", hadX + 46, hadY - 8);
    g.font = "500 11.5px " + FB;
    g.fillStyle = C.muted;
    g.fillText("Carries y = " + (S2.y * 100).toFixed(0) + "% energy", hadX + 46, hadY + 10);
    g.fillText("Fragmented quarks → π±, π⁰, p, n (<10m)", hadX + 46, hadY + 26);
  }

  // Setup Slide 2 Buttons
  $$("#fl_dis button").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$("#fl_dis button").forEach((b) => b.setAttribute("aria-pressed", b === btn ? "true" : "false"));
      S2.mode = btn.dataset.f;
      drawDIS();
      readDIS();
    });
  });

  bindRange("#rY", "#oY", (v) => v.toFixed(2), (v) => {
    S2.y = v;
    drawDIS();
    readDIS();
    updateInelasticityHUD();
  });
  updateInelasticityHUD();

  function readDIS() {
    const dl = $("#rDIS");
    if (!dl) return;
    const it = [];
    if (S2.mode === "mu_cc") {
      it.push(["Interaction", "ν_μ Charged Current"]);
      it.push(["Boson Exchange", "W⁺ / W⁻ (80.4 GeV)"]);
      it.push(["Primary Signal", "Kilometers-long Muon Track"]);
      it.push(["Vertex Signature", "Localized Hadronic Shower"]);
      it.push(["Reconstruction", "0.3° Point-Source Direction"]);
    } else if (S2.mode === "e_cc") {
      it.push(["Interaction", "ν_e Charged Current"]);
      it.push(["Boson Exchange", "W⁺ / W⁻ (80.4 GeV)"]);
      it.push(["Primary Signal", "Spherical Cascade (<10m)"]);
      it.push(["EM vs Hadronic", "Overlapping Showers"]);
      it.push(["Reconstruction", "~8% High-Precision Energy"]);
    } else if (S2.mode === "tau_cc") {
      it.push(["Interaction", "ν_τ Charged Current"]);
      it.push(["Boson Exchange", "W⁺ / W⁻ (80.4 GeV)"]);
      it.push(["Primary Signal", "Double Bang Signature"]);
      it.push(["Tau Decay Flight", (50 * 2).toFixed(0) + " m per 2 PeV"]);
      it.push(["Physics Role", "1:1:1 Cosmic Oscillation Ratio"]);
    } else {
      it.push(["Interaction", "Neutral Current (All Flavors)"]);
      it.push(["Boson Exchange", "Z⁰ Boson (91.2 GeV)"]);
      it.push(["Outgoing Neutrino", "Invisible (Zero Light)"]);
      it.push(["Visible Energy", (S2.y * 100).toFixed(0) + "% (Hadron Cascade Only)"]);
      it.push(["Event Rate", "~30% of all DIS Events"]);
    }
    row(dl, it);
  }

  // =========================================================================
  // SLIDE 3: ICE DETECTOR (Figure 3 Schematic vs Live Cherenkov Display)
  // =========================================================================
  const S3_Det = {
    view: "figure3", // "figure3" or "live"
    flavor: "mu",
    logE: 2,
    phi: 25,
    beta: 1.0,
    n: 1.31,
    c: 520,
    t: 0,
    dur: 3,
    hold: 0,
    ev: null,
    doms: [],
    ctr: { x: 480, y: 245 }
  };

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 10; j++) {
      S3_Det.doms.push({ x: 190 + i * 116, y: 70 + j * 37.8 });
    }
  }

  const g2 = ctx("#c2", 960, 480);
  const RE = [220, 38, 38];    // Red = earliest
  const RL = [15, 126, 155];   // Teal/Blue = latest

  function ramp(u) {
    u = Math.max(0, Math.min(1, u));
    return "rgb(" + RE.map((a, i) => Math.round(a + (RL[i] - a) * u)).join(",") + ")";
  }

  function build2() {
    const ph = (S3_Det.phi * Math.PI) / 180;
    const d = { x: Math.cos(ph), y: -Math.sin(ph) };
    const nr = { x: -d.y, y: d.x };
    const C_ctr = S3_Det.ctr, n = S3_Det.n, beta = S3_Det.beta, c = S3_Det.c;
    const cosT = 1 / (n * beta);
    const cone = cosT < 1;
    const thc = cone ? Math.acos(cosT) : 0;
    const al = cone ? Math.asin(cosT) : 0;
    const ev = { d, nr, cone, thc, al, tan: cone ? Math.tan(thc) : 1, hits: [], kind: S3_Det.flavor };
    const E = S3_Det.logE;

    if (S3_Det.flavor === "mu") {
      ev.L = 480 + 90 * E;
      ev.V = { x: C_ctr.x - d.x * 330, y: C_ctr.y - d.y * 330 };
      if (cone) {
        S3_Det.doms.forEach((D, i) => {
          const rx = D.x - ev.V.x, ry = D.y - ev.V.y;
          const z = rx * d.x + ry * d.y, rho = Math.abs(rx * d.y - ry * d.x);
          const sc = z - rho / ev.tan;
          if (sc >= 0 && sc <= ev.L && rho < 115) {
            const t = sc / (beta * c) + (n * Math.hypot(rho, z - sc)) / c;
            const q = Math.max(0.2, Math.min(1, (55 / (rho + 22)) * (0.6 + 0.1 * E)));
            ev.hits.push({ i, t: t + gauss() * 0.008, t0: t, q });
          }
        });
      }
    } else {
      ev.V = { x: C_ctr.x, y: C_ctr.y };
      ev.Rc = 70 + 28 * E;
      S3_Det.doms.forEach((D, i) => {
        const r = Math.hypot(D.x - C_ctr.x, D.y - C_ctr.y);
        if (r < ev.Rc) {
          const t = (n * r) / c;
          ev.hits.push({ i, t: t + gauss() * 0.008, t0: t, q: Math.max(0.25, 1 - (r / ev.Rc) * 0.8) });
        }
      });
    }

    ev.tmin = Infinity; ev.tmax = 0;
    ev.hits.forEach((h) => {
      ev.tmin = Math.min(ev.tmin, h.t0);
      ev.tmax = Math.max(ev.tmax, h.t0);
    });
    if (!ev.hits.length) { ev.tmin = 0; ev.tmax = 1; }

    ev.fit = S3_Det.flavor === "mu" && cone ? fit2(ev) : null;
    S3_Det.dur = Math.max(2.2, ev.tmax + 0.6);
    S3_Det.ev = ev;
    S3_Det.t = 0;
    S3_Det.hold = 0;
    read2();
  }

  function fit2(ev) {
    if (ev.hits.length < 4) return null;
    let best = null;
    const C_ctr = S3_Det.ctr;
    for (let a = 0; a < 360; a += 1) {
      const ar = (a * Math.PI) / 180, dx = Math.cos(ar), dy = -Math.sin(ar), nx = -dy, ny = dx;
      for (let b = -300; b <= 300; b += 8) {
        const px = C_ctr.x + nx * b, py = C_ctr.y + ny * b;
        let sr = 0, rs = [];
        for (const h of ev.hits) {
          const D = S3_Det.doms[h.i], rx = D.x - px, ry = D.y - py;
          const z = rx * dx + ry * dy, rho = Math.abs(rx * dy - ry * dx);
          const tp = (z - rho / ev.tan) / (S3_Det.beta * S3_Det.c) + (S3_Det.n * rho) / (S3_Det.c * Math.sin(ev.thc));
          const r = h.t - tp;
          rs.push(r);
          sr += r;
        }
        const m = sr / rs.length;
        let chi = 0;
        for (const r of rs) chi += (r - m) * (r - m);
        if (!best || chi < best.chi) best = { chi, a, b, px, py, dx, dy };
      }
    }
    const tr = S3_Det.phi;
    let df = Math.abs((((best.a - tr + 540) % 360) - 180));
    best.err = df;
    return best;
  }

  function upd2(dt) {
    if (!S3_Det.ev) return;
    if (S3_Det.t < S3_Det.dur) {
      S3_Det.t = Math.min(S3_Det.dur, S3_Det.t + dt);
    } else {
      S3_Det.hold += dt;
      if (S3_Det.hold > 1.5) {
        S3_Det.t = 0;
        S3_Det.hold = 0;
      }
    }
  }

  function draw2() {
    if (!g2) return;
    const g = g2, W = 960, H = 480, ev = S3_Det.ev;
    if (!ev) return;
    g.clearRect(0, 0, W, H);

    // Light-mode glacial ice stage background
    g.fillStyle = "#edf6f9";
    g.fillRect(0, 0, W, H);

    // Depth indicators
    g.strokeStyle = C.line;
    g.lineWidth = 1;
    g.fillStyle = C.muted;
    g.font = "600 12px " + FB;
    g.textAlign = "left";
    g.fillText("1,450 m Depth (Top)", 14, 74);
    g.fillText("2,450 m Depth (Bottom)", 14, 414);

    S3_Det.doms.forEach((D, i) => {
      if (i % 10 === 0) {
        g.beginPath();
        g.moveTo(D.x, 56);
        g.lineTo(D.x, 424);
        g.stroke();
      }
    });

    const t = S3_Det.t, d = ev.d, nr = ev.nr, V = ev.V;

    // Incoming Neutrino (Dashed Amber line)
    g.setLineDash([12, 10]);
    g.strokeStyle = C.amber;
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(V.x - d.x * 700, V.y - d.y * 700);
    g.lineTo(V.x, V.y);
    if (ev.kind === "nc") g.lineTo(V.x + d.x * 700, V.y + d.y * 700);
    g.stroke();
    g.setLineDash([]);

    if (ev.kind === "mu") {
      const sp = Math.min(S3_Det.beta * S3_Det.c * t, ev.L);
      const p = { x: V.x + d.x * sp, y: V.y + d.y * sp };

      // Cherenkov Shock Cone
      if (ev.cone && sp > 1) {
        const len = sp * Math.cos(ev.al), s = Math.sin(ev.al), co = Math.cos(ev.al);
        g.fillStyle = "rgba(15, 126, 155, 0.18)";
        g.beginPath();
        g.moveTo(p.x, p.y);
        g.lineTo(p.x - len * (co * d.x - s * nr.x), p.y - len * (co * d.y - s * nr.y));
        g.lineTo(p.x - len * (co * d.x + s * nr.x), p.y - len * (co * d.y + s * nr.y));
        g.closePath();
        g.fill();

        g.strokeStyle = C.teal;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(p.x - len * (co * d.x - s * nr.x), p.y - len * (co * d.y - s * nr.y));
        g.lineTo(p.x, p.y);
        g.lineTo(p.x - len * (co * d.x + s * nr.x), p.y - len * (co * d.y + s * nr.y));
        g.stroke();
      }

      // Outgoing muon particle line
      g.strokeStyle = C.tealDeep;
      g.lineWidth = 3.5;
      g.beginPath();
      g.moveTo(V.x, V.y);
      g.lineTo(p.x, p.y);
      g.stroke();

      g.fillStyle = C.tealDeep;
      g.beginPath();
      g.arc(p.x, p.y, 5, 0, Math.PI * 2);
      g.fill();
    } else {
      // Cascade spherical wave
      const r = Math.min((S3_Det.c / S3_Det.n) * t, ev.Rc);
      const gr = g.createRadialGradient(V.x, V.y, 2, V.x, V.y, Math.max(4, r));
      gr.addColorStop(0, "rgba(214, 123, 25, 0.85)");
      gr.addColorStop(0.5, "rgba(15, 126, 155, 0.45)");
      gr.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = gr;
      g.beginPath();
      g.arc(V.x, V.y, Math.max(4, r), 0, Math.PI * 2);
      g.fill();

      g.fillStyle = C.amber;
      g.beginPath();
      g.arc(V.x, V.y, 6, 0, Math.PI * 2);
      g.fill();
    }

    // DOMs rendering with rainbow timing
    const lit = {};
    ev.hits.forEach((h) => {
      if (h.t0 <= t) lit[h.i] = h;
    });

    S3_Det.doms.forEach((D, i) => {
      const h = lit[i];
      if (h) {
        const u = (h.t0 - ev.tmin) / ((ev.tmax - ev.tmin) || 1);
        g.fillStyle = ramp(u);
        g.globalAlpha = 0.35;
        g.beginPath();
        g.arc(D.x, D.y, 5 + 13 * h.q, 0, Math.PI * 2);
        g.fill();
        g.globalAlpha = 1;
        g.beginPath();
        g.arc(D.x, D.y, 3 + 6 * h.q, 0, Math.PI * 2);
        g.fill();
      } else {
        g.fillStyle = C.line;
        g.beginPath();
        g.arc(D.x, D.y, 3, 0, Math.PI * 2);
        g.fill();
      }
    });

    // Reconstructed Track Fit Line
    if (ev.fit && t >= S3_Det.dur - 0.05) {
      const f = ev.fit;
      g.setLineDash([6, 6]);
      g.strokeStyle = C.ink;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(f.px - f.dx * 600, f.py - f.dy * 600);
      g.lineTo(f.px + f.dx * 600, f.py + f.dy * 600);
      g.stroke();
      g.setLineDash([]);
    }

    // Legend Card
    g.fillStyle = C.surface;
    g.strokeStyle = C.line;
    g.fillRect(W - 200, H - 95, 185, 80);
    g.strokeRect(W - 200, H - 95, 185, 80);

    g.font = "600 11.5px " + FB;
    g.fillStyle = C.ink;
    g.textAlign = "left";

    // Legend items
    g.fillStyle = C.amber;
    g.fillRect(W - 190, H - 85, 12, 4);
    g.fillStyle = C.ink;
    g.fillText("Incoming Neutrino (ν)", W - 170, H - 81);

    g.fillStyle = C.tealDeep;
    g.fillRect(W - 190, H - 65, 12, 4);
    g.fillStyle = C.ink;
    g.fillText("Charged Muon Track (μ)", W - 170, H - 61);

    // Rainbow timing bar
    const rG = g.createLinearGradient(W - 190, 0, W - 150, 0);
    rG.addColorStop(0, ramp(0));
    rG.addColorStop(1, ramp(1));
    g.fillStyle = rG;
    g.fillRect(W - 190, H - 45, 30, 8);
    g.fillStyle = C.ink;
    g.fillText("Early → Late Hit", W - 150, H - 38);
  }

  function read2() {
    const ev = S3_Det.ev, n = S3_Det.n, beta = S3_Det.beta;
    const dl = $("#r2");
    if (!dl || !ev) return;
    const thr = 1 / n;
    const cone = ev.cone;
    const it = [];
    it.push(["Cone Angle θ_c", cone ? (ev.thc * (180 / Math.PI)).toFixed(1) + "°" : "Subluminal"]);
    it.push(["Light Velocity c/n", ((300000 / n)).toFixed(0) + " km/s"]);
    it.push(["Cherenkov Threshold β", "> " + thr.toFixed(3)]);
    it.push(["Sensors Triggered", ev.hits.length + " of " + S3_Det.doms.length]);
    if (ev.kind === "mu") {
      it.push(["Topology", "Linear Muon Track"]);
      if (ev.fit) it.push(["Direction Error", ev.fit.err.toFixed(1) + "°"]);
    } else {
      it.push(["Topology", "Spherical Cascade"]);
      it.push(["Directional Precision", "±5° (Calorimetric)"]);
    }
    row(dl, it);
  }

  // Cherenkov Event Generator Controls
  $$("#fl button").forEach((b) => {
    b.addEventListener("click", () => {
      $$("#fl button").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
      S3_Det.flavor = b.dataset.f;
      build2();
    });
  });

  bindRange("#rE", "#oE", (v) => {
    const e = Math.pow(10, v);
    return e >= 1000 ? (e / 1000).toFixed(e >= 10000 ? 0 : 1) + " PeV" : (e >= 10 ? e.toFixed(0) : e.toFixed(1)) + " TeV";
  }, (v) => {
    S3_Det.logE = v;
    build2();
  });

  bindRange("#rP", "#oP", (v) => v + "°", (v) => {
    S3_Det.phi = v;
    build2();
  });

  bindRange("#rBeta", "#oBeta", (v) => v.toFixed(3), (v) => {
    S3_Det.beta = v;
    build2();
  });

  const bFire = $("#bFire");
  if (bFire) bFire.addEventListener("click", () => build2());
  build2();

  // =========================================================================
  // SLIDE 4: SCALE & EARTH ABSORPTION
  // =========================================================================
  const NA = 6.022e23, NUC = 0.917 * NA;
  const AN = [[0, -35], [1, -34.155], [2, -33.398], [3, -33], [4, -32.62], [5, -32.26], [6, -31.92]];

  function sigma(le) {
    le = Math.max(0, Math.min(6, le));
    for (let i = 0; i < AN.length - 1; i++) {
      if (le <= AN[i + 1][0]) {
        const f = (le - AN[i][0]) / (AN[i + 1][0] - AN[i][0]);
        return Math.pow(10, AN[i][1] + f * (AN[i + 1][1] - AN[i][1]));
      }
    }
    return 1e-32;
  }

  function column(al) {
    const R = 6371, Rc = 3480, b = R * Math.sin(al), L = 2 * R * Math.cos(al);
    let Lc = 0;
    if (b < Rc) Lc = 2 * Math.sqrt(Rc * Rc - b * b);
    return ((L - Lc) * 4.4 + Lc * 11.0) * 1e5;
  }

  function trans(le, al) {
    return Math.exp(-column(al) * sigma(le) * NA);
  }

  const S4_Scale = { le: 3, ll: 3 };
  const g3 = ctx("#c3", 900, 150);
  const g3b = ctx("#c3b", 900, 300);

  function fmtE(le) {
    const e = Math.pow(10, le);
    return e >= 1000 ? (e / 1000).toFixed(e >= 10000 ? 0 : 1) + " PeV" : (e >= 10 ? e.toFixed(0) : e.toFixed(1)) + " TeV";
  }

  function fmtL(ll) {
    const m = Math.pow(10, ll);
    return m >= 1000 ? (m / 1000).toFixed(m >= 10000 ? 0 : 1) + " km" : (m >= 10 ? m.toFixed(0) : m.toFixed(1)) + " m";
  }

  function waitStr(r) {
    if (r >= 1) return (r >= 10 ? r.toFixed(0) : r.toFixed(1)) + " per year";
    const y = 1 / r;
    if (y < 1) return "one every " + Math.max(1, Math.round(y * 365)) + " days";
    if (y >= 1e6) return "one every " + (y / 1e6).toFixed(1) + " million years";
    if (y >= 1000) return "one every " + Math.round(y).toLocaleString("en-US") + " years";
    return "one every " + y.toFixed(y < 10 ? 1 : 0) + " years";
  }

  function draw4_Scale() {
    if (!g3 || !g3b) return;

    // Ruler canvas
    let g = g3, W = 900, H = 150;
    g.clearRect(0, 0, W, H);
    g.fillStyle = C.surface;
    g.fillRect(0, 0, W, H);

    const x = (v) => 40 + (v / 4.3) * 820;
    const y0 = 88;

    g.strokeStyle = C.ink;
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(x(0), y0);
    g.lineTo(x(4.3), y0);
    g.stroke();

    g.font = "12px " + FB;
    g.fillStyle = C.muted;
    g.textAlign = "center";
    [[0, "1 m"], [1, "10 m"], [2, "100 m"], [3, "1 km"], [4, "10 km"]].forEach((a) => {
      g.strokeStyle = C.ink;
      g.beginPath();
      g.moveTo(x(a[0]), y0 - 6);
      g.lineTo(x(a[0]), y0 + 6);
      g.stroke();
      g.fillText(a[1], x(a[0]), y0 + 22);
    });

    [[3, "IceCube (1 km³)", C.teal], [Math.log10(2000), "Gen2 (~8 km³)", C.amber]].forEach((a) => {
      g.fillStyle = a[2];
      g.beginPath();
      g.arc(x(a[0]), y0, 6, 0, Math.PI * 2);
      g.fill();
      g.font = "700 12px " + FD;
      g.textAlign = a[0] > 3.1 ? "left" : "right";
      g.fillText(a[1], x(a[0]) + (a[0] > 3.1 ? 10 : -10), y0 - 14);
    });

    g.font = "600 12px " + FB;
    g.fillStyle = C.muted;
    g.textAlign = "left";
    g.fillText("Benchtop detector", x(0) - 4, y0 - 14);

    const xm = x(S4_Scale.ll);
    g.fillStyle = C.amber;
    g.beginPath();
    g.moveTo(xm, y0 - 8);
    g.lineTo(xm - 9, y0 - 30);
    g.lineTo(xm + 9, y0 - 30);
    g.closePath();
    g.fill();

    g.font = "700 15px " + FD;
    g.textAlign = "center";
    g.fillText(fmtL(S4_Scale.ll), Math.max(40, Math.min(860, xm)), y0 - 38);

    g.fillStyle = C.muted;
    g.font = "12px " + FB;
    g.textAlign = "left";
    g.fillText("Detector side length (logarithmic scale)", 40, H - 8);

    // Earth transmission plot
    g = g3b; W = 900; H = 300;
    g.clearRect(0, 0, W, H);
    g.fillStyle = C.surface;
    g.fillRect(0, 0, W, H);

    const px0 = 70, px1 = 860, py0 = 24, py1 = 250;
    const X = (a) => px0 + (a / 90) * (px1 - px0);
    const Y = (v) => py1 - v * (py1 - py0);

    g.strokeStyle = C.line;
    g.lineWidth = 1;
    g.font = "12px " + FB;
    g.fillStyle = C.muted;
    g.textAlign = "right";
    [0, 0.25, 0.5, 0.75, 1].forEach((v) => {
      g.beginPath();
      g.moveTo(px0, Y(v));
      g.lineTo(px1, Y(v));
      g.stroke();
      g.fillText(Math.round(v * 100) + "%", px0 - 8, Y(v) + 4);
    });

    g.textAlign = "center";
    [0, 15, 30, 45, 60, 75, 90].forEach((a) => g.fillText(a + "°", X(a), py1 + 18));
    g.fillText("Arrival direction: 0° is straight up through Earth's core, 90° is horizontal", (px0 + px1) / 2, py1 + 40);

    g.save();
    g.translate(16, (py0 + py1) / 2);
    g.rotate(-Math.PI / 2);
    g.fillText("Neutrinos that survive passing through Earth", 0, 0);
    g.restore();

    const curve = (le, col, lw, al) => {
      g.strokeStyle = col;
      g.lineWidth = lw;
      g.globalAlpha = al;
      g.beginPath();
      for (let a = 0; a <= 90; a += 1) {
        const v = trans(le, (a * Math.PI) / 180);
        if (a) g.lineTo(X(a), Y(v));
        else g.moveTo(X(a), Y(v));
      }
      g.stroke();
      g.globalAlpha = 1;
    };

    [[0, "1 TeV"], [2, "100 TeV"], [4, "10 PeV"]].forEach((a) => {
      curve(a[0], C.muted, 1.5, 0.55);
      g.fillStyle = C.muted;
      g.textAlign = "left";
      g.font = "12px " + FB;
      g.fillText(a[1], X(70) + 4, Y(trans(a[0], (70 * Math.PI) / 180)) - 6);
    });

    curve(S4_Scale.le, C.teal, 3.5, 1);
    g.fillStyle = C.tealDeep;
    g.font = "700 13px " + FD;
    g.textAlign = "left";
    g.fillText("Current Energy: " + fmtE(S4_Scale.le), px0 + 10, py0 + 10);

    // Readouts
    const s = sigma(S4_Scale.le);
    const mfp = 1 / (NUC * s) / 1e5;
    const Lm = Math.pow(10, S4_Scale.ll);
    const P = 1 - Math.exp(-NUC * s * Lm * 100);
    const tr0 = trans(S4_Scale.le, 0);
    const rate = 100 * Math.pow(Lm / 1000, 3);

    row($("#r3"), [
      ["Interaction Cross Section σ", sci(s) + " cm²"],
      ["Mean Free Path in Ice", mfp >= 1e4 ? sci(mfp) + " km" : Math.round(mfp).toLocaleString("en-US") + " km"],
      ["Single Crossing Interaction Chance", sci(P)],
      ["Neutrinos needed per hit", P > 0 ? sci(1 / P) : "n/a"],
      ["Survive straight through Earth", tr0 > 0.9995 ? "about 100%" : tr0 < 1e-4 ? sci(tr0) : (tr0 * 100).toFixed(1) + "%"],
      ["Expected Cosmic Signal", waitStr(rate)]
    ]);
  }

  bindRange("#rE3", "#oE3", fmtE, (v) => { S4_Scale.le = v; draw4_Scale(); });
  bindRange("#rL", "#oL", fmtL, (v) => { S4_Scale.ll = v; draw4_Scale(); });

  const pre3 = $("#pre3");
  if (pre3) {
    pre3.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      const v = +b.dataset.e;
      const rE3 = $("#rE3");
      if (rE3) {
        rE3.value = v;
        rE3.dispatchEvent(new Event("input"));
      }
    });
  }

  // =========================================================================
  // SLIDE 5: SIGNIFICANCE & 5-SIGMA STANDARD
  // =========================================================================
  const S5_Sig = { lb: 3.4, s: 250, f: 0, obs: null };
  const g4 = ctx("#c4", 900, 320);

  function sig5() {
    const b = Math.pow(10, S5_Sig.lb), s = S5_Sig.s, fb = (S5_Sig.f / 100) * b;
    const s0 = Math.sqrt(b + fb * fb), s1 = Math.sqrt(b + s + fb * fb);
    return { b, s, s0, s1 };
  }

  function draw5_Sig() {
    if (!g4) return;
    const g = g4, W = 900, H = 320, m = sig5();
    g.clearRect(0, 0, W, H);
    g.fillStyle = C.surface;
    g.fillRect(0, 0, W, H);

    const lo = m.b - 4 * m.s0;
    const hi = Math.max(m.b + m.s + 4 * m.s1, m.b + 6.5 * m.s0);
    const px0 = 30, px1 = 870, py0 = 34, py1 = 264;
    const X = (v) => px0 + ((v - lo) / (hi - lo)) * (px1 - px0);
    const pdf = (v, mu, sd) => Math.exp(-0.5 * ((v - mu) / sd) ** 2) / sd;
    const peak = Math.max(1 / m.s0, m.s > 0 ? 1 / m.s1 : 0) * 0.4;
    const Y = (p) => py1 - (p / peak) * (py1 - py0) * 0.95;

    const curve = (mu, sd, col, fill) => {
      g.beginPath();
      for (let i = 0; i <= 300; i++) {
        const v = lo + ((hi - lo) * i) / 300;
        const y = Y(pdf(v, mu, sd));
        if (i) g.lineTo(X(v), y);
        else g.moveTo(X(v), y);
      }
      g.lineTo(px1, py1);
      g.lineTo(px0, py1);
      g.closePath();
      g.globalAlpha = fill;
      g.fillStyle = col;
      g.fill();
      g.globalAlpha = 1;

      g.strokeStyle = col;
      g.lineWidth = 2.5;
      g.beginPath();
      for (let i = 0; i <= 300; i++) {
        const v = lo + ((hi - lo) * i) / 300;
        const y = Y(pdf(v, mu, sd));
        if (i) g.lineTo(X(v), y);
        else g.moveTo(X(v), y);
      }
      g.stroke();
    };

    curve(m.b, m.s0, C.teal, 0.16);
    if (m.s > 0) curve(m.b + m.s, m.s1, C.amber, 0.16);

    g.strokeStyle = C.line;
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(px0, py1);
    g.lineTo(px1, py1);
    g.stroke();

    [[3, C.muted], [5, C.ink]].forEach((a) => {
      const v = m.b + a[0] * m.s0;
      if (v <= hi) {
        g.setLineDash([5, 5]);
        g.strokeStyle = a[1];
        g.lineWidth = 1.5;
        g.beginPath();
        g.moveTo(X(v), py0);
        g.lineTo(X(v), py1);
        g.stroke();
        g.setLineDash([]);
        g.fillStyle = a[1];
        g.font = "700 12px " + FD;
        g.textAlign = "center";
        g.fillText(a[0] + "σ Threshold", X(v), py0 - 8);
      }
    });

    g.font = "12px " + FB;
    g.fillStyle = C.muted;
    g.textAlign = "center";
    for (let i = 0; i <= 5; i++) {
      const v = lo + ((hi - lo) * i) / 5;
      g.fillText(Math.round(v).toLocaleString("en-US"), X(v), py1 + 16);
    }
    g.fillText("Events Counted", (px0 + px1) / 2, py1 + 36);

    g.font = "700 13px " + FD;
    g.fillStyle = C.tealDeep;
    g.textAlign = "left";
    g.fillText("● Background Only", px0 + 4, py0 + 12);
    g.fillStyle = C.amber;
    g.fillText("● Background + True Signal", px0 + 4, py0 + 30);

    if (S5_Sig.obs !== null) {
      const xo = X(S5_Sig.obs);
      g.fillStyle = C.ink;
      g.beginPath();
      g.moveTo(xo, py1);
      g.lineTo(xo - 7, py1 + 14);
      g.lineTo(xo + 7, py1 + 14);
      g.closePath();
      g.fill();

      g.strokeStyle = C.ink;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(xo, py1);
      g.lineTo(xo, py0 + 40);
      g.stroke();

      g.font = "700 13px " + FD;
      g.textAlign = "center";
      g.fillText("This Run: " + Math.round(S5_Sig.obs).toLocaleString("en-US"), Math.min(px1 - 60, Math.max(px0 + 60, xo)), py0 + 34);
    }
  }

  function verdict(z) {
    return z >= 5 ? "Discovery (5σ Gold Standard)" : z >= 3 ? "Evidence (3σ Standard)" : "Fluctuation / Insufficient";
  }

  function update5(extra) {
    const m = sig5();
    const z = m.s / m.s0;
    const pw = 0.5 * erfc(((m.b + 5 * m.s0) - (m.b + m.s)) / (m.s1 * Math.SQRT2));
    let html =
      '<div><span class="chip">Expected Significance</span></div><div class="big">' +
      z.toFixed(1) +
      ' σ</div><div class="note">Statistics alone would yield ' +
      (m.s / Math.sqrt(m.b)).toFixed(1) +
      " σ. Probability of reaching formal 5σ discovery: " +
      (pw >= 0.995 ? "over 99" : pw < 0.001 ? "under 0.1" : (pw * 100).toFixed(pw < 0.1 ? 1 : 0)) +
      "%.</div>";
    if (extra) html += extra;
    const r4 = $("#r4");
    if (r4) r4.innerHTML = html;
  }

  function runOne() {
    const m = sig5();
    const n = m.b + m.s + m.s1 * gauss();
    S5_Sig.obs = n;
    const z = (n - m.b) / m.s0;
    const p = 0.5 * erfc(z / Math.SQRT2);
    update5(
      '<div><span class="chip">This Run</span></div><div class="big">' +
      z.toFixed(1) +
      ' σ</div><div class="note"><strong>' +
      verdict(z) +
      "</strong>. One-sided p-value = " +
      (p >= 1e-3 ? p.toFixed(3) : sci(p)) +
      (p > 0 && p < 0.5 ? ", odds of fluke: 1 in " + (1 / p >= 1e6 ? (1 / p / 1e6).toFixed(1) + " million" : Math.round(1 / p).toLocaleString("en-US")) : "") +
      ".</div>"
    );
    draw5_Sig();
  }

  function run200() {
    const m = sig5();
    let a = 0, b3 = 0;
    for (let i = 0; i < 200; i++) {
      const z = (m.b + m.s + m.s1 * gauss() - m.b) / m.s0;
      if (z >= 5) a++;
      if (z >= 3) b3++;
    }
    S5_Sig.obs = null;
    update5(
      '<div><span class="chip">200 Simulation Repeats</span></div><div class="note">' +
      b3 + " runs reached 3σ evidence.<br>" +
      "<strong>" + a + " runs reached 5σ discovery.</strong></div>"
    );
  }

  bindRange("#rb", "#ob", (v) => Math.round(Math.pow(10, v)).toLocaleString("en-US"), (v) => {
    S5_Sig.lb = v;
    S5_Sig.obs = null;
    update5();
  });

  bindRange("#rs", "#os", (v) => v.toLocaleString("en-US"), (v) => {
    S5_Sig.s = v;
    S5_Sig.obs = null;
    update5();
  });

  bindRange("#rf", "#of", (v) => v.toFixed(1) + "%", (v) => {
    S5_Sig.f = v;
    S5_Sig.obs = null;
    update5();
  });

  const bRun = $("#bRun"), bRun200 = $("#bRun200");
  if (bRun) bRun.addEventListener("click", runOne);
  if (bRun200) bRun200.addEventListener("click", run200);

  const tSigBody = $("#tSig tbody");
  if (tSigBody) {
    tSigBody.innerHTML = [
      ["2014 Discovery, First Astrophysical Flux", 5.7],
      ["2022 Discovery, Active Galaxy NGC 1068", 4.2],
      ["2023 Evidence, Milky Way Galactic Plane", 4.5],
      ["2026 Discovery, Milky Way Galactic Plane", 5.7]
    ].map((r) => {
      const p = 0.5 * erfc(r[1] / Math.SQRT2);
      const o = 1 / p;
      return (
        "<tr><td>" + r[0] + "</td><td><strong>" + r[1].toFixed(1) + "σ</strong></td><td>" +
        sci(p) + "</td><td>1 in " + (o >= 1e6 ? (o / 1e6).toFixed(o >= 1e8 ? 0 : 1) + " million" : Math.round(o).toLocaleString("en-US")) + "</td></tr>"
      );
    }).join("");
  }
  update5();

  // =========================================================================
  // SLIDE TAB NAVIGATION & MAIN LOOP
  // =========================================================================
  let activeSlide = 0;

  function showSlide(idx) {
    activeSlide = idx;
    for (let k = 0; k < 6; k++) {
      const tab = $("#t" + k);
      const panel = $("#p" + k);
      if (tab) tab.setAttribute("aria-selected", k === idx ? "true" : "false");
      if (panel) panel.hidden = k !== idx;
    }
    if (idx === 1) {
      drawDIS();
      readDIS();
      updateInelasticityHUD();
    } else if (idx === 3) {
      build2();
    } else if (idx === 4) {
      draw4_Scale();
    } else if (idx === 5) {
      draw5_Sig();
      update5();
    }
  }

  for (let k = 0; k < 6; k++) {
    const tab = $("#t" + k);
    if (tab) tab.addEventListener("click", () => showSlide(k));
  }

  const tabsNav = $(".tabs");
  if (tabsNav) {
    tabsNav.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const next = (activeSlide + (e.key === "ArrowRight" ? 1 : 5)) % 6;
        showSlide(next);
        const nextTab = $("#t" + next);
        if (nextTab) nextTab.focus();
      }
    });
  }

  // Fullscreen button
  const btnFs = $("#btn-fullscreen");
  if (btnFs) {
    btnFs.addEventListener("click", () => {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
      else document.exitFullscreen().catch(() => {});
    });
  }

  let lastTs = performance.now(), accTimer = 0;
  function animLoop(ts) {
    const dt = Math.min(0.05, (ts - lastTs) / 1000 || 0);
    lastTs = ts;

    if (activeSlide === 0) {
      upd1(dt);
      draw1();
      accTimer += dt;
      if (accTimer > 0.25) {
        accTimer = 0;
        read1();
      }
    } else if (activeSlide === 1) {
      // Feynman canvas is static/interactive
    } else if (activeSlide === 2) {
      // Observatory Architecture (schematic image & specs)
    } else if (activeSlide === 3) {
      upd2(dt);
      draw2();
    } else if (activeSlide === 4) {
      // Scale canvas
    } else if (activeSlide === 5) {
      // Significance canvas
    }

    requestAnimationFrame(animLoop);
  }

  read1();
  requestAnimationFrame(animLoop);

})();
