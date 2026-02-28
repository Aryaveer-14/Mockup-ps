'use client';
/**
 * SceneLighting — Cinematic Porsche showroom lighting.
 *
 * Setup:
 * - Soft ambient fill (low intensity)
 * - Two cool-white rim lights behind cars (left + right) for silhouette edge glow
 * - Top spotlight per car position for dramatic overhead illumination
 * - HDR environment for PBR reflections (not rendered as background)
 *
 * No expensive shadow maps — performance-first approach.
 */
import { Environment } from '@react-three/drei';

export default function SceneLighting() {
  return (
    <>
      {/* ── Soft ambient fill — very low for cinematic contrast ── */}
      <ambientLight intensity={0.15} color="#e8e4df" />

      {/* ── Rim light LEFT — cool white edge glow on car silhouettes ── */}
      <pointLight
        position={[-8, 3, -5]}
        intensity={0.6}
        color="#c8d4e8"
        distance={30}
        decay={2}
      />

      {/* ── Rim light RIGHT — matching cool white from opposite side ── */}
      <pointLight
        position={[8, 3, -5]}
        intensity={0.6}
        color="#c8d4e8"
        distance={30}
        decay={2}
      />

      {/* ── Top spotlight CENTER — primary key light overhead ── */}
      <spotLight
        position={[0, 12, 2]}
        angle={Math.PI / 6}
        penumbra={0.8}
        intensity={1.4}
        color="#fff5eb"
        distance={40}
        decay={2}
        target-position={[0, 0, 0]}
      />

      {/* ── Top spotlight LEFT (selection phase — above left car slot) ── */}
      <spotLight
        position={[-7, 10, 2]}
        angle={Math.PI / 7}
        penumbra={0.9}
        intensity={0.8}
        color="#fff5eb"
        distance={35}
        decay={2}
      />

      {/* ── Top spotlight RIGHT (selection phase — above right car slot) ── */}
      <spotLight
        position={[7, 10, 2]}
        angle={Math.PI / 7}
        penumbra={0.9}
        intensity={0.8}
        color="#fff5eb"
        distance={35}
        decay={2}
      />

      {/* ── Subtle fill from below — ground reflection simulation ── */}
      <pointLight
        position={[0, -1, 3]}
        intensity={0.08}
        color="#ffffff"
        distance={15}
        decay={2}
      />

      {/* HDR environment for PBR reflections — not rendered as background */}
      <Environment preset="studio" background={false} />
    </>
  );
}
