import CustomLink from '@/components/custom-link';
import Image from 'next/image';

function SoldOutSection() {
  return (
    <section className='mx-auto my-12 px-4 md:px-[3.219rem]'>
      <div className='grid-cols-2 md:grid md:min-h-[70vh]'>
        <div className='relative col-span-1 hidden place-content-center rounded-l-2xl md:grid'>
          <Image
            src='/assets/images/sold-prty.jpg'
            alt={`test`}
            className='h-full w-full rounded-l-2xl bg-no-repeat'
            fill
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
          <div className="absolute inset-0 bg-[url('../../public/assets/images/celebrate.svg')] bg-cover bg-center"></div>
        </div>
        <div className='col-span-1 grid  place-content-center rounded-xl bg-black text-white md:rounded-none md:rounded-r-2xl'>
          <div className='px-8 text-white md:px-20'>
            <h1 className='py-6 pr-20 text-3xl font-bold md:text-5xl'>
              Sold out with <br className='hidden md:block' /> Minimum effort.
            </h1>
            <h3 className='text-sm'>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem
              ipsum dolor sit amet, consectetur adipiscing elit, sed do
            </h3>
            <CustomLink className='mb-8 w-full md:mb-0 md:w-1/2' href='/buy'>
              Buy a home
            </CustomLink>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SoldOutSection;
