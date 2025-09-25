import { Skeleton } from '@/components/ui/skeleton';

function PropertyDetailLoader() {
  return (
    <>
      <div className='col-span-3 h-full w-full flex-col '>
        <div className='flex flex-col justify-between gap-20'>
          <div className='flex flex-row gap-20'>
            <Skeleton className='h-[125px] w-[450px] rounded-xl' />
            <div className='space-y-5'>
              <Skeleton className='h-8 w-[180px] rounded-full' />
              <Skeleton className='h-8 w-[180px] rounded-full' />
            </div>
          </div>

          <div className='flex w-full flex-col items-center justify-between gap-10'>
            <Skeleton className='h-6 w-[100%] rounded-full' />
            <div className='flex flex-row items-center justify-between gap-5'>
              <Skeleton className='h-6 w-[180px] rounded-full' />
              <Skeleton className='h-6 w-[180px] rounded-full' />
              <Skeleton className='h-6 w-[180px] rounded-full' />
              <Skeleton className='h-6 w-[180px] rounded-full' />
            </div>
          </div>

          <div className='flex w-full flex-col items-center justify-between gap-10'>
            <Skeleton className='h-6 w-[50%] rounded-full' />
            <Skeleton className='h-6 w-[180px] rounded-full' />
          </div>
        </div>
      </div>

      <div className='col-span-2 flex h-full w-full flex-col gap-20'>
        <div className='flex flex-row items-center justify-between gap-5'>
          <Skeleton className='h-[125px] w-[180px] rounded-xl' />
          <Skeleton className='h-[125px] w-[180px] rounded-xl' />
          <Skeleton className='h-[125px] w-[180px] rounded-xl' />
        </div>

        <div className='flex flex-col items-center justify-center gap-5'>
          <Skeleton className='h-[125px] w-[180px] rounded-xl' />
          <Skeleton className='h-6 w-[250px] rounded-full' />
          <Skeleton className='h-6 w-[180px] rounded-full' />
        </div>
      </div>
    </>
  );
}

export default PropertyDetailLoader;
