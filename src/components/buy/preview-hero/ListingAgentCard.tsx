'use client';

import * as React from 'react';
import { Mail } from 'lucide-react';

import CustomModal from '@/components/shared/custom-modal';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import CustomInput from '@/components/customs/input';
import { cn } from '@/lib/utils';
import { sellerGetInitials } from '@/lib/helpers';
import { useRouter } from 'next/navigation';
import { useAgentConversationApi } from '@/hooks/api/auth/useConversationApi';
import { error, success } from '@/components/alert/notify';
import { useSelector } from 'react-redux';

interface ListingAgentCardProps {
  agentName?: string;
  className?: string;
  email?:string
}

const ListingAgentCard: React.FC<ListingAgentCardProps> = ({
  className,
  agentName,
  email
}) => {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const propertyData = useSelector((state: { property: { property: any } }) => state.property.property)
  const [viewState, setViewState] = React.useState<'message' | 'form'>(
    'message',
  );
  console.log(email)
  const { createThreadMutation } = useAgentConversationApi()
  const userData = useSelector((state: { auth: { user: any } }) => state.auth.user);  
  const handleClose = (
    e: React.MouseEvent<HTMLButtonElement | HTMLDivElement>,
  ) => {
    e.stopPropagation();
    if(userData?.account_type==="agent"){
      setOpen((o) => !o);
    }
    if(!userData?.id){
      router.push("/login")
    }
    // if(!open)
    //   router.push('/dashboard?tab=conversation')
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  };

  const handleSuggestionClick: (suggestion: string) => void = (suggestion: string) => {
    setMessage(suggestion);
  };

  const handleConversation = async (trheadData: any) => {
    try {
      createThreadMutation.mutate(trheadData, {
        onSuccess: (data) => {
          setLoading(false);
          router.push('/dashboard/chat')
        },
        onError: (error) => {
          console.log("Error in mutation: ", error);
          setLoading(false);
        },
      })
    } catch (error) {
      console.log(error);
    }
  }

  const nextButton = () => {
  const data = {
      listingId:propertyData?.listingId,
      propertyId: propertyData?.id,
      threadName: "New thread",
      propertyName: "New Property",
      propertyOwnerId: "29a5174b-b985-4239-a996-0c5d9cbc5591",
      buyerAgentId: "1b5ea235-556b-40db-a4a7-f71fd5ac5a37",
      sellerAgentId: "851524d2-7a93-4d06-b5d4-088a847f3f4a",
      message
    }    
    handleConversation(data)
    setViewState('form')
  };
  const prevButton = () => setViewState('message');

  return (
    <>
      <div
        className={cn('w-full rounded-lg bg-ocOrange px-2 py-3', className)}
        onClick={handleClose}
        // style={{marginTop: '-50px'}}
      >
        <div className='flex items-center justify-between'>
          <div className='inline-flex items-center space-x-2'>
            <div className='flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-ocGrey-50'>
              <p className='text-lg font-medium'>
                {sellerGetInitials(agentName || 'Snaphomz Buyer')}
              </p>
            </div>
            <div>
              <p className='text-sm font-semibold text-white'>
                {`${agentName} (Listing Agent) ` || 'Snaphomz Buyer'}
              </p>
              <p className='text-sm font-medium text-black'>{ email  || 'Listing Agent'} </p>
            </div>
          </div>
          {/* <button
            className='select-none pr-6 outline-none'
            onClick={handleClose}
          >
            <Mail size={32} color='#ffffff' strokeWidth={1.2} />
          </button> */}
        </div>
      </div>

      <CustomModal
        isOpen={open}
        className='backdrop-blur-sm'
        backdropBlur='pointer-event-none'
      >
        <div className='flex min-w-[25rem]  max-w-2xl flex-col overflow-x-hidden p-10 md:min-w-[32rem]'>
          <div className='flex items-center justify-between'>
            <h4 className='text-xl font-semibold leading-6'>
              {viewState === 'message'
                ? 'Send a message'
                : 'How can we get back to you?'}
            </h4>
            <Button
              onClick={handleClose}
              variant='secondary'
              size='icon'
              className='cursor-pointer bg-transparent hover:bg-transparent'
            >
              <Icons.Close className='h-5 w-5' />
            </Button>
          </div>

          {viewState === 'form' ? (
            <ListingAgentForm />
          ) : (
            <div className='mt-4 flex h-full w-full flex-col space-y-5'>
              <div className='inline-flex items-center space-x-4'>
                <div className='flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-ocGrey-50'>
                  <p className='text-lg font-medium'>
                    {sellerGetInitials(
                      agentName !== undefined ? agentName : 'Snaphomz Buyer',
                    )}
                  </p>
                </div>
                <div>
                  <p className='text-sm font-semibold text-black'>
                    {agentName}
                  </p>
                  <p className='text-sm font-medium text-grey-250'>
                     Listing Agent {email }
                  </p>
                </div>
              </div>
              <div />
              <div className='flex h-28 w-full flex-col rounded-md border border-grey-290 p-2.5'>
                <textarea
                  value={message}
                  onChange={handleChange}
                  placeholder='Write a message'
                  className='w-full flex-grow resize-none focus:border-transparent focus:outline-none focus:ring-0'
                />
                {message.length > 0 ? null : (
                  <div className='mt-2 grid w-full grid-flow-row grid-cols-3 gap-x-4'>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index.toString()}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className='col-span-1 w-full cursor-pointer truncate rounded-md border border-grey-290 p-1 text-center text-xs transition duration-150 ease-in-out hover:bg-gray-200'
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div></div>
            </div>
          )}
          <div
            className={cn(
              'flex justify-end',
              viewState === 'form'
                ? 'mt-3 w-full items-center justify-between'
                : '',
            )}
          >
            {viewState === 'message' ? (
              <Button
                disabled={message.length < 4}
                roundness='full'
                className='h-8 w-28 px-8'
                onClick={nextButton}
              >
                Next
              </Button>
            ) : (
              <>
                <Button
                  variant='outline'
                  roundness='full'
                  className='h-8 w-28 px-8'
                  onClick={prevButton}
                >
                  Back
                </Button>
                <Button roundness='full' className='h-8 w-28 px-8'>
                  Send
                </Button>
              </>
            )}
          </div>
        </div>
      </CustomModal>
    </>
  );
};

const ListingAgentForm = (): React.ReactElement => {
  return (
    <div className='mt-4 flex flex-col'>
      <CustomInput placeholder='First name' />
      <CustomInput placeholder='Last name' />
      <CustomInput placeholder='Phone' />
      <CustomInput placeholder='Email address' />
    </div>
  );
};

const suggestions = [
  "I'm interested in buying",
  'Is this home still available?',
  "I'd like more home details",
];

export { ListingAgentCard };
