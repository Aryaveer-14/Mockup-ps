'use client';
/**
 * ActiveCarModel — Conditionally renders the correct car model.
 *
 * Selection phase: All 3 cars displayed side-by-side.
 *   - Each car floats above a glowing disk platform
 *   - Smooth turntable Y-rotation (faster on hover)
 *   - Subtle sine-wave floating idle animation
 *   - Click a car → select + advance to configurator
 *
 * Other phases: Only the selected car is shown with platform + float.
 *
 * Hierarchy per slot:
 *   <group position={[slotX, 0, 0]}>          ← slot position
 *     <GlowingPlatform y≈0 />                 ← stationary disk on ground
 *     <group y={FLOAT_BASE}>                  ← raise car above disk
 *       <FloatingWrapper>                     ← sine-wave Y bobbing
 *         <group ref={rotationRef}>           ← turntable spin
 *           <CarModel />
 *         </group>
 *       </FloatingWrapper>
 *     </group>
 *   </group>
 */
import { Suspense, useRef, useCallback } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { CarId } from '@/store/useConfiguratorStore';
import Model911 from './models/Model911';
import ModelTaycan from './models/ModelTaycan';
import ModelCayenne from './models/ModelCayenne';
import GlowingPlatform from './GlowingPlatform';
import CarLabel from './CarLabel';
import { CAR_REGISTRY, formatPrice } from '@/data/cars';

/** How far above the platform the car base sits */
const FLOAT_BASE = 0.25;

// Fallback geometry shown while model loads
function LoadingMesh() {
  return (
    <mesh position={[0, 0.5, 0]}>
      <boxGeometry args={[2, 0.6, 4]} />
      <meshStandardMaterial color="#1C1C1C" wireframe />
    </mesh>
  );
}

// ─── Floating wrapper — applies subtle sine-wave idle animation ─────────────
interface FloatingWrapperProps {
  children: React.ReactNode;
  amplitude?: number;
  speed?: number;
  offset?: number;
}

function FloatingWrapper({
  children,
  amplitude = 0.05,
  speed = 0.8,
  offset = 0,
}: FloatingWrapperProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime() + offset;
    // Oscillate around 0 — the parent group handles the base elevation
    groupRef.current.position.y = Math.sin(t * speed) * amplitude;
  });

  return <group ref={groupRef}>{children}</group>;
}

// ─── Selection showcase slot ────────────────────────────────────────────────
interface CarSlotProps {
  carId: CarId;
  positionX: number;
  children: React.ReactNode;
  showLabel?: boolean;
}

function CarSlot({ carId, positionX, children, showLabel = false }: CarSlotProps) {
  const car = CAR_REGISTRY[carId];
  const rotationRef = useRef<THREE.Group>(null);
  const { hoveredCarId, setSelectedCar, setPhase, setHoveredCar, setIsSelecting, isSelecting } =
    useConfiguratorStore();

  const isHovered = hoveredCarId === carId;

  // Only the rotation group spins — doesn't affect float or disk
  useFrame((_state, delta) => {
    if (!rotationRef.current) return;
    const speed = isHovered ? 0.6 : 0.2;
    rotationRef.current.rotation.y += speed * delta;
  });

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setHoveredCar(carId);
      document.body.style.cursor = 'pointer';
    },
    [carId, setHoveredCar],
  );

  const handlePointerOut = useCallback(() => {
    setHoveredCar(null);
    document.body.style.cursor = 'default';
  }, [setHoveredCar]);

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (isSelecting) return;
      setIsSelecting(true);
      setSelectedCar(carId);
      setTimeout(() => {
        setPhase('configurator');
        setIsSelecting(false);
      }, 500);
    },
    [carId, isSelecting, setSelectedCar, setPhase, setIsSelecting],
  );

  return (
    <group position={[positionX, 0, 0]}>
      {/* ── Glowing disk — sits on the ground, never moves ── */}
      <GlowingPlatform
        position={[0, 0.01, 0]}
        radius={3.2}
        intensity={isHovered ? 0.65 : 0.35}
      />

      {/* ── 3D label directly under the car ── */}
      {showLabel && (
        <CarLabel
          name={car.name}
          tagline={car.tagline}
          price={formatPrice(car.basePrice)}
          position={[0, -0.55, 2.6]}
        />
      )}

      {/* ── Elevated base — lifts car above the disk ── */}
      <group position={[0, FLOAT_BASE, 0]}>
        {/* ── Float bobbing — smooth sine oscillation ── */}
        <FloatingWrapper amplitude={0.06} speed={0.7} offset={positionX * 1.3}>
          {/* ── Rotation — turntable spin only ── */}
          <group
            ref={rotationRef}
            scale={isHovered ? [1.05, 1.05, 1.05] : [1, 1, 1]}
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          >
            {children}
          </group>
        </FloatingWrapper>
      </group>
    </group>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
export default function ActiveCarModel() {
  const { selectedCarId, phase } = useConfiguratorStore();

  // Selection phase → show all 3 cars side-by-side
  if (phase === 'selection') {
    return (
      <>
        <Suspense fallback={<LoadingMesh />}>
          <CarSlot carId="911" positionX={-7} showLabel>
            <Model911 />
          </CarSlot>
        </Suspense>
        <Suspense fallback={<LoadingMesh />}>
          <CarSlot carId="taycan" positionX={0} showLabel>
            <ModelTaycan />
          </CarSlot>
        </Suspense>
        <Suspense fallback={<LoadingMesh />}>
          <CarSlot carId="cayenne" positionX={7} showLabel>
            <ModelCayenne />
          </CarSlot>
        </Suspense>
      </>
    );
  }

  if (!selectedCarId) return null;

  // Configurator / performance / summary — single car with platform + float
  return (
    <>
      <GlowingPlatform position={[0, 0.01, 0]} radius={4} intensity={0.5} />
      <group position={[0, FLOAT_BASE, 0]}>
        <FloatingWrapper amplitude={0.06} speed={0.5}>
          <Suspense fallback={<LoadingMesh />}>
            {selectedCarId === '911'     && <Model911 />}
            {selectedCarId === 'taycan'  && <ModelTaycan />}
            {selectedCarId === 'cayenne' && <ModelCayenne />}
          </Suspense>
        </FloatingWrapper>
      </group>
    </>
  );
}
