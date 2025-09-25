import { cn } from '@/lib/utils';
import Link from 'next/link';

interface CardProps {
  index: number;
  activeIndex: string | null;
  handleCardClick: () => void;
  property: Property;
}

const PropertyDetailCard: React.FC<CardProps> = ({
  index,
  activeIndex,
  handleCardClick,
  property,
}) => {
  const isActive = activeIndex === property._id;

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        'mt-5 cursor-pointer rounded-md px-8 py-8 text-sm transition-colors duration-200',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-grey-600 bg-[#F7F2EB] text-black',
      )}
    >
      <p className='font-bold'>{property.propertyName}</p>
      <Link
        href={`/dashboard/buyer/property/${property._id}`}
        target='_blank'
        className={cn('mt-2 inline-block font-bold text-[#E8804C]')}
      >
        View Property
      </Link>
    </div>
  );
};

export default PropertyDetailCard;
