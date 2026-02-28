'use client';
/**
 * CameraRig — Lerp-based camera controller.
 *
 * Rules:
 * - Never teleport. Always lerp position + target.
 * - No camera shake, no procedural noise.
 * - Orbit enabled only in 'configurator' phase.
 * - Angular velocity implicitly limited by lerp factor.
 */
import { useRef, useEffect, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { CAR_REGISTRY, CameraPreset } from '@/data/cars';

const FALLBACK_PRESET: CameraPreset = { position: [0, 2, 14], target: [0, 0.5, 0], fov: 50 };

// Phase + activeStep → camera preset resolver
function resolvePreset(
  phase: string,
  carId: string | null,
  activeStep: string | null,
): CameraPreset {
  if (phase === 'selection' || !carId) {
    return FALLBACK_PRESET;
  }

  const car = CAR_REGISTRY[carId as keyof typeof CAR_REGISTRY];
  if (!car) return FALLBACK_PRESET;

  switch (phase) {
    case 'selection':
      return car.selectionCameraPreset ?? FALLBACK_PRESET;
    case 'configurator':
      if (activeStep === 'wheels') return car.wheelsCameraPreset ?? car.cameraPreset ?? FALLBACK_PRESET;
      return car.cameraPreset ?? FALLBACK_PRESET;
    case 'performance': {
      const cp = car.cameraPreset ?? FALLBACK_PRESET;
      return {
        position: [cp.position[0] * 0.8, 0.8, cp.position[2] * 0.8],
        target:   [0, 0.3, 0],
        fov:      45,
      };
    }
    case 'summary':
      return {
        position: [3, 1.4, 3.5],
        target:   [0, 0.3, 0],
        fov:      48,
      };
    default:
      return car.cameraPreset ?? FALLBACK_PRESET;
  }
}

export default function CameraRig() {
  const { camera } = useThree();
  const { phase, selectedCarId, activeStep } = useConfiguratorStore();

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const orbitRef = useRef<any>(null);
  const targetPosition = useRef(new THREE.Vector3(0, 2, 14));
  const targetLookAt   = useRef(new THREE.Vector3(0, 0.5, 0));
  const currentLookAt  = useRef(new THREE.Vector3(0, 0.5, 0));

  const viewingWheels = phase === 'configurator' && activeStep === 'wheels';

  // Resolve the current preset once for both the effect and render
  const preset = useMemo(
    () => resolvePreset(phase, selectedCarId, activeStep),
    [phase, selectedCarId, activeStep],
  );

  // Update targets when phase/car changes
  useEffect(() => {
    targetPosition.current.set(...preset.position);
    targetLookAt.current.set(...preset.target);

    (camera as THREE.PerspectiveCamera).fov = preset.fov;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  }, [preset, camera]);

  useFrame(() => {
    // ── Smooth lerp ──
    camera.position.lerp(targetPosition.current, 0.04);
    currentLookAt.current.lerp(targetLookAt.current, 0.04);
    camera.lookAt(currentLookAt.current);
  });

  return (
    <>
      {phase === 'configurator' && (
        <OrbitControls
          ref={orbitRef}
          /* ── Interaction ── */
          enableRotate
          enablePan={false}
          enableZoom={viewingWheels}
          /* ── Auto-rotate (off for wheels) ── */
          autoRotate={!viewingWheels}
          autoRotateSpeed={0.4}
          /* ── Polar angle limits ── */
          minPolarAngle={viewingWheels ? Math.PI / 4 : Math.PI / 6}
          maxPolarAngle={viewingWheels ? Math.PI / 2 : Math.PI / 2.2}
          /* ── Zoom limits ── */
          minDistance={viewingWheels ? 2 : undefined}
          maxDistance={viewingWheels ? 6 : undefined}
          /* ── Damping for smooth feel ── */
          enableDamping
          dampingFactor={0.05}
          /* ── Exterior target ── */
          target={[0, 0.3, 0] as unknown as THREE.Vector3}
        />
      )}
    </>
  );
}
