import type { SVGProps } from 'react';

export function Onboarding2(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Background circle */}
      <circle cx="100" cy="100" r="80" fill="#f0f7ff" />
      {/* Wallet */}
      <rect x="40" y="70" width="120" height="80" rx="16" fill="#2c3e50" />
      <rect x="40" y="62" width="120" height="80" rx="16" fill="#34495e" />
      {/* Wallet flap */}
      <path d="M40 102h120v40c0 8.84-7.16 16-16 16H56c-8.84 0-16-7.16-16-16v-40z" fill="#2c3e50" />
      {/* Pi symbol on wallet */}
      <text x="100" y="128" textAnchor="middle" fill="#ffffff" fontSize="28" fontWeight="700" fontFamily="Inter, sans-serif">
        π
      </text>
      {/* Sparkles */}
      <g fill="#27ae60">
        <path d="M155 55l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" />
        <path d="M40 45l1.5 4.5 4.5 1.5-4.5 1.5L40 57l-1.5-4.5-4.5-1.5 4.5-1.5L40 45z" />
      </g>
      <g fill="#f39c12">
        <path d="M165 90l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
      </g>
      {/* Coins floating */}
      <circle cx="155" cy="80" r="12" fill="#27ae60" opacity="0.9" />
      <text x="155" y="85" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="700" fontFamily="Inter, sans-serif">
        π
      </text>
      <circle cx="45" cy="85" r="10" fill="#27ae60" opacity="0.7" />
      <text x="45" y="89" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="700" fontFamily="Inter, sans-serif">
        π
      </text>
      {/* Glow effect */}
      <circle cx="100" cy="100" r="65" stroke="#27ae60" strokeWidth="1" opacity="0.2" fill="none" />
    </svg>
  );
}
