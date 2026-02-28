'use client';
/**
 * WheelPicker — Wheel option cards for the selected car.
 * Writes selectedWheels to store.
 */
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { CAR_REGISTRY, formatPrice } from '@/data/cars';

export default function WheelPicker() {
  const { selectedCarId, selectedWheels, setWheels } = useConfiguratorStore();
  if (!selectedCarId) return null;

  const car = CAR_REGISTRY[selectedCarId];

  return (
    <div className="flex flex-col gap-4">
      <p className="label-caps text-p-muted">Wheel Design</p>

      <div className="flex flex-col gap-2">
        {car.wheels.map((wheel) => {
          const isSelected = selectedWheels === wheel.key;
          return (
            <button
              key={wheel.key}
              onClick={() => setWheels(wheel.key)}
              className={`
                flex items-center gap-4 p-3 text-left rounded-sm
                border transition-all duration-150
                ${isSelected
                  ? 'border-p-gold bg-[var(--color-selected-bg)]'
                  : 'border-p-border bg-p-elevated hover:border-p-muted'}
              `}
              aria-pressed={isSelected}
            >
              {/* Icon placeholder */}
              <div
                className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center"
                style={{ backgroundColor: isSelected ? 'rgba(201,168,76,0.15)' : '#1C1C1C' }}
              >
                <svg viewBox="0 0 40 40" className="w-8 h-8">
                  <circle cx="20" cy="20" r="18" stroke={isSelected ? '#C9A84C' : '#4A4A44'} strokeWidth="1.5" fill="none"/>
                  <circle cx="20" cy="20" r="6"  stroke={isSelected ? '#C9A84C' : '#4A4A44'} strokeWidth="1.5" fill="none"/>
                  {[0, 72, 144, 216, 288].map((angle, i) => (
                    <line
                      key={i}
                      x1="20" y1="14"
                      x2="20" y2="2"
                      stroke={isSelected ? '#C9A84C' : '#4A4A44'}
                      strokeWidth="1.5"
                      transform={`rotate(${angle} 20 20)`}
                    />
                  ))}
                </svg>
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <p
                  className={`${isSelected ? 'text-p-text' : 'text-p-muted'} truncate`}
                  style={{ fontSize: 'var(--text-body)', fontWeight: isSelected ? 500 : 400 }}
                >
                  {wheel.label}
                </p>
                <p className="label-caps text-p-muted" style={{ fontSize: '10px' }}>
                  {wheel.price === 0 ? 'Standard' : `+ ${formatPrice(wheel.price)}`}
                </p>
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <span className="text-p-gold" style={{ fontSize: '18px', lineHeight: 1 }}>✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
