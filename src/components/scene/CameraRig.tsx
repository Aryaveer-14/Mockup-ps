'use client';
/**
 * CameraRig — Lerp-based camera controller.
 *
 * Rules:
 * - Never teleport. Always lerp position + target.
 * - No camera shake, no procedural noise.
 * - Orbit enabled only in 'configurator' phase.
 * - Angular velocity implicitly limited by lerp factor.
 *
 * Interior mode:
 * - Camera lerps to cockpit position, then hands off to OrbitControls.
 * - User can freely look around, zoom, and pan inside the cabin.
 * - OrbitControls target is set to the interior look-at point.
 */
import { useRef, useEffect, useMemo } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { CAR_REGISTRY, CameraPreset } from '@/data/cars';

// Phase + activeStep → camera preset resolver
function resolvePreset(
  phase: string,
  carId: string | null,
  activeStep: string | null,
  viewingInterior: boolean
): CameraPreset {
  if (phase === 'selection' || !carId) {
    return { position: [0, 2, 14], target: [0, 0.5, 0], fov: 50 };
  }

  const car = CAR_REGISTRY[carId as keyof typeof CAR_REGISTRY];

  switch (phase) {
    case 'selection':
      return car.selectionCameraPreset;
    case 'configurator':
      if (viewingInterior) return car.interiorCameraPreset;
      if (activeStep === 'wheels') return car.wheelsCameraPreset;
      return car.cameraPreset;
    case 'performance':
      return {
        position: [car.cameraPreset.position[0] * 0.8, 0.8, car.cameraPreset.position[2] * 0.8],
        target:   [0, 0.3, 0],
        fov:      45,
      };
    case 'summary':
      return {
        position: [3, 1.4, 3.5],
        target:   [0, 0.3, 0],
        fov:      48,
      };
    default:
      return car.cameraPreset;
  }
}

export default function CameraRig() {
  const { camera } = useThree();
  const { phase, selectedCarId, activeStep, viewingInterior } = useConfiguratorStore();

  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const orbitRef = useRef<any>(null);
  const targetPosition = useRef(new THREE.Vector3(0, 2, 14));
  const targetLookAt   = useRef(new THREE.Vector3(0, 0.5, 0));
  const currentLookAt  = useRef(new THREE.Vector3(0, 0.5, 0));
  // Track whether the initial interior lerp is still running
  const interiorTransitioning = useRef(false);

  const interiorMode = phase === 'configurator' && viewingInterior;

  const viewingWheels = phase === 'configurator' && activeStep === 'wheels';

  // Resolve the current preset once for both the effect and render
  const preset = useMemo(
    () => resolvePreset(phase, selectedCarId, activeStep, viewingInterior),
    [phase, selectedCarId, activeStep, viewingInterior],
  );

  // Update targets when phase/car/interior changes
  useEffect(() => {
    targetPosition.current.set(...preset.position);
    targetLookAt.current.set(...preset.target);

    (camera as THREE.PerspectiveCamera).fov = preset.fov;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();

    if (interiorMode) {
      // Begin transition lerp; OrbitControls takes over once close
      interiorTransitioning.current = true;

      // Point OrbitControls at the interior target immediately
      if (orbitRef.current) {
        orbitRef.current.target.set(...preset.target);
        orbitRef.current.update();
      }
    }
  }, [preset, camera, interiorMode]);

  // When leaving interior mode, reset OrbitControls target to exterior
  useEffect(() => {
    if (!interiorMode && orbitRef.current) {
      orbitRef.current.target.set(0, 0.3, 0);
      orbitRef.current.update();
    }
  }, [interiorMode]);

  useFrame(() => {
    if (interiorMode) {
      // During the approach, lerp camera toward cockpit. Once close, stop
      // and let OrbitControls provide full interactive control.
      if (interiorTransitioning.current) {
        const dist = camera.position.distanceTo(targetPosition.current);
        if (dist > 0.08) {
          camera.position.lerp(targetPosition.current, 0.1);
          // Don't call camera.lookAt — let OrbitControls handle orientation
          // so the handoff is seamless.
        } else {
          interiorTransitioning.current = false;
        }
      }
      // OrbitControls handles everything from here.
      return;
    }

    // ── Exterior / non-configurator: smooth lerp ──
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
          enablePan={interiorMode}
          enableZoom={interiorMode || viewingWheels}
          /* ── Auto-rotate exterior only (off for interior + wheels) ── */
          autoRotate={!interiorMode && !viewingWheels}
          autoRotateSpeed={0.4}
          /* ── Polar angle limits ── */
          minPolarAngle={interiorMode ? 0.1 : viewingWheels ? Math.PI / 4 : Math.PI / 6}
          maxPolarAngle={interiorMode ? Math.PI * 0.9 : viewingWheels ? Math.PI / 2 : Math.PI / 2.2}
          /* ── Zoom limits ── */
          minDistance={interiorMode ? 0.15 : viewingWheels ? 2 : undefined}
          maxDistance={interiorMode ? 2.5  : viewingWheels ? 6 : undefined}
          /* ── Damping for smooth feel ── */
          enableDamping
          dampingFactor={interiorMode ? 0.08 : 0.05}
          /* ── Pan limits (interior) ── */
          maxAzimuthAngle={interiorMode ? Math.PI    : Infinity}
          minAzimuthAngle={interiorMode ? -Math.PI   : -Infinity}
          /* ── Exterior target (interior target set via ref) ── */
          {...(!interiorMode && { target: [0, 0.3, 0] as unknown as THREE.Vector3 })}
        />
      )}
    </>
  );
}
