'use client';
/**
 * SelectionScreen — 3-car model selection grid.
 * Overlaid over the 3D scene. Semi-transparent panel at bottom.
 */
import { motion } from 'framer-motion';
import { CAR_REGISTRY } from '@/data/cars';
import ModelCard from './ModelCard';

const CARS = Object.values(CAR_REGISTRY);

export default function SelectionScreen() {
  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Top header */}
      <motion.div
        className="pt-10 pb-6 px-10 flex items-end justify-between"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: [0, 0, 0.2, 1] } }}
      >
        {/* Porsche wordmark */}
        <div>
          <p className="label-caps text-p-muted mb-1">Select Your Model</p>
          <h1
            className="font-display text-p-text"
            style={{ fontSize: 'var(--text-title)', fontWeight: 'var(--fw-bold)', letterSpacing: '-0.02em' }}
          >
            Porsche Configurator
          </h1>
        </div>

        {/* Year badge */}
        <span className="label-caps text-p-disabled">2026 Lineup</span>
      </motion.div>

      {/* Spacer — shows 3D scene through it */}
      <div className="flex-1" />

      {/* Bottom card tray */}
      <div
        className="px-8 pb-8 pt-6"
        style={{
          background: 'linear-gradient(to top, rgba(10,10,10,0.97) 60%, transparent)',
        }}
      >
        <div className="grid grid-cols-3 gap-4 max-w-5xl mx-auto">
          {CARS.map((car, i) => (
            <ModelCard key={car.id} car={car} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
