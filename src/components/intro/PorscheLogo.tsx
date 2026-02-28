// PorscheLogo — SVG wordmark + crest, used in IntroScreen
// Entirely vector-based. No external assets. No font load risk.

interface PorscheLogoProps {
  className?: string;
}

export default function PorscheLogo({ className = '' }: PorscheLogoProps) {
  return (
    <svg
      viewBox="0 0 320 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Porsche"
    >
      {/* ── Wordmark: PORSCHE ── */}
      <text
        x="160"
        y="150"
        textAnchor="middle"
        fontFamily="'Arial Narrow', Arial, sans-serif"
        fontWeight="700"
        fontSize="28"
        letterSpacing="12"
        fill="#F5F5F0"
        style={{ textTransform: 'uppercase' }}
      >
        PORSCHE
      </text>

      {/* ── Crest outline (simplified geometric crest) ── */}
      {/* Badge shield outline */}
      <path
        d="M160 8 L198 28 L198 82 Q198 108 160 124 Q122 108 122 82 L122 28 Z"
        stroke="#F5F5F0"
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="400"
        strokeDashoffset="400"
        style={{
          animation: 'drawIn 0.8s cubic-bezier(0.16,1,0.3,1) 1.6s forwards',
        }}
      />
      {/* Horizontal divider */}
      <line
        x1="122" y1="66" x2="198" y2="66"
        stroke="#F5F5F0"
        strokeWidth="1.5"
        strokeDasharray="80"
        strokeDashoffset="80"
        style={{
          animation: 'drawIn 0.5s cubic-bezier(0.16,1,0.3,1) 2.0s forwards',
        }}
      />
      {/* Vertical divider */}
      <line
        x1="160" y1="8" x2="160" y2="124"
        stroke="#F5F5F0"
        strokeWidth="1.5"
        strokeDasharray="120"
        strokeDashoffset="120"
        style={{
          animation: 'drawIn 0.5s cubic-bezier(0.16,1,0.3,1) 2.2s forwards',
        }}
      />
      {/* Top-left: Stuttgart horse (simplified rearing horse silhouette blocks) */}
      <rect x="130" y="38" width="6" height="10" fill="#F5F5F0" opacity="0"
        style={{ animation: 'fadeIn 0.3s ease-out 2.3s forwards' }} />
      <rect x="138" y="30" width="4" height="8"  fill="#F5F5F0" opacity="0"
        style={{ animation: 'fadeIn 0.3s ease-out 2.35s forwards' }} />
      <rect x="134" y="26" width="8" height="6"  fill="#F5F5F0" opacity="0"
        style={{ animation: 'fadeIn 0.3s ease-out 2.4s forwards' }} />
      {/* Top-right: Red + black stripes (Württemberg) */}
      <rect x="164" y="16" width="8" height="46" fill="#D5001C" opacity="0"
        style={{ animation: 'fadeIn 0.3s ease-out 2.3s forwards' }} />
      <rect x="172" y="16" width="8" height="46" fill="#1A1A1A" opacity="0"
        style={{ animation: 'fadeIn 0.3s ease-out 2.35s forwards' }} />
      <rect x="180" y="16" width="8" height="46" fill="#D5001C" opacity="0"
        style={{ animation: 'fadeIn 0.3s ease-out 2.4s forwards' }} />
      {/* Bottom-left: Black + red stripes */}
      <rect x="130" y="66" width="8" height="48" fill="#1A1A1A" opacity="0"
        style={{ animation: 'fadeIn 0.3s ease-out 2.3s forwards' }} />
      <rect x="138" y="66" width="8" height="48" fill="#D5001C" opacity="0"
        style={{ animation: 'fadeIn 0.3s ease-out 2.35s forwards' }} />
      <rect x="146" y="66" width="8" height="48" fill="#1A1A1A" opacity="0"
        style={{ animation: 'fadeIn 0.3s ease-out 2.4s forwards' }} />
      {/* Bottom-right: Gold stag antlers (simplified block) */}
      <rect x="164" y="72" width="12" height="6" fill="#C9A84C" opacity="0"
        style={{ animation: 'fadeIn 0.3s ease-out 2.3s forwards' }} />
      <rect x="168" y="78" width="4"  height="30" fill="#C9A84C" opacity="0"
        style={{ animation: 'fadeIn 0.3s ease-out 2.35s forwards' }} />
    </svg>
  );
}
