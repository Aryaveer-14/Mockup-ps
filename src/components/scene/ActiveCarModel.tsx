'use client';
/**
 * ActiveCarModel — Conditionally renders the correct car model.
 *
 * Selection phase: All 3 cars displayed side-by-side.
 *   - Each car has hover-driven Y rotation
 *   - Click a car → select + advance to configurator
 *   - Hovered car signals store for UI highlight
 *
 * Other phases: Only the selected car is shown.
 */
import { Suspense, useRef, useCallback } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { CarId } from '@/store/useConfiguratorStore';
import Model911 from './models/Model911';
import ModelTaycan from './models/ModelTaycan';
import ModelCayenne from './models/ModelCayenne';

// Fallback geometry shown while model loads
function LoadingMesh() {
  return (
    <mesh position={[0, 0.5, 0]}>
      <boxGeometry args={[2, 0.6, 4]} />
      <meshStandardMaterial color="#1C1C1C" wireframe />
    </mesh>
  );
}

// ─── Selection showcase slot ────────────────────────────────────────────────
interface CarSlotProps {
  carId: CarId;
  positionX: number;
  children: React.ReactNode;
}

function CarSlot({ carId, positionX, children }: CarSlotProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { hoveredCarId, setSelectedCar, setPhase, setHoveredCar, setIsSelecting, isSelecting } =
    useConfiguratorStore();

  const isHovered = hoveredCarId === carId;

  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    // Smooth turntable rotation; faster when hovered
    const speed = isHovered ? 0.6 : 0.2; // radians per second
    groupRef.current.rotation.y += speed * delta;
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
    <group
      ref={groupRef}
      position={[positionX, 0, 0]}
      scale={isHovered ? [1.05, 1.05, 1.05] : [1, 1, 1]}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {children}
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
          <CarSlot carId="911" positionX={-7}>
            <Model911 />
          </CarSlot>
        </Suspense>
        <Suspense fallback={<LoadingMesh />}>
          <CarSlot carId="taycan" positionX={0}>
            <ModelTaycan />
          </CarSlot>
        </Suspense>
        <Suspense fallback={<LoadingMesh />}>
          <CarSlot carId="cayenne" positionX={7}>
            <ModelCayenne />
          </CarSlot>
        </Suspense>
      </>
    );
  }

  if (!selectedCarId) return null;

  return (
    <Suspense fallback={<LoadingMesh />}>
      {selectedCarId === '911'     && <Model911 />}
      {selectedCarId === 'taycan'  && <ModelTaycan />}
      {selectedCarId === 'cayenne' && <ModelCayenne />}
    </Suspense>
  );
}
