'use client';
/**
 * CarCinematicScene — Premium R3F cinematic with realistic car approach.
 *
 * Timeline (driven by useFrame):
 *   0.0–1.0s  Darkness, ambient barely rises
 *   1.0–2.0s  Car silhouette visible far away, dim key light
 *   2.0–3.5s  Headlights gradually ignite (emissive ramp)
 *   3.5–6.2s  Car glides toward camera (luxury ease)
 *   6.2–7.0s  Headlights ramp to blinding, glow fills frame
 *   7.0s      Hard cut — onComplete fires
 *
 * Camera:
 *   Slight push-in during approach + vertical micro-drift for realism.
 */

import React, { useRef, useEffect, useMemo, Suspense, Component } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { assetUrl } from '@/lib/basePath';

const MODEL_911 = assetUrl('/models/911.glb');

// Preload so the model is cached before Suspense mounts — prevents fallback flash
useGLTF.preload(MODEL_911);

// ─── Timing ──────────────────────────────────────────────────────────────────

const T = {
  AMBIENT_DUR:   1.0,
  KEY_START:     1.0,
  KEY_DUR:       1.0,
  HL_START:      2.0,
  HL_FULL:       3.5,
  MOVE_START:    3.5,
  MOVE_END:      6.2,
  FLASH_START:   6.2,
  FLASH_PEAK:    7.0,
  SCENE_END:     7.0,
} as const;

const CAR_Z_FAR  = -40;
const CAR_Z_NEAR =   2.8;

// ─── Easing ──────────────────────────────────────────────────────────────────

function clamp01(v: number) { return Math.max(0, Math.min(1, v)); }
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

/** Luxury ease — slow start, long sustain, gentle decel */
function luxuryEase(t: number) {
  // Custom quintic S-curve
  const t2 = t * t;
  const t3 = t2 * t;
  return 6 * t3 * t2 - 15 * t2 * t2 + 10 * t3;
}

/** Smooth quadratic in */
function easeInQuad(t: number) { return t * t; }

/** Sine micro-drift for camera realism */
function microDrift(t: number, freq: number, amp: number) {
  return Math.sin(t * freq * Math.PI * 2) * amp;
}

// ─── Error boundary ──────────────────────────────────────────────────────────

interface EBProps { children: React.ReactNode; fallback: React.ReactNode }
interface EBState { hasError: boolean }

class ModelErrorBoundary extends Component<EBProps, EBState> {
  constructor(props: EBProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

// ─── GLB Car Model ───────────────────────────────────────────────────────────

function GlbCar() {
  const { scene } = useGLTF(MODEL_911);
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;
    const box = new THREE.Box3().setFromObject(groupRef.current);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim === 0) return;
    const s = 5.5 / maxDim;
    groupRef.current.scale.setScalar(s);
    groupRef.current.position.set(-center.x * s, -box.min.y * s, -center.z * s);

    // Dark paint for silhouette presence
    scene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (mat.color) {
          mat.color.set('#111111');
          mat.metalness = 0.92;
          mat.roughness = 0.18;
          mat.envMapIntensity = 0.4;
          mat.needsUpdate = true;
        }
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
  }, [scene]);

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
    </group>
  );
}

// ─── Fallback car ────────────────────────────────────────────────────────────

function FallbackCar() {
  return (
    <group>
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[1.9, 0.52, 4.6]} />
        <meshStandardMaterial color="#0e0e0e" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.82, -0.35]}>
        <boxGeometry args={[1.55, 0.38, 2.1]} />
        <meshStandardMaterial color="#080808" metalness={0.92} roughness={0.15} />
      </mesh>
      {(
        [[-0.88, 0.16, 1.55], [0.88, 0.16, 1.55], [-0.88, 0.16, -1.55], [0.88, 0.16, -1.55]] as const
      ).map((pos, i) => (
        <mesh key={i} position={[pos[0], pos[1], pos[2]]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.26, 0.26, 0.16, 16]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Animated car + headlights ───────────────────────────────────────────────

interface AnimatedCarProps {
  onFlashIntensity: (v: number) => void;
  onComplete: () => void;
}

function AnimatedCar({ onFlashIntensity, onComplete }: AnimatedCarProps) {
  const group = useRef<THREE.Group>(null!);
  const leftPt = useRef<THREE.PointLight>(null!);
  const rightPt = useRef<THREE.PointLight>(null!);
  const leftOrb = useRef<THREE.Mesh>(null!);
  const rightOrb = useRef<THREE.Mesh>(null!);
  const keyLight = useRef<THREE.DirectionalLight>(null!);
  const ambientRef = useRef<THREE.AmbientLight>(null!);
  const t0 = useRef(0);
  const done = useRef(false);

  // Headlight emissive material — warm white, no bloom needed
  const hlMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffffff',
    emissive: new THREE.Color('#ffe4a0'),
    emissiveIntensity: 0,
    toneMapped: false,
    transparent: true,
    opacity: 1,
  }), []);

  useFrame((state) => {
    if (t0.current === 0) t0.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - t0.current;
    if (!group.current) return;

    // ── Ambient ──
    if (ambientRef.current) {
      ambientRef.current.intensity = clamp01(t / T.AMBIENT_DUR) * 0.08;
    }

    // ── Key light ── subtle directional silhouette
    if (keyLight.current) {
      const keyP = clamp01((t - T.KEY_START) / T.KEY_DUR);
      keyLight.current.intensity = keyP * 0.35;
    }

    // ── Car position ── luxury ease
    const moveP = luxuryEase(clamp01((t - T.MOVE_START) / (T.MOVE_END - T.MOVE_START)));
    group.current.position.z = lerp(CAR_Z_FAR, CAR_Z_NEAR, moveP);

    // ── Headlight glow ── smooth quadratic ramp
    const hlNorm = easeInQuad(clamp01((t - T.HL_START) / (T.HL_FULL - T.HL_START)));

    // ── Flash ramp ── fill the frame
    const flashP = clamp01((t - T.FLASH_START) / (T.FLASH_PEAK - T.FLASH_START));
    const flashCurve = flashP * flashP * flashP; // cubic ramp

    const totalHL = hlNorm + flashCurve * 14;

    // Point lights
    const ptI = totalHL * 3.5;
    if (leftPt.current) leftPt.current.intensity = ptI;
    if (rightPt.current) rightPt.current.intensity = ptI;

    // Emissive orbs
    hlMat.emissiveIntensity = Math.min(totalHL * 2.5, 18);
    const orbScale = 1 + flashCurve * 5;
    if (leftOrb.current) leftOrb.current.scale.setScalar(orbScale);
    if (rightOrb.current) rightOrb.current.scale.setScalar(orbScale);

    // Flash overlay callback
    onFlashIntensity(flashCurve);

    // ── Done ──
    if (t >= T.SCENE_END && !done.current) {
      done.current = true;
      onComplete();
    }
  });

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0} color="#6677aa" />

      {/* Subtle top-right key for silhouette sculpting */}
      <directionalLight
        ref={keyLight}
        position={[5, 8, 3]}
        intensity={0}
        color="#8899cc"
      />

      <group ref={group} position={[0, 0, CAR_Z_FAR]}>
        <ModelErrorBoundary fallback={<FallbackCar />}>
          <Suspense fallback={null}>
            <GlbCar />
          </Suspense>
        </ModelErrorBoundary>

        {/* ── Left headlight ── */}
        <mesh ref={leftOrb} position={[-0.62, 0.52, 2.25]} material={hlMat}>
          <sphereGeometry args={[0.09, 12, 12]} />
        </mesh>
        <pointLight
          ref={leftPt}
          position={[-0.62, 0.52, 2.5]}
          color="#ffe4a0"
          intensity={0}
          distance={50}
          decay={1.2}
        />

        {/* ── Right headlight ── */}
        <mesh ref={rightOrb} position={[0.62, 0.52, 2.25]} material={hlMat}>
          <sphereGeometry args={[0.09, 12, 12]} />
        </mesh>
        <pointLight
          ref={rightPt}
          position={[0.62, 0.52, 2.5]}
          color="#ffe4a0"
          intensity={0}
          distance={50}
          decay={1.2}
        />

        {/* Soft forward spill */}
        <pointLight position={[0, 0.1, 3]} color="#ffe4a0" intensity={0.2} distance={20} />
      </group>
    </>
  );
}

// ─── Cinematic camera with micro-drift + push-in ─────────────────────────────

function CinematicCamera() {
  const { camera } = useThree();
  const t0 = useRef(0);

  const CAM_START_Z = 8;
  const CAM_END_Z   = 5.5;

  useFrame((state) => {
    if (t0.current === 0) t0.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - t0.current;

    // Push-in
    const pushP = luxuryEase(clamp01(t / T.SCENE_END));
    const z = lerp(CAM_START_Z, CAM_END_Z, pushP);

    // Micro-drift
    const dx = microDrift(t, 0.08, 0.015);
    const dy = microDrift(t, 0.12, 0.008);

    camera.position.set(dx, 1.05 + dy, z);
    camera.lookAt(0, 0.45, 0);
  });

  return null;
}

// ─── Reflective ground ──────────────────────────────────────────────────────

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <planeGeometry args={[120, 120]} />
      <meshStandardMaterial color="#030303" metalness={0.85} roughness={0.35} />
    </mesh>
  );
}

// ─── Exported Canvas ─────────────────────────────────────────────────────────

interface CarCinematicSceneProps {
  onFlashIntensity: (v: number) => void;
  onComplete: () => void;
}

export default function CarCinematicScene({ onFlashIntensity, onComplete }: CarCinematicSceneProps) {
  return (
    <Canvas
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.5,
        powerPreference: 'default',
      }}
      camera={{ fov: 40, near: 0.1, far: 250, position: [0, 1.05, 8] }}
      style={{ background: '#000000' }}
      dpr={[1, 1.5]}
    >
      <CinematicCamera />
      <hemisphereLight color="#080818" groundColor="#000000" intensity={0.03} />
      <Ground />
      <AnimatedCar onFlashIntensity={onFlashIntensity} onComplete={onComplete} />
    </Canvas>
  );
}
