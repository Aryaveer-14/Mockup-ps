'use client';
/**
 * BackgroundLogo — Porsche wordmark floating in the dark background.
 *
 * Renders the distinctive Porsche wordmark using canvas for reliable
 * cross-browser rendering. White text on transparent background with
 * additive blending creates a glowing effect against the dark scene.
 * Subtle breathing pulse animation.
 */
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BackgroundLogoProps {
  position?: [number, number, number];
  width?: number;
  opacity?: number;
}

/** Render the Porsche wordmark to a canvas texture at high resolution */
function useWordmarkTexture() {
  return useMemo(() => {
    const w = 2048;
    const h = 340;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, w, h);

    // Outer glow behind text
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Porsche wordmark — bold, wide-spaced, geometric sans-serif
    ctx.font = '700 160px "Arial Black", "Helvetica Neue", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '48px';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('PORSCHE', w / 2, h / 2);

    // Second pass for extra glow
    ctx.shadowBlur = 80;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.25)';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fillText('PORSCHE', w / 2, h / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return { texture, aspect: w / h };
  }, []);
}

export default function BackgroundLogo({
  position = [0, 6.5, -18],
  width = 55,
  opacity = 0.12,
}: BackgroundLogoProps) {
  const { texture, aspect } = useWordmarkTexture();
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  // Subtle breathing glow
  useFrame(({ clock }) => {
    if (!matRef.current) return;
    const t = clock.getElapsedTime();
    matRef.current.opacity = opacity + Math.sin(t * 0.3) * 0.02;
  });

  const height = width / aspect;

  return (
    <mesh position={position}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        ref={matRef}
        map={texture}
        transparent
        opacity={opacity}
        depthWrite={false}
        side={THREE.DoubleSide}
        emissive="#ffffff"
        emissiveMap={texture}
        emissiveIntensity={0.4}
        toneMapped={false}
      />
    </mesh>
  );
}
