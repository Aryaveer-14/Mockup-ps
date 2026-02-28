'use client';
/**
 * GlowingPlatform — Soft emissive circular disk beneath each car.
 *
 * Creates a floating light-stage effect with:
 * - Radial gradient fade via custom shader material
 * - Subtle warm white emission
 * - Transparency for premium look
 * - Reacts to hover via intensity prop
 * - Slight bloom interaction (handled by postprocessing)
 */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GlowingPlatformProps {
  position?: [number, number, number];
  radius?: number;
  color?: string;
  intensity?: number;
}

// Custom shader for radial gradient fade
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec2 vUv;

  void main() {
    // Distance from center (UV space centered at 0.5, 0.5)
    float dist = distance(vUv, vec2(0.5));

    // Smooth radial falloff — bright center, fading edges
    float alpha = smoothstep(0.5, 0.05, dist) * uIntensity;

    // Slight inner glow boost
    float innerGlow = smoothstep(0.25, 0.0, dist) * 0.35;

    gl_FragColor = vec4(uColor, (alpha + innerGlow) * 0.65);
  }
`;

export default function GlowingPlatform({
  position = [0, 0.01, 0],
  radius = 3.5,
  color = '#ffffff',
  intensity = 0.45,
}: GlowingPlatformProps) {
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: intensity },
    }),
    // Only recreate on color change — intensity is updated per-frame
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [color],
  );

  const matRef = useRef<THREE.ShaderMaterial>(null);
  const ringRef = useRef<THREE.MeshBasicMaterial>(null);

  // Smoothly animate intensity changes (e.g. hover transitions)
  useFrame(() => {
    if (matRef.current) {
      const cur = matRef.current.uniforms.uIntensity.value;
      matRef.current.uniforms.uIntensity.value += (intensity - cur) * 0.1;
    }
    if (ringRef.current) {
      const target = intensity > 0.4 ? 0.06 : 0.03;
      ringRef.current.opacity += (target - ringRef.current.opacity) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Main glowing disk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius, 64]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer soft ring for extra depth */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
        <ringGeometry args={[radius * 0.7, radius * 1.15, 64]} />
        <meshBasicMaterial
          ref={ringRef}
          color={color}
          transparent
          opacity={0.03}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
