'use client';
/**
 * SummaryScreen — Final configuration receipt.
 * Shows selected model, full config breakdown, and total price.
 * Right side shows 3D scene (bottom panel).
 */
import { motion } from 'framer-motion';
import { useConfiguratorStore } from '@/store/useConfiguratorStore';
import { CAR_REGISTRY, computeTotalPrice, formatPrice } from '@/data/cars';

interface LineItemProps {
  label: string;
  value: string;
  price?: string;
  accent?: boolean;
}

function LineItem({ label, value, price, accent }: LineItemProps) {
  return (
    <div
      className="flex items-start justify-between py-3 border-b border-p-border"
    >
      <div>
        <p className="label-caps text-p-muted mb-0.5">{label}</p>
        <p
          className={accent ? 'text-p-gold' : 'text-p-text'}
          style={{ fontSize: 'var(--text-body)' }}
        >
          {value}
        </p>
      </div>
      {price && (
        <p className="text-p-muted" style={{ fontSize: 'var(--text-body)' }}>
          {price}
        </p>
      )}
    </div>
  );
}

export default function SummaryScreen() {
  const {
    selectedCarId,
    selectedColor,
    selectedWheels,
    selectedPackages,
    resetConfig,
    setPhase,
  } = useConfiguratorStore();

  if (!selectedCarId) return null;

  const car          = CAR_REGISTRY[selectedCarId];
  const colorOption  = car.colors.find((c) => c.hex === selectedColor);
  const wheelOption  = car.wheels.find((w) => w.key === selectedWheels);
  const pkgOptions   = car.packages.filter((p) => selectedPackages.includes(p.key));
  const totalPrice   = computeTotalPrice(car, selectedWheels, selectedPackages);

  return (
    <div className="absolute inset-0 flex">
      {/* Left side — transparent (3D scene visible) */}
      <div className="flex-1 pointer-events-none" />

      {/* Right panel — summary receipt */}
      <motion.aside
        className="
          pointer-events-auto
          w-[400px] h-full flex flex-col
          bg-p-bg/97 backdrop-blur-sm
          border-l border-p-border
          overflow-hidden
        "
        initial={{ x: 40, opacity: 0 }}
        animate={{ x: 0, opacity: 1, transition: { duration: 0.45, ease: [0, 0, 0.2, 1] } }}
        exit={{ x: 40, opacity: 0, transition: { duration: 0.3 } }}
      >
        {/* Header */}
        <div className="px-6 pt-10 pb-6 border-b border-p-border flex-shrink-0">
          <button
            onClick={() => setPhase('performance')}
            className="label-caps text-p-disabled hover:text-p-muted transition-colors mb-4 block"
          >
            ← Performance
          </button>

          <p className="label-caps text-p-muted mb-1">Configuration Summary</p>
          <h1
            className="font-display text-p-text"
            style={{ fontSize: 'var(--text-title)', fontWeight: 'var(--fw-bold)', letterSpacing: '-0.02em' }}
          >
            {car.name}
          </h1>

          {/* Color indicator */}
          <div className="flex items-center gap-2 mt-3">
            <div
              className="w-4 h-4 rounded-sm"
              style={{ backgroundColor: selectedColor }}
            />
            <span className="label-caps text-p-muted">{colorOption?.label}</span>
          </div>
        </div>

        {/* Line items */}
        <div className="flex-1 overflow-y-auto px-6 py-2">

          {/* Base */}
          <LineItem
            label="Base Model"
            value={car.fullName}
            price={formatPrice(car.basePrice)}
          />

          {/* Color */}
          <LineItem
            label="Exterior Color"
            value={`${colorOption?.label ?? '—'} ${colorOption?.metallic ? '(Metallic)' : '(Solid)'}`}
            price="Included"
          />

          {/* Wheels */}
          <LineItem
            label="Wheels"
            value={wheelOption?.label ?? '—'}
            price={wheelOption?.price ? `+ ${formatPrice(wheelOption.price)}` : 'Standard'}
          />

          {/* Packages */}
          {pkgOptions.length > 0 && (
            <>
              <p className="label-caps text-p-muted pt-4 pb-2">Option Packages</p>
              {pkgOptions.map((pkg) => (
                <LineItem
                  key={pkg.key}
                  label={pkg.label}
                  value={pkg.description}
                  price={`+ ${formatPrice(pkg.price)}`}
                />
              ))}
            </>
          )}

          {pkgOptions.length === 0 && (
            <LineItem
              label="Option Packages"
              value="None selected"
              price="—"
            />
          )}

          {/* Spacer */}
          <div className="h-4" />
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-6 border-t border-p-border bg-p-bg">
          {/* Total */}
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="label-caps text-p-muted mb-1">Total</p>
              <p
                className="font-display text-p-text font-bold"
                style={{ fontSize: 'var(--text-title)', letterSpacing: '-0.02em' }}
              >
                {formatPrice(totalPrice)}
              </p>
            </div>
            <p className="label-caps text-p-disabled" style={{ fontSize: '10px' }}>
              incl. 19% VAT
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            <button className="p-btn-primary w-full">
              Request Consultation
            </button>
            <button
              onClick={resetConfig}
              className="p-btn-ghost w-full"
            >
              Start Over
            </button>
          </div>
        </div>
      </motion.aside>
    </div>
  );
}
