'use client';
/**
 * Model911 — Porsche 911 Turbo S 3D model.
 *
 * Swaps color material based on selectedColor in store.
 * If GLB is unavailable, falls back to placeholder geometry.
 *
 * Scale: 1.0 (911 is the reference size)
 */
import { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { CAR_REGISTRY } from '@/data/cars';

const MODEL_PATH = '/models/911.glb';
const SCALE = CAR_REGISTRY['911'].scale;

// Placeholder geometry when model file is not available
function Placeholder({ color }: { color: string }) {
  return (
    <group scale={[SCALE, SCALE, SCALE]}>
      {/* Body */}
      <mesh position={[0, 0.48, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.62, 4.3]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.95, 0.3]} castShadow>
        <boxGeometry args={[1.6, 0.52, 2.0]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Wheels */}
      {([[-0.95, 0.24, 1.3], [0.95, 0.24, 1.3], [-0.95, 0.24, -1.3], [0.95, 0.24, -1.3]] as [number,number,number][]).map((pos, i) => (
        <mesh key={i} position={pos} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.24, 0.22, 24]} />
          <meshStandardMaterial color="#1A1A1A" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
      {/* Shadow plane */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 8]} />
        <shadowMaterial opacity={0.35} />
      </mesh>
    </group>
  );
}

export default function Model911() {
  const { selectedColor } = useConfiguratorStore();
  const bodyColor = selectedColor || CAR_REGISTRY['911'].defaultColor;

  // Try loading the actual GLB; fall back to placeholder if it fails
  let gltfResult: ReturnType<typeof useGLTF> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    gltfResult = useGLTF(MODEL_PATH);
  } catch {
    gltfResult = null;
  }

  const groupRef = useRef<THREE.Group>(null);

  // Apply body color to exterior mesh materials
  useEffect(() => {
    if (!gltfResult?.scene) return;
    gltfResult.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const name = child.name.toLowerCase();
        if (name.includes('body') || name.includes('paint') || name.includes('exterior')) {
          const mat = child.material as THREE.MeshStandardMaterial;
          mat.color.set(bodyColor);
          mat.needsUpdate = true;
        }
      }
    });
  }, [gltfResult, bodyColor]);

  if (!gltfResult?.scene) {
    return <Placeholder color={bodyColor} />;
  }

  return (
    <group ref={groupRef} scale={[SCALE, SCALE, SCALE]} position={[0, 0, 0]}>
      <primitive object={gltfResult.scene} />
      {/* Ground shadow plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[8, 10]} />
        <shadowMaterial opacity={0.35} />
      </mesh>
    </group>
  );
}
