import { InfoCardProp } from '@/interfaces/card.interface';
import { cn, capitalizeEachWord } from '@/lib/utils';

export const InfoCard = ({
  className,
  title = 'Open For Tour',
}: InfoCardProp) => {
  return (
    <span
      className={cn(
        'rounded-2xl bg-ocOrange px-4 py-2 text-sm font-bold text-black',
        className,
      )}
    >
      {capitalizeEachWord(title)}
    </span>
  );
};
