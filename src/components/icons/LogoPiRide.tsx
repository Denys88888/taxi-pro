import type { SVGProps } from 'react';

export function LogoPiRide(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="120" y2="120">
          <stop offset="0%" stopColor="#2c3e50" />
          <stop offset="100%" stopColor="#27ae60" />
        </linearGradient>
      </defs>
      {/* Background circle */}
      <circle cx="60" cy="60" r="56" fill="url(#logoGrad)" />
      {/* Car body */}
      <path
        d="M24 68c0-6 4.8-10.8 10.8-10.8h4.2l5.4-10.8c2.4-4.8 7.2-7.8 12.6-7.8h10.8c5.4 0 10.2 3 12.6 7.8l5.4 10.8h4.2c6 0 10.8 4.8 10.8 10.8v12c0 3.6-2.4 6.6-5.4 7.8v4.8c0 3-2.4 5.4-5.4 5.4s-5.4-2.4-5.4-5.4v-3.6H34.8v3.6c0 3-2.4 5.4-5.4 5.4s-5.4-2.4-5.4-5.4v-4.8c-3-1.2-5.4-4.2-5.4-7.8v-12z"
        fill="#ffffff"
      />
      {/* Car windows */}
      <path
        d="M44.4 46.8l-4.8 10.8h41.4l-4.8-10.8c-1.5-3.3-4.8-5.4-8.4-5.4H52.8c-3.6 0-6.9 2.1-8.4 5.4z"
        fill="#2c3e50"
        opacity="0.3"
      />
      {/* Pi symbol */}
      <text x="60" y="84" textAnchor="middle" fill="#2c3e50" fontSize="18" fontWeight="700" fontFamily="Inter, sans-serif">
        π
      </text>
      {/* Wheels */}
      <circle cx="37" cy="85" r="7" fill="#2c3e50" />
      <circle cx="83" cy="85" r="7" fill="#2c3e50" />
      <circle cx="37" cy="85" r="3" fill="#9ca3af" />
      <circle cx="83" cy="85" r="3" fill="#9ca3af" />
    </svg>
  );
}
