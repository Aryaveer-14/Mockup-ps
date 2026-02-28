'use client';
/**
 * ThreeCarShowcase — 3-model horizontal cinematic reveal.
 *
 * Fades in three Porsche cards with staggered timing.
 * Each card shows: car name, tagline, price, subtle gold hover line.
 * Matches VISUAL_DIRECTION tokens.
 *
 * This is the bridge between cinematic intro and the real SelectionScreen.
 * After brief display, fires onReady to let AppShell take over.
 */

import { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

// ─── Font stack ──────────────────────────────────────────────────────────────
const LOGO_FONT = [
  '"Eurostile Extended"',
  '"Eurostile"',
  '"Microgramma"',
  '"Porsche Next"',
  '"Arial Narrow"',
  'Arial',
  'sans-serif',
].join(', ');

// ─── Car data (hardcoded to avoid import cycles) ────────────────────────────

interface ShowcaseCar {
  name: string;
  tagline: string;
  price: string;
}

const SHOWCASE_CARS: ShowcaseCar[] = [
  { name: '911 Turbo S',      tagline: '650 PS · PDK · AWD',       price: 'From €230,700' },
  { name: 'Taycan Turbo S',   tagline: '952 PS · Electric · AWD',  price: 'From €190,800' },
  { name: 'Cayenne Turbo GT', tagline: '659 PS · V8 · AWD',        price: 'From €201,500' },
];

const STAGGER_DELAY = 0.18;
const CARD_DURATION = 0.7;
const HOLD_MS = 2200;

// ─── Card reveal variant ────────────────────────────────────────────────────

const cardVariant = {
  hidden: { opacity: 0, y: 40, filter: 'blur(6px)' },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      delay: 0.3 + i * STAGGER_DELAY,
      duration: CARD_DURATION,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const headerVariant = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

interface ThreeCarShowcaseProps {
  onReady: () => void;
}

export default function ThreeCarShowcase({ onReady }: ThreeCarShowcaseProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stableReady = useCallback(() => {
    onReady();
  }, [onReady]);

  useEffect(() => {
    const totalDelay = (0.3 + SHOWCASE_CARS.length * STAGGER_DELAY + CARD_DURATION) * 1000 + HOLD_MS;
    timerRef.current = setTimeout(stableReady, totalDelay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [stableReady]);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center justify-center"
      style={{ backgroundColor: '#0A0A0A' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }}
      exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeIn' } }}
    >
      {/* ── Header ── */}
      <motion.h2
        variants={headerVariant}
        initial="hidden"
        animate="visible"
        style={{
          fontFamily: LOGO_FONT,
          fontSize: 'clamp(0.65rem, 1.2vw, 0.8rem)',
          letterSpacing: '0.35em',
          color: '#C4A24A',
          textTransform: 'uppercase',
          marginBottom: '3rem',
        }}
      >
        Choose Your Porsche
      </motion.h2>

      {/* ── Cards row ── */}
      <div className="flex gap-8 md:gap-14 lg:gap-20 px-8">
        {SHOWCASE_CARS.map((car, i) => (
          <motion.div
            key={car.name}
            custom={i}
            variants={cardVariant}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center text-center cursor-pointer group"
          >
            {/* Car silhouette placeholder — 16:9 dark area */}
            <div
              className="w-48 h-28 sm:w-56 sm:h-32 md:w-64 md:h-36 rounded-sm mb-5
                         flex items-center justify-center"
              style={{
                backgroundColor: '#111111',
                border: '1px solid #1C1C1C',
              }}
            >
              <span
                style={{
                  fontFamily: LOGO_FONT,
                  fontSize: '1.6rem',
                  fontWeight: 700,
                  color: '#1E1E1E',
                  letterSpacing: '0.1em',
                }}
              >
                {car.name.split(' ')[0]}
              </span>
            </div>

            {/* Name */}
            <h3
              style={{
                fontFamily: LOGO_FONT,
                fontWeight: 700,
                fontSize: 'clamp(1rem, 2vw, 1.35rem)',
                letterSpacing: '0.08em',
                color: '#EDEDE8',
                lineHeight: 1.2,
              }}
            >
              {car.name}
            </h3>

            {/* Tagline */}
            <p
              className="mt-1"
              style={{
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: '0.68rem',
                letterSpacing: '0.06em',
                color: '#8A8A84',
              }}
            >
              {car.tagline}
            </p>

            {/* Price */}
            <p
              className="mt-2"
              style={{
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: '0.85rem',
                fontWeight: 700,
                letterSpacing: '-0.01em',
                color: '#EDEDE8',
                opacity: 0.7,
              }}
            >
              {car.price}
            </p>

            {/* Hover gold line */}
            <motion.div
              className="mt-3 h-px"
              style={{ backgroundColor: '#C4A24A' }}
              initial={{ width: 0 }}
              whileHover={{ width: 48 }}
              transition={{ duration: 0.25, ease: [0, 0, 0.2, 1] }}
            />
          </motion.div>
        ))}
      </div>

      {/* ── Bottom subtle instruction ── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{
          opacity: 0.3,
          transition: { delay: 1.5, duration: 0.8, ease: 'easeOut' },
        }}
        style={{
          fontFamily: LOGO_FONT,
          fontSize: '0.5rem',
          letterSpacing: '0.3em',
          color: '#8A8A84',
          textTransform: 'uppercase',
          marginTop: '3rem',
        }}
      >
        Entering showroom...
      </motion.p>
    </motion.div>
  );
}
