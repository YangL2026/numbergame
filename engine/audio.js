// Sounds are generated in the browser, so there are no audio files.
export class Sound {
  constructor(on = true) {
    this.on = on;
    this.ctx = null;
  }

  // Browsers only allow sound after a tap or key press, so call this from one.
  unlock() {
    if (!this.on) return;
    try {
      if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch (e) { this.ctx = null; }
  }

  tone(f0, f1, dur, { type = 'sine', gain = 0.16, delay = 0 } = {}) {
    if (!this.on || !this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f0, t);
    osc.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  boing() { this.tone(240, 560, 0.17, { type: 'triangle' }); }
  bigJump() { this.tone(180, 720, 0.45, { type: 'triangle', gain: 0.2 }); }
  land() {
    this.tone(523, 523, 0.14);
    this.tone(784, 784, 0.26, { delay: 0.13 });
  }
  soft() { this.tone(440, 392, 0.2, { gain: 0.1 }); }
}

export function speak(text) {
  try {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  } catch (e) { /* no speech on this device */ }
}
