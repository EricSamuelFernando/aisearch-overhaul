import { Search } from 'lucide-react';
import { Input } from '../ui/input';

const FindAgent = () => {
  return (
    <section className='grid grid-cols-2 gap-8 px-10 py-20'>
      <div className='flex h-[14.375rem] w-full flex-col items-start justify-center gap-y-4 rounded-[10px] bg-[#F7F2EB] p-10 pl-8'>
        <div>
          <h3 className='text-xl font-bold'>FIND AN AGENT</h3>
          <p className='text-md'>Search our directory</p>
        </div>
        <div className='flex w-full max-w-[89%] items-center rounded-lg bg-white px-6 py-1'>
          <Search />
          <Input
            className='w-full  border-none py-3 outline-none hover:border-none hover:outline-none'
            placeholder='Search name, email or location'
          />
        </div>
      </div>
      <div className='flex h-[14.375rem] w-full flex-col items-center justify-center rounded-[10px] bg-black text-white'>
        <h3>Have an agent outside SNAPHOMZ?</h3>
        <p className='text-4xl underline hover:cursor-pointer'>
          INVITE YOUR AGENT
        </p>
      </div>
    </section>
  );
};

export default FindAgent;