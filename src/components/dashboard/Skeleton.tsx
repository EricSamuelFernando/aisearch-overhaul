import SkeletonLoader from '../skeleton-loader';
import { OverviewSkeleton } from './main/property-overview';

type Props = {};

function DahboardSkeleton({}: Props) {
  return (
    <section className='animate-pulse rounded-md bg-grey-50 p-4'>
      <OverviewSkeleton />

      <SkeletonLoader className='mx-auto my-4 block h-[1px] w-[95%] bg-grey-350' />
      <div className='mx-auto my-4 flex items-center gap-4 gap-x-4'>
        <SkeletonLoader className='h-6 w-[100px] rounded-2xl bg-gray-300 px-2  py-1 text-sm' />
        <SkeletonLoader className='h-6 w-[100px] rounded-2xl bg-gray-300 px-2  py-1 text-sm' />
        <SkeletonLoader className='h-6 w-[100px] rounded-2xl bg-gray-300 px-2  py-1 text-sm' />
      </div>
    </section>
  );
}

export default DahboardSkeleton;
