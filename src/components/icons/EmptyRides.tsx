import type { SVGProps } from 'react';

export function EmptyRides(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="20" y="100" width="160" height="6" rx="3" fill="#e1e4e8" />
      <rect x="40" y="118" width="120" height="4" rx="2" fill="#f0f2f5" />
      {/* Road */}
      <rect x="10" y="130" width="180" height="20" rx="4" fill="#f0f2f5" />
      <line x1="30" y1="140" x2="60" y2="140" stroke="#e1e4e8" strokeWidth="2" strokeLinecap="round" />
      <line x1="80" y1="140" x2="110" y2="140" stroke="#e1e4e8" strokeWidth="2" strokeLinecap="round" />
      <line x1="130" y1="140" x2="160" y2="140" stroke="#e1e4e8" strokeWidth="2" strokeLinecap="round" />
      {/* Car */}
      <circle cx="100" cy="80" r="30" fill="#f0f7ff" />
      <path
        d="M82 88c0-4.8 3.84-8.64 8.64-8.64h3.36l4.32-8.64c1.92-3.84 5.76-6.24 10.08-6.24h8.64c4.32 0 8.16 2.4 10.08 6.24l4.32 8.64h3.36c4.8 0 8.64 3.84 8.64 8.64v9.6c0 2.88-1.92 5.28-4.32 6.24v3.84c0 2.4-1.92 4.32-4.32 4.32s-4.32-1.92-4.32-4.32v-2.88H90.96v2.88c0 2.4-1.92 4.32-4.32 4.32s-4.32-1.92-4.32-4.32v-3.84c-2.4-.96-4.32-3.36-4.32-6.24V88z"
        fill="#2c3e50"
      />
      <path
        d="M91.2 74.88l-3.84 8.64h33.12l-3.84-8.64c-1.2-2.64-3.84-4.32-6.72-4.32H97.92c-2.88 0-5.52 1.68-6.72 4.32z"
        fill="#34495e"
        opacity="0.4"
      />
      {/* Search icon */}
      <circle cx="156" cy="44" r="20" fill="#27ae60" opacity="0.15" />
      <circle cx="156" cy="44" r="8" stroke="#27ae60" strokeWidth="2.5" fill="none" />
      <line x1="162" y1="50" x2="168" y2="56" stroke="#27ae60" strokeWidth="2.5" strokeLinecap="round" />
      {/* Wheels */}
      <circle cx="91" cy="106" r="5.6" fill="#2c3e50" />
      <circle cx="127" cy="106" r="5.6" fill="#2c3e50" />
      <circle cx="91" cy="106" r="2.4" fill="#9ca3af" />
      <circle cx="127" cy="106" r="2.4" fill="#9ca3af" />
    </svg>
  );
}
