'use client';
/**
 * PorscheLogoReveal — Letter-by-letter "PORSCHE" reveal.
 *
 * Each letter fades + slides in from below with staggered delay.
 * After all letters are visible, a thin gold underline draws in,
 * holds briefly, then calls onComplete.
 *
 * Total duration: ~2.2s
 */

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LETTERS = 'PORSCHE'.split('');
const STAGGER = 0.12;         // delay between each letter
const LETTER_DURATION = 0.45; // each letter's fade-in time
const HOLD_AFTER = 1.0;       // hold after full reveal before onComplete
const UNDERLINE_DELAY = LETTERS.length * STAGGER + 0.1;
const TOTAL_DURATION =
  LETTERS.length * STAGGER + LETTER_DURATION + HOLD_AFTER;

// ─── Letter animation variants ───────────────────────────────────────────────

const letterVariant = {
  hidden: {
    opacity: 0,
    y: 24,
    filter: 'blur(6px)',
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      delay: i * STAGGER,
      duration: LETTER_DURATION,
      ease: [0.16, 1, 0.3, 1], // expo out
    },
  }),
};

// ─── Component ───────────────────────────────────────────────────────────────

interface PorscheLogoRevealProps {
  /** Called when the full reveal + hold is finished */
  onComplete: () => void;
}

export default function PorscheLogoReveal({ onComplete }: PorscheLogoRevealProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onComplete();
    }, TOTAL_DURATION * 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onComplete]);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black z-50">
      <div className="flex flex-col items-center gap-4">
        {/* ── Letter row ── */}
        <div className="flex" aria-label="Porsche" role="heading">
          <AnimatePresence>
            {LETTERS.map((letter, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={letterVariant}
                initial="hidden"
                animate="visible"
                style={{
                  fontFamily: "'Arial Narrow', Arial, sans-serif",
                  fontWeight: 700,
                  fontSize: 'clamp(2.5rem, 6vw, 5rem)',
                  letterSpacing: '0.22em',
                  color: '#F0F0EC',
                  display: 'inline-block',
                  willChange: 'transform, opacity, filter',
                }}
              >
                {letter}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>

        {/* ── Gold underline ── */}
        <motion.div
          className="h-px"
          style={{ backgroundColor: '#C4A24A' }}
          initial={{ width: 0, opacity: 0 }}
          animate={{
            width: '140px',
            opacity: 1,
            transition: {
              delay: UNDERLINE_DELAY,
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
            },
          }}
        />

        {/* ── Subtle tagline ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{
            opacity: 0.5,
            transition: {
              delay: UNDERLINE_DELAY + 0.3,
              duration: 0.6,
              ease: 'easeOut',
            },
          }}
          style={{
            fontFamily: "Arial, Helvetica, sans-serif",
            fontSize: '0.7rem',
            letterSpacing: '0.3em',
            color: '#8A8A84',
            textTransform: 'uppercase',
          }}
        >
          There is no substitute
        </motion.p>
      </div>
    </div>
  );
}
