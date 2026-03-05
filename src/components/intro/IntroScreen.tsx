'use client';
/**
 * IntroScreen — Enhanced cinematic landing page sequence
 *
 * Timing:
 *   Phase 1 (Logo): 0.0s - 3.8s
 *     t=0.0s  Black. Logo opacity 0.
 *     t=0.3s  Wordmark fades in       (0.6s)
 *     t=1.6s  Crest draws in          (0.8s)
 *     t=2.8s  Slight scale pulse
 *     t=3.1s  Logo fades out          (0.7s)
 *
 *   Phase 2 (Racing Car): 3.8s - 9.0s
 *     t=3.8s  Car enters from right, speed lines
 *     t=5.5s  Car center position, brake lights
 *     t=7.0s  Tagline appears "Engineering Excellence"
 *     t=8.2s  Scene fades to selection
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import PorscheLogo from './PorscheLogo';

type IntroPhase = 'logo' | 'racing';

export default function IntroScreen() {
  const { setPhase, setIntroComplete } = useConfiguratorStore();
  const [introPhase, setIntroPhase] = useState<IntroPhase>('logo');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phase2TimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Phase 1: Logo → Phase 2: Racing car
    timerRef.current = setTimeout(() => {
      setIntroPhase('racing');
    }, 3800);

    // Phase 2: Racing car → Selection screen
    phase2TimerRef.current = setTimeout(() => {
      setIntroComplete(true);
      setPhase('selection');
    }, 9000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (phase2TimerRef.current) clearTimeout(phase2TimerRef.current);
    };
  }, [setPhase, setIntroComplete]);

  const handleSkip = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (phase2TimerRef.current) clearTimeout(phase2TimerRef.current);
    setIntroComplete(true);
    setPhase('selection');
  };

  return (
    <motion.div
      className="absolute inset-0 bg-black overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.7, ease: [0.4, 0, 1, 1] } }}
    >
      <AnimatePresence mode="wait">
        {/* Phase 1: Logo Intro */}
        {introPhase === 'logo' && (
          <motion.div
            key="logo-phase"
            className="absolute inset-0 flex items-center justify-center"
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
          >
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

              <motion.div
                className="h-px bg-p-gold"
                initial={{ width: 0 }}
                animate={{
                  width: '160px',
                  transition: { duration: 0.6, delay: 0.9, ease: [0.16, 1, 0.3, 1] },
                }}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Phase 2: Racing Car */}
        {introPhase === 'racing' && (
          <motion.div
            key="racing-phase"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5 } }}
            exit={{ opacity: 0, transition: { duration: 0.7 } }}
          >
            {/* Road/horizon line */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="absolute w-full h-px"
                style={{
                  background: 'linear-gradient(to right, transparent 0%, rgba(196,162,74,0.2) 20%, rgba(196,162,74,0.4) 50%, rgba(196,162,74,0.2) 80%, transparent 100%)',
                  top: '55%',
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1, transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }}
              />
            </div>

            {/* Speed lines background */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.3, duration: 0.5 } }}
            >
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-px bg-p-border"
                  style={{
                    top: `${25 + i * 5}%`,
                    left: 0,
                    right: 0,
                  }}
                  initial={{ scaleX: 0, x: '100%' }}
                  animate={{
                    scaleX: [0, 1, 0],
                    x: ['100%', '0%', '-100%'],
                    transition: {
                      duration: 1.5,
                      delay: i * 0.08,
                      repeat: 2,
                      ease: 'linear',
                    },
                  }}
                />
              ))}
            </motion.div>

            {/* Racing car silhouette */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="relative"
                initial={{ x: '100vw', scale: 0.8 }}
                animate={{
                  x: [
                    '100vw',   // Start far right
                    '20vw',    // Zoom in
                    '0vw',     // Center
                  ],
                  scale: [0.8, 1.2, 1.0],
                  transition: {
                    duration: 2.5,
                    times: [0, 0.6, 1],
                    ease: [0.16, 1, 0.3, 1],
                  },
                }}
                style={{ width: 600, height: 200 }}
              >
                {/* Car body */}
                <svg viewBox="0 0 600 200" className="w-full h-full">
                  {/* Main body */}
                  <motion.path
                    d="M 80 120 L 500 120 L 480 100 L 400 90 L 350 80 L 250 75 L 150 80 L 100 100 Z"
                    fill="#8A9BB0"
                    stroke="rgba(196,162,74,0.3)"
                    strokeWidth="1"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                      pathLength: 1,
                      opacity: 1,
                      transition: { duration: 0.8, delay: 0.5 }
                    }}
                  />

                  {/* Cabin */}
                  <motion.path
                    d="M 200 75 L 180 55 L 320 45 L 360 55 L 340 75 Z"
                    fill="#8A9BB0"
                    stroke="rgba(196,162,74,0.3)"
                    strokeWidth="1"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                      pathLength: 1,
                      opacity: 1,
                      transition: { duration: 0.8, delay: 0.6 }
                    }}
                  />

                  {/* Windows */}
                  <motion.path
                    d="M 210 70 L 195 55 L 245 50 L 250 70 Z"
                    fill="rgba(10,10,10,0.9)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: 0.7, duration: 0.3 } }}
                  />
                  <motion.path
                    d="M 270 70 L 275 50 L 315 47 L 330 55 L 320 70 Z"
                    fill="rgba(10,10,10,0.9)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: 0.7, duration: 0.3 } }}
                  />

                  {/* Wheels */}
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: 0.8, duration: 0.3 } }}
                  >
                    <circle cx="140" cy="135" r="22" fill="#1A1A1A" stroke="#3A3A3A" strokeWidth="3"/>
                    <circle cx="140" cy="135" r="10" fill="#2A2A2A"/>
                    <circle cx="430" cy="135" r="22" fill="#1A1A1A" stroke="#3A3A3A" strokeWidth="3"/>
                    <circle cx="430" cy="135" r="10" fill="#2A2A2A"/>
                  </motion.g>

                  {/* Brake lights - flash on */}
                  <motion.circle
                    cx="490"
                    cy="110"
                    r="4"
                    fill="#D5001C"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 1, 1, 0.3],
                      transition: {
                        duration: 1.5,
                        delay: 1.8,
                        times: [0, 0.2, 0.8, 1],
                      },
                    }}
                  />
                  <motion.circle
                    cx="490"
                    cy="130"
                    r="4"
                    fill="#D5001C"
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 1, 1, 0.3],
                      transition: {
                        duration: 1.5,
                        delay: 1.8,
                        times: [0, 0.2, 0.8, 1],
                      },
                    }}
                  />
                </svg>

                {/* Ground reflection */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-8"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(138,155,176,0.15) 0%, transparent 70%)',
                    filter: 'blur(8px)',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { delay: 1.2, duration: 0.5 } }}
                />
              </motion.div>
            </div>

            {/* Tagline */}
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center pt-64"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { delay: 3.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] },
              }}
            >
              <p
                className="label-caps text-p-muted mb-2"
                style={{ letterSpacing: '0.2em' }}
              >
                Porsche
              </p>
              <h1
                className="font-display text-p-text"
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3.5rem)',
                  fontWeight: 'var(--fw-bold)',
                  letterSpacing: '-0.02em',
                }}
              >
                Engineering Excellence
              </h1>
              <motion.div
                className="h-px bg-p-gold mt-4"
                initial={{ width: 0 }}
                animate={{
                  width: '120px',
                  transition: { delay: 3.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip button — persistent */}
      <button
        onClick={handleSkip}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 label-caps text-p-muted
                   hover:text-p-text transition-colors duration-150 px-4 py-2 z-50"
      >
        Skip Intro
      </button>
    </motion.div>
  );
}
