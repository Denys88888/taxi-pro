import type { SVGProps } from 'react';

export function DestinationPin(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M20 0C8.96 0 0 8.96 0 20c0 15 20 28 20 28s20-13 20-28C40 8.96 31.04 0 20 0z"
        fill="#e74c3c"
      />
      <circle cx="20" cy="20" r="10" fill="#ffffff" />
      <path
        d="M15 15l10 10M25 15L15 25"
        stroke="#e74c3c"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
