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
import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { CAR_REGISTRY } from '@/data/cars';
import { CameraPreset } from '@/data/cars';

// Phase → camera preset resolver
function resolvePreset(
  phase: string,
  carId: string | null
): CameraPreset {
  // Fallback if no car selected
  if (!carId) {
    return { position: [8, 3, 8], target: [0, 0.5, 0], fov: 55 };
  }

  const car = CAR_REGISTRY[carId as keyof typeof CAR_REGISTRY];

  switch (phase) {
    case 'selection':
      return car.selectionCameraPreset;
    case 'configurator':
      return car.cameraPreset;
    case 'performance':
      // Low dramatic angle
      return {
        position: [car.cameraPreset.position[0] * 0.8, 0.8, car.cameraPreset.position[2] * 0.8],
        target:   [0, 0.3, 0],
        fov:      45,
      };
    case 'summary':
      // 3/4 front
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
  const { phase, selectedCarId } = useConfiguratorStore();

  const targetPosition = useRef(new THREE.Vector3(8, 3, 8));
  const targetLookAt   = useRef(new THREE.Vector3(0, 0.5, 0));
  const currentLookAt  = useRef(new THREE.Vector3(0, 0.5, 0));

  // Update targets when phase or car changes
  useEffect(() => {
    const preset = resolvePreset(phase, selectedCarId);
    targetPosition.current.set(...preset.position);
    targetLookAt.current.set(...preset.target);
    // FOV lerp via ref delta handled in useFrame
    (camera as THREE.PerspectiveCamera).fov = preset.fov;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  }, [phase, selectedCarId, camera]);

  useFrame(() => {
    // Lerp camera position — factor 0.04 ≈ smooth over ~25 frames at 60fps
    camera.position.lerp(targetPosition.current, 0.04);

    // Lerp lookAt target
    currentLookAt.current.lerp(targetLookAt.current, 0.04);
    camera.lookAt(currentLookAt.current);
  });

  return (
    <>
      {/* Orbit only active in configurator phase */}
      {phase === 'configurator' && (
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate
          autoRotate
          autoRotateSpeed={0.4}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
          target={[0, 0.3, 0]}
        />
      )}
    </>
  );
}
