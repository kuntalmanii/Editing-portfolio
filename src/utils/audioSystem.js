// ─────────────────────────────────────────────────────────────────────────────
// audioSystem.js
// High-end tactile UI audio feedback using Web Audio API synthesis.
// Zero external audio files — 100% self-contained and instant.
// ─────────────────────────────────────────────────────────────────────────────

let audioCtx = null;
let isMuted = true; // Safe default (muted) to respect browser autoplay

// Initialize state from localStorage if available
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('framerate_audio_muted');
    if (saved !== null) {
      isMuted = saved === 'true';
    }
  } catch (e) {
    // ignore localStorage errors in private mode
  }
}

function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isAudioEnabled() {
  return !isMuted;
}

export function setAudioEnabled(enabled) {
  isMuted = !enabled;
  try {
    localStorage.setItem('framerate_audio_muted', String(isMuted));
  } catch (e) {}

  if (enabled) {
    getAudioContext();
    // Play a confirmation blip
    playClickSound(800, 0.04);
  }

  // Notify listeners (e.g. Masthead or controls)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('framerate-audio-changed', { detail: { enabled } }));
  }
}

export function toggleAudio() {
  setAudioEnabled(isMuted);
  return !isMuted;
}

/**
 * Play a high-end console click sound
 * @param {number} freq - starting frequency in Hz
 * @param {number} vol - gain volume (0.01 - 0.2)
 */
export function playClickSound(freq = 1400, vol = 0.04) {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.018);

    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.018);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.02);
  } catch (e) {}
}

/**
 * Play a folder or tab switch pip
 */
export function playSwitchSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.setValueAtTime(1300, now + 0.015);

    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.035);
  } catch (e) {}
}

/**
 * Ultra-short timeline scrub tick (like an analog jog wheel)
 */
export function playScrubTick() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.006);

    gain.gain.setValueAtTime(0.02, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.006);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.008);
  } catch (e) {}
}

/**
 * Ascending chime on form dispatch or copy
 */
export function playSuccessSound() {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    [587.33, 880, 1174.66].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + i * 0.04;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(0.03, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.13);
    });
  } catch (e) {}
}
