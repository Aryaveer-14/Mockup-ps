'use client';
/**
 * ModelCard — Single car selection card.
 * Shows thumbnail, name, tagline, base price.
 * onClick: sets selectedCarId and advances to configurator phase.
 */
import { motion } from 'framer-motion';
import Image from 'next/image';
import { CarConfig, formatPrice } from '@/data/cars';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';

interface ModelCardProps {
  car: CarConfig;
  index: number;
}

export default function ModelCard({ car, index }: ModelCardProps) {
  const { setSelectedCar, setPhase } = useConfiguratorStore();

  function handleSelect() {
    setSelectedCar(car.id);
    setPhase('configurator');
  }

  return (
    <motion.button
      onClick={handleSelect}
      className="group relative flex flex-col overflow-hidden text-left
                 bg-p-elevated border border-p-border rounded-sm
                 transition-colors duration-200
                 hover:border-p-gold hover:bg-[var(--color-selected-bg)]
                 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-p-gold"
      initial={{ opacity: 0, y: 32 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          delay: index * 0.12,
          ease: [0, 0, 0.2, 1],
        },
      }}
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-p-bg overflow-hidden">
        <Image
          src={car.thumbnailPath}
          alt={car.fullName}
          fill
          className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
          onError={(e) => {
            // Hide broken image — let background show through
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-p-elevated/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        {/* Model name */}
        <div>
          <p className="label-caps text-p-muted mb-1">Porsche</p>
          <h2
            className="font-display text-p-text"
            style={{ fontSize: 'var(--text-heading)', fontWeight: 'var(--fw-bold)' }}
          >
            {car.name}
          </h2>
        </div>

        {/* Tagline / spec */}
        <p
          className="text-p-muted"
          style={{ fontSize: 'var(--text-label)', letterSpacing: 'var(--ls-wide)' }}
        >
          {car.tagline}
        </p>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom row */}
        <div className="flex items-end justify-between pt-3 border-t border-p-border">
          <div>
            <p className="label-caps text-p-muted" style={{ fontSize: '10px' }}>From</p>
            <p
              className="text-p-text font-bold"
              style={{ fontSize: 'var(--text-body)', letterSpacing: 'var(--ls-tight)' }}
            >
              {formatPrice(car.basePrice)}
            </p>
          </div>

          {/* Arrow CTA */}
          <span
            className="label-caps text-p-gold
                       group-hover:translate-x-1 transition-transform duration-200"
          >
            Configure →
          </span>
        </div>
      </div>
    </motion.button>
  );
}
