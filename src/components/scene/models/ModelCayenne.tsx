'use client';
/**
 * ModelCayenne — Porsche Cayenne Turbo GT 3D model.
 * Loads GLB from /models/cayenne.glb
 * No scene cloning — direct scene rendering.
 */
import { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { CAR_REGISTRY } from '@/data/cars';

const MODEL_PATH = '/models/cayenne.glb';
const SCALE = CAR_REGISTRY['cayenne'].scale;
const TARGET_SIZE = 6.5;

const SKIP_KEYWORDS = ['glass', 'window', 'light', 'tire', 'tyre', 'wheel', 'rim', 'chrome', 'rubber', 'interior', 'seat', 'dash', 'sticker', 'plate', 'logo', 'emblem', 'grille', 'grill', 'brake'];
const BODY_KEYWORDS = ['body', 'paint', 'coat', 'exterior', 'shell', 'door', 'fender', 'hood', 'trunk', 'bumper', 'panel'];

useGLTF.preload(MODEL_PATH);

export default function ModelCayenne() {
  const { selectedColor } = useConfiguratorStore();
  const bodyColor = selectedColor || CAR_REGISTRY['cayenne'].defaultColor;
  const groupRef = useRef<THREE.Group>(null);
  const centered = useRef(false);
  const { scene } = useGLTF(MODEL_PATH);

  // Enable shadows
  useEffect(() => {
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  // Apply body color
  useEffect(() => {
    if (!scene) return;
    let anyBodyMatch = false;
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const n = (child.name + ' ' + ((child.material as THREE.Material)?.name || '')).toLowerCase();
        if (BODY_KEYWORDS.some(kw => n.includes(kw)) && !SKIP_KEYWORDS.some(kw => n.includes(kw))) {
          anyBodyMatch = true;
        }
      }
    });
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const mat = child.material as THREE.MeshStandardMaterial;
      if (!mat?.color) return;
      const n = (child.name + ' ' + (mat.name || '')).toLowerCase();
      if (SKIP_KEYWORDS.some(kw => n.includes(kw))) return;
      if (anyBodyMatch) {
        if (BODY_KEYWORDS.some(kw => n.includes(kw))) {
          mat.color.set(bodyColor);
          mat.needsUpdate = true;
        }
      } else {
        const hsl = { h: 0, s: 0, l: 0 };
        mat.color.getHSL(hsl);
        if (hsl.l > 0.15 && hsl.l < 0.95) {
          mat.color.set(bodyColor);
          mat.needsUpdate = true;
        }
      }
    });
  }, [scene, bodyColor]);

  // Auto-center and normalize
  useEffect(() => {
    if (!groupRef.current || centered.current) return;
    const box = new THREE.Box3().setFromObject(groupRef.current);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim === 0) return;
    const scaleFactor = TARGET_SIZE / maxDim * SCALE;
    groupRef.current.scale.setScalar(scaleFactor);
    groupRef.current.position.set(
      -center.x * scaleFactor,
      -box.min.y * scaleFactor,
      -center.z * scaleFactor,
    );
    centered.current = true;
  }, [scene]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}
