import { CarId } from '@/store/useConfiguratorStore';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ColorOption {
  key: string;
  label: string;
  hex: string;
  metallic: boolean;
}

export interface WheelOption {
  key: string;
  label: string;
  price: number;
  imagePath: string;
}

export interface Package {
  key: string;
  label: string;
  description: string;
  price: number;
}

export interface PerformanceStat {
  label: string;
  value: string;
  barPercent: number; // 0–100 relative to fleet maximum
}

export interface CameraPreset {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
}

export interface CarConfig {
  id: CarId;
  name: string;        // Short: "911 Turbo S"
  fullName: string;    // Full: "Porsche 911 Turbo S"
  tagline: string;     // "650 PS · PDK · AWD"
  basePrice: number;   // EUR
  modelPath: string;   // Public path to GLB
  thumbnailPath: string;
  scale: number;       // Uniform 3D scale factor
  defaultColor: string;
  colors: ColorOption[];
  wheels: WheelOption[];
  packages: Package[];
  performance: PerformanceStat[];
  cameraPreset: CameraPreset;
  selectionCameraPreset: CameraPreset;
  wheelsCameraPreset: CameraPreset;
}

// ─── Shared Options (used across all cars) ────────────────────────────────────

// ─── Car Registry ─────────────────────────────────────────────────────────────

export const CAR_REGISTRY: Record<CarId, CarConfig> = {

  '911': {
    id: '911',
    name: '911 Turbo S',
    fullName: 'Porsche 911 Turbo S',
    tagline: '650 PS · PDK · AWD',
    basePrice: 230700,
    modelPath: '/models/911.glb',
    thumbnailPath: '/images/911-thumb.webp',
    scale: 1.0,
    defaultColor: '#8A9BB0',
    colors: [
      { key: 'arctic-silver',  label: 'Arctic Silver',    hex: '#8A9BB0', metallic: true },
      { key: 'jet-black',      label: 'Jet Black Meta.',  hex: '#1A1A1A', metallic: true },
      { key: 'guards-red',     label: 'Guards Red',       hex: '#C0111F', metallic: false },
      { key: 'gt-silver',      label: 'GT Silver Meta.',  hex: '#C0C0C0', metallic: true },
      { key: 'python-green',   label: 'Python Green',     hex: '#4A5D3A', metallic: true },
    ],
    wheels: [
      { key: 'standard',    label: 'Turbo S 21" Standard', price: 0,    imagePath: '/images/wheel-911-std.webp' },
      { key: 'sport-design', label: 'Sport Design 21"',    price: 1800, imagePath: '/images/wheel-911-sport.webp' },
      { key: 'exclusive',   label: 'Exclusive Design 21"', price: 3400, imagePath: '/images/wheel-911-exc.webp' },
    ],
    packages: [
      { key: 'chrono',     label: 'Chrono Package',        description: 'Sport Chrono stopwatch + Sport Plus mode',  price: 2960 },
      { key: 'pasm-sport', label: 'PASM Sport',            description: 'Lowered sport suspension incl. PASM',       price: 2100 },
      { key: 'pccb',       label: 'PCCB Brake System',     description: 'Carbon-ceramic composite brakes',           price: 9135 },
      { key: 'bose',       label: 'BOSE Surround',         description: 'BOSE® Surround Sound System (14 speakers)', price: 1160 },
    ],
    performance: [
      { label: '0–100 km/h', value: '2.7s',     barPercent: 99 },
      { label: 'Top Speed',  value: '330 km/h',  barPercent: 92 },
      { label: 'Power',      value: '650 PS',    barPercent: 96 },
      { label: 'Torque',     value: '800 Nm',    barPercent: 87 },
    ],
    cameraPreset: {
      position: [4.5, 1.6, 4.5],
      target:   [0, 0.3, 0],
      fov: 50,
    },
    selectionCameraPreset: {
      position: [6, 2.5, 6],
      target:   [0, 0.5, 0],
      fov: 55,
    },
    wheelsCameraPreset: {
      position: [2.8, 0.4, 3.2],
      target:   [1.2, 0.3, 0],
      fov: 40,
    },
  },

  'taycan': {
    id: 'taycan',
    name: 'Taycan Turbo',
    fullName: 'Porsche Taycan Turbo',
    tagline: '700 PS · 2-Speed · AWD · 98 kWh',
    basePrice: 185356,
    modelPath: '/models/taycan.glb',
    thumbnailPath: '/images/taycan-thumb.webp',
    scale: 1.0,
    defaultColor: '#1A1A2E',
    colors: [
      { key: 'frozen-blue',   label: 'Frozen Blue MG',    hex: '#1A1A2E', metallic: true },
      { key: 'chalk',         label: 'Chalk',             hex: '#D8D4C8', metallic: false },
      { key: 'volcano-grey',  label: 'Volcano Grey MG',   hex: '#6B6B5E', metallic: true },
      { key: 'carmine-red',   label: 'Carmine Red',       hex: '#7B1528', metallic: false },
      { key: 'mamba-green',   label: 'Mamba Green MG',    hex: '#2D4A35', metallic: true },
    ],
    wheels: [
      { key: 'standard',    label: 'Turbo 21" Aero',       price: 0,    imagePath: '/images/wheel-taycan-std.webp' },
      { key: 'cross-turismo', label: 'Mission E 21"',      price: 2100, imagePath: '/images/wheel-taycan-mission.webp' },
      { key: 'exclusive',   label: 'Exclusive Design 21"', price: 3100, imagePath: '/images/wheel-taycan-exc.webp' },
    ],
    packages: [
      { key: 'performance-battery', label: 'Performance Battery+', description: 'Extended 98 kWh battery, 598 km WLTP',  price: 8000 },
      { key: 'innodrive',           label: 'InnoDrive + ACC',      description: 'Predictive cruise control with HD maps',  price: 3950 },
      { key: 'pccb',                label: 'PCCB Brakes',          description: 'Carbon-ceramic composite brake system',   price: 8950 },
      { key: 'bose',                label: 'BOSE Surround',        description: 'BOSE® 14-channel immersive audio',        price: 1260 },
    ],
    performance: [
      { label: '0–100 km/h', value: '2.8s',     barPercent: 97 },
      { label: 'Top Speed',  value: '260 km/h',  barPercent: 72 },
      { label: 'Power',      value: '700 PS',    barPercent: 100 },
      { label: 'Range',      value: '598 km',    barPercent: 95 },
    ],
    cameraPreset: {
      position: [4.5, 1.5, 4.5],
      target:   [0, 0.4, 0],
      fov: 52,
    },
    selectionCameraPreset: {
      position: [6, 2.5, 6],
      target:   [0, 0.5, 0],
      fov: 55,
    },
    wheelsCameraPreset: {
      position: [2.6, 0.35, 3.0],
      target:   [1.1, 0.3, 0],
      fov: 42,
    },
  },

  'cayenne': {
    id: 'cayenne',
    name: 'Cayenne Turbo GT',
    fullName: 'Porsche Cayenne Turbo GT',
    tagline: '640 PS · Tiptronic S · AWD',
    basePrice: 197056,
    modelPath: '/models/cayenne.glb',
    thumbnailPath: '/images/cayenne-thumb.webp',
    scale: 0.92,
    defaultColor: '#4A4A4A',
    colors: [
      { key: 'gt-silver',      label: 'GT Silver Meta.',   hex: '#B0B0AA', metallic: true },
      { key: 'jet-black',      label: 'Jet Black Meta.',   hex: '#1A1A1A', metallic: true },
      { key: 'mahogany',       label: 'Mahogany MG',       hex: '#5C2E1E', metallic: true },
      { key: 'dolomite-silver', label: 'Dolomite Silver',  hex: '#8C8C84', metallic: true },
      { key: 'carrara-white',  label: 'Carrara White MG',  hex: '#F0EFEA', metallic: true },
    ],
    wheels: [
      { key: 'standard',    label: 'GT 22" Standard',      price: 0,    imagePath: '/images/wheel-cayenne-std.webp' },
      { key: 'exclusive',   label: 'Exclusive Design 22"', price: 2800, imagePath: '/images/wheel-cayenne-exc.webp' },
      { key: 'gt-rs-spyder', label: 'RS Spyder 22"',       price: 4100, imagePath: '/images/wheel-cayenne-rss.webp' },
    ],
    packages: [
      { key: 'off-road-design', label: 'Off-Road Design Pkg', description: 'Steel protection bars + mudguards',         price: 3400 },
      { key: 'night-vision',    label: 'Night Vision Assist', description: 'Thermal imaging pedestrian detection',       price: 3520 },
      { key: 'pccb',            label: 'PCCB Brakes',         description: 'Carbon-ceramic composite brake system',      price: 9600 },
      { key: 'burmester',       label: '3D Burmester® Audio', description: 'High-end 3D surround, 1455W, 21 speakers',   price: 6720 },
    ],
    performance: [
      { label: '0–100 km/h', value: '3.3s',     barPercent: 90 },
      { label: 'Top Speed',  value: '300 km/h',  barPercent: 83 },
      { label: 'Power',      value: '640 PS',    barPercent: 94 },
      { label: 'Torque',     value: '900 Nm',    barPercent: 100 },
    ],
    cameraPreset: {
      position: [5, 2, 5],
      target:   [0, 0.6, 0],
      fov: 55,
    },
    selectionCameraPreset: {
      position: [7, 3, 7],
      target:   [0, 0.7, 0],
      fov: 58,
    },
    wheelsCameraPreset: {
      position: [3.0, 0.5, 3.5],
      target:   [1.3, 0.4, 0],
      fov: 42,
    },
  },

};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getCarConfig(id: CarId): CarConfig {
  return CAR_REGISTRY[id];
}

export function computeTotalPrice(
  car: CarConfig,
  selectedWheels: string,
  selectedPackages: string[]
): number {
  const wheelsPrice   = car.wheels.find((w) => w.key === selectedWheels)?.price ?? 0;
  const packagesPrice = selectedPackages.reduce((sum, key) => {
    const pkg = car.packages.find((p) => p.key === key);
    return sum + (pkg?.price ?? 0);
  }, 0);
  return car.basePrice + wheelsPrice + packagesPrice;
}

export function formatPrice(eur: number): string {
  return new Intl.NumberFormat('de-DE', {
    style:    'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(eur);
}
