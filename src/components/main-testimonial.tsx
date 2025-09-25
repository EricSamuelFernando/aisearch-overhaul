import Link from 'next/link';
import { MoveUpRight } from 'lucide-react';

import { TestimonailTab } from './main/Testimonial';
import { MobileTestimonial } from './main/mobile-testimonail';

function MainTestimonial() {
  return (
    <section className='mx-auto  mt-16 px-4 md:px-8' id='testimonials'>
      <div className='flex justify-between'>
        <h2 className=' my-0 py-0 text-md font-bold md:text-5xl'>
          What our customers say about us
        </h2>
        <Link
          href='/testimonial'
          className='mb-2-5 flex items-center text-sm font-medium text-[#030303]'
        >
          View more
          <MoveUpRight className='mb-1 ml-3' size={12} />
        </Link>
      </div>

      <div className='py-16'>
        <TestimonailTab />
        <MobileTestimonial />
      </div>
    </section>
  );
}

export default MainTestimonial;
