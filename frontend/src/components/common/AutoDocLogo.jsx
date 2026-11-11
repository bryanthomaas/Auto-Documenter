import React from 'react';

export function AutoDocLogo({ 
  size = 32, 
  showWordmark = true, 
  className = '',
  variant = 'full'
}) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Custom Vector Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        role="img"
        aria-label="Auto-Documenter Logo"
      >
        <defs>
          <linearGradient id="logoOceanBg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#012487" />
            <stop offset="60%" stopColor="#012EA8" />
            <stop offset="100%" stopColor="#011650" />
          </linearGradient>
          <linearGradient id="logoSilver" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEFDFE" />
            <stop offset="100%" stopColor="#E4EBFE" />
          </linearGradient>
          <linearGradient id="logoCerulean" x1="16" y1="16" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C7FC02" />
            <stop offset="100%" stopColor="#013CD3" />
          </linearGradient>
        </defs>

        {/* Base Squircle */}
        <rect
          x="3"
          y="3"
          width="58"
          height="58"
          rx="14"
          fill="url(#logoOceanBg)"
          stroke="#FEFDFE"
          strokeOpacity="0.3"
          strokeWidth="2"
        />

        {/* Isometric Document Fold */}
        <path
          d="M20 18H38L46 26V46H20V18Z"
          fill="#013CD3"
          stroke="#FEFDFE"
          strokeWidth="1.5"
        />
        <path
          d="M38 18V26H46"
          stroke="#FEFDFE"
          strokeWidth="1.5"
          fill="#C7FC02"
        />

        {/* Code Glyphs */}
        <path
          d="M27 34L23 37L27 40"
          stroke="#C7FC02"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M39 34L43 37L39 40"
          stroke="#C7FC02"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M35 32L31 42"
          stroke="#FEFDFE"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* Styled Wordmark */}
      {showWordmark && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1 leading-none">
            <span className="font-display font-bold text-base tracking-tight text-[#FEFDFE]">
              Auto
            </span>
            <span className="font-display font-bold text-base tracking-tight text-[#C7FC02]">
              Documenter
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default AutoDocLogo;
