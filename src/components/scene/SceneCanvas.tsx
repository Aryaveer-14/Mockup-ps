'use client';
/**
 * SceneCanvas — Single persistent React Three Fiber canvas.
 *
 * Premium Porsche showroom environment:
 * - Deep dark background with fog for depth
 * - Bloom postprocessing for glowing elements
 * - Background Porsche logo (atmospheric)
 * - Faint ground reflection plane
 * - No expensive shadows — performance-first
 */
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import SceneLighting from './SceneLighting';
import CameraRig from './CameraRig';
import ActiveCarModel from './ActiveCarModel';
import BackgroundLogo from './BackgroundLogo';

/** Subtle ground reflection plane */
function GroundReflection() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial
        color="#050505"
        roughness={0.85}
        metalness={0.15}
        transparent
        opacity={0.9}
      />
    </mesh>
  );
}

export default function SceneCanvas() {
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{
        antialias:    true,
        toneMapping:  2, // ACESFilmicToneMapping
        toneMappingExposure: 0.95,
      }}
      camera={{
        fov:      50,
        near:     0.1,
        far:      200,
        position: [0, 2, 14],
      }}
      style={{ background: '#050508' }}
    >
      {/* ── Fog for depth — pushed back so wordmark stays visible ── */}
      <fog attach="fog" args={['#000000', 12, 40]} />

      {/* ── Deep background color ── */}
      <color attach="background" args={['#030306']} />

      {/* ── Cinematic lighting ── */}
      <SceneLighting />

      {/* ── Camera controller ── */}
      <CameraRig />

      {/* ── Subtle ground reflection ── */}
      <GroundReflection />

      {/* ── Glowing Porsche wordmark — filling the dark upper background ── */}
      <BackgroundLogo position={[0, 6.5, -18]} width={55} opacity={0.12} />

      {/* ── Active car model with platforms + floating ── */}
      <ActiveCarModel />

      {/* ── Bloom postprocessing — affects glowing platforms, logo, highlights ── */}
      <EffectComposer>
        <Bloom
          intensity={0.45}
          luminanceThreshold={0.55}
          luminanceSmoothing={0.35}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
