'use client';
/**
 * StepNavigator — Horizontal tab bar for configurator steps.
 * Steps: Color → Wheels → Interior → Packages
 */
import { useConfiguratorStore, ConfigStep } from '@/store/useConfiguratorStore';

const STEPS: { key: ConfigStep; label: string }[] = [
  { key: 'color',    label: 'Exterior Color' },
  { key: 'wheels',   label: 'Wheels' },
  { key: 'interior', label: 'Interior' },
  { key: 'packages', label: 'Packages' },
];

export default function StepNavigator() {
  const { activeStep, setActiveStep } = useConfiguratorStore();

  return (
    <div className="flex gap-0 border-b border-p-border">
      {STEPS.map((step, i) => {
        const isActive = step.key === activeStep;
        return (
          <button
            key={step.key}
            onClick={() => setActiveStep(step.key)}
            className={`
              relative px-5 py-3 label-caps
              transition-colors duration-150
              ${isActive
                ? 'text-p-text border-b-2 border-p-gold -mb-px'
                : 'text-p-disabled hover:text-p-muted border-b-2 border-transparent -mb-px'}
            `}
          >
            <span className="mr-2 text-p-disabled" style={{ fontSize: '10px' }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            {step.label}
          </button>
        );
      })}
    </div>
  );
}
