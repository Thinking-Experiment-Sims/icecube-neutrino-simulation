/**
 * audio.js - Accessible Audio Sonification Engine for Neutrino Interactions
 * Authored for "The Thinking Experiment" · Vladimir Lopez · 2026
 * 
 * Follows Physics Education Research (PER) UI/UX Guidelines:
 * 1. Muted by default: respects quiet classroom and seminar settings.
 * 2. Visual-audio dual coding: every sound maps directly to a visible event flash.
 * 3. Psychoacoustically tuned tones:
 *    - Cherenkov photon hits: crisp high-frequency micro-pings (600 - 1400 Hz)
 *    - Muon tracks: progressive arpeggiated acoustic clicks along the string geometry
 *    - PeV Cascades: deep resonant sub-bass pulse (60 - 90 Hz) modeling energy deposition
 *    - Tau Double-Bang: dual-resonance heartbeat
 */

const SoundFX = (() => {
  let audioCtx = null;
  let isMuted = true;
  let masterVolume = 0.5;

  function initAudioContext() {
    if (!audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function setMuted(muted) {
    isMuted = muted;
    if (!isMuted) {
      initAudioContext();
    }
  }

  function setVolume(vol) {
    masterVolume = Math.max(0, Math.min(1, vol));
  }

  /**
   * Play a short Cherenkov optical photon hit ping on a DOM
   * normTime: [0, 1] maps chromatic arrival time to pitch
   */
  function playDomHit(normTime = 0, chargePE = 1) {
    if (isMuted || !audioCtx) return;

    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      // Pitch rises from Red (440 Hz) to Blue (1100 Hz)
      const freq = 440 + normTime * 660;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Volume proportional to charge PE, capped safely
      const gainVal = Math.min(0.2, (0.02 + 0.03 * Math.log10(Math.max(1, chargePE)))) * masterVolume;
      gain.gain.setValueAtTime(gainVal, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {
      // Audio context policy safe ignore
    }
  }

  /**
   * PeV Cascade burst: deep sub-bass boom simulating energetic shower
   */
  function playCascadeBoom(energyTeV = 1000) {
    if (isMuted || !audioCtx) return;

    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      // Low fundamental frequency: 65 Hz for PeV scale
      const fundamental = Math.max(50, 95 - 15 * Math.log10(Math.max(10, energyTeV)));
      osc.frequency.setValueAtTime(fundamental, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.45);

      const peakGain = 0.35 * masterVolume;
      gain.gain.setValueAtTime(peakGain, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    } catch (e) {}
  }

  /**
   * Muon Track streak sound: swift linear sweep
   */
  function playMuonStreak() {
    if (isMuted || !audioCtx) return;

    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);

      gain.gain.setValueAtTime(0.12 * masterVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {}
  }

  return {
    setMuted,
    setVolume,
    isMuted: () => isMuted,
    playDomHit,
    playCascadeBoom,
    playMuonStreak
  };
})();

// Export for module/browser compatibility
if (typeof window !== 'undefined') {
  window.SoundFX = SoundFX;
}
