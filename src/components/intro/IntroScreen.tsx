'use client';
/**
 * IntroScreen — Premium cinematic Porsche intro sequence.
 *
 * Full sequence (~12s interactive):
 *   1. Darkness → car silhouette → headlights ignite
 *   2. Car approaches camera → headlights fill frame → hard cut to black
 *   3. "PORSCHE" reveals letter-by-letter (Eurostile Extended typography)
 *   4. Logo idles with breathing animation → click to zoom into showroom
 *   5. 3-car showcase fades in → transitions to selection phase
 */

import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import CinematicIntro from '@/components/cinematic/CinematicIntro';

export default function IntroScreen() {
  const { setPhase, setIntroComplete } = useConfiguratorStore();

  const handleFinished = useCallback(() => {
    setIntroComplete(true);
    setPhase('selection');
  }, [setPhase, setIntroComplete]);

  return (
    <motion.div
      className="absolute inset-0 bg-black z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.7, ease: [0.4, 0, 1, 1] } }}
    >
      <CinematicIntro onFinished={handleFinished} />
    </motion.div>
  );
}
