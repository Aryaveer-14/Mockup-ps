'use client';
/**
 * CarLabel — Premium 3D text label rendered in world-space below each car.
 *
 * Uses @react-three/drei `Text` (troika-three-text / SDF) for crisp,
 * lightweight rendering. Three lines stacked vertically:
 *   1. Model name   — large, semi-bold, soft white, wide tracking
 *   2. Specs / tag  — smaller, muted, 70 % opacity
 *   3. Price        — Porsche gold accent with subtle emissive glow
 *
 * Fade-in via animated opacity on mount.
 */
import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface CarLabelProps {
  /** Short model name, e.g. "911 Turbo S" */
  name: string;
  /** Specs tagline, e.g. "650 PS · PDK · AWD" */
  tagline: string;
  /** Formatted price string, e.g. "€ 230.700" */
  price: string;
  /** World-space position — should sit below the glowing disk */
  position?: [number, number, number];
}

const GOLD = '#d4af37';
const SOFT_WHITE = '#f5f5f5';

export default function CarLabel({
  name,
  tagline,
  price,
  position = [0, -0.6, 0],
}: CarLabelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [visible, setVisible] = useState(false);

  // Trigger fade-in after mount
  useEffect(() => {
    const id = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(id);
  }, []);

  // Smooth opacity fade-in
  const opacity = useRef(0);
  useFrame((_s, delta) => {
    const target = visible ? 1 : 0;
    opacity.current = THREE.MathUtils.lerp(opacity.current, target, delta * 2.5);
    if (!groupRef.current) return;
    groupRef.current.traverse((child) => {
      if ((child as THREE.Mesh).material) {
        const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        if (mat.opacity !== undefined) mat.opacity = opacity.current;
      }
    });
  });

  return (
    <group ref={groupRef} position={position}>
      {/* ── Model name ── */}
      <Text
        position={[0, 0, 0]}
        fontSize={0.38}
        letterSpacing={0.12}
        color={SOFT_WHITE}
        anchorX="center"
        anchorY="top"
        font={undefined} // system sans-serif via default
        material-transparent={true}
        material-opacity={0}
        material-depthWrite={false}
      >
        {name}
      </Text>

      {/* ── Tagline / specs ── */}
      <Text
        position={[0, -0.48, 0]}
        fontSize={0.17}
        letterSpacing={0.08}
        color={SOFT_WHITE}
        anchorX="center"
        anchorY="top"
        material-transparent={true}
        material-opacity={0}
        material-depthWrite={false}
      >
        {tagline}
      </Text>

      {/* ── Price — gold accent with emissive glow ── */}
      <Text
        position={[0, -0.82, 0]}
        fontSize={0.22}
        letterSpacing={0.06}
        color={GOLD}
        anchorX="center"
        anchorY="top"
        material-depthWrite={false}
      >
        {price}
        <meshStandardMaterial
          color={GOLD}
          emissive={GOLD}
          emissiveIntensity={0.6}
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </Text>
    </group>
  );
}
