import { cn } from '@/lib/utils';

interface PropCardLoader {
  className?: string;
}

export const PropCardLoader = ({ className }: PropCardLoader) => {
  return (
    <div
      className={
        (cn('mx-8 mb-8 w-full flex-1 animate-pulse'), className)
      }
    >
      <div className='relative h-[200px] w-full animate-pulse rounded-t-lg  bg-gray-400' />
      <div className='h-max rounded-b-xl bg-gray-200 px-4 pb-8 pt-6 text-white'>
        <div className='space-y-4 pb-10 pt-2'>
          <p className='h-6 w-16 rounded-md bg-gray-300 font-bold' />
          <p className='h-6 w-40 rounded-md bg-gray-300 font-bold' />
        </div>

        <div className='flex items-center gap-x-4 font-bold'>
          <p className='h-6 flex-1 rounded-2xl bg-gray-400' />
          <p className='h-6 flex-1 rounded-2xl bg-gray-400' />
          <p className='h-6 flex-1 rounded-2xl bg-gray-400' />
        </div>
        
      </div>
    </div>
  );
};
