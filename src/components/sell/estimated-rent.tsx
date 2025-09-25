import { MLSSearch } from './mls-search';
import { SellAnalytics } from './sell-analytics';

const EstimatedRent = () => {
  return (
    <section
      id='home-estimator'
      className='flex flex-col space-y-16 bg-[#FAF0E6]  py-7 mt-32  md:grid md:min-h-[80vh] lg:py-10'
    >
      <div className='grid grid-cols-1 md:grid-cols-4  '>
        {/* First Section */}
        <div className='col-span-1 md:col-span-2 flex flex-col items-center justify-center gap-3 bg-[#170800] px-16 py-2'>
          <div className='mx-auto flex w-fit items-center p-2 justify-center  rounded-full bg-[#30180B]  text-[#D84C06]'>
            <p className='text-center text-[16px]  font-bold capitalize'>
              Estimated Monthly Rent in your area
            </p>
          </div>

          <div className='flex flex-col items-center justify-center gap-4 text-white'>
            <h3 className='text-3xl sm:text-4xl md:text-6xl font-bold 2xl:text-7xl'>$1,245</h3>

            <div className='font-medium'>
              <div className='flex gap-6'>
                <p className='flex flex-col items-end justify-end text-end text-md sm:text-xl 2xl:text-[1.8rem]'>
                  $1.19 <span className='text-md'>per sq.ft.</span>
                </p>

                <div className='h-16 w-[1px] bg-[#B3B3B3]' />

                <p className='flex flex-col items-end justify-end text-end  text-md  sm:text-xl 2xl:text-[1.8rem]'>
                  $414.85 <span className='text-md'>per bedroom</span>
                </p>
              </div>
            </div>
          </div>

          <div className='w-full space-y-3'>
            <div className='flex items-center justify-between px-2 text-lg sm:text-xl font-medium text-[#8C8C8C] 2xl:text-2xl'>
              <p>Low Estimate</p>
              <p>High Estimate</p>
            </div>
            <div className='h-5 w-full rounded-full bg-gradient-to-r from-[#F07639] to-[#FFB000]' />
            <div className='mt-2 flex items-center justify-between px-2 text-lg font-bold text-white 2xl:text-2xl'>
              <div>
                <p>$1,100</p>
                <p className='font-medium'>$1.05 /sq.ft.</p>
              </div>

              <div>
                <p>$1,389</p>
                <p className='font-medium'>$1.32 /sq.ft.</p>
              </div>
            </div>

            {/* MLS Search Input */}
            <div className='w-full mt-24'>
              <MLSSearch placeholderText='Enter your address or MLS#' />
            </div>
          </div>
        </div>

        {/* Second Section */}
        <div className='col-span-1 md:col-span-2 h-full w-full'>
          <SellAnalytics />
        </div>
      </div>
    </section>
  );
};

export default EstimatedRent;
