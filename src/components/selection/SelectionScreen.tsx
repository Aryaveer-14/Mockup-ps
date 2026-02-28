'use client';
/**
 * SelectionScreen — Minimalist floating labels beneath each 3D car.
 * No card boxes, no header chrome, no gradient tray.
 * Just car names + specs floating over the dark scene.
 *
 * Each label column is clickable and selects the respective car.
 */
import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { CAR_REGISTRY, formatPrice } from '@/data/cars';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { CarId } from '@/store/useConfiguratorStore';

const CARS = Object.values(CAR_REGISTRY);

export default function SelectionScreen() {
  const { hoveredCarId, isSelecting, setSelectedCar, setPhase, setHoveredCar, setIsSelecting } =
    useConfiguratorStore();

  const handleCarClick = useCallback(
    (carId: CarId) => {
      if (isSelecting) return;
      setIsSelecting(true);
      setSelectedCar(carId);
      setTimeout(() => {
        setPhase('configurator');
        setIsSelecting(false);
      }, 500);
    },
    [isSelecting, setIsSelecting, setSelectedCar, setPhase],
  );

  return (
    <div className="absolute inset-0 flex flex-col">
      {/* Invisible click zones over the 3D cars — top 2/3 of screen */}
      <div className="flex-1 grid grid-cols-3">
        {CARS.map((car) => (
          <button
            key={car.id}
            className="w-full h-full cursor-pointer"
            style={{ background: 'transparent' }}
            onClick={() => handleCarClick(car.id)}
            onMouseEnter={() => setHoveredCar(car.id)}
            onMouseLeave={() => setHoveredCar(null)}
            aria-label={`Select ${car.fullName}`}
          />
        ))}
      </div>

      {/* Bottom label strip */}
      <motion.div
        className="w-full px-6 pb-10"
        initial={{ opacity: 0, y: 20 }}
        animate={
          isSelecting
            ? { opacity: 0, y: 10, transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } }
            : { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2, ease: [0, 0, 0.2, 1] } }
        }
      >
        <div className="grid grid-cols-3 gap-6 max-w-5xl mx-auto">
          {CARS.map((car, i) => {
            const isHovered = hoveredCarId === car.id;

            return (
              <motion.button
                key={car.id}
                className="flex flex-col items-center text-center cursor-pointer"
                style={{ background: 'transparent' }}
                onClick={() => handleCarClick(car.id)}
                onMouseEnter={() => setHoveredCar(car.id)}
                onMouseLeave={() => setHoveredCar(null)}
                initial={{ opacity: 0, y: 16 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    delay: 0.3 + i * 0.1,
                    ease: [0, 0, 0.2, 1],
                  },
                }}
              >
                {/* Car name */}
                <h2
                  className="font-display transition-colors duration-200"
                  style={{
                    fontSize: 'var(--text-heading)',
                    fontWeight: 'var(--fw-bold)',
                    letterSpacing: 'var(--ls-tight)',
                    color: isHovered
                      ? 'var(--color-accent-gold)'
                      : 'var(--color-text-primary)',
                  }}
                >
                  {car.name}
                </h2>

                {/* Tagline */}
                <p
                  className="mt-1 transition-opacity duration-200"
                  style={{
                    fontSize: 'var(--text-label)',
                    letterSpacing: 'var(--ls-wide)',
                    color: 'var(--color-text-secondary)',
                    opacity: isHovered ? 1 : 0.6,
                  }}
                >
                  {car.tagline}
                </p>

                {/* Price */}
                <p
                  className="mt-2 font-bold transition-opacity duration-200"
                  style={{
                    fontSize: 'var(--text-body)',
                    letterSpacing: 'var(--ls-tight)',
                    color: 'var(--color-text-primary)',
                    opacity: isHovered ? 1 : 0.5,
                  }}
                >
                  {formatPrice(car.basePrice)}
                </p>

                {/* Hover hint line */}
                <motion.div
                  className="mt-3 h-px bg-p-gold"
                  initial={{ width: 0 }}
                  animate={{
                    width: isHovered ? 48 : 0,
                    transition: { duration: 0.25, ease: [0, 0, 0.2, 1] },
                  }}
                />
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
