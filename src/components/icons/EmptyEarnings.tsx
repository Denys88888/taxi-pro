import type { SVGProps } from 'react';

export function EmptyEarnings(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="40" y="30" width="120" height="90" rx="12" fill="#f0f2f5" />
      <rect x="40" y="22" width="120" height="90" rx="12" fill="#f8f9fa" stroke="#e1e4e8" strokeWidth="2" />
      {/* Wallet fold */}
      <path d="M40 82h120v30c0 6.63-5.37 12-12 12H52c-6.63 0-12-5.37-12-12V82z" fill="#f0f2f5" />
      {/* Pi symbol */}
      <text x="100" y="72" textAnchor="middle" fill="#2c3e50" fontSize="28" fontWeight="700" fontFamily="Inter, sans-serif">
        π
      </text>
      {/* Coin stack */}
      <ellipse cx="70" cy="118" rx="14" ry="6" fill="#27ae60" />
      <rect x="56" y="104" width="28" height="14" fill="#2ecc71" />
      <ellipse cx="70" cy="104" rx="14" ry="6" fill="#27ae60" opacity="0.7" />
      <rect x="60" y="94" width="24" height="12" fill="#2ecc71" />
      <ellipse cx="72" cy="94" rx="12" ry="5" fill="#27ae60" opacity="0.8" />
      {/* Decorative coins */}
      <ellipse cx="140" cy="122" rx="10" ry="4" fill="#27ae60" opacity="0.5" />
      <ellipse cx="140" cy="118" rx="10" ry="4" fill="#2ecc71" opacity="0.6" />
      {/* Sparkles */}
      <path d="M155 45l1.5 4.5 4.5 1.5-4.5 1.5-1.5 4.5-1.5-4.5-4.5-1.5 4.5-1.5 1.5-4.5z" fill="#f39c12" opacity="0.6" />
      <path d="M45 50l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" fill="#f39c12" opacity="0.4" />
    </svg>
  );
}
