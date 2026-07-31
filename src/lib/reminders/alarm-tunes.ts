'use client';

/**
 * Four distinct, pleasant alarm tunes, synthesized with the Web Audio API
 * (no mp3 files to load/host). Preference is saved per-device in
 * localStorage since it's a personal playback preference, not app data.
 */

export type TuneId = 'chime' | 'bell' | 'marimba' | 'pulse';

export const TUNES: { id: TuneId; label: string }[] = [
  { id: 'chime', label: 'Chime' },
  { id: 'bell', label: 'Soft Bell' },
  { id: 'marimba', label: 'Marimba' },
  { id: 'pulse', label: 'Gentle Pulse' },
];

const PREF_KEY = 'ss_alarm_tune';

export function getSavedTune(): TuneId {
  if (typeof window === 'undefined') return 'chime';
  const v = localStorage.getItem(PREF_KEY);
  return (TUNES.some((t) => t.id === v) ? (v as TuneId) : 'chime');
}

export function saveTune(id: TuneId) {
  try {
    localStorage.setItem(PREF_KEY, id);
  } catch {
    /* ignore */
  }
}

// Shared, lazily-unlocked AudioContext — browsers block sound that isn't
// triggered by a user gesture, so we create/resume this on the user's very
// first tap anywhere in the app (see unlockAudio), then reuse it later when
// an alarm fires on its own from a background timer with no tap involved.
let sharedCtx: AudioContext | null = null;

function getAudioCtxCtor(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null;
  return window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext || null;
}

export function unlockAudio() {
  const Ctor = getAudioCtxCtor();
  if (!Ctor) return;
  if (!sharedCtx) sharedCtx = new Ctor();
  if (sharedCtx.state === 'suspended') sharedCtx.resume().catch(() => {});
}

function ctx(): AudioContext | null {
  const Ctor = getAudioCtxCtor();
  if (!Ctor) return null;
  if (!sharedCtx) sharedCtx = new Ctor();
  if (sharedCtx.state === 'suspended') sharedCtx.resume().catch(() => {});
  return sharedCtx;
}

function tone(c: AudioContext, start: number, freq: number, dur: number, type: OscillatorType, peak: number) {
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(peak, start + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
  osc.connect(gain).connect(c.destination);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

function playChime(c: AudioContext) {
  const notes = [880, 988, 1046.5, 1318.5]; // A5, B5, C6, E6
  let t = c.currentTime;
  for (let round = 0; round < 2; round++) {
    for (const freq of notes) { tone(c, t, freq, 0.35, 'sine', 0.28); t += 0.22; }
    t += 0.15;
  }
}

function playBell(c: AudioContext) {
  let t = c.currentTime;
  const notes = [1318.5, 1046.5, 1318.5]; // E6, C6, E6 — soft two-tone bell
  for (const freq of notes) {
    tone(c, t, freq, 0.9, 'sine', 0.22);
    tone(c, t, freq * 2, 0.5, 'sine', 0.06); // gentle overtone for a "bell" timbre
    t += 0.55;
  }
}

function playMarimba(c: AudioContext) {
  const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25]; // C5 E5 G5 C6 G5 E5 — bright run
  let t = c.currentTime;
  for (const freq of notes) { tone(c, t, freq, 0.28, 'triangle', 0.3); t += 0.13; }
}

function playPulse(c: AudioContext) {
  let t = c.currentTime;
  for (let i = 0; i < 4; i++) {
    tone(c, t, 660, 0.18, 'sine', 0.22);
    tone(c, t + 0.09, 880, 0.18, 'sine', 0.18);
    t += 0.42;
  }
}

export function playTune(id: TuneId) {
  try {
    const c = ctx();
    if (!c) return;
    if (id === 'chime') playChime(c);
    else if (id === 'bell') playBell(c);
    else if (id === 'marimba') playMarimba(c);
    else if (id === 'pulse') playPulse(c);
  } catch {
    /* Audio failed silently — toast/notification elsewhere still show. */
  }
}
