'use client';
/**
 * PerformanceSection — Full-bleed performance storytelling panel.
 * Left half: model name + key stat. Right half: stat bars. 3D scene visible behind.
 */
import { motion } from 'framer-motion';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { CAR_REGISTRY } from '@/data/cars';
import StatBar from './StatBar';

export default function PerformanceSection() {
  const { selectedCarId, setPhase } = useConfiguratorStore();
  if (!selectedCarId) return null;

  const car = CAR_REGISTRY[selectedCarId];
  const heroStat = car.performance[0]; // 0–100 km/h is the hero figure

  return (
    <div className="absolute inset-0 overflow-x-auto overflow-y-auto">
      <div className="min-w-[740px] w-full h-full relative flex">
        {/* Left hero panel */}
        <motion.div
          className="
            w-[420px] min-w-[420px] h-full flex flex-col justify-between
            bg-gradient-to-r from-p-bg via-p-bg/98 to-transparent
            p-10 pt-12
          "
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1, transition: { duration: 0.5, ease: [0, 0, 0.2, 1] } }}
        >
        {/* Back nav */}
        <button
          onClick={() => setPhase('configurator')}
          className="label-caps text-p-disabled hover:text-p-muted transition-colors self-start"
        >
          ← Configuration
        </button>

        {/* Hero content */}
        <div>
          <p className="label-caps text-p-muted mb-2">Porsche {car.name}</p>

          {/* Hero stat */}
          <div className="mb-6">
            <p className="label-caps text-p-muted mb-1">{heroStat.label}</p>
            <p
              className="font-display text-p-text"
              style={{
                fontSize: 'var(--text-hero)',
                fontWeight: 'var(--fw-bold)',
                letterSpacing: '-0.03em',
                lineHeight: 0.9,
              }}
            >
              {heroStat.value}
            </p>
          </div>

          {/* Gold rule */}
          <div className="w-16 h-px bg-p-gold mb-6" />

          {/* Tagline */}
          <p
            className="text-p-muted"
            style={{ fontSize: 'var(--text-heading)', lineHeight: 1.5 }}
          >
            {car.tagline}
          </p>
        </div>

        {/* AR CTA */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setPhase('ar')}
            className="p-btn-primary w-full"
          >
            Experience in AR
          </button>
          <button
            onClick={() => setPhase('summary')}
            className="p-btn-ghost w-full"
          >
            View My Configuration
          </button>
        </div>
      </motion.div>

      {/* Right stat panel — flows in the flex row */}
      <div className="flex-1 min-w-[320px] flex items-end justify-end p-8 pb-10">
        <motion.div
          className="flex flex-col gap-6 w-full max-w-[320px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2, ease: [0, 0, 0.2, 1] } }}
        >
          <p className="label-caps text-p-muted">Performance Data</p>
          {car.performance.map((stat, i) => (
            <StatBar key={stat.label} stat={stat} delay={i * 80 + 400} />
          ))}
        </motion.div>
      </div>
      </div>
    </div>
  );
}
