import * as React from 'react';

type Props = React.SVGProps<SVGSVGElement>;

const TikTokIcon = ({ className, ...props }: Props) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M12.5 2h3.02c.14 1.2.72 2.28 1.65 3.07.93.8 2.07 1.23 3.33 1.33v3.1c-1.4-.06-2.7-.53-3.78-1.36v6.3c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6c.4 0 .8.05 1.2.12v3.24c-.36-.2-.77-.31-1.2-.31-1.55 0-2.8 1.25-2.8 2.8s1.25 2.8 2.8 2.8 2.8-1.25 2.8-2.8V2z" />
  </svg>
);

export default TikTokIcon;
