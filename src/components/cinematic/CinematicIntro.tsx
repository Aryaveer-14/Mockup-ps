'use client';
/**
 * CinematicIntro — Premium orchestrator for the full Porsche intro sequence.
 *
 * Phase flow:
 *   'car'       → 3D cinematic: darkness → headlights → approach → flash
 *   'blackout'  → Hard cut to black (0.4s)
 *   'logo'      → Letter-by-letter PORSCHE reveal
 *   'interact'  → Logo idle + breathing, click to zoom into showroom
 *   'showcase'  → 3-car reveal with staggered animation
 *   'done'      → onFinished fires, app transitions to selection
 *
 * Overlays:
 *   - White/warm flash during car scene headlight ramp
 *   - Black overlay for blackout transition
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import PorscheLogoReveal from './PorscheLogoReveal';
import InteractiveLogoTransition from './InteractiveLogoTransition';

// R3F scene — no SSR
const CarCinematicScene = dynamic(() => import('./CarCinematicScene'), {
  ssr: false,
});

type Phase = 'car' | 'blackout' | 'logo' | 'interact' | 'done';

interface CinematicIntroProps {
  onFinished: () => void;
}

export default function CinematicIntro({ onFinished }: CinematicIntroProps) {
  const [phase, setPhase] = useState<Phase>('car');
  const [flashOpacity, setFlashOpacity] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const addTimer = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }, []);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      timers.current.forEach(clearTimeout);
    };
  }, []);

  // ── Flash intensity from 3D scene ──
  const handleFlashIntensity = useCallback((v: number) => {
    setFlashOpacity(v);
  }, []);

  // ── Car scene done → blackout → logo ──
  const handleCarComplete = useCallback(() => {
    setFlashOpacity(0);
    setPhase('blackout');
    addTimer(() => setPhase('logo'), 450);
  }, [addTimer]);

  // ── Logo reveal done → interactive logo ──
  const handleLogoComplete = useCallback(() => {
    setPhase('interact');
  }, []);

  // ── Logo clicked & zoom done → go directly to selection ──
  const handleLogoTransitionComplete = useCallback(() => {
    setPhase('done');
    onFinished();
  }, [onFinished]);

  // ── Skip handler ──
  const handleSkip = useCallback(() => {
    timers.current.forEach(clearTimeout);
    setPhase('done');
    onFinished();
  }, [onFinished]);

  if (phase === 'done') return null;

  return (
    <div className="absolute inset-0 z-50 bg-black overflow-hidden select-none">

      {/* ── PHASE: Car cinematic scene ── */}
      <AnimatePresence>
        {phase === 'car' && (
          <motion.div
            key="car"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1.0, ease: 'easeOut' } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            <CarCinematicScene
              onFlashIntensity={handleFlashIntensity}
              onComplete={handleCarComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Warm flash overlay (headlight fill) ── */}
      {phase === 'car' && flashOpacity > 0.005 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 55%, #fff8e0, #fff4c8)',
            opacity: Math.min(flashOpacity * 1.3, 1),
            zIndex: 10,
          }}
        />
      )}

      {/* ── PHASE: Blackout ── */}
      <AnimatePresence>
        {phase === 'blackout' && (
          <motion.div
            key="blackout"
            className="absolute inset-0 bg-black"
            style={{ zIndex: 20 }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 1 }}
          />
        )}
      </AnimatePresence>

      {/* ── PHASE: Logo reveal ── */}
      <AnimatePresence>
        {phase === 'logo' && (
          <motion.div
            key="logo"
            className="absolute inset-0"
            style={{ zIndex: 30 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.4 } }}
            exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeIn' } }}
          >
            <PorscheLogoReveal onComplete={handleLogoComplete} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PHASE: Interactive logo (click to zoom) ── */}
      <AnimatePresence>
        {phase === 'interact' && (
          <motion.div
            key="interact"
            className="absolute inset-0"
            style={{ zIndex: 30 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.3 } }}
            exit={{ opacity: 0, transition: { duration: 0.4, ease: 'easeIn' } }}
          >
            <InteractiveLogoTransition
              onTransitionComplete={handleLogoTransitionComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Skip button ── */}
      <button
        onClick={handleSkip}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[60]
                   text-xs tracking-[0.15em] uppercase
                   text-neutral-600 hover:text-neutral-400
                   transition-colors duration-150 px-4 py-2"
        style={{
          fontFamily: '"Eurostile Extended", "Eurostile", "Porsche Next", Arial, sans-serif',
        }}
      >
        Skip
      </button>
    </div>
  );
}
