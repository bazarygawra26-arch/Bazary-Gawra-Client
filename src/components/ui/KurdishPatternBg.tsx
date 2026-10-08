import React from 'react';

interface KurdishPatternBgProps {
  className?: string;
  opacity?: number;
}

/**
 * KurdishPatternBg: Very faint geometric Kurdish kilim pattern background (~4% opacity)
 * Safe to place behind visual hero containers without obstructing text readability.
 */
export const KurdishPatternBg: React.FC<KurdishPatternBgProps> = ({
  className = '',
  opacity = 0.04,
}) => {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden ${className}`}
      style={{ opacity }}
    >
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="kurdish-rug-bg-grid"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            {/* Diamond outer */}
            <polygon
              points="40,6 74,40 40,74 6,40"
              fill="none"
              stroke="#657A52"
              strokeWidth="1.5"
            />
            {/* Diamond inner */}
            <polygon
              points="40,16 64,40 40,64 16,40"
              fill="none"
              stroke="#F4B942"
              strokeWidth="1.5"
            />
            {/* Center cross/star motif */}
            <line x1="40" y1="28" x2="40" y2="52" stroke="#B5473A" strokeWidth="1.5" />
            <line x1="28" y1="40" x2="52" y2="40" stroke="#B5473A" strokeWidth="1.5" />
            {/* Corner motifs */}
            <polygon points="0,0 12,0 0,12" fill="#657A52" />
            <polygon points="80,0 68,0 80,12" fill="#657A52" />
            <polygon points="0,80 12,80 0,68" fill="#657A52" />
            <polygon points="80,80 68,80 80,68" fill="#657A52" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#kurdish-rug-bg-grid)" />
      </svg>
    </div>
  );
};

export default KurdishPatternBg;
