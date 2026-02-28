'use client';
/**
 * useRevSound — Synthesized engine rev burst via Web Audio API.
 *
 * Creates a one-shot rev sound on each call to `playRev()`.
 * Each car has a unique sonic profile:
 *   - 911:     high-pitched flat-six scream
 *   - Taycan:  electric whine sweep
 *   - Cayenne: deep V8 rumble
 *
 * Uses fresh oscillators per play — avoids stuck-node issues.
 * AudioContext is created on first play (inside a click handler)
 * so it's guaranteed to be unlocked by browser autoplay policy.
 */
import { useRef, useCallback } from 'react';
import { CarId } from '@/store/useConfiguratorStore';

/** Engine profile per car */
const ENGINE_PROFILES: Record<CarId, {
  fundamentals: number[];
  types: OscillatorType[];
  peakGain: number;
  filterStart: number;
  filterPeak: number;
  pitchMultiplier: number;
  attackTime: number;
  sustainTime: number;
  releaseTime: number;
}> = {
  '911': {
    fundamentals: [110, 220, 330, 495],
    types: ['sawtooth', 'square', 'sawtooth', 'square'],
    peakGain: 0.5,
    filterStart: 400,
    filterPeak: 4000,
    pitchMultiplier: 2.0,
    attackTime: 0.15,
    sustainTime: 0.6,
    releaseTime: 0.8,
  },
  'taycan': {
    fundamentals: [220, 330, 660],
    types: ['sine', 'triangle', 'sine'],
    peakGain: 0.4,
    filterStart: 600,
    filterPeak: 6000,
    pitchMultiplier: 2.5,
    attackTime: 0.1,
    sustainTime: 0.5,
    releaseTime: 1.0,
  },
  'cayenne': {
    fundamentals: [72, 144, 216, 288, 360, 432],
    types: ['sawtooth', 'square', 'sawtooth', 'square', 'sawtooth', 'square'],
    peakGain: 0.55,
    filterStart: 300,
    filterPeak: 2800,
    pitchMultiplier: 1.6,
    attackTime: 0.2,
    sustainTime: 0.7,
    releaseTime: 0.9,
  },
};

export function useRevSound(carId: CarId) {
  const ctxRef = useRef<AudioContext | null>(null);
  const playingRef = useRef(false);

  const playRev = useCallback(() => {
    // Prevent overlapping bursts
    if (playingRef.current) return;
    playingRef.current = true;

    // Create or reuse AudioContext (created inside click = always unlocked)
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const profile = ENGINE_PROFILES[carId];
    const now = ctx.currentTime;
    const { attackTime, sustainTime, releaseTime } = profile;
    const totalTime = attackTime + sustainTime + releaseTime;

    // ── Master gain envelope ──
    const master = ctx.createGain();
    master.gain.setValueAtTime(0, now);
    master.gain.linearRampToValueAtTime(profile.peakGain, now + attackTime);
    master.gain.setValueAtTime(profile.peakGain, now + attackTime + sustainTime);
    master.gain.exponentialRampToValueAtTime(0.001, now + totalTime);

    // ── Low-pass filter sweep (engine opening up) ──
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 4;
    filter.frequency.setValueAtTime(profile.filterStart, now);
    filter.frequency.linearRampToValueAtTime(profile.filterPeak, now + attackTime + sustainTime * 0.7);
    filter.frequency.linearRampToValueAtTime(profile.filterStart, now + totalTime);

    // ── Waveshaper for grit ──
    const distortion = ctx.createWaveShaper();
    const curve = new Float32Array(256);
    for (let i = 0; i < 256; i++) {
      const x = (i / 128) - 1;
      curve[i] = (Math.PI + 5) * x / (Math.PI + 5 * Math.abs(x));
    }
    distortion.curve = curve;

    // Chain: distortion → master → filter → destination
    distortion.connect(master);
    master.connect(filter);
    filter.connect(ctx.destination);

    // ── Create oscillators for each harmonic ──
    const oscillators: OscillatorNode[] = [];

    profile.fundamentals.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = profile.types[idx] || 'sawtooth';

      // Pitch ramp (rev up then back down)
      const peakFreq = freq * profile.pitchMultiplier;
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.linearRampToValueAtTime(peakFreq, now + attackTime + sustainTime * 0.8);
      osc.frequency.linearRampToValueAtTime(freq * 0.8, now + totalTime);

      // Individual gain (higher harmonics quieter)
      const g = ctx.createGain();
      g.gain.value = 1 / (idx + 1);

      osc.connect(g);
      g.connect(distortion);

      osc.start(now);
      osc.stop(now + totalTime + 0.1);
      oscillators.push(osc);
    });

    // ── Add noise burst for exhaust texture ──
    const noiseLength = ctx.sampleRate * totalTime;
    const noiseBuffer = ctx.createBuffer(1, noiseLength, ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseLength; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * 0.3;
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.12, now + attackTime);
    noiseGain.gain.setValueAtTime(0.12, now + attackTime + sustainTime * 0.5);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + totalTime);

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 800;
    noiseFilter.Q.value = 1.5;

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(master);
    noiseSource.start(now);
    noiseSource.stop(now + totalTime + 0.1);

    // Allow replaying after the burst ends
    setTimeout(() => {
      playingRef.current = false;
    }, totalTime * 1000);
  }, [carId]);

  return { playRev };
}

