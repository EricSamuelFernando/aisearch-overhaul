import React from 'react';

const RequestLoader = () => {
  return (
    <div className='min-w-[350px] flex-1  animate-pulse'>
      <div className='h-max rounded-xl bg-gray-200 px-4 pb-8 pt-6 text-white'>
        <div className='flex'>
          <div className='h-12 w-12 rounded-full bg-gray-300'></div>
          <div className='ml-4 space-y-4 pb-10 pt-2'>
            <p className='h-3 w-16 rounded-md bg-gray-300 font-bold' />
            <p className='h-3 w-40 rounded-md bg-gray-300 font-bold' />
          </div>
        </div>

        <div className='flex items-center gap-x-4 font-bold'>
          <p className='h-8 flex-1 rounded-full bg-gray-400' />
          <p className='h-8 flex-1 rounded-full bg-gray-400' />
        </div>
      </div>
    </div>
  );
};

export default RequestLoader;
