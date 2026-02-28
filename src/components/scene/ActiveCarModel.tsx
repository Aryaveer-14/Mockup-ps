'use client';
/**
 * ActiveCarModel — Conditionally renders the correct car model.
 * This is the ONLY place where model mounting/unmounting happens.
 *
 * Rules:
 * - Each model is wrapped in <Suspense> — loading never crashes the scene.
 * - useGLTF.preload() is called at module level for all 3 models.
 * - Lighting is NOT inside car components. It lives in SceneLighting.
 */
import { Suspense } from 'react';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import Model911 from './models/Model911';
import ModelTaycan from './models/ModelTaycan';
import ModelCayenne from './models/ModelCayenne';

// Preload all models at module load time — never on demand
// (Comment out in dev if models aren't present yet — uses placeholder geometry fallback)
// import { useGLTF } from '@react-three/drei';
// useGLTF.preload('/models/911.glb');
// useGLTF.preload('/models/taycan.glb');
// useGLTF.preload('/models/cayenne.glb');

// Fallback geometry shown while model loads
function LoadingMesh() {
  return (
    <mesh position={[0, 0.5, 0]}>
      <boxGeometry args={[2, 0.6, 4]} />
      <meshStandardMaterial color="#1C1C1C" wireframe />
    </mesh>
  );
}

export default function ActiveCarModel() {
  const { selectedCarId } = useConfiguratorStore();

  if (!selectedCarId) return null;

  return (
    <Suspense fallback={<LoadingMesh />}>
      {selectedCarId === '911'     && <Model911 />}
      {selectedCarId === 'taycan'  && <ModelTaycan />}
      {selectedCarId === 'cayenne' && <ModelCayenne />}
    </Suspense>
  );
}
