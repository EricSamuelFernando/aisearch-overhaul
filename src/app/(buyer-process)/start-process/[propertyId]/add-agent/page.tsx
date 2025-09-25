'use client';

import Link from 'next/link';
import * as React from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

import { Icons } from '@/components/icons';
import { UserInvitedAgentList } from '@/components/buy/property-purchase-process/UserInvitedAgentList';
import { AddAgentSearchForm } from '@/components/start-process/add-agent-form';
import { AgentDirectoryBox } from '@/components/start-process/agent-directory-box';
import { usePurchaseProcessStore } from '@/store/use-purchase-process-store';
import { Button } from '@/components/ui/button';

const AddAgentPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { propertyId } = useParams<{ propertyId: string }>();
  const [displayAgent, setDisplayAgent] = React.useState(false);
  const { combinedProcessState, agentPreviousStep } = usePurchaseProcessStore();
  const [inviteStatus, setInviteStatus] = React.useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [inviteError, setInviteError] = React.useState<string | null>(null);

  const updateDisplay = (
    e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>,
  ) => {
    e.stopPropagation();
    setDisplayAgent((d) => !d);
  };
  const meansType = searchParams.get("means");
  const snaphomzAgents = searchParams.get('type')
  const backHref = React.useMemo(() => {
    if (agentPreviousStep) {
      return agentPreviousStep;
    } else {
      return `/start-process/${propertyId}/finance-process`;
    }
  }, [agentPreviousStep, propertyId]);

  const handleInviteSuccess = () => {
    setInviteStatus('success');
    setInviteError(null);
  };

  const handleInviteError = (error: string) => {
    setInviteStatus('error');
    setInviteError(error);
  };

  React.useEffect(()=>{
    if(snaphomzAgents){
      setDisplayAgent(true)
    }
  },[snaphomzAgents])

  const canContinue = inviteStatus === 'success' || inviteStatus === 'error';

  return (
    <>
      <div className='relative my-5 grid min-h-[512px] w-full grid-flow-col place-items-baseline px-0 py-10 md:grid-cols-3 md:px-5'>
        <div className='col-span-4 flex w-full flex-col gap-5 space-y-8'>
          <div className='flex flex-col gap-1'>
            <h1 className='w-full text-2xl font-medium leading-10 md:w-4/6 md:text-4xl'>
              Add an agent
            </h1>
            {/* <UserInvitedAgentList
              displayAgent={displayAgent}
              toggleDisplayAgent={updateDisplay}
            /> */}
          </div>
          {displayAgent ? null : (
            <AddAgentSearchForm
              // propertyId={combinedProcessState.property}
              // onInviteSuccess={handleInviteSuccess}
              // onInviteError={handleInviteError}
            />
          )}

          <p className='w-2/4 text-center font-bold text-grey-210'>OR</p>
          {/* <Link
            href={`/start-process/${propertyId}/transaction-agreement`}
            className='inline-flex cursor-pointer items-center space-x-3 md:w-fit'
          >
            <span className='border-b-2 border-black text-lg font-bold text-black'>
              Continue with a guided transaction
            </span>
            <Icons.Warning className='h-4 w-4' />
          </Link> */}
        </div>
        <div className='col-span-2 w-full'>
          <AgentDirectoryBox />
        </div>
      </div>

      {/* <div className='mt-auto flex w-full flex-nowrap items-center justify-between px-0 pb-5 md:px-5'>
        <div className='flex flex-row flex-nowrap items-center gap-3'>
          <Link
            href=""
            className='flex h-8 w-28 items-center justify-center rounded-full border-2 border-black bg-transparent px-12 py-2 text-center text-black'
            onClick={(e)=>{
              e.preventDefault();
              router.back();
            }}
          >
            Back
          </Link>
          <Link
            href={'/buy/browse'}
            className='px-8 py-2 font-bold text-ocOrange'
          >
            Cancel
          </Link>
        </div>

        <div className='flex flex-nowrap items-center gap-3'>
          <Button
            asChild
            disabled={!canContinue}
            className='h-8 rounded-full border-2 bg-black px-12 py-4 text-center text-white disabled:cursor-not-allowed disabled:bg-gray-400'
          >
            <Link href={`/start-process/${propertyId}/finance-process`}>
              Continue
            </Link>
          </Button>
        </div>
      </div> */}
    </>
  );
};

export default AddAgentPage;
