'use client';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import IntroScreen from '@/components/intro/IntroScreen';
import SelectionScreen from '@/components/selection/SelectionScreen';
import ConfiguratorPanel from '@/components/configurator/ConfiguratorPanel';
import PerformanceSection from '@/components/performance/PerformanceSection';
import SummaryScreen from '@/components/summary/SummaryScreen';
import ARSimulation from '@/components/ar/ARSimulation';

// SceneCanvas uses WebGL — no SSR
const SceneCanvas = dynamic(() => import('@/components/scene/SceneCanvas'), {
  ssr: false,
});

// ─── Phase transition variants ────────────────────────────────────────────────
const phaseVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5, ease: [0, 0, 0.2, 1] } },
  exit:    { opacity: 0, transition: { duration: 0.35, ease: [0.4, 0, 1, 1] } },
};

export default function AppShell() {
  const { phase, introComplete } = useConfiguratorStore();

  return (
    // Root viewport container — full screen, no scroll
    <div className="relative w-full h-full overflow-hidden bg-p-bg">

      {/* ── 3D Canvas (persistent from selection onward) ──────────────────── */}
      {introComplete && (
        <div
          className="absolute inset-0"
          style={{ zIndex: 'var(--z-canvas)' as unknown as number }}
        >
          <SceneCanvas />
        </div>
      )}

      {/* ── Phase Layers ── each overlaid over the canvas ─────────────────── */}
      <AnimatePresence mode="wait">

        {phase === 'intro' && (
          <motion.div
            key="intro"
            className="absolute inset-0"
            style={{ zIndex: 'var(--z-intro)' as unknown as number }}
            {...phaseVariants}
          >
            <IntroScreen />
          </motion.div>
        )}

        {phase === 'selection' && (
          <motion.div
            key="selection"
            className="absolute inset-0"
            style={{ zIndex: 'var(--z-ui)' as unknown as number }}
            {...phaseVariants}
          >
            <SelectionScreen />
          </motion.div>
        )}

        {phase === 'configurator' && (
          <motion.div
            key="configurator"
            className="absolute inset-0"
            style={{ zIndex: 'var(--z-panel)' as unknown as number }}
            {...phaseVariants}
          >
            <ConfiguratorPanel />
          </motion.div>
        )}

        {phase === 'performance' && (
          <motion.div
            key="performance"
            className="absolute inset-0"
            style={{ zIndex: 'var(--z-panel)' as unknown as number }}
            {...phaseVariants}
          >
            <PerformanceSection />
          </motion.div>
        )}

        {phase === 'ar' && (
          <motion.div
            key="ar"
            className="absolute inset-0"
            style={{ zIndex: 'var(--z-overlay)' as unknown as number }}
            {...phaseVariants}
          >
            <ARSimulation />
          </motion.div>
        )}

        {phase === 'summary' && (
          <motion.div
            key="summary"
            className="absolute inset-0"
            style={{ zIndex: 'var(--z-panel)' as unknown as number }}
            {...phaseVariants}
          >
            <SummaryScreen />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
