import CustomLink from '@/components/custom-link';

function Listing() {
  return (
    <section className='my-8 bg-ocGray px-4 py-8 md:px-[3.219rem]'>
      <div className='mx-auto flex flex-col  items-center  justify-between gap-y-12 py-12 md:flex-row md:gap-x-12 md:gap-y-0 md:px-0'>
        <div className='flex-1 space-y-6'>
          <h3 className='text-2xl font-bold md:w-4/6 md:text-4xl'>
            Get your home listed In few minutes.
          </h3>
          <p className='text-[14px] text-grey-250  md:w-4/6'>
            Lorem ipsum dolor sit amet consectetur adipisicing elit.
            Exercitationem et fugit expedita! Optio officiis laborum a ex
            consectetur? Rerum distinctio est maiores repellendus iste modi?
          </p>
          <CustomLink className='w-max bg-black text-white' href='/agent'>
            Get Started
          </CustomLink>
        </div>

        <div className='w-full flex-1'>
          <div className="min-h-[400px] w-full  bg-[url('../../public/assets/images/map.svg')] bg-contain bg-center bg-no-repeat" />
        </div>
      </div>
    </section>
  );
}

export default Listing;
