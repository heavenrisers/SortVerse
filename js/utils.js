/**
 * =============================================================
 * UTILS & AUDIO SYNTH ENGINE
 * Handles dataset generation, volume, and visual helper colors.
 * =============================================================
 */

// Helper to generate a random number in a range
function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Dataset Generators
const ArrayGenerators = {
  random: function (size) {
    const arr = [];
    for (let i = 0; i < size; i++) {
      // Scale from 5 to 100 representing percentage height
      arr.push(randomRange(5, 100));
    }
    return arr;
  },

  reversed: function (size) {
    const arr = [];
    for (let i = 0; i < size; i++) {
      arr.push(Math.round(5 + ((size - i) / size) * 95));
    }
    return arr;
  },

  "nearly-sorted": function (size) {
    const arr = [];
    for (let i = 0; i < size; i++) {
      arr.push(Math.round(5 + (i / size) * 95));
    }
    // Perform a few random adjacent swaps to disrupt order slightly
    const swapCount = Math.max(3, Math.floor(size * 0.08));
    for (let s = 0; s < swapCount; s++) {
      const idx = randomRange(0, size - 2);
      let temp = arr[idx];
      arr[idx] = arr[idx + 1];
      arr[idx + 1] = temp;
    }
    return arr;
  },

  "few-unique": function (size) {
    const arr = [];
    const uniqueValues = [];
    const uniqueCount = 4; // 4 discrete values
    for (let i = 0; i < uniqueCount; i++) {
      uniqueValues.push(Math.round(15 + (i / (uniqueCount - 1)) * 80));
    }
    for (let i = 0; i < size; i++) {
      const val = uniqueValues[randomRange(0, uniqueCount - 1)];
      arr.push(val);
    }
    return arr;
  }
};

// Web Audio API Synthesizer Class
class SoundSynth {
  constructor() {
    this.audioCtx = null;
    this.enabled = true;
    this.volume = 0.3; // Default volume (0.0 to 1.0)
  }

  initContext() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playTone(value, duration = 0.05) {
    if (!this.enabled || this.volume === 0) return;
    
    try {
      this.initContext();
      
      // Map percentage value (5-100) to frequency range (180Hz - 1000Hz)
      const freq = 180 + (value / 100) * 820;
      
      const osc = this.audioCtx.createOscillator();
      const gainNode = this.audioCtx.createGain();
      
      osc.type = 'triangle'; // triangle sounds cleaner than sine/saw
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      
      // Avoid pop sounds using audio ramp envelopes
      gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.15, this.audioCtx.currentTime + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(this.audioCtx.destination);
      
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Audio context not allowed or failed to initialize", e);
    }
  }
}

// Global synthesizer instance
const synth = new SoundSynth();
