'use client';
/**
 * SceneLighting — Immutable lighting setup.
 * Lives in SceneCanvas. Never modified per-car. Never duplicated.
 */
import { Environment } from '@react-three/drei';

export default function SceneLighting() {
  return (
    <>
      {/* Ambient fill */}
      <ambientLight intensity={0.4} />

      {/* Key light — upper right front */}
      <directionalLight
        position={[5, 8, 3]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.1}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Fill light — lower left rear */}
      <directionalLight position={[-4, 2, -3]} intensity={0.3} />

      {/* HDR environment for PBR reflections — not rendered as background */}
      <Environment preset="studio" background={false} />
    </>
  );
}
