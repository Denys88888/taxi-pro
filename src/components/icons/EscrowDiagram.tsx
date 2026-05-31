import type { SVGProps } from 'react';

export function EscrowDiagram(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 320 80" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* Passenger */}
      <circle cx="40" cy="40" r="28" fill="#f0f7ff" stroke="#2c3e50" strokeWidth="2" />
      <text x="40" y="36" textAnchor="middle" fill="#2c3e50" fontSize="10" fontWeight="600" fontFamily="Inter, sans-serif">
        You
      </text>
      <text x="40" y="48" textAnchor="middle" fill="#2c3e50" fontSize="8" fontFamily="Inter, sans-serif">
        Pay
      </text>
      {/* Arrow 1 */}
      <line x1="72" y1="40" x2="108" y2="40" stroke="#2c3e50" strokeWidth="2" />
      <polygon points="104,36 112,40 104,44" fill="#2c3e50" />
      {/* Escrow/App */}
      <circle cx="140" cy="40" r="28" fill="#f5f0ff" stroke="#9b59b6" strokeWidth="2" />
      <text x="140" y="36" textAnchor="middle" fill="#9b59b6" fontSize="9" fontWeight="600" fontFamily="Inter, sans-serif">
        Escrow
      </text>
      <text x="140" y="48" textAnchor="middle" fill="#9b59b6" fontSize="8" fontFamily="Inter, sans-serif">
        Hold
      </text>
      {/* Arrow 2 */}
      <line x1="172" y1="40" x2="208" y2="40" stroke="#27ae60" strokeWidth="2" />
      <polygon points="204,36 212,40 204,44" fill="#27ae60" />
      {/* Driver */}
      <circle cx="244" cy="40" r="28" fill="#f0faf3" stroke="#27ae60" strokeWidth="2" />
      <text x="244" y="36" textAnchor="middle" fill="#27ae60" fontSize="10" fontWeight="600" fontFamily="Inter, sans-serif">
        Driver
      </text>
      <text x="244" y="48" textAnchor="middle" fill="#27ae60" fontSize="8" fontFamily="Inter, sans-serif">
        98%
      </text>
      {/* Platform fee label */}
      <text x="176" y="72" textAnchor="middle" fill="#9ca3af" fontSize="8" fontFamily="Inter, sans-serif">
        2% platform fee
      </text>
    </svg>
  );
}
