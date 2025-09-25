'use client';

import Link from 'next/link';
import React from 'react';

import UserBackButton, { SellerBackToPropertyButton } from '@/components/dashboard/user/back-button';
import { UserInvitedAgentList } from '@/components/buy/property-purchase-process/UserInvitedAgentList';
import { AddAgentSearchForm } from '@/components/start-process/add-agent-form';
import { Icons } from '@/components/icons';
import { useParams, useSearchParams } from 'next/navigation';
import { SellingAgentDirectoryBox } from '../../seller-agent-directory-box';
import { InviteExternalAgent } from '../../seller-agent-invite-form';

function AddAgentPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [displayAgent, setDisplayAgent] = React.useState(false);
  const searchParams = useSearchParams();
  const meansType = searchParams.get("mean_type")
  const updateDisplay = (
    e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>,
  ) => {
    e.stopPropagation();
    setDisplayAgent((d) => !d);
  };

  return (
    <section className='px-16 h-auto py-8'>
      {/* <UserBackButton /> */}
      <SellerBackToPropertyButton /> 

      <div className='relative my-5 grid w-full place-items-baseline'>
        {meansType === "snaphomz_agents" ? <div className='col-span-2 w-full'>
          <SellingAgentDirectoryBox />
        </div> :
          <div className='col-span-4 flex h-screen w-full flex-col gap-5 space-y-8'>
            <div className='flex flex-col gap-1'>
              <h1 className='w-full text-2xl font-medium leading-10 md:w-4/6 md:text-4xl'>
                Add an agent
              </h1>
            </div>
            <InviteExternalAgent
            />
          </div>
        }
      </div>
    </section>
  );
}

export default AddAgentPage;
