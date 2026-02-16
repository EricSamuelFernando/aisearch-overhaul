import type { SVGProps } from 'react';

const XIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path d="M3 3h4.6l4.1 5.5L15.5 3H21l-7.2 8.8L21.2 21h-4.7l-4.5-6-4.6 6H3l7.4-9L3 3Z" />
  </svg>
);

export default XIcon;
