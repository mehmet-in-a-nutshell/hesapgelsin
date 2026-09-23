/**
 * AudioEngine.js
 * Procedural Audio Synthesizer built with Web Audio API.
 * Provides sound effects for cash register chimes, coffee brewing steam,
 * UI clicks, level up fanfares, and relaxing ambient cafe music.
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.ambientLooping = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  ensureContext() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Delicate Cafe Door Bell Chime Sound
   * Throttled to play at most once every 2.5 seconds to avoid sound clutter.
   */
  playDoorChime() {
    if (this.isMuted) return;
    const nowMs = Date.now();
    if (this.lastChimeTime && nowMs - this.lastChimeTime < 2500) {
      return;
    }
    this.lastChimeTime = nowMs;

    this.ensureContext();
    const now = this.ctx.currentTime;

    // Gentle brass bell notes: E6 (1318.51 Hz) -> B6 (1975.53 Hz)
    const notes = [1318.51, 1975.53];

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      // Very soft gain (0.04 max) for gentle, non-intrusive bell chime
      gain.gain.setValueAtTime(0.04, now + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + idx * 0.12 + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.6);
    });
  }

  /**
   * Cash Register Cha-Ching Coin Sound
   */
  playChaChing() {
    if (this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(987.77, now); // B5
    osc1.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    osc2.frequency.setValueAtTime(1567.98, now + 0.08); // G6

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.08);
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.4);
  }

  /**
   * Espresso Machine Steam Brewing Hiss Sound
   */
  playSteamBrew() {
    if (this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    // White noise generator
    const bufferSize = this.ctx.sampleRate * 0.6;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.Q.setValueAtTime(3.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.6);
  }

  /**
   * UI Click Sound
   */
  playClick() {
    if (this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.05);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Level Up Fanfare Chord
   */
  playLevelUp() {
    if (this.isMuted) return;
    this.ensureContext();
    const now = this.ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.12, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.5);
    });
  }

  /**
   * Delicate & Cute Order Served Sound Effect (Sipariş Teslimat Sesi)
   */
  playOrderServed() {
    if (this.isMuted) return;
    const nowMs = Date.now();
    if (this.lastOrderServedTime && nowMs - this.lastOrderServedTime < 300) {
      return;
    }
    this.lastOrderServedTime = nowMs;

    this.ensureContext();
    const now = this.ctx.currentTime;

    // Sweet two-note soft chime (F6 1396.91 Hz -> A6 1760.00 Hz)
    const notes = [1396.91, 1760.00];

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      // Very subtle, warm, non-intrusive volume gain (0.04 max)
      gain.gain.setValueAtTime(0.04, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + idx * 0.07 + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.22);
    });
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
}

export const audioEngine = new AudioEngine();
