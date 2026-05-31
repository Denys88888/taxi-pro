import type { SVGProps } from 'react';

export function Onboarding1(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Map background grid */}
      <rect x="10" y="10" width="180" height="180" rx="20" fill="#f8f9fa" />
      {/* Grid lines */}
      <line x1="50" y1="10" x2="50" y2="190" stroke="#e1e4e8" strokeWidth="1" />
      <line x1="100" y1="10" x2="100" y2="190" stroke="#e1e4e8" strokeWidth="1" />
      <line x1="150" y1="10" x2="150" y2="190" stroke="#e1e4e8" strokeWidth="1" />
      <line x1="10" y1="50" x2="190" y2="50" stroke="#e1e4e8" strokeWidth="1" />
      <line x1="10" y1="100" x2="190" y2="100" stroke="#e1e4e8" strokeWidth="1" />
      <line x1="10" y1="150" x2="190" y2="150" stroke="#e1e4e8" strokeWidth="1" />
      {/* Roads */}
      <rect x="50" y="20" width="12" height="160" rx="6" fill="#ffffff" stroke="#e1e4e8" strokeWidth="1" />
      <rect x="20" y="90" width="160" height="12" rx="6" fill="#ffffff" stroke="#e1e4e8" strokeWidth="1" />
      {/* Route line */}
      <path
        d="M100 90 L100 60 L140 60 L140 150"
        stroke="#2c3e50"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="8 4"
      />
      {/* Route dots */}
      <circle cx="100" cy="90" r="6" fill="#27ae60" />
      <circle cx="100" cy="60" r="6" fill="#2c3e50" />
      <circle cx="140" cy="60" r="6" fill="#2c3e50" />
      <circle cx="140" cy="150" r="6" fill="#e74c3c" />
      {/* Car */}
      <g transform="translate(82, 36)">
        <rect x="0" y="8" width="36" height="18" rx="6" fill="#2c3e50" />
        <rect x="6" y="4" width="24" height="10" rx="3" fill="#34495e" />
        <circle cx="8" cy="28" r="5" fill="#1a1a2e" />
        <circle cx="28" cy="28" r="5" fill="#1a1a2e" />
        <circle cx="8" cy="28" r="2" fill="#9ca3af" />
        <circle cx="28" cy="28" r="2" fill="#9ca3af" />
      </g>
      {/* Buildings */}
      <rect x="62" y="30" width="24" height="50" rx="4" fill="#e1e4e8" opacity="0.5" />
      <rect x="66" y="38" width="6" height="8" rx="2" fill="#9ca3af" opacity="0.3" />
      <rect x="78" y="38" width="6" height="8" rx="2" fill="#9ca3af" opacity="0.3" />
      <rect x="66" y="54" width="6" height="8" rx="2" fill="#9ca3af" opacity="0.3" />
      <rect x="78" y="54" width="6" height="8" rx="2" fill="#9ca3af" opacity="0.3" />
      {/* Trees */}
      <circle cx="72" cy="120" r="8" fill="#27ae60" opacity="0.3" />
      <circle cx="120" cy="120" r="8" fill="#27ae60" opacity="0.3" />
    </svg>
  );
}
