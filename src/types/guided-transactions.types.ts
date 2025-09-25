import React from 'react';
import { IconProps } from '@/components/icons';

export type StepKey =
  | 'add-agent'
  | 'draft-offer'
  | 'review-disclosure'
  | 'title-escrow'
  | 'sign-close';

export type StepProp = {
  title: string;
  desc: string;
  key: StepKey;
  icon: (props: IconProps) => React.JSX.Element;
};
