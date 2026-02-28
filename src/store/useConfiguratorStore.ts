import { create } from 'zustand';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Phase = 'intro' | 'selection' | 'configurator' | 'performance' | 'ar' | 'summary';
export type CarId = '911' | 'taycan' | 'cayenne';
export type ConfigStep = 'color' | 'wheels' | 'interior' | 'packages';

// ─── State Interface ──────────────────────────────────────────────────────────

interface ConfiguratorState {
  // Phase control
  phase: Phase;
  setPhase: (phase: Phase) => void;

  // Intro
  introComplete: boolean;
  setIntroComplete: (v: boolean) => void;

  // Car selection
  selectedCarId: CarId | null;
  setSelectedCar: (id: CarId) => void;

  // Hover tracking (selection screen)
  hoveredCarId: CarId | null;
  setHoveredCar: (id: CarId | null) => void;

  // Selection animation
  isSelecting: boolean;
  setIsSelecting: (v: boolean) => void;

  // Interior view mode
  viewingInterior: boolean;
  setViewingInterior: (v: boolean) => void;

  // Configurator step
  activeStep: ConfigStep;
  setActiveStep: (step: ConfigStep) => void;

  // Configuration choices
  selectedColor: string;
  selectedWheels: string;
  selectedInterior: string;
  selectedPackages: string[];

  setColor: (hex: string) => void;
  setWheels: (key: string) => void;
  setInterior: (key: string) => void;
  togglePackage: (key: string) => void;

  // Reset for restart flow
  resetConfig: () => void;
}

// ─── Default Config Values ────────────────────────────────────────────────────

const DEFAULT_CONFIG = {
  selectedColor:    '#8A9BB0', // Arctic Silver
  selectedWheels:   'standard',
  selectedInterior: 'black-leather',
  selectedPackages: [] as string[],
  activeStep:       'color' as ConfigStep,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useConfiguratorStore = create<ConfiguratorState>((set) => ({
  // Phase
  phase: 'intro',
  setPhase: (phase) => set({ phase }),

  // Intro
  introComplete: false,
  setIntroComplete: (v) => set({ introComplete: v }),

  // Car selection
  selectedCarId: null,
  setSelectedCar: (id) =>
    set({
      selectedCarId: id,
      // Reset options when switching cars
      ...DEFAULT_CONFIG,
    }),

  // Hover tracking
  hoveredCarId: null,
  setHoveredCar: (id) => set({ hoveredCarId: id }),

  // Selection animation
  isSelecting: false,
  setIsSelecting: (v) => set({ isSelecting: v }),

  // Interior view mode
  viewingInterior: false,
  setViewingInterior: (v) => set({ viewingInterior: v }),

  // Configurator step
  activeStep: DEFAULT_CONFIG.activeStep,
  setActiveStep: (step) => set({ activeStep: step }),

  // Config choices
  selectedColor:    DEFAULT_CONFIG.selectedColor,
  selectedWheels:   DEFAULT_CONFIG.selectedWheels,
  selectedInterior: DEFAULT_CONFIG.selectedInterior,
  selectedPackages: DEFAULT_CONFIG.selectedPackages,

  setColor:    (hex)  => set({ selectedColor: hex }),
  setWheels:   (key)  => set({ selectedWheels: key }),
  setInterior: (key)  => set({ selectedInterior: key }),
  togglePackage: (key) =>
    set((state) => ({
      selectedPackages: state.selectedPackages.includes(key)
        ? state.selectedPackages.filter((k) => k !== key)
        : [...state.selectedPackages, key],
    })),

  // Full reset back to intro
  resetConfig: () =>
    set({
      phase:         'intro',
      introComplete: false,
      selectedCarId: null,
      viewingInterior: false,
      ...DEFAULT_CONFIG,
    }),
}));
