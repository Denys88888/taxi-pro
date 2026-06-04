import type { SVGProps } from 'react';

export function AvatarDefault(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="40" cy="40" r="40" fill="#e1e4e8" />
      <circle cx="40" cy="32" r="14" fill="#9ca3af" />
      <path
        d="M16 68c0-13.25 10.75-22 24-22s24 8.75 24 22"
        fill="#9ca3af"
      />
    </svg>
  );
}
