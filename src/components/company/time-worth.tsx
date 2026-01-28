import { Slider } from '../ui/slider';

const TimeWorth = () => {
  return (
    <section className='flex flex-col items-center justify-center space-y-20 px-10 py-5'>
      <h3 className='text-4xl font-bold 2xl:text-5xl'>
        How Much is Your Time Worth to You?
      </h3>

      <div className='grid grid-cols-2 gap-5'>
        <div className='flex h-[37.375rem] w-full flex-col gap-10 rounded-[20px] bg-[#F7F2EB] p-8 font-bold'>
          <p className='text-xl text-[#555555]'>
            Hours you spend per week drafting offers, disclosures, and manual
            calendaring work
          </p>

          <div className='space-y-3'>
            <p className='text-3xl font-bold'>5 hours</p>
            <div>
              <Slider
                defaultValue={[6]}
                max={20}
                step={1}
                className='w-full'
                trackClassName='bg-black'
                rangeClassName='bg-[#F07639]'
                thumbClassName='border-[#F07639]'
              />

              <div className='flex items-center justify-between pt-2 text-lg font-bold text-[#757575] 2xl:text-xl'>
                <p>1</p>
                <p>20</p>
              </div>
            </div>
          </div>

          <div className='space-y-3'>
            <p className='text-xl text-[#555555]'>
              How much 1 hour of your time is worth to you
            </p>
            <div className='flex w-full items-center rounded-[10px] border border-[#909090] bg-transparent px-4 py-2 font-medium'>
              <input
                className='w-full border-none bg-transparent text-lg outline-none 2xl:text-[32px] 2xl:leading-[2.7]'
                placeholder='$'
              />{' '}
              <p className='flex w-fit items-end justify-end text-lg text-[#9E9E9E] 2xl:text-4xl 2xl:leading-[2.7]'>
                /hr
              </p>
            </div>
          </div>
        </div>

        <div className='flex h-[37.375rem] w-full flex-col rounded-[20px] bg-black font-medium'>
          <div className='flex flex-col gap-5 p-8 font-medium'>
            <div className='flex flex-col items-center justify-center text-lg 2xl:text-xl'>
              <p className='text-lg  text-white'>
                Snaphomz will save you this much
              </p>
              <h3 className='text-7xl text-[#F07639] 2xl:text-[7.5rem] 2xl:leading-[10.125rem]'>
                $981
              </h3>
              <p className='text-lg text-white'>Or 20 hours of your life</p>
            </div>

            <button className='relative w-full border border-transparent px-8 py-8'>
              <span className='absolute inset-0 rounded-md bg-gradient-to-r from-[#F07639] to-[#1F7EA1] p-[2px]'>
                <span
                  className='flex h-full w-full items-center justify-center rounded-md bg-black text-lg font-bold
                 text-[#F07639] 2xl:text-xl'
                >
                  Start your free trial
                </span>
              </span>
            </button>
          </div>

          <div className='h-[2px] w-full bg-[#EEE3D8] text-lg 2xl:text-xl' />
          <div className='space-y-5 p-8 text-white'>
            <p className='font-bold'>How did we get this number?</p>

            <div className='flex flex-col gap-2'>
              <div className='flex items-center justify-between'>
                <p className='text-[#CCCCCC]'>Hours lost per month</p>
                <p className='font-bold'>20 hours</p>
              </div>
              <div className='flex items-center justify-between'>
                <p className='text-[#CCCCCC]'>
                  Value of...for saving 20 hours of your time
                </p>
                <p className='font-bold'>$1000</p>
              </div>
              <div className='flex items-center justify-between'>
                <p className='text-[#CCCCCC]'>
                  Cost of...Pro subscription per month
                </p>
                <p className='font-bold'>$19</p>
              </div>
            </div>

            <div className='h-[2px] w-full bg-[#EEE3D8]' />

            <div className='flex w-full justify-between font-bold'>
              <p>Total ROI per month</p>
              <p className='font-bold'>$981</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TimeWorth;