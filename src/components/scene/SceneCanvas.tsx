'use client';
/**
 * SceneCanvas — Single persistent React Three Fiber canvas.
 *
 * Rules:
 * - This component is mounted ONCE and never re-mounts.
 * - No lighting is defined here — lives in SceneLighting.
 * - No car-specific logic — lives in ActiveCarModel.
 * - Camera setup lives in CameraRig.
 */
import { Canvas } from '@react-three/fiber';
import SceneLighting from './SceneLighting';
import CameraRig from './CameraRig';
import ActiveCarModel from './ActiveCarModel';

export default function SceneCanvas() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{
        antialias:    true,
        toneMapping:  2, // ACESFilmicToneMapping
        toneMappingExposure: 1.0,
      }}
      camera={{
        fov:      50,
        near:     0.1,
        far:      200,
        position: [0, 2, 14],
      }}
      style={{ background: '#0A0A0A' }}
    >
      {/* Immutable lighting — one instance, always */}
      <SceneLighting />

      {/* Dynamic camera — lerps to correct position per phase */}
      <CameraRig />

      {/* Ground grid — subtle reference plane, just below car feet */}
      <gridHelper args={[30, 30, '#1C1C1C', '#141414']} position={[0, -0.01, 0]} />

      {/* Active car model — swaps based on selectedCarId */}
      <ActiveCarModel />
    </Canvas>
  );
}
