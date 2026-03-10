import type { SVGProps } from 'react';
import React from 'react';

type Props = React.SVGProps<SVGSVGElement>;

const XIcon = React.forwardRef<SVGSVGElement, Props>(({ className, ...props }: Props, ref) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    fill="currentColor"
    aria-hidden="true"
    className={className}
    ref={ref}
    {...props}
  >
    <path d="M389.2 48H459.8L305.6 224.2L487 464H345L233.7 318.6L106.5 464H35.8L200.7 275.5L26.8 48H172.5L273.2 180.9L389.2 48ZM364.4 421.8H403.5L151.1 88H109.1L364.4 421.8Z" />
  </svg>
));

XIcon.displayName = 'XIcon';

export default XIcon;
