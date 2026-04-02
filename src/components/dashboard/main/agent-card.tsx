import React from 'react';
import Image from 'next/image';
import SkeletonLoader from '@/components/skeleton-loader';
import { IPropertyAgent } from '@/interfaces/property.interface';
import { Button } from '@/components/ui/button';
import { MessageSquareShare } from 'lucide-react';
import { useUserAgentMessageApi } from '@/hooks/api/auth/useMessageApi';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/hooks/useAuth';
import { decryptMessage, encryptMessage } from '@/utils/math-utilities';
import { useGetExternalAgentDetails } from '@/hooks/api/auth/useConversationApi';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

export const AgentCardSkeleton = () => {
  return (
    <div className='flex flex-1 animate-pulse items-center justify-center gap-x-6'>
      <div className='rounnded-full relative h-[50px] w-[50px] bg-gray-300 ' />
      <div className='bg-gray-300 font-bold'>
        <SkeletonLoader className='h-8 w-[100px] rounded-md bg-gray-300' />
        <SkeletonLoader className='h-8 w-[80px] rounded-md bg-gray-300' />
      </div>
    </div>
  );
};

type AgentProp = {
  agent?: IPropertyAgent;
};

function AgentCard({ agent, property }: any) {
  const firstNameRaw = agent?.agent?.firstName || agent?.firstName || 'Daniel';
  const lastNameRaw = agent?.agent?.lastName || agent?.lastName || 'Smith';
  const { data: externalAgent } = useGetExternalAgentDetails(agent?.id);
  const {
    createUserAgentThreadMutation,
    getAllThreadByPropertyMutation, // Import the mutation to get threads
    getAllThreadsBySellerMutation
  } = useUserAgentMessageApi();
  const { user } = useAuth();
  const router = useRouter();



  const handleThreadGeneration = async () => {
    try {
      //  First check seller threads
      debugger
      console.log(agent)
      console.log("agent", agent?.agent?.id)
      getAllThreadsBySellerMutation.mutate(
        { sellerAgentId: agent?.agent?.id },
        {
          onSuccess: (threads) => {
            debugger
            const existingThread = threads?.find(
              (thread: any) => thread?.sellerAgent?.id === agent?.agent?.id
            );

            console.log("Existing seller thread:", existingThread);
            if (existingThread) {
              router.push(`/dashboard/chat?type=messages&threadId=${existingThread.id}`);
            } else {
              // If no seller thread → check property threads
              getAllThreadByPropertyMutation.mutate(
                { propertyId: property?.propertyId, listingId: property?.listingId?.toString() || "" },
                {
                  onSuccess: (data) => {
                    const existingPropertyThread = data.data.get_threads_by_property?.find(
                      (thread: any) => thread?.sellerAgent?.id === agent?.id
                    );

                    if (existingPropertyThread) {
                      router.push(`/dashboard/chat?type=messages&threadId=${existingPropertyThread.id}`);
                    } else {
                      // 3️Otherwise create a new seller thread
                      createUserAgentThreadMutation.mutate(
                        {
                          propertyId: property?.id,
                          threadName: "Property Buyer Thread",
                          propertyName: property?.propertyName,
                          propertyImage: property?.propertyImage,
                          listingId: property?.listingId?.toString() || "",
                          propertyAddress: property?.propertyAddress,
                          propertyOwnerId: property?.ownerId, // 👈 replace with real property owner if available
                          sellerAgentId: agent?.id, // 👈 important
                          userType: 'Buyer',
                          userId: user?.id,
                          roomId: uuidv4(),
                          parentMessage: "Let's connect and talk",
                        },
                        {
                          onSuccess: (data) => {
                            router.push(`/dashboard/chat?type=messages&threadId=${data?.id}`);
                          },
                          onError: (error) => {
                            console.error("Error creating seller thread: ", error);
                          },
                        }
                      );
                    }
                  },
                  onError: (error) => {
                    console.error("Error checking property threads: ", error);
                  },
                }
              );
            }
          },
          onError: (error) => {
            console.error("Error fetching seller threads: ", error);
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  };
  // const handleThreadGeneration = async () => {
  //   try {
  //     // First, check if a thread already exists for this property
  //     debugger
  //     console.log("agent",agent)
  //     getAllThreadByPropertyMutation.mutate(
  //       { propertyId:property?.propertyId , listingId: property?.listingId?.toString() || "" },
  //       {
  //         onSuccess: (data) => {
  //           const existingThread = data.data.get_threads_by_property?.find(
  //             (thread: any) => thread?.buyerAgent?.id === agent?.id
  //           );

  //           if (existingThread) {
  //             // If a thread exists, redirect to the chat page for that thread
  //             router.push(`/dashboard/chat?type=messages&threadId=${existingThread.id}`);
  //           } else {
  //             // If no thread exists, create a new one
  //             createUserAgentThreadMutation.mutate(
  //               {
  //                 propertyId: property?.id,
  //                 threadName: "Property Message Thread",
  //                 propertyName: "New Property Thread",
  //                 propertyImage: property?.propertyImage,
  //                 listingId: property?.listingId?.toString() || "",
  //                 propertyAddress: property?.propertyAddress,
  //                 propertyOwnerId: "920513be-6829-40e1-8a75-4febf73fe3c5", // This seems to be a hardcoded ID, you might want to adjust this.
  //                 buyerAgentId: agent?.id,
  //                 userType: 'BUYER',
  //                 userId: user?.id,
  //                 roomId: uuidv4(),
  //                 parentMessage: "Let's connect and talk",
  //               },
  //               {
  //                 onSuccess: (data) => {
  //                   router.push(`/dashboard/chat?type=messages&threadId=${data?.id}`);
  //                 },
  //                 onError: (error) => {
  //                   console.error("Error creating new thread: ", error);
  //                 },
  //               }
  //             );
  //           }
  //         },
  //         onError: (error) => {
  //           console.error("Error checking for existing threads: ", error);
  //           // Optionally, you can handle the error by still trying to create a new thread
  //           // or by showing an error message to the user.
  //         },
  //       }
  //     );
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const firstName = capitalize(firstNameRaw);
  const lastName = capitalize(lastNameRaw);

  const initials = `${firstName[0]}${lastName[0]}`;
  const imageUrl =
    agent?.imageUrl ||
    agent?.agent?.profile ||
    agent?.profile ||
    agent?.agent?.avatarUrl ||
    agent?.avatarUrl;
  const hasImage = Boolean(imageUrl);

  return (
    <div className='flex flex-1 cursor-pointer items-center justify-center gap-x-1 sm:gap-x-2'>
      <div className='leading-1 flex flex-col gap-1 sm:gap-2 font-bold'>
        <div className='flex gap-1 sm:gap-2 items-center'>
          {hasImage ? (
            <Image
              height={50}
              width={50}
              src={imageUrl}
              objectFit='contain'
              alt='Agent'
              className='rounded-full object-cover w-[40px] h-[40px] sm:w-[45px] sm:h-[45px] md:w-[50px] md:h-[50px]'
            />
          ) : (agent?.agent?.firstName || agent?.firstName) && (agent?.agent?.lastName || agent?.lastName) ? (
            <>
              <div className='flex h-[40px] w-[40px] sm:h-[45px] sm:w-[45px] md:h-[50px] md:w-[50px] items-center justify-center rounded-full bg-gray-400 text-white text-sm sm:text-base md:text-lg font-semibold'>
                {initials}
              </div>
            </>
          ) : (
            ''
          )}
          {agent?.agent?.firstName && agent?.agent?.lastName ? (
            <>
              <p className='text-sm sm:text-base'>{`${firstName} ${lastName}`}</p>
            </>
          ) : (
            <p className='text-sm sm:text-base'>{externalAgent?.email || 'External Agent'}</p>
          )}
        </div>
        <div className='flex items-center justify-between'>
          {
            (agent?.is_accepted === "pending" || agent?.is_accepted === "PENDING") ?
              <p className='text-xs sm:text-sm md:text-md text-yellow-500'>Agent pending</p>
              : agent?.is_accepted === "rejected" ?
                <p className='text-xs sm:text-sm md:text-md text-red-500'>Agent rejected</p> :
                <p className='text-xs sm:text-sm text-ocOrange'>Agent accepted</p>
          }
          <button
            className='font-bol ml-4 sm:ml-6 md:ml-8 gap-1 sm:gap-2 flex items-center text-xs border p-1 sm:p-2 rounded-full'
            onClick={handleThreadGeneration}
          >
            {createUserAgentThreadMutation.isPending ? (
              <>connecting...</>
            ) : (
              <>
                Chat
                <MessageSquareShare size={12} className='sm:w-[14px] sm:h-[14px]' />
              </>
            )}
          </button>
        </div>
        <Button
          variant='ocreal'
          className={cn('px-2 sm:px-4 w-full sm:w-auto bg-black border bg-ocOrange')}
          roundness='full'
        >
          <Link
            href={{
              pathname: `/buy/${property?.propertyId}/prop/preview`,
              query: { listingId: property?.listingId, propertyId: property?.propertyId },
            }}
          >
            <div className='flex w-full bg-ocOrange items-center gap-x-1 sm:gap-x-2'>
              <span className='text-xs'>Visit Property</span>
            </div>
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default AgentCard;
