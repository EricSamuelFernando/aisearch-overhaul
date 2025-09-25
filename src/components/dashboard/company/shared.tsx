import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
export type SummaryCardItemProp = {
  title: ReactNode;
  titleClass?: string;
  description: ReactNode;
  descriptionClass?: string;
};

export const SummaryCardItem = ({
  title = 'Offer Price',
  titleClass,
  description = '$740,000',
  descriptionClass,
}: SummaryCardItemProp) => {
  return (
    <div className='flex-1'>
      <span className={cn('text-xs text-grey-70', titleClass)}>{title}</span>
      <p className={cn('text-base', descriptionClass)}>{description}</p>
    </div>
  );
};
