import React from 'react';

interface KilimDividerProps {
  className?: string;
  variant?: 'full' | 'subtle' | 'banner';
}

/**
 * KilimDivider: Reusable authentic Kurdish kilim motif border strip
 * Using diamond and zigzag geometry in flag-inspired Kurdish palette:
 * #F4B942 (Warm Yellow), #657A52 (Olive Green), #B5473A (Muted Red Accent).
 */
export const KilimDivider: React.FC<KilimDividerProps> = ({
  className = '',
  variant = 'full',
}) => {
  const height = variant === 'banner' ? 14 : variant === 'subtle' ? 8 : 12;

  return (
    <div
      role="separator"
      aria-hidden="true"
      className={`w-full overflow-hidden select-none pointer-events-none ${className}`}
      style={{ height: `${height}px` }}
    >
      <svg
        className="w-full h-full block"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="repeat-x"
        height={height}
      >
        <defs>
          <pattern
            id="kurdish-kilim-pattern"
            width="48"
            height={height}
            patternUnits="userSpaceOnUse"
          >
            {/* Background subtle base */}
            <rect width="48" height={height} fill="#FAF9F6" />

            {/* Top & bottom grounding lines */}
            <line x1="0" y1="0.5" x2="48" y2="0.5" stroke="#DBD7CD" strokeWidth="1" />
            <line x1="0" y1={height - 0.5} x2="48" y2={height - 0.5} stroke="#DBD7CD" strokeWidth="1" />

            {/* Central Diamond: Yellow (#F4B942) */}
            <polygon
              points={`24,${height * 0.15} 32,${height * 0.5} 24,${height * 0.85} 16,${height * 0.5}`}
              fill="#F4B942"
            />
            {/* Inner tiny diamond in red (#B5473A) */}
            <polygon
              points={`24,${height * 0.35} 27,${height * 0.5} 24,${height * 0.65} 21,${height * 0.5}`}
              fill="#B5473A"
            />

            {/* Stepped Olive Zigzags (#657A52) on left & right */}
            {/* Left triangle pointing to center */}
            <polygon
              points={`0,${height * 0.5} 6,${height * 0.2} 6,${height * 0.8}`}
              fill="#657A52"
            />
            {/* Right triangle pointing to center */}
            <polygon
              points={`48,${height * 0.5} 42,${height * 0.2} 42,${height * 0.8}`}
              fill="#657A52"
            />

            {/* Top and Bottom Red Accent Dots (#B5473A) */}
            <circle cx="8" cy={height * 0.5} r={height * 0.12} fill="#B5473A" />
            <circle cx="40" cy={height * 0.5} r={height * 0.12} fill="#B5473A" />
            <circle cx="24" cy={height * 0.1} r={height * 0.08} fill="#657A52" />
            <circle cx="24" cy={height * 0.9} r={height * 0.08} fill="#657A52" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#kurdish-kilim-pattern)" />
      </svg>
    </div>
  );
};

export default KilimDivider;
