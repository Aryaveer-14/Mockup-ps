'use client';
/**
 * PorscheLogoReveal — Premium letter-by-letter "PORSCHE" reveal.
 *
 * Typography: Eurostile Extended / Microgramma inspired.
 * Each letter fades + slides up with staggered delay.
 * Gold underline draws in after full reveal.
 * Calls onComplete after hold duration.
 */

import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LETTERS = 'PORSCHE'.split('');
const STAGGER = 0.14;
const LETTER_DUR = 0.5;
const UNDERLINE_DELAY = LETTERS.length * STAGGER + LETTER_DUR * 0.3;
const HOLD_AFTER = 0.6;
const TOTAL_MS = (UNDERLINE_DELAY + 0.5 + HOLD_AFTER) * 1000;

// ─── Variants ────────────────────────────────────────────────────────────────

const letterVariant = {
  hidden: {
    opacity: 0,
    y: 30,
    filter: 'blur(8px)',
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      delay: i * STAGGER,
      duration: LETTER_DUR,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

// ─── Font stack — Eurostile Extended / Microgramma inspired ──────────────────
// Falls back through geometric extended faces available on most systems.
const LOGO_FONT = [
  '"Eurostile Extended"',
  '"Eurostile"',
  '"Microgramma"',
  '"Square 721 Extended"',
  '"Porsche Next"',
  '"Arial Narrow"',
  'Arial',
  'sans-serif',
].join(', ');

// ─── Component ───────────────────────────────────────────────────────────────

interface PorscheLogoRevealProps {
  onComplete: () => void;
}

export default function PorscheLogoReveal({ onComplete }: PorscheLogoRevealProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stableComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    timerRef.current = setTimeout(stableComplete, TOTAL_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [stableComplete]);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-5">
        {/* ── Letters ── */}
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
                  fontFamily: LOGO_FONT,
                  fontWeight: 700,
                  fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
                  letterSpacing: '0.28em',
                  lineHeight: 1,
                  color: '#F0F0EC',
                  display: 'inline-block',
                  willChange: 'transform, opacity, filter',
                  textTransform: 'uppercase',
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
            width: '160px',
            opacity: 1,
            transition: {
              delay: UNDERLINE_DELAY,
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            },
          }}
        />

        {/* ── Tagline ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{
            opacity: 0.45,
            transition: {
              delay: UNDERLINE_DELAY + 0.35,
              duration: 0.7,
              ease: 'easeOut',
            },
          }}
          style={{
            fontFamily: LOGO_FONT,
            fontSize: '0.65rem',
            letterSpacing: '0.35em',
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
