'use client';

import EmblaCarousel from '@/components/customs/carousel/embla-carousel';
import CustomRating from '@/components/customs/rating';
import { userTestimonials } from '@/data/testimonials';
import { ITestimonail } from '@/interfaces/testimonail.interface';
import { EmblaOptionsType } from 'embla-carousel';
import { nanoid } from 'nanoid';
import Image from 'next/image';

interface CardProps {
  image: string;
  title: string;
  category: string;
}

function Card({
  role,
  imagePath,
  user,
  rating,
  shortRating,
  details,
}: Readonly<ITestimonail>) {
  return (
    <div className='min-w-[280px] rounded-lg shadow-inner'>
      <div className='p-4'>
        <h2 className='pb-4 font-bold'>{shortRating}</h2>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Accusamus
          provident tempore, dolore natus sapiente architecto.
        </p>

        <div>
          <CustomRating
            color='gold'
            count={5}
            defaultValue={0}
            fractions={1}
            emptySymbol='☆'
            fullSymbol='★'
            highlightSelectedOnly={false}
            name='product-rating'
            readOnly={true}
            size='sm'
            value={rating}
          />
        </div>
        <div className='flex items-center gap-x-8'>
          <div className='relative h-[50px] w-[50px]'>
            <Image
              src={imagePath}
              alt={`test`}
              className='h-fit w-fit rounded-full'
              fill
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
          </div>
          <div>
            <p>{user}</p>
            <span>{role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const OPTIONS: EmblaOptionsType = { dragFree: true, loop: true };
const SLIDE_COUNT = 5;
const SLIDES = Array.from(Array(SLIDE_COUNT).keys());

export function MobileTestimonial() {
  const slides = userTestimonials.map((item, i) => <Card key={i} {...item} />);
  return (
    <div className='md:hidden'>
      <EmblaCarousel slides={slides} options={OPTIONS} />
    </div>
  );
}
