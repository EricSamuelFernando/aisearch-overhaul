import React, { forwardRef, HTMLProps } from 'react';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';

type ButtonType = 'h1' | 'h2' | 'h3' | 'h4' | 'h5';
type MainHeadingProp = HTMLProps<HTMLHeadingElement> & {
  type: ButtonType;
  asChild?: boolean;
};

export const BaseHeading = forwardRef<HTMLHeadingElement, MainHeadingProp>(
  ({ className, type = 'h1', asChild, children, ...rest }, ref) => {
    const Comp = asChild ? Slot : type;
    return (
      <Comp ref={ref} className={cn('font-bold', className)} {...rest}>
        {children}
      </Comp>
    );
  },
);

BaseHeading.displayName = 'BaseHeading';

type HeadingLevel2Prop = HTMLProps<HTMLHeadingElement> & {};
export const HeadingLevelTwo: React.FC<HeadingLevel2Prop> = ({ ...props }) => {
  return <BaseHeading {...props} type='h2' />;
};

type HeadingProps = {
  title: string;
} & HTMLProps<HTMLHeadingElement>;

export const Heading: React.FC<HeadingProps> = ({ title, ...props }) => {
  return (
    <BaseHeading {...props} type='h1'>
      {title}
    </BaseHeading>
  );
};

Heading.displayName = 'Heading';

export default Heading;
