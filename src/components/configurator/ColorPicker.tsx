'use client';
/**
 * ColorPicker — Exterior color swatches for the selected car.
 * Writes selectedColor to store. Reads available colors from CAR_REGISTRY.
 */
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { CAR_REGISTRY } from '@/data/cars';

export default function ColorPicker() {
  const { selectedCarId, selectedColor, setColor } = useConfiguratorStore();
  if (!selectedCarId) return null;

  const car = CAR_REGISTRY[selectedCarId];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="label-caps text-p-muted mb-1">Exterior Color</p>
        <p className="text-p-text" style={{ fontSize: 'var(--text-heading)', fontWeight: 600 }}>
          {car.colors.find((c) => c.hex === selectedColor)?.label ?? 'Select Color'}
        </p>
      </div>

      {/* Swatch grid */}
      <div className="flex flex-wrap gap-3">
        {car.colors.map((color) => {
          const isSelected = selectedColor === color.hex;
          return (
            <button
              key={color.key}
              title={color.label}
              onClick={() => setColor(color.hex)}
              className={`
                relative w-9 h-9 rounded-full
                transition-all duration-150
                ${isSelected
                  ? 'ring-2 ring-offset-2 ring-p-gold ring-offset-p-elevated scale-110'
                  : 'ring-1 ring-p-border hover:ring-p-muted hover:scale-105'}
              `}
              style={{ backgroundColor: color.hex }}
              aria-pressed={isSelected}
              aria-label={color.label}
            >
              {/* Metallic shimmer overlay */}
              {color.metallic && (
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 60%)',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Color detail */}
      <div className="flex items-center gap-2 mt-1">
        <div
          className="w-4 h-4 rounded-sm"
          style={{ backgroundColor: selectedColor }}
        />
        <div>
          <p className="text-p-text" style={{ fontSize: 'var(--text-body)' }}>
            {car.colors.find((c) => c.hex === selectedColor)?.label}
          </p>
          <p className="label-caps text-p-muted" style={{ fontSize: '10px' }}>
            {car.colors.find((c) => c.hex === selectedColor)?.metallic ? 'Metallic' : 'Solid'} Paint
          </p>
        </div>
      </div>
    </div>
  );
}
