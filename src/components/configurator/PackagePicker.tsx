'use client';
/**
 * PackagePicker — Multi-select option packages.
 * Uses togglePackage from store. selectedPackages is string[].
 */
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { CAR_REGISTRY, formatPrice } from '@/data/cars';

export default function PackagePicker() {
  const { selectedCarId, selectedPackages, togglePackage } = useConfiguratorStore();
  if (!selectedCarId) return null;

  const car = CAR_REGISTRY[selectedCarId];

  return (
    <div className="flex flex-col gap-4">
      <p className="label-caps text-p-muted">Option Packages</p>

      <div className="flex flex-col gap-2">
        {car.packages.map((pkg) => {
          const isSelected = selectedPackages.includes(pkg.key);
          return (
            <button
              key={pkg.key}
              onClick={() => togglePackage(pkg.key)}
              className={`
                flex items-start gap-4 p-4 text-left rounded-sm
                border transition-all duration-150
                ${isSelected
                  ? 'border-p-gold bg-[var(--color-selected-bg)]'
                  : 'border-p-border bg-p-elevated hover:border-p-muted'}
              `}
              aria-pressed={isSelected}
            >
              {/* Checkbox */}
              <div
                className={`
                  mt-0.5 w-4 h-4 flex-shrink-0 rounded-sm border
                  flex items-center justify-center transition-colors duration-150
                  ${isSelected ? 'bg-p-gold border-p-gold' : 'bg-transparent border-p-border'}
                `}
              >
                {isSelected && (
                  <svg viewBox="0 0 12 12" className="w-2.5 h-2.5">
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="#000"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p
                    className={isSelected ? 'text-p-text' : 'text-p-muted'}
                    style={{ fontSize: 'var(--text-body)', fontWeight: isSelected ? 500 : 400 }}
                  >
                    {pkg.label}
                  </p>
                  <span
                    className="flex-shrink-0 label-caps"
                    style={{ color: isSelected ? 'var(--color-accent-gold)' : 'var(--color-text-secondary)' }}
                  >
                    + {formatPrice(pkg.price)}
                  </span>
                </div>
                <p
                  className="text-p-disabled"
                  style={{ fontSize: 'var(--text-label)', lineHeight: 1.5 }}
                >
                  {pkg.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
