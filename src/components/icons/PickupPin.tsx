import type { SVGProps } from 'react';

export function PickupPin(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M20 0C8.96 0 0 8.96 0 20c0 15 20 28 20 28s20-13 20-28C40 8.96 31.04 0 20 0z"
        fill="#27ae60"
      />
      <circle cx="20" cy="20" r="10" fill="#ffffff" />
      <circle cx="20" cy="20" r="5" fill="#27ae60" />
    </svg>
  );
}
