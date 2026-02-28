'use client';
/**
 * ConfiguratorPanel — Main configurator overlay.
 * Sidebar over 3D scene. Displays StepNavigator + active step content.
 * Shows live price. Navigates to Performance phase.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { CAR_REGISTRY, computeTotalPrice, formatPrice } from '@/data/cars';
import StepNavigator from './StepNavigator';
import ColorPicker from './ColorPicker';
import WheelPicker from './WheelPicker';
import InteriorPicker from './InteriorPicker';
import PackagePicker from './PackagePicker';

export default function ConfiguratorPanel() {
  const {
    selectedCarId,
    activeStep,
    selectedColor,
    selectedWheels,
    selectedInterior,
    selectedPackages,
    setPhase,
  } = useConfiguratorStore();

  if (!selectedCarId) return null;
  const car = CAR_REGISTRY[selectedCarId];

  const totalPrice = computeTotalPrice(car, selectedWheels, selectedInterior, selectedPackages);

  return (
    <div className="absolute inset-0 pointer-events-none flex">
      {/* Left side — transparent, shows 3D scene */}
      <div className="flex-1" />

      {/* Right panel — configurator */}
      <motion.aside
        className="
          pointer-events-auto
          w-[380px] h-full flex flex-col
          bg-p-bg/95 backdrop-blur-sm
          border-l border-p-border
          overflow-hidden
        "
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1, transition: { duration: 0.45, ease: [0, 0, 0.2, 1] } }}
        exit={{ x: 40, opacity: 0, transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } }}
      >
        {/* Header */}
        <div className="px-6 pt-8 pb-4 border-b border-p-border flex-shrink-0">
          <button
            onClick={() => setPhase('selection')}
            className="label-caps text-p-disabled hover:text-p-muted transition-colors mb-4 flex items-center gap-1"
          >
            ← Change Model
          </button>
          <p className="label-caps text-p-muted mb-1">Porsche</p>
          <h1
            className="font-display text-p-text"
            style={{ fontSize: 'var(--text-title)', fontWeight: 'var(--fw-bold)', letterSpacing: '-0.02em' }}
          >
            {car.name}
          </h1>
          <p className="label-caps text-p-muted mt-1">{car.tagline}</p>
        </div>

        {/* Step tabs */}
        <div className="flex-shrink-0">
          <StepNavigator />
        </div>

        {/* Step content — scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.25, ease: [0, 0, 0.2, 1] } }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
            >
              {activeStep === 'color'    && <ColorPicker />}
              {activeStep === 'wheels'   && <WheelPicker />}
              {activeStep === 'interior' && <InteriorPicker />}
              {activeStep === 'packages' && <PackagePicker />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer — price + CTA */}
        <div className="flex-shrink-0 p-6 border-t border-p-border bg-p-bg">
          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="label-caps text-p-muted mb-0.5">Total Configuration</p>
              <p
                className="text-p-text font-bold"
                style={{ fontSize: 'var(--text-title)', letterSpacing: '-0.02em' }}
              >
                {formatPrice(totalPrice)}
              </p>
            </div>
            <p className="label-caps text-p-disabled" style={{ fontSize: '10px' }}>incl. VAT</p>
          </div>

          <button
            onClick={() => setPhase('performance')}
            className="w-full p-btn-primary"
          >
            View Performance
          </button>
        </div>
      </motion.aside>
    </div>
  );
}
