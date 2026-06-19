/**
 * Generate the Learn game's UI feedback sounds (NOT liturgical content — generic
 * synthesized tones). correct.wav = a bright rising bell ding; wrong.wav = a low
 * dull descending buzz. 16-bit PCM mono WAV @ 44.1kHz. Run: node scripts/gen-sfx.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const SR = 44100;
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'audio', 'ui');

function wav(samples) {
  const n = samples.length;
  const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buf.writeInt16LE((s * 32767) | 0, 44 + i * 2);
  }
  return buf;
}
function tone(freq, dur, { decay = 8, gain = 0.6, type = 'sine', attack = 0.006 } = {}) {
  const n = Math.floor(SR * dur); const out = new Float32Array(n);
  const aN = Math.max(1, Math.floor(SR * attack));
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    // soft attack ramp (kills the onset click) then a smooth exponential decay
    let env = Math.exp(-decay * t);
    if (i < aN) env *= i / aN;
    const ph = freq * t;
    const v = type === 'saw' ? 2 * (ph - Math.floor(0.5 + ph)) : Math.sin(2 * Math.PI * ph);
    out[i] = v * env * gain;
  }
  return out;
}
function mix(a, b) { const n = Math.max(a.length, b.length); const o = new Float32Array(n); for (let i = 0; i < n; i++) o[i] = (a[i] || 0) + (b[i] || 0); return o; }
function concat(...as) { const n = as.reduce((s, a) => s + a.length, 0); const o = new Float32Array(n); let k = 0; for (const a of as) { o.set(a, k); k += a.length; } return o; }
/** Lay notes onto one timeline at given start offsets (seconds) so they ring together. */
function placed(totalSec, notes) {
  const out = new Float32Array(Math.floor(SR * totalSec));
  for (const { buf, at } of notes) {
    const off = Math.floor(at * SR);
    for (let i = 0; i < buf.length && off + i < out.length; i++) out[off + i] += buf[i];
  }
  return out;
}

// correct — a small sacred bell / cymbal "ting", on-brand with the metal
// percussion (the naqūs hand-cymbals & triangle) that keep time in Coptic
// hymns. Additive synthesis with INHARMONIC bell partials, each ringing and
// decaying at its own rate (what makes metal sound alive, not robotic), a faint
// detuned second strike for paired-cymbal shimmer, and a long warm tail.
//
// Classic bell partials relative to the strike note (hum, prime, minor third,
// fifth, octave/nominal, then metallic upper partials), gently detuned so they
// beat against each other organically.
const BELL = [
  { ratio: 0.5, gain: 0.20, decay: 2.4 }, // hum — warm body
  { ratio: 1.0, gain: 0.50, decay: 2.8 }, // prime — the note
  { ratio: 1.183, gain: 0.18, decay: 4.5, detune: 0.0012 }, // minor third (inharmonic)
  { ratio: 1.506, gain: 0.16, decay: 4.0, detune: -0.0009 }, // fifth
  { ratio: 2.0, gain: 0.14, decay: 5.5, detune: 0.0016 }, // octave / nominal
  { ratio: 2.66, gain: 0.08, decay: 7.5 }, // metallic
  { ratio: 3.61, gain: 0.05, decay: 10, detune: 0.002 }, // shimmer
  { ratio: 5.13, gain: 0.035, decay: 13 }, // top "ting"
];
// A darker, muted bell (more hum, little metallic shimmer) for the error cue —
// somber but still a bell, not a buzz.
const MUTED = [
  { ratio: 0.5, gain: 0.24, decay: 3.4 },
  { ratio: 1.0, gain: 0.5, decay: 3.0 },
  { ratio: 1.5, gain: 0.12, decay: 3.4, detune: -0.001 },
  { ratio: 2.0, gain: 0.07, decay: 4.0 },
  { ratio: 2.66, gain: 0.025, decay: 5.0 },
];
function bellStrike(f0, dur, gain, partials = BELL) {
  const out = new Float32Array(Math.floor(SR * dur));
  for (const p of partials) {
    const f = f0 * p.ratio * (1 + (p.detune || 0));
    const buf = tone(f, dur, { decay: p.decay, gain: gain * p.gain, attack: 0.012 });
    for (let i = 0; i < buf.length; i++) out[i] += buf[i];
  }
  return out;
}

// correct — three bell strikes RISING through an open root–fifth–octave
// (E5 → B5 → E6). The upward lift is the reward; open intervals (no thirds) keep
// it chant-like and peaceful; the octave rings out and resolves.
const correct = placed(1.5, [
  { buf: bellStrike(659.25, 0.5, 0.2), at: 0 }, // E5
  { buf: bellStrike(987.77, 0.6, 0.24), at: 0.12 }, // B5 (a fifth up)
  { buf: bellStrike(1318.51, 1.3, 0.3), at: 0.26 }, // E6 (the octave) — rings + resolves
]);
writeFileSync_(join(OUT, 'correct.wav'), wav(correct));

// wrong — two muted bells FALLING a gentle minor third (A4 → F#4). Soft and low,
// a quiet "not quite" — clearly downward, never harsh.
const wrong = placed(0.95, [
  { buf: bellStrike(440, 0.42, 0.3, MUTED), at: 0 }, // A4
  { buf: bellStrike(369.99, 0.78, 0.3, MUTED), at: 0.14 }, // F#4 (down a minor third)
]);
writeFileSync_(join(OUT, 'wrong.wav'), wav(wrong));

// levelComplete — a warm "you finished" cadence: a high strike that SETTLES down
// onto a full, sustained tonic octave (A4·A5·A6). The downward resolution + the
// octave body read as conclusive, distinct from the per-answer rising ding.
const levelComplete = placed(1.85, [
  { buf: bellStrike(1318.51, 0.5, 0.2), at: 0 }, // E6 — opens up high
  { buf: bellStrike(880, 1.55, 0.26), at: 0.17 }, // A5 — lands on the tonic, rings
  { buf: bellStrike(440, 1.55, 0.15), at: 0.17 }, // A4 — low warmth/body
  { buf: bellStrike(1760, 1.3, 0.12), at: 0.2 }, // A6 — soft octave halo on the landing
]);
writeFileSync_(join(OUT, 'levelComplete.wav'), wav(levelComplete));

// crown — the grand one (100%): a low drone under a rising open run A5 → E6 → A6
// that peaks and rings out long, with a fifth-above shimmer + a detuned twin for
// a glorious sacred-bell halo. The longest ring.
const crown = placed(2.7, [
  { buf: bellStrike(440, 2.3, 0.14), at: 0 }, // A4 drone — grandeur underneath
  { buf: bellStrike(880, 0.55, 0.18), at: 0.0 }, // A5
  { buf: bellStrike(1318.51, 0.55, 0.2), at: 0.15 }, // E6 (fifth)
  { buf: bellStrike(1760, 2.1, 0.24), at: 0.32 }, // A6 (octave) — the peak, rings long
  { buf: bellStrike(2637.02, 1.7, 0.1), at: 0.36 }, // E7 — shimmer a fifth above the peak
  { buf: bellStrike(1760 * 1.006, 1.9, 0.1), at: 0.42 }, // faint detuned twin (cymbal halo)
]);
writeFileSync_(join(OUT, 'crown.wav'), wav(crown));

function writeFileSync_(p, b) { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, b); console.log(`wrote ${p} (${b.length} bytes)`); }
