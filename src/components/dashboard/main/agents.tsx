'use client';

import Heading from '@/components/heading';
import SkeletonLoader from '@/components/skeleton-loader';
import { useGetUserEngagementsAgents } from '@/hooks/api/agent/useAgentProperty';
import { useHandleAgent } from '@/hooks/api/agent/useFetchAgent';
import { getInitials, sellerGetInitials } from '@/lib/helpers';
import Image from 'next/image';
import Link from 'next/link';

function Agents() {

  const { getUserAgentList } = useHandleAgent();

  const {data:agents , isLoading ,} = useGetUserEngagementsAgents()

  console.log(agents)

  return (
    <div className='w-full'>
      <Heading
        title='Agents'
        className='my-4 w-full text-left text-xl font-bold'
      />
      <div className='flex items-center justify-between gap-x-3'>
        {isLoading ? (
          <div className='flex items-center gap-x-3'>
            {Array.from({ length: 3 }).map((item, i) => (
              <SkeletonLoader key={i} className='h-20 w-20 rounded-full' />
            ))}
          </div>
        ) : (
          <div className='w-full'>
            {agents && agents?.length > 0 ? (
              <div className='flex w-full items-center justify-between gap-x-4'>
                <div className='flex flex-auto gap-x-4'>
                  {agents?.map((agent:any, i:any) => (
                    <>
                    {
                        !agent?.profile ?
                        <div
                        key={i}
                        // className='relative h-[70px] w-[70px] rounded-full'
                        className='relative flex h-[70px] w-[70px] items-center justify-center rounded-full bg-black text-lg font-bold text-white'
                      >{
                         
                      }
                        
                        {sellerGetInitials(`${agent?.firstName } ${agent?.lastName }`)}
                      </div>
                      :<Image
                        src={agent?.profile}
                        objectFit='contain'
                        fill
                        width={32}
                        height={32}
                        unoptimized
                        className='w-32 h-32 rounded-full'
                        alt='Agent'
                      />
                    }
                    </>
                   
                  ))}
                </div>
                <Link
                  href='/dashboard/seller/agent'
                  className='mt-4 text-[1.125rem]'
                >
                  View all
                </Link>
              </div>
            ) : (
              <div className='flex items-center gap-x-3'>
                {Array.from({ length: 3 }).map((item, i) => (
                  <SkeletonLoader key={i} className='h-20 w-20 rounded-full' />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Agents;
