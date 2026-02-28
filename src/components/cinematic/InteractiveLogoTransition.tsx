'use client';
/**
 * InteractiveLogoTransition — Clickable "PORSCHE" logo with zoom transition.
 *
 * States:
 *   'idle'     → Logo centered, subtle breathing scale, cursor pointer
 *   'zooming'  → Logo zooms forward, bg crossfades, then fades out
 *   'done'     → Fires onTransitionComplete
 *
 * Feels like entering a digital showroom.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

// ─── Font stack (Eurostile Extended inspired) ────────────────────────────────
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

// ─── Timing ──────────────────────────────────────────────────────────────────

const ZOOM_DURATION = 1.4;       // seconds for the zoom
const FADE_OUT_DELAY = 0.9;      // start fading text during zoom
const DONE_DELAY_MS = (ZOOM_DURATION + 0.3) * 1000;

// ─── Component ───────────────────────────────────────────────────────────────

interface InteractiveLogoTransitionProps {
  onTransitionComplete: () => void;
}

type Phase = 'idle' | 'zooming' | 'done';

export default function InteractiveLogoTransition({
  onTransitionComplete,
}: InteractiveLogoTransitionProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const doneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = useCallback(() => {
    if (phase !== 'idle') return;
    setPhase('zooming');

    doneTimer.current = setTimeout(() => {
      setPhase('done');
      onTransitionComplete();
    }, DONE_DELAY_MS);
  }, [phase, onTransitionComplete]);

  useEffect(() => {
    return () => {
      if (doneTimer.current) clearTimeout(doneTimer.current);
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* ── Background crossfade (black → dark showroom) ── */}
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor: '#000000' }}
        animate={
          phase === 'zooming'
            ? { backgroundColor: '#0A0A0A', transition: { duration: ZOOM_DURATION, ease: 'easeInOut' } }
            : {}
        }
      />

      {/* ── Subtle vignette overlay during zoom ── */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
        }}
        initial={{ opacity: 0 }}
        animate={
          phase === 'zooming'
            ? { opacity: 1, transition: { duration: 0.8, ease: 'easeOut' } }
            : { opacity: 0 }
        }
      />

      {/* ── Logo container ── */}
      <motion.button
        onClick={handleClick}
        className="relative z-10 flex flex-col items-center gap-5 cursor-pointer
                   focus:outline-none select-none"
        style={{ background: 'transparent', border: 'none' }}
        /* ── Idle: subtle breathing ── */
        {...(phase === 'idle'
          ? {
              animate: {
                scale: [1, 1.015, 1],
              },
              transition: {
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }
          : {})}
      >
        {/* ── "PORSCHE" text ── */}
        <motion.div
          className="flex"
          animate={
            phase === 'zooming'
              ? {
                  scale: 6,
                  opacity: 0,
                  transition: {
                    scale: { duration: ZOOM_DURATION, ease: [0.25, 0.1, 0.25, 1] },
                    opacity: {
                      duration: ZOOM_DURATION * 0.5,
                      delay: FADE_OUT_DELAY,
                      ease: 'easeIn',
                    },
                  },
                }
              : { scale: 1, opacity: 1 }
          }
        >
          {'PORSCHE'.split('').map((letter, i) => (
            <span
              key={i}
              style={{
                fontFamily: LOGO_FONT,
                fontWeight: 700,
                fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
                letterSpacing: '0.28em',
                lineHeight: 1,
                color: '#F0F0EC',
                textTransform: 'uppercase',
              }}
            >
              {letter}
            </span>
          ))}
        </motion.div>

        {/* ── Gold underline ── */}
        <motion.div
          className="h-px"
          style={{ backgroundColor: '#C4A24A', width: 160 }}
          animate={
            phase === 'zooming'
              ? {
                  opacity: 0,
                  scaleX: 3,
                  transition: { duration: 0.6, ease: 'easeIn' },
                }
              : { opacity: 1, scaleX: 1 }
          }
        />

        {/* ── Tagline ── */}
        <motion.p
          style={{
            fontFamily: LOGO_FONT,
            fontSize: '0.65rem',
            letterSpacing: '0.35em',
            color: '#8A8A84',
            textTransform: 'uppercase',
            opacity: 0.45,
          }}
          animate={
            phase === 'zooming'
              ? { opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } }
              : {}
          }
        >
          There is no substitute
        </motion.p>

        {/* ── Click hint (idle only) ── */}
        {phase === 'idle' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.5,
            }}
            style={{
              fontFamily: LOGO_FONT,
              fontSize: '0.55rem',
              letterSpacing: '0.25em',
              color: '#C4A24A',
              textTransform: 'uppercase',
              marginTop: '1.5rem',
            }}
          >
            Click to enter
          </motion.p>
        )}
      </motion.button>
    </div>
  );
}
