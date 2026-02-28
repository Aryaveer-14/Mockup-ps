'use client';
/**
 * ModelTaycan — Porsche Taycan Turbo 3D model.
 * Shares the same pattern as Model911 for consistency + merge safety.
 * Scale: 1.0
 */
import { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { CAR_REGISTRY } from '@/data/cars';

const MODEL_PATH = '/models/taycan.glb';
const SCALE = CAR_REGISTRY['taycan'].scale;

function Placeholder({ color }: { color: string }) {
  return (
    <group scale={[SCALE, SCALE, SCALE]}>
      {/* Body — Taycan is wider, lower */}
      <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.0, 0.58, 4.7]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.88, 0.2]} castShadow>
        <boxGeometry args={[1.75, 0.48, 2.3]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.4} />
      </mesh>
      {/* Wheels */}
      {([[-1.0, 0.24, 1.55], [1.0, 0.24, 1.55], [-1.0, 0.24, -1.55], [1.0, 0.24, -1.55]] as [number,number,number][]).map((pos, i) => (
        <mesh key={i} position={pos} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.26, 0.24, 24]} />
          <meshStandardMaterial color="#1A1A1A" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 8]} />
        <shadowMaterial opacity={0.35} />
      </mesh>
    </group>
  );
}

export default function ModelTaycan() {
  const { selectedColor } = useConfiguratorStore();
  const bodyColor = selectedColor || CAR_REGISTRY['taycan'].defaultColor;

  let gltfResult: ReturnType<typeof useGLTF> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    gltfResult = useGLTF(MODEL_PATH);
  } catch {
    gltfResult = null;
  }

  const groupRef = useRef<THREE.Group>(null);

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
    <group ref={groupRef} scale={[SCALE, SCALE, SCALE]}>
      <primitive object={gltfResult.scene} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[8, 10]} />
        <shadowMaterial opacity={0.35} />
      </mesh>
    </group>
  );
}
