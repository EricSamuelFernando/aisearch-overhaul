// 'use client';
// import { debounce } from 'lodash';
// import React, { useCallback, useEffect, useMemo, useState } from 'react';

// import { error as errorNotify } from '@/components/alert/notify';
// import {
//   NewRealtor,
//   RealtorProfile,
// } from '@/components/buy/onboard/realtor-profile';
// import CustomInput from '@/components/customs/input';
// import Heading from '@/components/heading';
// import { Button } from '@/components/ui/button';
// import { useHandleAgent } from '@/hooks/api/agent/useFetchAgent';
// import { cn, validateEmail } from '@/lib/utils';
// import { useModalContext } from '@/providers/modal-provider';
// import { Loader } from 'lucide-react';
// import Link from 'next/link';
// import useAgentsSearch from '../../hooks/api/user/useAgentsSearch';
// import { Icons } from '../icons';
// import { Skeleton } from '../ui/skeleton';
// import { useParams } from 'next/navigation';

// type Props = {
//   showGuidedTransaction?: boolean;
// };

// function OnboardingAddAgentForm({ showGuidedTransaction = true }: Props) {
//   const { propertyId } = useParams<{ propertyId: string }>();
//   const [email, setEmail] = React.useState<string>('');
//   const [search, setSearch] = useState('');
//   const { inviteAgentToUserProfile } = useHandleAgent();
//   const { addAgentToProperty } = useHandleAgent();

//   const handleInvite = async () => {
//     inviteAgentToUserProfile?.mutateAsync({
//       emails: [search],
//     });
//   };

//   useEffect(() => {
//     setSearch('');
//   }, [inviteAgentToUserProfile.isSuccess]);

//   const handleAgentInviteSelection = React.useCallback(
//     async (e: React.MouseEvent<HTMLButtonElement>) => {
//       e.stopPropagation();
//       e.preventDefault();
//       const result = await addAgentToProperty?.mutateAsync({
//         email,
//         propertyId,
//       });
//     },
//     [email, propertyId, addAgentToProperty],
//   );

//   return (
//     <>
//       <h3>
//         Have a specific agent you like to use?{' '}
//         <span className='cursor-pointer font-bold underline'>Invite</span>
//       </h3>
//       <div className='my-10 flex items-center gap-x-4'>
//         <CustomInput
//           onChange={(e) => setSearch(e.currentTarget.value)}
//           placeholder='Enter email Address'
//           className='h-12 rounded-lg'
//           containerClass='p-0 mb-0'
//         />
//         <Button
//           roundness='full'
//           className='w-max min-w-[150px] px-4 text-xs disabled:bg-black/60'
//           onClick={handleInvite}
//           disabled={
//             inviteAgentToUserProfile?.isPending || !validateEmail(search)
//           }
//         >
//           {inviteAgentToUserProfile?.isPending ? (
//             <Loader className='animate-spin' />
//           ) : null}
//           {inviteAgentToUserProfile?.isPending ? 'Inviting...' : 'Invite'}
//         </Button>
//       </div>

//       <p className='w-3/4 py-8 text-center font-bold text-[#ccc]'>OR</p>

//       {showGuidedTransaction ? (
//         <Link
//           href='/guided-transactions'
//           className='flex items-center gap-x-4 text-center'
//         >
//           <span>Continue with a guided transaction</span>
//           <Icons.Warning className='h-4 w-4' />
//         </Link>
//       ) : null}
//     </>
//   );
// }

// export default OnboardingAddAgentForm;


'use client';

import { debounce } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { error as errorNotify } from '@/components/alert/notify';
import {
  NewRealtor,
  RealtorProfile,
} from '@/components/buy/onboard/realtor-profile';
import CustomInput from '@/components/customs/input';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { useHandleAgent } from '@/hooks/api/agent/useFetchAgent';
import { cn, validateEmail } from '@/lib/utils';
import { useModalContext } from '@/providers/modal-provider';
import { Loader } from 'lucide-react';
import Link from 'next/link';
import useAgentsSearch from '../../hooks/api/user/useAgentsSearch';
import { Icons } from '../icons';
import { Skeleton } from '../ui/skeleton';
import { useParams } from 'next/navigation';

type Props = {
  showGuidedTransaction?: boolean;
};

function OnboardingAddAgentForm({ showGuidedTransaction = true }: Props) {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [email, setEmail] = useState<string>('');
  const { inviteAgentToUserProfile } = useHandleAgent();
  const { addAgentToProperty } = useHandleAgent();

  const handleInvite = async () => {
    inviteAgentToUserProfile?.mutateAsync({
      emails: [email],
    });
  };

  useEffect(() => {
    setEmail('');
  }, [inviteAgentToUserProfile.isSuccess]);

  const handleAgentInviteSelection = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      e.preventDefault();
      const result = await addAgentToProperty?.mutateAsync({
        email,
        propertyId,
      });
    },
    [email, propertyId, addAgentToProperty],
  );

  return (
    <>
      <h3>
        Have a specific agent you like to use?{' '}
        <span className='cursor-pointer font-bold underline'>Invite</span>
      </h3>
      <div className='my-10 flex items-center gap-x-4'>
        <CustomInput
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          placeholder='Enter email Address'
          className='h-12 rounded-lg'
          containerClass='p-0 mb-0'
        />
        <Button
          roundness='full'
          className='w-max min-w-[150px] px-4 text-xs disabled:bg-black/60'
          onClick={handleInvite}
          disabled={
            inviteAgentToUserProfile?.isPending || !validateEmail(email)
          }
        >
          {inviteAgentToUserProfile?.isPending ? (
            <Loader className='animate-spin' />
          ) : null}
          {inviteAgentToUserProfile?.isPending ? 'Inviting...' : 'Invite'}
        </Button>
      </div>

      <p className='w-3/4 py-8 text-center font-bold text-[#ccc]'>OR</p>

      {showGuidedTransaction ? (
        <Link
          href='/guided-transactions'
          className='flex items-center gap-x-4 text-center'
        >
          <span>Continue with a guided transaction</span>
          <Icons.Warning className='h-4 w-4' />
        </Link>
      ) : null}
    </>
  );
}

export default OnboardingAddAgentForm;

export const AgentsCard = ({ headerText = 'Choose Snaphomz Agents' }) => {
  const { openModal } = useModalContext();
  const limit = 3;
  const page = 1;
  const { data, isLoading } = useAgentsSearch('', limit, page);

  return (
    <div className='h-max max-w-md rounded-3xl bg-white p-10 px-8'>
      <Heading className='mb-10 p-0 text-2xl font-medium' title={headerText} />

      <div className='flex items-center justify-between gap-x-6'>
        {isLoading ? (
          <>
            <Skeleton className='h-20 w-full' />
          </>
        ) : (
          <>
            {data?.data.result.map((agent) => (
              <NewRealtor
                onClick={() => {
                  console.log(agent);
                }}
                key={agent._id}
                className='rounded-2xl'
                id={agent._id}
                realtorName={agent.fullname}
                address={agent.region}
              />
            ))}
          </>
        )}
      </div>

      {data?.data.result ? (
        <div className='mt-10 flex items-center justify-center'>
          <Button
            variant='secondary'
            onClick={() => openModal('select-agent')}
            className='border border-black bg-white px-6 font-semibold'
            roundness='full'
          >
            Load Directory
          </Button>
        </div>
      ) : null}
    </div>
  );
};
