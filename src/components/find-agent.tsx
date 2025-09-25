import Image from 'next/image';
import CustomLink from './custom-link';

export function FindAgentSection() {
  return (
    <section className='mx-auto px-4 md:px-[3.219rem]'>
      <div className='grid-cols-2 bg-ocGray py-8 md:grid md:py-24'>
        <div className='cols-span-1  grid place-content-center'>
          <div className='px-10 text-black md:px-20'>
            <h1 className='py-6 text-2xl font-bold md:text-5xl'>
              Over 500 <br className='hidden md:block' /> Certified Realtors
            </h1>
            <h3 className='text-sm'>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem
              ipsum dolor sit amet, consectetur adipiscing elit, sed do
            </h3>
            <CustomLink className='w-max bg-black text-white' href='/agent'>
              Find agent
            </CustomLink>
          </div>
        </div>
        <div className='cols-span-1 hidden items-center justify-center md:flex'>
          <div className='relative h-[150px] w-[150px]'>
            <Image
              src='/assets/images/Mask Group 94.jpg'
              alt={`test`}
              className='h-fit w-fit rounded-full'
              fill
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
          </div>
          <div className='relative -left-10 h-[150px]  w-[150px]'>
            <Image
              src='/assets/images/Mask Group 96.jpg'
              alt={`test`}
              className='h-fit w-fit rounded-full'
              fill
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
          </div>
          <div className='relative -left-24 h-[150px]  w-[150px]'>
            <Image
              src='/assets/images/Mask Group 95.jpg'
              alt={`test`}
              className='h-fit w-fit rounded-full'
              fill
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
