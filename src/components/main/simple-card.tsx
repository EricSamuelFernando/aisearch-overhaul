import { ICardProps } from '@/interfaces/card.interface';
import NextImage from 'next/image';

export const SimpleCard = ({ title, description, imagePath }: ICardProps) => {
  return (
    <div className='w-full min-w-[250px]'>
      <div className='relative h-[280px] w-full rounded-t-lg'>
        <NextImage
          src={imagePath}
          alt={`test`}
          className='h-full w-full rounded-t-lg bg-no-repeat'
          fill
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      </div>
      <div className='rounded-b-lg bg-black px-4 py-12 pt-8 text-left text-white'>
        <h2 className='py-4 text-[19px] font-bold'>{title}</h2>
        <p className='text-sm'>{description}</p>
      </div>
    </div>
  );
};
