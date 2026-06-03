import type { SVGProps } from 'react';

export function Onboarding3(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Background circle */}
      <circle cx="100" cy="100" r="80" fill="#f0faf3" />
      {/* Shield */}
      <path
        d="M100 30L160 55v45c0 35-25.6 55-60 70-34.4-15-60-35-60-70V55l60-25z"
        fill="#27ae60"
        opacity="0.15"
      />
      <path
        d="M100 38L152 59.5v40.5c0 30.8-22.4 48.4-52 62-29.6-13.6-52-31.2-52-62V59.5L100 38z"
        fill="#27ae60"
      />
      {/* Checkmark */}
      <path
        d="M75 100l18 18 32-36"
        stroke="#ffffff"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Lock icon */}
      <g transform="translate(130, 24)">
        <rect x="0" y="14" width="28" height="22" rx="6" fill="#2c3e50" />
        <path d="M6 14V9a8 8 0 0116 0v5" stroke="#2c3e50" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <circle cx="14" cy="25" r="3" fill="#ffffff" />
        <line x1="14" y1="28" x2="14" y2="31" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* Decorative dots */}
      <circle cx="45" cy="55" r="4" fill="#27ae60" opacity="0.3" />
      <circle cx="160" cy="130" r="5" fill="#27ae60" opacity="0.3" />
      <circle cx="35" cy="120" r="3" fill="#27ae60" opacity="0.2" />
    </svg>
  );
}
