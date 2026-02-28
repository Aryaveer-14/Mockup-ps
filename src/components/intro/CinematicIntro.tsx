'use client';
/**
 * CinematicIntro — Full cinematic Porsche intro sequence orchestrator.
 *
 * Phase flow:
 *   'car'      → 3D car scene (headlights on → approach → flash)
 *   'blackout' → brief pure-black gap (0.3s)
 *   'logo'     → letter-by-letter "PORSCHE" reveal
 *   'done'     → fires onFinished callback (app can transition)
 *
 * Total duration: ~8s
 *
 * Overlays:
 *   - White flash div (opacity driven by scene callback)
 *   - Black overlay for blackout transition
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import PorscheLogoReveal from './PorscheLogoReveal';

// Dynamic import for the R3F scene — no SSR
const CarCinematicScene = dynamic(() => import('./CarCinematicScene'), {
  ssr: false,
});

type Phase = 'car' | 'blackout' | 'logo' | 'done';

interface CinematicIntroProps {
  /** Called when the full cinematic sequence ends */
  onFinished: () => void;
}

export default function CinematicIntro({ onFinished }: CinematicIntroProps) {
  const [phase, setPhase] = useState<Phase>('car');
  const [flashOpacity, setFlashOpacity] = useState(0);
  const blackoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Car scene reports flash intensity each frame ──
  const handleFlashIntensity = useCallback((v: number) => {
    // v: 0→1 as headlights ramp to blinding
    setFlashOpacity(v);
  }, []);

  // ── Car scene finished → go to blackout ──
  const handleSceneComplete = useCallback(() => {
    setFlashOpacity(0); // kill the flash overlay
    setPhase('blackout');
    // Short blackout gap before logo
    blackoutTimer.current = setTimeout(() => {
      setPhase('logo');
    }, 400);
  }, []);

  // ── Logo reveal finished → done ──
  const handleLogoComplete = useCallback(() => {
    setPhase('done');
    onFinished();
  }, [onFinished]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (blackoutTimer.current) clearTimeout(blackoutTimer.current);
    };
  }, []);

  // ── Skip handler ──
  const handleSkip = useCallback(() => {
    if (blackoutTimer.current) clearTimeout(blackoutTimer.current);
    setPhase('done');
    onFinished();
  }, [onFinished]);

  if (phase === 'done') return null;

  return (
    <div className="absolute inset-0 z-50 bg-black overflow-hidden select-none">
      {/* ── 3D Car Scene ── */}
      <AnimatePresence>
        {phase === 'car' && (
          <motion.div
            key="car-scene"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
          >
            <CarCinematicScene
              onFlashIntensity={handleFlashIntensity}
              onComplete={handleSceneComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── White flash overlay (driven by scene) ── */}
      {phase === 'car' && flashOpacity > 0.01 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundColor: '#fffbe6',
            opacity: Math.min(flashOpacity * 1.2, 1),
            zIndex: 10,
            transition: 'opacity 0.05s linear',
          }}
        />
      )}

      {/* ── Blackout ── */}
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

      {/* ── Logo Reveal ── */}
      <AnimatePresence>
        {phase === 'logo' && (
          <motion.div
            key="logo"
            className="absolute inset-0"
            style={{ zIndex: 30 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.3 } }}
            exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeIn' } }}
          >
            <PorscheLogoReveal onComplete={handleLogoComplete} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Skip button ── */}
      {
        <button
          onClick={handleSkip}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50
                     text-xs tracking-[0.12em] uppercase
                     text-neutral-500 hover:text-neutral-300
                     transition-colors duration-150 px-4 py-2"
          style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
        >
          Skip Intro
        </button>
      }
    </div>
  );
}
