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
    this.bgmPlaying = false;
    this.bgmTimer = null;
    this.bgmStep = 0;
    this.isModalActive = false;
    this.isTabHidden = false;
    this.brushBuffer = null;
    this.gameState = null;

    this.initTabVisibilityListeners();
  }

  initTabVisibilityListeners() {
    if (typeof document === 'undefined') return;

    const handleHide = () => {
      this.isTabHidden = true;
      this.pauseBGM();
      if (this.ctx && this.ctx.state === 'running') {
        this.ctx.suspend();
      }
    };

    const handleShow = () => {
      this.isTabHidden = false;
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      if (!this.isMuted && !this.isModalActive) {
        if (this.isWelcomeActive() || (this.gameState && this.gameState.gameSpeed > 0)) {
          this.startBGM();
        }
      }
    };

    document.addEventListener('visibilitychange', () => {
      if (document.hidden || document.visibilityState === 'hidden') {
        handleHide();
      } else {
        handleShow();
      }
    });

    window.addEventListener('blur', () => handleHide());
    window.addEventListener('focus', () => handleShow());
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
      return this.ctx.resume().then(() => {
        this.updateAudioBadge();
      }).catch(() => {});
    } else {
      this.updateAudioBadge();
    }
    return Promise.resolve();
  }

  updateAudioBadge() {
    if (typeof document === 'undefined') return;
    const badge = document.querySelector('.welcome-ver-badge');
    if (!badge) return;

    if (this.isMuted) {
      badge.innerText = '🔇 Müzik Kapalı • v1.5';
    } else if (this.ctx && this.ctx.state === 'running' && this.bgmPlaying) {
      badge.innerText = '🔊 Lo-Fi Cafe Jazz Çalıyor • v1.5';
    } else if (this.ctx && this.ctx.state === 'suspended') {
      badge.innerText = '🎵 Müziği Başlatmak İçin Ekrana Tıklayın • v1.5';
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

  isWelcomeActive() {
    if (typeof document === 'undefined') return false;
    const ws = document.getElementById('welcome-screen');
    return !!(ws && ws.style.display !== 'none' && !ws.classList.contains('welcome-fade-out'));
  }

  setModalActive(active) {
    this.isModalActive = active;
    if (active) {
      this.pauseBGM();
    } else {
      if (!this.isMuted && !this.isTabHidden) {
        if (this.isWelcomeActive() || (this.gameState && this.gameState.gameSpeed > 0)) {
          this.startBGM();
        }
      }
    }
  }

  startBGM() {
    if (this.isMuted || this.bgmPlaying || this.isModalActive || this.isTabHidden) return;
    this.ensureContext();
    if (!this.ctx) return;

    this.bgmPlaying = true;
    this.scheduleBGMStep();
  }

  pauseBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  stopBGM() {
    this.pauseBGM();
    this.bgmStep = 0;
  }

  scheduleBGMStep() {
    if (!this.bgmPlaying || this.isMuted || this.isModalActive || this.isTabHidden) {
      this.bgmPlaying = false;
      return;
    }

    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Scale tempo dynamically with gameState.gameSpeed
    // 1x speed => multiplier 1.0 (0.42s per beat)
    // 2x speed => multiplier 1.5 (0.28s per beat)
    // 3x speed => multiplier 2.0 (0.21s per beat)
    const speed = (this.gameState && this.gameState.gameSpeed) ? Math.max(1, this.gameState.gameSpeed) : 1;
    const speedMultiplier = 1 + (speed - 1) * 0.5;
    const stepDuration = 0.42 / speedMultiplier;

    // Relaxing 4-Bar Lo-Fi Jazz Chord Progression (Cmaj7 -> Am7 -> Dm7 -> G7)
    const chords = [
      { name: 'Cmaj7', bass: 130.81, notes: [261.63, 329.63, 392.00, 493.88] }, // C3 bass, C4, E4, G4, B4
      { name: 'Am7',   bass: 110.00, notes: [220.00, 261.63, 329.63, 392.00] }, // A2 bass, A3, C4, E4, G4
      { name: 'Dm7',   bass: 146.83, notes: [293.66, 349.23, 440.00, 523.25] }, // D3 bass, D4, F4, A4, C5
      { name: 'G7',    bass: 98.00,  notes: [196.00, 246.94, 293.66, 349.23] }  // G2 bass, G3, B3, D4, F4
    ];

    const currentMeasure = Math.floor(this.bgmStep / 4) % chords.length;
    const beatInMeasure = this.bgmStep % 4; // 0, 1, 2, 3
    const chord = chords[currentMeasure];

    // 1. Warm Soft Fender Rhodes Chord Strum (Beat 0 and Beat 2)
    if (beatInMeasure === 0 || beatInMeasure === 2) {
      chord.notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        const strumTime = now + (idx * 0.03) / speedMultiplier;
        const noteDuration = 1.2 / speedMultiplier;

        osc.type = 'triangle'; // Smooth Fender Rhodes tone
        osc.frequency.setValueAtTime(freq, strumTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1050, now);

        gain.gain.setValueAtTime(0.012, strumTime);
        gain.gain.linearRampToValueAtTime(0.022, strumTime + 0.08 / speedMultiplier);
        gain.gain.exponentialRampToValueAtTime(0.0005, strumTime + noteDuration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(strumTime);
        osc.stop(strumTime + noteDuration + 0.05);
      });
    }

    // 2. Soft Warm Walking Bassline (Beat 0 and Beat 2)
    if (beatInMeasure === 0 || beatInMeasure === 2) {
      const bassOsc = this.ctx.createOscillator();
      const bassFilter = this.ctx.createBiquadFilter();
      const bassGain = this.ctx.createGain();

      const bassFreq = beatInMeasure === 0 ? chord.bass : chord.bass * 1.5; // Root & Fifth
      const bassDuration = 0.7 / speedMultiplier;

      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(bassFreq, now);

      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(280, now); // Deep low bass warmth

      bassGain.gain.setValueAtTime(0.035, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + bassDuration);

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(this.ctx.destination);

      bassOsc.start(now);
      bassOsc.stop(now + bassDuration + 0.05);
    }

    // 3. Ultra-Soft Brush Ride Percussion Tap (Every Beat)
    const noiseBuffer = this.createBrushNoiseBuffer();
    if (noiseBuffer) {
      const noise = this.ctx.createBufferSource();
      const noiseFilter = this.ctx.createBiquadFilter();
      const noiseGain = this.ctx.createGain();

      const noiseDuration = 0.07 / speedMultiplier;

      noise.buffer = noiseBuffer;
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(7000, now);

      const tapGain = beatInMeasure === 2 ? 0.005 : 0.0025; // Soft backbeat
      noiseGain.gain.setValueAtTime(tapGain, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + noiseDuration);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + noiseDuration + 0.01);
    }

    this.bgmStep++;

    // Schedule next beat
    this.bgmTimer = setTimeout(() => {
      this.scheduleBGMStep();
    }, stepDuration * 1000);
  }

  createBrushNoiseBuffer() {
    if (this.brushBuffer) return this.brushBuffer;
    if (!this.ctx) return null;

    const size = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.brushBuffer = buffer;
    return buffer;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.pauseBGM();
    } else if (!this.isModalActive && !this.isTabHidden) {
      if (this.isWelcomeActive() || (this.gameState && this.gameState.gameSpeed > 0)) {
        this.startBGM();
      }
    }
    return this.isMuted;
  }
}

export const audioEngine = new AudioEngine();
