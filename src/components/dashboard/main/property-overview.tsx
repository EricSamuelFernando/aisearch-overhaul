// 'use client';

// import CustomProgressBar from '@/components/customs/custom-ring-progress';
// import { cn } from '@/lib/utils';
// import Image from 'next/image';
// import { Button } from '@/components/ui/button';
// import { imageLoader } from '@/utils/image-loader';
// import Link from 'next/link';
// import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
// import { EngagedPropertyInterface } from '../user/property-detail-layout';
// import { useState } from 'react';

// type Props = {
//   className?: string;
//   trailColor?: string;
//   textColor?: string;
//   pathColor?: string;
//   streetName: string;
//   address: string;
//   image?: string;
//   status?: string;
//   progress?: number;
//   size?: number;
//   trackWidth?: number;
//   indicatorWidth?: number;
//   isManage?: boolean;
//   propertyId?:string;
// };

// export const OverviewSkeleton = () => (
//   <div className='flex animate-pulse items-center justify-between gap-x-4'>
//     <div className='flex flex-auto items-center gap-x-4'>
//       <div className='relative h-20 w-24 bg-gray-300' />
//       <div className='py-2 '>
//         <p className='h-4 w-1/2 bg-gray-300' />
//         <p className='h-4 max-w-[70%] bg-gray-400' />
//       </div>
//     </div>
//     <div className='h-[80px] w-[80px] rounded-full bg-gray-300' />
//   </div>
// );

// export function PropertyOverview({
//   className,
//   pathColor = 'black',
//   trailColor = '#d6d6d6',
//   streetName,
//   address,
//   textColor,
//   image,
//   status,
//   size = 80,
//   progress = 0,
//   trackWidth = 5,
//   indicatorWidth = 5,
//   isManage = false,
//   propertyId 
// }: Props) {
//   const { userPath } = useCurrentUser();
//   const [propertyData, setPropertyData] = useState<EngagedPropertyInterface>();
//   return (
//     <div className={cn('flex items-center justify-between ', className)}>
//       <div className='grid flex-auto grid-cols-3 items-center gap-x-4'>
//         <div className='relative aspect-square w-20 h-20 sm:w-24 sm:h-24 col-span-1 col-start-1 sm:col-span-1 sm:col-start-1'>
//           <Image
//             loader={imageLoader}
//             src={image ?? '/assets/images/placeholder.svg'}
//             alt={`${streetName}-image`}
//             className='h-full w-full rounded-md'
//             fill
//             style={{
//               objectFit: 'cover',
//               objectPosition: 'center',
//             }}
//           />
//         </div>

//         <div className='col-span-2 col-start-2 flex flex-col items-start justify-between ml-2'>
//           <div>
//             <p className='line-clamp-2 text-md font-bold'>{address}</p>
//             <p className='line-clamp-1 text-sm font-light'>
//               {streetName ? streetName : 'Street name not available'}
//             </p>
//           </div>
//           <br />
//           {isManage ? <Button
//             asChild
//             variant='outline'
//             className={cn('px-4 md:min-w-[150px] bg-black border border-ocOrange')}
//             roundness='full'
//           >
//             <Link href={`${userPath}/property/${propertyId}/manage`}>
//               <span className='flex w-full  items-center gap-x-2'>
//                 <span className='flex h-4 w-4 items-center justify-center rounded-full bg-ocOrange p-3'>
//                   1
//                 </span>
//                 <span className='font-bold'>Manage</span>
//               </span>
//             </Link>
           
//           </Button> : null}

        
//           {status ? (
//             <Button
//               variant='ocreal'
//               className='text-xs text-black'
//               roundness='full'
//             >
//               Now Showing
//             </Button>
//           ) : null}
//         </div>
//       </div>
//       <div>
//         <CustomProgressBar
//           trackColor={trailColor}
//           indicatorColor={pathColor}
//           size={size!}
//           progress={progress!}
//           trackWidth={trackWidth!}
//           indicatorWidth={indicatorWidth!}
//           spinnerMode={false}
//           label={
//             <p className='flex h-full  items-center justify-center text-center text-white'>
//               <span
//                 className={cn('text-sm text-black', textColor)}
//               >{`${progress}%`}</span>
//             </p>
//           }
//         />
//       </div>
//     </div>
//   );
// }

// export default PropertyOverview;


'use client';

import CustomProgressBar from '@/components/customs/custom-ring-progress';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { imageLoader } from '@/utils/image-loader';
import Link from 'next/link';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import { EngagedPropertyInterface } from '../user/property-detail-layout';
import { useState } from 'react';

type Props = {
  className?: string;
  trailColor?: string;
  textColor?: string;
  pathColor?: string;
  streetName: string;
  address: string;
  image?: string;
  status?: string;
  progress?: number;
  size?: number;
  trackWidth?: number;
  indicatorWidth?: number;
  isManage?: boolean;
  propertyId?: string;
};export const OverviewSkeleton = () => (
  <div className='flex animate-pulse items-center justify-between gap-x-4'>
    <div className='flex flex-auto items-center gap-x-4'>
      <div className='relative h-20 w-24 bg-gray-300' />
      <div className='py-2 '>
        <p className='h-4 w-1/2 bg-gray-300' />
        <p className='h-4 max-w-[70%] bg-gray-400' />
      </div>
    </div>
    <div className='h-[80px] w-[80px] rounded-full bg-gray-300' />
  </div>
);

export function PropertyOverview({
  className,
  pathColor = 'black',
  trailColor = '#d6d6d6',
  streetName,
  address,
  textColor,
  image,
  status,
  size = 80,
  progress = 0,
  trackWidth = 5,
  indicatorWidth = 5,
  isManage = false,
  propertyId 
}: Props) {
  const { userPath } = useCurrentUser();
  const [propertyData, setPropertyData] = useState<EngagedPropertyInterface>();
  return (
    <div className={cn('flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6', className)}>
      <div className='flex flex-auto items-start md:items-center gap-3 md:gap-4 w-full'>
        <div className='relative aspect-square w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0'>
          <Image
            loader={imageLoader}
            src={image ?? '/assets/images/placeholder.svg'}
            alt={`${streetName}-image`}
            className='h-full w-full rounded-md'
            fill
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
        </div>
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-3 md:gap-4 w-full pr-3 md:pr-0'>
            <div className='min-w-0 flex-1 flex-shrink'>
              <p className='truncate text-xs sm:text-sm md:text-base font-bold'>{address}</p>
              <p className='truncate text-xs sm:text-sm font-light text-gray-500'>
                {streetName ? streetName : 'Street name not available'}
              </p>
            </div>

            <div className='flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20'>
              <CustomProgressBar
                trackColor={trailColor}
                indicatorColor={pathColor}
                size={Math.max(60, size! * 0.7)}
                progress={progress!}
                trackWidth={trackWidth!}
                indicatorWidth={indicatorWidth!}
                spinnerMode={false}
                label={
                  <p className='flex h-full items-center justify-center text-center text-white'>
                    <span
                      className={cn('text-[10px] sm:text-xs md:text-sm font-semibold text-black leading-none', textColor)}
                    >{`${progress}%`}</span>
                  </p>
                }
              />
            </div>
          </div>

          <div className='mt-2 flex items-center gap-2 flex-wrap'>
            {isManage ? (
              <Button
                asChild
                variant='outline'
                className={cn('px-2 sm:px-4 pt-0.5 pb-1 sm:pt-1 sm:pb-1 text-xs sm:text-sm h-auto bg-black border border-ocOrange')}
                roundness='full'
              >
                <Link href={`${userPath}/property/${propertyId}/manage`}>
                  <span className='flex flex-row-reverse md:flex-row items-center gap-1 sm:gap-2'>
                    <span className='flex h-3 w-3 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-ocOrange text-xs flex-shrink-0'>
                      1
                    </span>
                    <span className='font-bold'>Manage</span>
                  </span>
                </Link>
              </Button>
            ) : null}

            {status ? (
              <Button
                variant='ocreal'
                className='text-xs h-auto pt-0.5 pb-1 px-2 sm:px-3 sm:pt-1 sm:pb-1 text-black'
                roundness='full'
              >
                Now Showing
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyOverview;