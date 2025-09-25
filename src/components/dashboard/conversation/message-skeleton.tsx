import { Skeleton } from '@/components/ui/skeleton';

export default function MessageSkeleton() {
  return (
    <section className='grid h-[500px] w-full grid-cols-10 gap-5'>
      <div className='col-span-3 h-full rounded-2xl bg-gray-200 p-4'>
        <div className='flex h-full flex-col items-center justify-center space-y-4'>
          {[...Array(5)].map((_, i) => (
            <div key={i} className='flex items-center gap-4'>
              <Skeleton className='h-16 w-16 rounded-full' />
              <div className='space-y-2'>
                <Skeleton className='h-6 w-40' />
                <Skeleton className='h-4 w-28' />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className='col-span-7 flex flex-col rounded-2xl bg-gray-200'></div>
    </section>
  );
}
