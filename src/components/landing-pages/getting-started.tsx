import { gettingStartedCardData } from '@/data/card';
import { ICardProps } from '@/interfaces/card.interface';
import { nanoid } from 'nanoid';
import Image from 'next/image';

export const GettingStartedCard = ({
  title,
  description,
  imagePath,
}: ICardProps) => {
  return (
    <div className='mx-auto w-full min-w-[250px] text-center'>
      <div className='flex items-center justify-center'>
        <div className='relative h-[85px] w-[85px] rounded-full bg-black text-center'>
          <Image
            src={imagePath}
            alt={`test`}
            fill
            className='h-full w-full rounded-full object-contain'
          />
        </div>
      </div>
      <div className='px-4  text-black'>
        <h2 className='py-4 text-[19px] font-bold'>{title}</h2>
        <p className='text-sm'>{description}</p>
      </div>
    </div>
  );
};

export const GettingStarted = () => {
  return (
    <section className='my-24'>
      <div className=''>
        <h2 className='text-bold py-4 text-center text-3xl font-extrabold tracking-tight lg:text-4xl'>
          Simple steps to get started
        </h2>
        <div className='mx-auto items-center justify-between gap-x-12 space-y-6 px-4  py-4 md:flex md:space-y-0 md:px-[3.219rem]'>
          {gettingStartedCardData.map((item) => (
            <GettingStartedCard key={nanoid()} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
};
