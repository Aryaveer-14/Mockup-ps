'use client';
/**
 * IntroScreen — Cinematic Porsche logo intro
 *
 * Timing:
 *   t=0.0s  Black. Logo opacity 0.
 *   t=0.3s  Wordmark fades in       (0.6s)
 *   t=1.6s  Crest draws in          (0.8s)  ← handled inside PorscheLogo via CSS
 *   t=2.8s  Slight scale pulse
 *   t=3.1s  Full overlay fades out  (0.7s)
 *   t=3.8s  setPhase('selection') + setIntroComplete(true)
 */

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import PorscheLogo from './PorscheLogo';

export default function IntroScreen() {
  const { setPhase, setIntroComplete } = useConfiguratorStore();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Transition out after full sequence (3.8s)
    timerRef.current = setTimeout(() => {
      setIntroComplete(true);
      setPhase('selection');
    }, 3800);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [setPhase, setIntroComplete]);

  return (
    // Full-screen black backdrop
    <motion.div
      className="absolute inset-0 flex items-center justify-center bg-black z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.7, ease: [0.4, 0, 1, 1], delay: 0 } }}
    >
      {/* Logo container — fade in wordmark, then crest draws inside PorscheLogo */}
      <motion.div
        className="flex flex-col items-center gap-4 select-none"
        initial={{ opacity: 0, scale: 1 }}
        animate={{
          opacity: [0, 1, 1, 1, 0],
          scale:   [1, 1, 1.04, 0.96, 0.96],
          transition: {
            duration: 3.8,
            times:    [0, 0.16, 0.74, 0.84, 1.0],
            ease:     'easeInOut',
          },
        }}
      >
        <PorscheLogo className="w-72 h-48 sm:w-80 sm:h-56" />

        {/* Thin gold rule beneath the logo */}
        <motion.div
          className="h-px bg-p-gold"
          initial={{ width: 0 }}
          animate={{
            width: '160px',
            transition: { duration: 0.6, delay: 0.9, ease: [0.16, 1, 0.3, 1] },
          }}
        />
      </motion.div>

      {/* Skip button — bottom center */}
      <button
        onClick={() => {
          if (timerRef.current) clearTimeout(timerRef.current);
          setIntroComplete(true);
          setPhase('selection');
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 label-caps text-p-muted
                   hover:text-p-text transition-colors duration-150 px-4 py-2"
      >
        Skip Intro
      </button>
    </motion.div>
  );
}
