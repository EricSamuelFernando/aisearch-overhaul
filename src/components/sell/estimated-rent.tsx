import { MLSSearch } from './mls-search';
import { SellAnalytics } from './sell-analytics';

const EstimatedRent = () => {
  return (
    <section
      id='home-estimator'
      className='flex flex-col bg-[#FAF0E6] md:bg-[#FAF0E6] py-0 md:py-7 mt-0 md:mt-32'
    >
      {/* Mobile/Tablet: Title Section at Top */}
      <div className='lg:hidden bg-[#FDF6EE] px-4 pt-6 pb-4 text-center'>
        <h2 className='text-3xl font-bold text-[#2A1C14] mb-2'>
          EasyOffer Strength <span className='font-normal italic'>Analyzer</span>
        </h2>
        <p className='text-sm text-[#8B7D6B] leading-relaxed max-w-[600px] mx-auto'>
          Tailor your homebuying experience — your way, with the guidance you need.
        </p>
      </div>

      <div className='flex flex-col lg:grid lg:grid-cols-4 lg:min-h-[80vh] bg-[#FDF6EE]'>
        {/* First Section - Rental Estimate */}
        <div className='col-span-1 lg:col-span-2 flex flex-col items-center justify-center gap-3 bg-[#2A1C14] px-4 lg:px-16 py-6 lg:py-2'>
          {/* Mobile/Tablet: Small rounded button header */}
          <div className='mx-auto flex w-fit items-center px-3 py-1.5 justify-center rounded-full bg-[#100C07] text-[#F07639] mb-2 lg:mb-0'>
            <p className='text-center text-xs lg:text-[16px] font-bold capitalize'>
              Estimated monthly rent in your area
            </p>
          </div>

          <div className='flex flex-col items-center justify-center gap-4 text-white w-full'>
            <h3 className='text-5xl md:text-6xl font-bold 2xl:text-7xl'>$1,245</h3>

            <div className='font-medium w-full flex items-center justify-center'>
              <div className='flex gap-4 md:gap-6 items-center'>
                <p className='flex flex-col items-end justify-end text-end text-base md:text-xl 2xl:text-[1.8rem]'>
                  $1.19 <span className='text-sm md:text-md'>per sq.ft.</span>
                </p>

                <div className='h-12 md:h-16 w-[1px] bg-white' />

                <p className='flex flex-col items-end justify-end text-end text-base md:text-xl 2xl:text-[1.8rem]'>
                  $414.85 <span className='text-sm md:text-md'>per bedroom</span>
                </p>
              </div>
            </div>
          </div>

          <div className='w-full space-y-3 mt-4'>
            <div className='flex items-center justify-between px-2 text-sm md:text-lg font-medium text-white'>
              <p>Low Estimate</p>
              <p>High Estimate</p>
            </div>
            <div className='h-3 md:h-5 w-full rounded-full bg-gradient-to-r from-[#F07639] to-[#FFB000]' />
            <div className='mt-2 flex items-center justify-between px-2 text-base md:text-lg font-bold text-white 2xl:text-2xl'>
              <div className='text-left'>
                <p>$1,100</p>
                <p className='font-medium text-sm md:text-base'>$1.05 /sq.ft.</p>
              </div>

              <div className='text-right'>
                <p>$1,389</p>
                <p className='font-medium text-sm md:text-base'>$1.32 /sq.ft.</p>
              </div>
            </div>

            {/* MLS Search Input */}
            <div className='w-full mt-6 lg:mt-24'>
              <MLSSearch placeholderText='Enter your MLS#' />
            </div>
          </div>
        </div>

        {/* Second Section - Analytics */}
        <div className='col-span-1 lg:col-span-2 h-full w-full bg-[#FDF6EE] lg:bg-[#FDF6EE]'>
          <SellAnalytics />
        </div>
      </div>
    </section>
  );
};

export default EstimatedRent;
