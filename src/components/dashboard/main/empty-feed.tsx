import CustomButton from '@/components/custom-button';
import Image from 'next/image';
import CustomInput from '@/components/customs/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const EmptyFeed = () => {
  return (
    <div className='flex  h-full min-h-[500px] w-max flex-col items-center py-8  text-center'>
      <div className='relative h-48 w-48'>
        <Image
          src='/assets/images/feeds.svg'
          // height={140}
          // width={70}
          className='object-contain object-center'
          fill
          alt='empty-feed'
        />
      </div>
      <p className='py-1 text-grey-450'>
        Bringing endless social property packages soon.
      </p>
      <p className='py-2 text-2xl font-[500]'>Stay Informed!</p>

      <form className='my-8  flex items-center  justify-center gap-x-4'>
        <CustomInput
          className='w-[300px] rounded-md  bg-[#f5f8fa] md:w-[400px]'
          placeholder='Enter Email'
        />

        {/* <CustomButton
          onClick={(e) => {
            e.preventDefault();
          }}
          label="Notify Me"
          type="submit"
          className="bg-black w-max text-white rounded-3xl text-sm  px-6 py-2  hover:bg-opacity-90"
        /> */}

        <Button
          onClick={(e) => {
            e.preventDefault();
          }}
          type='submit'
          className='w-[150px]'
          roundness='full'
        >
          Notify Me
        </Button>
      </form>
    </div>
  );
};
