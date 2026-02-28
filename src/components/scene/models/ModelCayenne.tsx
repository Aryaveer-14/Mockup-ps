'use client';
/**
 * ModelCayenne — Porsche Cayenne Turbo GT 3D model.
 * Scale: 0.92 (SUV, slightly larger footprint)
 */
import { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { CAR_REGISTRY } from '@/data/cars';

const MODEL_PATH = '/models/cayenne.glb';
const SCALE = CAR_REGISTRY['cayenne'].scale;

function Placeholder({ color }: { color: string }) {
  return (
    <group scale={[SCALE, SCALE, SCALE]}>
      {/* Body — Cayenne is taller, wider */}
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.1, 0.88, 4.8]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 1.32, 0.15]} castShadow>
        <boxGeometry args={[1.9, 0.58, 2.4]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.4} />
      </mesh>
      {/* Wheels — taller ride height */}
      {([[-1.05, 0.36, 1.6], [1.05, 0.36, 1.6], [-1.05, 0.36, -1.6], [1.05, 0.36, -1.6]] as [number,number,number][]).map((pos, i) => (
        <mesh key={i} position={pos} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.36, 0.36, 0.28, 24]} />
          <meshStandardMaterial color="#1A1A1A" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[7, 9]} />
        <shadowMaterial opacity={0.35} />
      </mesh>
    </group>
  );
}

export default function ModelCayenne() {
  const { selectedColor } = useConfiguratorStore();
  const bodyColor = selectedColor || CAR_REGISTRY['cayenne'].defaultColor;

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
        <planeGeometry args={[9, 12]} />
        <shadowMaterial opacity={0.35} />
      </mesh>
    </group>
  );
}
