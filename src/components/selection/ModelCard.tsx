'use client';
/**
 * ModelCard — Single car selection card with refined interaction.
 *
 * Hover behavior:
 *  - Cursor-tracking CSS perspective tilt (±6° max)
 *  - Subtle scale (1.02) with spring physics
 *  - Border transitions to gold, faint gold glow
 *  - Thumbnail opacity lifts to 100%
 *  - CTA arrow nudges right
 *  - Signals hoveredCarId to store → 3D scene can react
 *
 * Selection behavior:
 *  - Selected card holds position, scales up slightly (1.04) then fades
 *  - Non-selected cards dismiss with staggered Y-slide + fade
 *  - Phase transition fires after dismiss animation
 *
 * Performance:
 *  - Only transform + opacity animated (compositor-friendly)
 *  - requestAnimationFrame for cursor tracking
 *  - will-change hint applied during hover only
 */
import { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import { CarConfig, formatPrice } from '@/data/cars';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';

interface ModelCardProps {
  car: CarConfig;
  index: number;
  /** Which car ID was selected (null = none yet) */
  selectedId: string | null;
  /** Whether the selection-dismiss animation is playing */
  isSelecting: boolean;
  /** Total card count – used for stagger calc */
  total: number;
}

// Spring config: snappy but not bouncy
const SPRING = { damping: 25, stiffness: 300, mass: 0.6 };
const TILT_MAX = 6; // degrees

export default function ModelCard({
  car,
  index,
  selectedId,
  isSelecting,
  total,
}: ModelCardProps) {
  const { setSelectedCar, setPhase, setHoveredCar, setIsSelecting } =
    useConfiguratorStore();

  const cardRef = useRef<HTMLButtonElement>(null);
  const rafRef = useRef<number>(0);
  const [isHovered, setIsHovered] = useState(false);

  // ------- Cursor-tracking tilt via motion values -------
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // Springs for smooth interpolation
  const springX = useSpring(mouseX, SPRING);
  const springY = useSpring(mouseY, SPRING);

  // Map normalised mouse → rotation
  const rotateY = useTransform(springX, [0, 1], [-TILT_MAX, TILT_MAX]);
  const rotateX = useTransform(springY, [0, 1], [TILT_MAX, -TILT_MAX]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!cardRef.current) return;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = cardRef.current!.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width;
        const ny = (e.clientY - rect.top) / rect.height;
        mouseX.set(nx);
        mouseY.set(ny);
      });
    },
    [mouseX, mouseY],
  );

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    setHoveredCar(car.id);
  }, [car.id, setHoveredCar]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setHoveredCar(null);
    cancelAnimationFrame(rafRef.current);
    // Reset tilt to center
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY, setHoveredCar]);

  // ------- Selection handler -------
  function handleSelect() {
    if (isSelecting) return; // prevent double click
    setIsSelecting(true);
    setSelectedCar(car.id);

    // Wait for dismiss animation to finish, then change phase
    setTimeout(() => {
      setPhase('configurator');
      setIsSelecting(false);
    }, 600);
  }

  // ------- Derive animation state -------
  const isSelectedCard = selectedId === car.id;
  const isDismissed = isSelecting && !isSelectedCard;

  // Stagger delay for dismiss: cards further from selected dismiss later
  const dismissDelay = (() => {
    if (!selectedId || !isSelecting) return 0;
    const selectedIndex = index; // will be overridden below
    return Math.abs(index - (selectedId === car.id ? index : 0)) * 0.06;
  })();

  // ------- Framer Motion variants -------
  // Entry animation
  const entryVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: 0.15 + index * 0.12,
        ease: [0, 0, 0.2, 1],
      },
    },
  };

  // Dismiss animation for non-selected cards
  const dismissVariant = {
    opacity: 0,
    y: 32,
    scale: 0.96,
    transition: {
      duration: 0.35,
      delay: index * 0.06,
      ease: [0.4, 0, 1, 1],
    },
  };

  // Selected card: brief scale pulse then fade
  const selectedVariant = {
    scale: 1.04,
    opacity: 0,
    transition: {
      duration: 0.5,
      ease: [0, 0, 0.2, 1],
    },
  };

  return (
    <motion.button
      ref={cardRef}
      onClick={handleSelect}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative flex flex-col overflow-hidden text-left
                 bg-p-elevated border border-p-border rounded-sm
                 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-p-gold"
      style={{
        perspective: 800,
        willChange: isHovered ? 'transform' : 'auto',
        // Gold glow on hover — subtle box-shadow
        boxShadow: isHovered
          ? '0 0 24px rgba(196, 162, 74, 0.12), 0 4px 16px rgba(0, 0, 0, 0.4)'
          : '0 2px 8px rgba(0, 0, 0, 0.3)',
        borderColor: isHovered ? 'var(--color-accent-gold)' : undefined,
        transition: 'box-shadow 200ms ease-out, border-color 120ms ease-out',
      }}
      // --- Motion ---
      variants={entryVariant}
      initial="hidden"
      animate={
        isDismissed
          ? dismissVariant
          : isSelectedCard && isSelecting
            ? selectedVariant
            : 'visible'
      }
    >
      {/* Inner wrapper for tilt — keeps border-radius clip correct */}
      <motion.div
        className="flex flex-col flex-1"
        style={{
          rotateX,
          rotateY,
          scale: isHovered ? 1.02 : 1,
          transformStyle: 'preserve-3d',
          transition: 'scale 250ms cubic-bezier(0, 0, 0.2, 1)',
        }}
      >
        {/* Thumbnail */}
        <div className="relative w-full aspect-video bg-p-bg overflow-hidden">
          <Image
            src={car.thumbnailPath}
            alt={car.fullName}
            fill
            className="object-cover transition-opacity duration-300"
            style={{ opacity: isHovered ? 1 : 0.8 }}
            onError={(e) => {
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
              style={{
                fontSize: 'var(--text-heading)',
                fontWeight: 'var(--fw-bold)',
              }}
            >
              {car.name}
            </h2>
          </div>

          {/* Tagline / spec */}
          <p
            className="text-p-muted"
            style={{
              fontSize: 'var(--text-label)',
              letterSpacing: 'var(--ls-wide)',
            }}
          >
            {car.tagline}
          </p>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Bottom row */}
          <div className="flex items-end justify-between pt-3 border-t border-p-border">
            <div>
              <p
                className="label-caps text-p-muted"
                style={{ fontSize: '10px' }}
              >
                From
              </p>
              <p
                className="text-p-text font-bold"
                style={{
                  fontSize: 'var(--text-body)',
                  letterSpacing: 'var(--ls-tight)',
                }}
              >
                {formatPrice(car.basePrice)}
              </p>
            </div>

            {/* Arrow CTA */}
            <span
              className="label-caps text-p-gold transition-transform duration-200"
              style={{
                transform: isHovered ? 'translateX(4px)' : 'translateX(0px)',
              }}
            >
              Configure →
            </span>
          </div>
        </div>
      </motion.div>
    </motion.button>
  );
}
