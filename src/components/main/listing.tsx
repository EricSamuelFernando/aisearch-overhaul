import CustomLink from '@/components/custom-link';
import Image from 'next/image';

function Listing() {
  return (
    <section className='mx-auto px-4 md:px-[3.219rem]'>
      <div className='grid gap-y-8 py-12 md:grid-cols-2'>
        <div className='cols-span-1 flex items-center justify-center'>
          <div className='relative h-[350px] w-full md:h-full'>
            <Image
              src='/assets/images/sell.png'
              alt={`test`}
              className='h-full w-full scale-[1.2] rounded-full'
              fill
              style={{
                objectFit: 'contain',
                objectPosition: 'center',
              }}
            />
          </div>
        </div>
        <div className='cols-span-1  grid place-content-center'>
          <div className='px-6 text-black md:px-20'>
            <h1 className='py-6 text-3xl font-bold md:text-5xl'>
              Get your home listed <br className='hidden md:block' /> In few
              minutes.
            </h1>
            <h3 className='text-sm'>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem
              ipsum dolor sit amet, consectetur adipiscing elit, sed do
            </h3>
            <CustomLink className='text-white md:bg-black' href='/agent'>
              Get Started
            </CustomLink>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Listing;
