import CustomLink from '@/components/custom-link';
import TangibleInsight from '@/components/tangible-insight';

function Insight() {
  return (
    <section className='bg-ocGray pt-8'>
      <div className='bg- py-16'>
        <TangibleInsight />
      </div>

      <div className='mt-8 rounded-tr-[50px] bg-ocOrange px-4 py-12 md:rounded-tr-[150px] md:px-0  md:py-20'>
        <div className='mx-auto px-4 md:px-[3.219rem]'>
          <h3 className='text-2xl font-bold text-white md:w-4/6 md:text-4xl'>
            Ready to start ?
          </h3>
          <p className='my-6 text-base text-white  md:text-2xl'>
            Experience the journey with Snaphomz
          </p>
          <CustomLink className='w-max bg-black text-white' href='/agent'>
            Get Started
          </CustomLink>
        </div>
      </div>
    </section>
  );
}

export default Insight;
