'use client';

import { userTestimonials } from '@/data/testimonials';
import { ITestimonail } from '@/interfaces/testimonail.interface';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useState } from 'react';
import CustomRating from '../customs/rating';

export function TestimonailTab() {
  const [activeTab, setActiveTab] = useState<string | null>(
    userTestimonials[0].user,
  );

  return (
    <section className='mx-6 hidden  md:flex '>
      <div className='flex-1'>
        {userTestimonials.map((testimonial) => {
          const isActiveTestimonial = activeTab === testimonial.user;
          return (
            <div
              onClick={() => setActiveTab(testimonial.user)}
              key={testimonial.user}
              className={`flex w-10/12 cursor-pointer flex-row items-center rounded-md px-10 py-4 
              bg-${isActiveTestimonial ? 'ocOrange' : 'transparent'} h-[132px]`}
            >
              <div className='relative mr-9 h-[80px] w-[80px]'>
                <Image
                  src={testimonial.imagePath}
                  alt={testimonial.user}
                  className='h-fit w-fit rounded-full'
                  fill
                  style={{
                    objectFit: 'cover',
                    objectPosition: 'center',
                  }}
                />
              </div>
              <div>
                <p>{testimonial.user}</p>
                <p
                  className={cn(
                    ` ${isActiveTestimonial ? 'text-white' : 'text-grey-250'}`,
                  )}
                >
                  {testimonial.role}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className='flex-1'>
        {userTestimonials
          .filter((testimonial) => testimonial.user === activeTab)
          .map((selected) => {
            return (
              <div className='px-4' key={selected.user}>
                <h1 className='text-2xl font-bold'>{selected.shortRating}</h1>
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
                  size='md'
                  value={selected.rating}
                />
                <p className='mt-10 text-justify text-lg leading-7'>
                  {selected.details}
                </p>
              </div>
            );
          })}
      </div>
    </section>
  );
}

export interface ITestimonialUser
  extends Pick<ITestimonail, 'imagePath' | 'role' | 'user'> {
  active: boolean;
}

export const TestimonialUser = ({
  active,
  role,
  imagePath,
  user,
}: ITestimonialUser) => {
  return (
    <div
      className={cn(
        `w-max items-center  justify-start gap-x-4   px-8 py-4 md:flex ${
          active ? 'bg-ocOrange' : 'bg-white'
        }`,
      )}
    >
      <div className='relative h-[70px] w-[70px]'>
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
        <p className={cn(` ${active ? 'text-white' : 'text-grey-250'}`)}>
          {role}
        </p>
      </div>
    </div>
  );
};

export const TestimonailContent = (
  props: Pick<ITestimonail, 'shortRating' | 'rating' | 'details'>,
) => {
  const { shortRating, rating, details } = props;
  return (
    <div className='px-4'>
      <h1 className='py-4 text-xl font-bold'>{shortRating}</h1>
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
      <p className='text-justify text-sm text-grey-250'>{details}</p>
    </div>
  );
};
