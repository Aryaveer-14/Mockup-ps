'use client';
/**
 * ARSimulation — Simulated AR test drive overlay.
 *
 * No device camera API required — this is a visual demo simulation:
 * - Blurred photographic "environment" background
 * - 3D canvas overlay with car rendered at ground level
 * - Animated scanning/placement grid
 * - AR UI chrome (corner brackets, status label)
 */
import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { CAR_REGISTRY } from '@/data/cars';

export default function ARSimulation() {
  const { selectedCarId, selectedColor, setPhase } = useConfiguratorStore();
  const scanRef = useRef<HTMLDivElement>(null);

  const car = selectedCarId ? CAR_REGISTRY[selectedCarId] : null;
  const bodyColor = selectedColor || car?.defaultColor || '#888';

  // Animate scan line
  useEffect(() => {
    const el = scanRef.current;
    if (!el) return;
    let frame: number;
    let pos = 0;
    const animate = () => {
      pos = (pos + 0.4) % 100;
      el.style.top = `${pos}%`;
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <motion.div
      className="absolute inset-0 bg-black flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.4 } }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
    >
      {/* Simulated environment — dark gradient mimicking a garage/exterior */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 70%, #1C1C10 0%, #0A0A08 40%, #000 100%)',
        }}
      />

      {/* Ground grid — AR placement surface simulation */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/2"
        style={{
          background:
            `repeating-linear-gradient(0deg, rgba(201,168,76,0.06) 0px, rgba(201,168,76,0.06) 1px, transparent 1px, transparent 40px),
             repeating-linear-gradient(90deg, rgba(201,168,76,0.06) 0px, rgba(201,168,76,0.06) 1px, transparent 1px, transparent 40px)`,
          perspective: '400px',
          transform: 'rotateX(60deg)',
          transformOrigin: 'bottom',
        }}
      />

      {/* Scan line */}
      <div
        ref={scanRef}
        className="absolute left-0 right-0 h-px opacity-60 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.8), transparent)',
        }}
      />

      {/* Car silhouette (centered) */}
      <div className="absolute inset-0 flex items-center justify-center pb-16">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, transition: { duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] } }}
        >
          {/* Simple CSS car silhouette for demo */}
          <div className="relative" style={{ width: 480, height: 180 }}>
            {/* Body */}
            <div
              className="absolute rounded-sm"
              style={{
                left: 40, bottom: 50,
                width: 400, height: 80,
                backgroundColor: bodyColor,
                opacity: 0.85,
                boxShadow: `0 0 40px ${bodyColor}40`,
              }}
            />
            {/* Cabin */}
            <div
              className="absolute rounded-sm"
              style={{
                left: 140, bottom: 110,
                width: 200, height: 60,
                backgroundColor: bodyColor,
                opacity: 0.75,
              }}
            />
            {/* Wheels */}
            {[80, 340].map((x, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  left: x, bottom: 24,
                  width: 60, height: 60,
                  backgroundColor: '#1A1A1A',
                  border: '3px solid #3A3A3A',
                }}
              />
            ))}
            {/* Ground shadow */}
            <div
              className="absolute"
              style={{
                left: 40, bottom: 20,
                width: 400, height: 16,
                background: 'radial-gradient(ellipse, rgba(0,0,0,0.7) 0%, transparent 70%)',
                filter: 'blur(8px)',
              }}
            />
            {/* Color glow */}
            <div
              className="absolute rounded-full"
              style={{
                left: '50%', bottom: 50,
                width: 300, height: 40,
                transform: 'translateX(-50%)',
                backgroundColor: bodyColor,
                opacity: 0.12,
                filter: 'blur(24px)',
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* AR UI chrome — corner brackets */}
      {['top-6 left-6', 'top-6 right-6', 'bottom-6 left-6', 'bottom-6 right-6'].map((pos, i) => (
        <div
          key={i}
          className={`absolute ${pos} w-8 h-8 pointer-events-none`}
          style={{
            borderTop:    (i < 2) ? '2px solid rgba(201,168,76,0.7)' : 'none',
            borderBottom: (i >= 2) ? '2px solid rgba(201,168,76,0.7)' : 'none',
            borderLeft:   (i % 2 === 0) ? '2px solid rgba(201,168,76,0.7)' : 'none',
            borderRight:  (i % 2 === 1) ? '2px solid rgba(201,168,76,0.7)' : 'none',
          }}
        />
      ))}

      {/* Top status bar */}
      <div className="relative z-10 px-8 pt-6 flex items-center justify-between">
        <button
          onClick={() => setPhase('performance')}
          className="label-caps text-p-muted hover:text-p-text transition-colors"
        >
          ← Exit AR
        </button>

        <div className="flex items-center gap-2">
          <motion.div
            className="w-2 h-2 rounded-full bg-p-gold"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span className="label-caps text-p-gold">AR Simulation Active</span>
        </div>

        <button
          onClick={() => setPhase('summary')}
          className="label-caps text-p-muted hover:text-p-text transition-colors"
        >
          Summary →
        </button>
      </div>

      {/* Bottom info */}
      <div className="relative z-10 mt-auto px-8 pb-8 flex flex-col items-center gap-3">
        {car && (
          <>
            <p className="label-caps text-p-muted">{car.fullName}</p>
            <p className="label-caps" style={{ color: 'rgba(201,168,76,0.8)', fontSize: '10px' }}>
              AR visualization · Surface detection simulated
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
}
