import type { SVGProps } from 'react';

export function DriverCarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="18" cy="18" r="17" fill="#2c3e50" stroke="#ffffff" strokeWidth="2" />
      <path
        d="M6 20c0-3 2.4-5.4 5.4-5.4h2.1l2.7-5.4c1.2-2.4 3.6-3.9 6.3-3.9h5.4c2.7 0 5.1 1.5 6.3 3.9l2.7 5.4h2.1c3 0 5.4 2.4 5.4 5.4v6c0 1.8-1.2 3.3-2.7 3.9v2.4c0 1.5-1.2 2.7-2.7 2.7s-2.7-1.2-2.7-2.7v-1.8H11.4v1.8c0 1.5-1.2 2.7-2.7 2.7s-2.7-1.2-2.7-2.7V30c-1.5-.6-2.7-2.1-2.7-3.9v-6z"
        fill="#ffffff"
        transform="translate(4, 4) scale(0.65)"
      />
    </svg>
  );
}
