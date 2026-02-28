'use client';
/**
 * StatBar — Single animated performance stat row.
 * Bar fills via CSS transition on mount.
 */
import { useEffect, useRef } from 'react';
import { PerformanceStat } from '@/data/cars';

interface StatBarProps {
  stat: PerformanceStat;
  delay?: number; // ms
}

export default function StatBar({ stat, delay = 0 }: StatBarProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!barRef.current) return;
    const timer = setTimeout(() => {
      if (barRef.current) {
        barRef.current.style.width = `${stat.barPercent}%`;
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [stat.barPercent, delay]);

  return (
    <div className="flex flex-col gap-2">
      {/* Label + value row */}
      <div className="flex items-baseline justify-between">
        <span className="label-caps text-p-muted">{stat.label}</span>
        <span
          className="text-p-text font-bold font-display"
          style={{ fontSize: 'clamp(1.25rem, 2vw, 1.75rem)', letterSpacing: '-0.02em' }}
        >
          {stat.value}
        </span>
      </div>

      {/* Bar track */}
      <div className="h-px bg-p-border w-full overflow-hidden">
        <div
          ref={barRef}
          className="h-full bg-p-gold"
          style={{
            width: 0,
            transition: `width 800ms cubic-bezier(0,0,0.2,1) ${delay}ms`,
          }}
        />
      </div>
    </div>
  );
}
