'use client';
/**
 * CarCinematicScene — R3F 3D scene for cinematic car intro.
 *
 * Sequence (driven by useFrame clock):
 *   0.0–0.5s : Ambient light fades up, scene barely visible
 *   0.5–1.5s : Car visible far away in dim light
 *   1.5–2.5s : Headlights glow on (emissive spheres + point lights)
 *   2.5–5.0s : Car glides toward camera
 *   5.0–5.5s : Headlights intensify to fill the frame
 *   5.5–5.8s : White flash overlay fires via callback
 *   5.8s      : Scene complete — onComplete fires
 */

import React, { useRef, useEffect, useMemo, Suspense, Component } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { assetUrl } from '@/lib/basePath';

// ─── Timing constants (seconds) ──────────────────────────────────────────────

const T = {
  AMBIENT_IN:       0.5,   // ambient light fade-in duration
  HL_START:         1.5,   // headlights begin glowing
  HL_FULL:          2.5,   // headlights at normal intensity
  MOVE_START:       2.5,   // car starts moving
  MOVE_END:         5.0,   // car reaches close position
  FLASH_START:      5.0,   // headlights ramp to blinding
  FLASH_PEAK:       5.5,   // peak flash
  SCENE_END:        5.8,   // scene fully done
} as const;

const CAR_Z_FAR  = -35;
const CAR_Z_NEAR =   3;

// ─── Math helpers ─────────────────────────────────────────────────────────────

function clamp01(v: number) { return Math.max(0, Math.min(1, v)); }
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

// ─── Error Boundary for GLB load failure ──────────────────────────────────────

interface ErrorBoundaryProps { children: React.ReactNode; fallback: React.ReactNode }
interface ErrorBoundaryState { hasError: boolean }

class ModelErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

// ─── GLB Car (loaded model) ──────────────────────────────────────────────────

function GlbCar() {
  const { scene } = useGLTF(assetUrl('/models/911.glb'));
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!groupRef.current) return;
    // Normalize size
    const box = new THREE.Box3().setFromObject(groupRef.current);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim === 0) return;
    const scaleFactor = 5.5 / maxDim;
    groupRef.current.scale.setScalar(scaleFactor);
    groupRef.current.position.set(
      -center.x * scaleFactor,
      -box.min.y * scaleFactor,
      -center.z * scaleFactor,
    );
    // Dark body tint for silhouette look
    scene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh && child.material) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (mat.color) {
          mat.color.set('#1a1a1a');
          mat.metalness = 0.9;
          mat.roughness = 0.25;
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

// ─── Fallback car (box geometry) ─────────────────────────────────────────────

function FallbackCar() {
  return (
    <group>
      {/* Body */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[1.8, 0.55, 4.5]} />
        <meshStandardMaterial color="#111" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.88, -0.3]}>
        <boxGeometry args={[1.5, 0.4, 2.0]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Wheels */}
      {(
        [[-0.85, 0.15, 1.5], [0.85, 0.15, 1.5], [-0.85, 0.15, -1.5], [0.85, 0.15, -1.5]] as const
      ).map((pos, i) => (
        <mesh key={i} position={[pos[0], pos[1], pos[2]]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.28, 0.28, 0.18, 16]} />
          <meshStandardMaterial color="#222" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Animated car + headlights group ─────────────────────────────────────────

interface AnimatedCarProps {
  onFlashIntensity: (v: number) => void;
  onComplete: () => void;
}

function AnimatedCar({ onFlashIntensity, onComplete }: AnimatedCarProps) {
  const group = useRef<THREE.Group>(null!);
  const leftLight = useRef<THREE.PointLight>(null!);
  const rightLight = useRef<THREE.PointLight>(null!);
  const leftGlow = useRef<THREE.Mesh>(null!);
  const rightGlow = useRef<THREE.Mesh>(null!);
  const ambient = useRef<THREE.AmbientLight>(null!);
  const started = useRef(0);
  const completed = useRef(false);

  const emissiveMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#ffffff',
        emissive: new THREE.Color('#ffe8a0'),
        emissiveIntensity: 0,
        toneMapped: false,
        transparent: true,
        opacity: 1,
      }),
    [],
  );

  useFrame((state: { clock: { elapsedTime: number } }) => {
    if (started.current === 0) started.current = state.clock.elapsedTime;
    const t = state.clock.elapsedTime - started.current;
    if (!group.current) return;

    // ── Ambient fade-in ──
    if (ambient.current) {
      ambient.current.intensity = clamp01(t / T.AMBIENT_IN) * 0.15;
    }

    // ── Car Z position ──
    const moveP = easeInOutCubic(clamp01((t - T.MOVE_START) / (T.MOVE_END - T.MOVE_START)));
    group.current.position.z = lerp(CAR_Z_FAR, CAR_Z_NEAR, moveP);

    // ── Headlight intensity (normal glow) ──
    const hlP = clamp01((t - T.HL_START) / (T.HL_FULL - T.HL_START));
    const hlBase = hlP * hlP; // quadratic ease-in

    // ── Flash ramp (blinding) ──
    const flashP = clamp01((t - T.FLASH_START) / (T.FLASH_PEAK - T.FLASH_START));
    const flashAdd = flashP * flashP * 12;

    const totalHL = hlBase + flashAdd;

    // Point lights
    const ptIntensity = totalHL * 4;
    if (leftLight.current) leftLight.current.intensity = ptIntensity;
    if (rightLight.current) rightLight.current.intensity = ptIntensity;

    // Emissive glow meshes
    const emI = Math.min(totalHL * 3, 15);
    emissiveMat.emissiveIntensity = emI;
    // Scale glow orbs up during flash for "fill the frame" effect
    const glowScale = 1 + flashP * 4;
    if (leftGlow.current) leftGlow.current.scale.setScalar(glowScale);
    if (rightGlow.current) rightGlow.current.scale.setScalar(glowScale);

    // Report flash intensity (0→1) for white overlay
    onFlashIntensity(flashP);

    // ── Scene end ──
    if (t >= T.SCENE_END && !completed.current) {
      completed.current = true;
      onComplete();
    }
  });

  return (
    <>
      <ambientLight ref={ambient} intensity={0} color="#8899bb" />

      <group ref={group} position={[0, 0, CAR_Z_FAR]}>
        {/* Car model (loaded or fallback) */}
        <ModelErrorBoundary fallback={<FallbackCar />}>
          <Suspense fallback={<FallbackCar />}>
            <GlbCar />
          </Suspense>
        </ModelErrorBoundary>

        {/* ── Left headlight ── */}
        <mesh ref={leftGlow} position={[-0.65, 0.55, 2.2]} material={emissiveMat}>
          <sphereGeometry args={[0.1, 16, 16]} />
        </mesh>
        <pointLight
          ref={leftLight}
          position={[-0.65, 0.55, 2.5]}
          color="#ffe8a0"
          intensity={0}
          distance={40}
          decay={1.5}
        />

        {/* ── Right headlight ── */}
        <mesh ref={rightGlow} position={[0.65, 0.55, 2.2]} material={emissiveMat}>
          <sphereGeometry args={[0.1, 16, 16]} />
        </mesh>
        <pointLight
          ref={rightLight}
          position={[0.65, 0.55, 2.5]}
          color="#ffe8a0"
          intensity={0}
          distance={40}
          decay={1.5}
        />

        {/* Subtle ground-bounce fill from headlights */}
        <pointLight position={[0, 0, 2.5]} color="#ffe8a0" intensity={0.3} distance={15} />
      </group>
    </>
  );
}

// ─── Camera controller ───────────────────────────────────────────────────────

function CinematicCamera() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 1.1, 6);
    camera.lookAt(0, 0.5, 0);
  }, [camera]);

  return null;
}

// ─── Ground plane (subtle reflection feel) ───────────────────────────────────

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#050505" metalness={0.8} roughness={0.4} />
    </mesh>
  );
}

// ─── Exported scene component ────────────────────────────────────────────────

interface CarCinematicSceneProps {
  onFlashIntensity: (v: number) => void;
  onComplete: () => void;
}

export default function CarCinematicScene({
  onFlashIntensity,
  onComplete,
}: CarCinematicSceneProps) {
  return (
    <Canvas
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.6,
        powerPreference: 'default',
      }}
      camera={{ fov: 45, near: 0.1, far: 200, position: [0, 1.1, 6] }}
      style={{ background: '#000000' }}
      dpr={[1, 1.5]}
    >
      <CinematicCamera />

      {/* Very dim fill — scene starts near-black */}
      <hemisphereLight
        color="#0a0a1a"
        groundColor="#000000"
        intensity={0.05}
      />

      <Ground />

      <AnimatedCar
        onFlashIntensity={onFlashIntensity}
        onComplete={onComplete}
      />
    </Canvas>
  );
}
