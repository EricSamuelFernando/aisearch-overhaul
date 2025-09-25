import SkeletonLoader from '@/components/skeleton-loader';

type Props = {};

function PropertyDetailLoader({}: Props) {
  return (
    <section>
      <SkeletonLoader className='col-span-3 h-full w-full rounded-md bg-gray-300' />
      <SkeletonLoader className='col-span-2 h-full w-full bg-gray-400' />
    </section>
  );
}

export default PropertyDetailLoader;
