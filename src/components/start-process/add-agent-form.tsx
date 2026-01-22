'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import CustomInput from '@/components/customs/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import useDebounce from '@/hooks/utils/debounce';
import { error, success } from '../alert/notify';
import { useSelector } from 'react-redux';
import { userData } from '@/slices/auth/auth.slice';
import { useRouter, useSearchParams } from 'next/navigation';

interface Agent {
  id: string;
  fullname: string;
  firstName?: string;
  lastName?: string;
  email: string;
  profile?: string;
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const AddAgentSearchForm: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [searchedAgents, setSearchedAgents] = React.useState<Agent[]>([]);
  const [selectedIndex, setSelectedIndex] = React.useState<number>(-1);
  const [loading, setLoading] = React.useState(false);
  const [emailError, setEmailError] = React.useState('');
  const { externalAgentIvitationMutation } = useUserAuthApi();
  const [agents, setAgents] = React.useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = React.useState('');
  const debounce = useDebounce();
  const currentUser = useSelector(userData);
  const engagementId = searchParams.get('engagementId');
  const meansType = searchParams.get('mean_type');

  const handleAgentSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    if (!validateEmail(value)) {
      setEmailError('✨ Almost there! Please enter a valid email address');
      return;
    } else {
      setEmailError('');
    }
  };


  const sendAgentInvitation = () => {
    setLoading(true)
    const data = {
      agentType: currentUser?.account_type,
      userId: currentUser?.id,
      email,
      is_accepted: "pending",
      engagementId: engagementId || undefined,
    };

    externalAgentIvitationMutation.mutateAsync(data, {
      onSuccess: (data) => {
        setLoading(false)
        const { message } = data;
        console.log(data)  // Assuming the response contains a 'message' field
        success({ message: message || 'Invitation sent successfully' });
        setSelectedAgent('');
        setAgents([]);
        router.push('/dashboard/buyer')
        console.log(data)
        // if (meansType) {
        //   router.push('/dashboard/buyer');
        // }
      },
      onError: (err) => {
        setLoading(false)
        console.error('Error sending agent invitation:', err);
      },
    });
  };

  return (
    <div className='w-full max-w-3xl'>
      <div className='ms-4 flex items-center gap-x-4'>
        <CustomInput
          onChange={handleAgentSearch}
          value={email}
          placeholder='Search agent by email'
          className='h-12 rounded-lg'
          containerClass='p-0 mb-0'
        />
        <Button
          roundness='full'
          className='w-max min-w-[150px] px-4 text-xs disabled:bg-black/60'
          disabled={loading || (emailError?.length > 0 && email?.length > 0)}
          onClick={sendAgentInvitation}
        >
          Contact Agent
        </Button>
      </div>
      {emailError && <p className='text-red-500 text-sm mt-2'>{emailError}</p>}
      {loading && (
        <div className='mt-4 flex items-center justify-center'>
          <Loader2 className='h-6 w-6 animate-spin text-gray-500' />
        </div>
      )}
    </div>
  );
};
