'use client';
/**
 * ModelTaycan — Porsche Panamera Turbo S Sport Turismo 3D model.
 * Loads GLB from /models/taycan.glb
 * No scene cloning — direct scene rendering for performance
 * (this model has 704 meshes / 1418 nodes).
 */
import { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { CAR_REGISTRY } from '@/data/cars';

const MODEL_PATH = '/models/taycan.glb';
const SCALE = CAR_REGISTRY['taycan'].scale;
const TARGET_SIZE = 6.5;

const SKIP_KEYWORDS = ['glass', 'window', 'light', 'tire', 'tyre', 'wheel', 'rim', 'chrome', 'rubber', 'interior', 'seat', 'dash', 'sticker', 'plate', 'logo', 'emblem', 'grille', 'grill', 'brake', 'transmission'];
const BODY_KEYWORDS = ['body', 'paint', 'coat', 'exterior', 'shell', 'door', 'fender', 'hood', 'trunk', 'bumper', 'panel'];
const INTERIOR_KEYWORDS = ['interior', 'seat', 'dash', 'dashboard', 'leather', 'trim', 'cabin', 'uphol', 'fabric', 'carpet', 'console', 'steering', 'colour'];

useGLTF.preload(MODEL_PATH);

export default function ModelTaycan() {
  const { selectedColor } = useConfiguratorStore();
  const bodyColor = selectedColor || CAR_REGISTRY['taycan'].defaultColor;
  const interiorColor = '#1A1A1A';
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

  // Apply interior color to interior meshes
  useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const mat = child.material as THREE.MeshStandardMaterial;
      if (!mat?.color) return;
      const n = (child.name + ' ' + (mat.name || '')).toLowerCase();
      if (INTERIOR_KEYWORDS.some(kw => n.includes(kw))) {
        mat.color.set(interiorColor);
        mat.needsUpdate = true;
      }
    });
  }, [scene, interiorColor]);

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
