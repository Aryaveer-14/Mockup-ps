'use client';
/**
 * InteriorPicker — Interior trim options.
 * Identical structure to WheelPicker for team consistency.
 */
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { CAR_REGISTRY, formatPrice } from '@/data/cars';

export default function InteriorPicker() {
  const { selectedCarId, selectedInterior, setInterior } = useConfiguratorStore();
  if (!selectedCarId) return null;

  const car = CAR_REGISTRY[selectedCarId];

  return (
    <div className="flex flex-col gap-4">
      <p className="label-caps text-p-muted">Interior Trim</p>

      <div className="flex flex-col gap-2">
        {car.interiors.map((option) => {
          const isSelected = selectedInterior === option.key;
          return (
            <button
              key={option.key}
              onClick={() => setInterior(option.key)}
              className={`
                flex items-center gap-4 p-3 text-left rounded-sm
                border transition-all duration-150
                ${isSelected
                  ? 'border-p-gold bg-[var(--color-selected-bg)]'
                  : 'border-p-border bg-p-elevated hover:border-p-muted'}
              `}
              aria-pressed={isSelected}
            >
              {/* Color swatch */}
              <div
                className="w-12 h-12 rounded-sm flex-shrink-0"
                style={{
                  backgroundColor:
                    option.key === 'black-leather'   ? '#1A1A1A' :
                    option.key === 'cognac-leather'  ? '#7A4A2A' :
                    option.key === 'grey-alcantara'  ? '#5A5A5A' : '#2A2A2A',
                  border: isSelected ? '1px solid rgba(201,168,76,0.5)' : '1px solid #2A2A2A',
                }}
              />

              <div className="flex-1 min-w-0">
                <p
                  className={`${isSelected ? 'text-p-text' : 'text-p-muted'} truncate`}
                  style={{ fontSize: 'var(--text-body)', fontWeight: isSelected ? 500 : 400 }}
                >
                  {option.label}
                </p>
                <p className="label-caps text-p-muted" style={{ fontSize: '10px' }}>
                  {option.price === 0 ? 'Included' : `+ ${formatPrice(option.price)}`}
                </p>
              </div>

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
