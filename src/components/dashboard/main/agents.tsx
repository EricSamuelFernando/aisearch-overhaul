// 'use client';

// import Heading from '@/components/heading';
// import SkeletonLoader from '@/components/skeleton-loader';
// import { useGetUserEngagementsAgents } from '@/hooks/api/agent/useAgentProperty';
// import { useHandleAgent } from '@/hooks/api/agent/useFetchAgent';
// import { getInitials, sellerGetInitials } from '@/lib/helpers';
// import Image from 'next/image';
// import Link from 'next/link';

// function Agents() {

//   const { getUserAgentList } = useHandleAgent();

//   const {data:agents , isLoading ,} = useGetUserEngagementsAgents()

//   console.log(agents)

//   return (
//     <div className='w-full'>
//       <Heading
//         title='Agents'
//         className='my-4 w-full text-left text-xl font-bold'
//       />
//       <div className='flex items-center justify-between gap-x-3'>
//         {isLoading ? (
//           <div className='flex items-center gap-x-3'>
//             {Array.from({ length: 3 }).map((item, i) => (
//               <SkeletonLoader key={i} className='h-20 w-20 rounded-full' />
//             ))}
//           </div>
//         ) : (
//           <div className='w-full'>
//             {agents && agents?.length > 0 ? (
//               <div className='flex w-full items-center justify-between gap-x-4'>
//                 <div className='flex flex-auto gap-x-4'>
//                   {agents?.map((agent:any, i:any) => (
//                     <>
//                     {
//                         !agent?.profile ?
//                         <div
//                         key={i}
//                         // className='relative h-[70px] w-[70px] rounded-full'
//                         className='relative flex h-[70px] w-[70px] items-center justify-center rounded-full bg-black text-lg font-bold text-white'
//                       >{
                         
//                       }
                        
//                         {sellerGetInitials(`${agent?.firstName } ${agent?.lastName }`)}
//                       </div>
//                       :<Image
//                         src={agent?.profile}
//                         objectFit='contain'
//                         fill
//                         width={32}
//                         height={32}
//                         unoptimized
//                         className='w-32 h-32 rounded-full'
//                         alt='Agent'
//                       />
//                     }
//                     </>
                   
//                   ))}
//                 </div>
//                 <Link
//                   href='/dashboard/seller/agent'
//                   className='mt-4 text-[1.125rem]'
//                 >
//                   View all
//                 </Link>
//               </div>
//             ) : (
//               <div className='flex items-center gap-x-3'>
//                 {Array.from({ length: 3 }).map((item, i) => (
//                   <SkeletonLoader key={i} className='h-20 w-20 rounded-full' />
//                 ))}
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Agents;


'use client';

import Heading from '@/components/heading';
import SkeletonLoader from '@/components/skeleton-loader';
import { useGetUserEngagementsAgents } from '@/hooks/api/agent/useAgentProperty';
import { useHandleAgent } from '@/hooks/api/agent/useFetchAgent';
import { sellerGetInitials } from '@/lib/helpers';
// import { getInitials, sellerGetInitials } from '@/lib/helpers';
import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';


function Agents() {
  const { getUserAgentList } = useHandleAgent();
  const { data: agents, isLoading } = useGetUserEngagementsAgents();
  const [showAll, setShowAll] = useState(false);

  const visibleAgents = showAll ? agents : agents?.slice(0, 4);

  return (
    <div className="w-full overflow-hidden">
      <Heading
        title="Agents"
        className="my-4 w-full text-left text-xl font-bold"
      />

      {isLoading ? (
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonLoader
              key={i}
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-full"
            />
          ))}
        </div>
      ) : agents && agents.length > 0 ? (
        <>
          {/* Agents list */}
          <div className="flex flex-wrap gap-3">
            {visibleAgents?.map((agent: any, i: number) => (
              <div
                key={i}
                className="relative h-12 w-12 sm:h-14 sm:w-14 rounded-full overflow-hidden flex-shrink-0 bg-gray-200"
              >
                {!agent?.profile ? (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-black text-xs sm:text-sm font-semibold text-white">
                    {sellerGetInitials(
                      `${agent?.firstName ?? ''} ${agent?.lastName ?? ''}`
                    )}
                  </div>
                ) : (
                  <Image
                    src={agent.profile}
                    alt="Agent"
                    fill
                    sizes="56px"
                    className="object-cover"
                    unoptimized
                  />
                )}
              </div>
            ))}
          </div>

          {/* Toggle button */}
          {agents.length > 4 && (
            <div className="my-2 text-right">
              <button
                onClick={() => setShowAll((prev) => !prev)}
                className="text-[1.125rem] font-medium hover:underline"
              >
                {showAll ? 'Show less' : 'View all'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonLoader
              key={i}
              className="h-12 w-12 sm:h-14 sm:w-14 rounded-full"
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Agents;

