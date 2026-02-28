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
import { useRevSound } from '@/hooks/useRevSound';

const CARS = Object.values(CAR_REGISTRY);

/** Speaker icon button — triggers engine rev for one car */
function RevButton({ carId }: { carId: CarId }) {
  const { playRev } = useRevSound(carId);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        playRev();
      }}
      className="group relative flex items-center justify-center transition-all duration-200"
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: '1px solid rgba(255,255,255,0.15)',
        background: 'rgba(255,255,255,0.05)',
        cursor: 'pointer',
        marginTop: 8,
      }}
      aria-label={`Play ${carId} engine sound`}
      title="Play engine sound"
    >
      {/* Speaker SVG icon */}
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: 'rgba(255,255,255,0.6)', transition: 'color 0.2s' }}
        className="group-hover:!text-[#d4af37]"
      >
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
      {/* Pulse ring on hover */}
      <span
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          border: '1px solid rgba(212,175,55,0.3)',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
      />
    </button>
  );
}

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
                    fontSize: '1.75rem',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    color: isHovered ? '#d4af37' : '#f5f5f5',
                  }}
                >
                  {car.name}
                </h2>

                {/* Tagline */}
                <p
                  className="mt-1 transition-opacity duration-200"
                  style={{
                    fontSize: '0.8rem',
                    letterSpacing: '0.06em',
                    color: '#a0a0a0',
                    opacity: isHovered ? 1 : 0.7,
                  }}
                >
                  {car.tagline}
                </p>

                {/* Price */}
                <p
                  className="mt-2 font-bold transition-opacity duration-200"
                  style={{
                    fontSize: '1.1rem',
                    letterSpacing: '0.02em',
                    color: isHovered ? '#d4af37' : '#f5f5f5',
                    opacity: isHovered ? 1 : 0.55,
                  }}
                >
                  {formatPrice(car.basePrice)}
                </p>

                {/* Hover hint line */}
                <motion.div
                  className="mt-3 h-px"
                  style={{ backgroundColor: '#d4af37' }}
                  initial={{ width: 0 }}
                  animate={{
                    width: isHovered ? 48 : 0,
                    transition: { duration: 0.25, ease: [0, 0, 0.2, 1] },
                  }}
                />

                {/* Engine rev sound button */}
                <RevButton carId={car.id} />
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
