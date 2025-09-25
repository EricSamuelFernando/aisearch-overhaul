'use client';

import React, { useEffect } from 'react';
import { ActionButton } from '@/components/ui/action-button';
import { InputField } from '@/components/ui/propertyInput';
import { AgentsProvider } from '@/providers/agent-list-provider';
import { AgentsCard } from '@/components/add-agent/add-agent-form';
import CustomButton from '@/components/shared/custom-button';
import { useSearchParams, useRouter } from 'next/navigation';
import { useHandleAgent } from '@/hooks/api/agent/useFetchAgent';
import { SellerAgentsCard } from '@/components/seller-add-agent/sell-add-agent';

interface AddAgentPageProps {
  onBack: () => void;
  onSaveAndContinue: () => void;
  setAgentInvited: React.Dispatch<React.SetStateAction<boolean>>;
}

const AddAgentPage: React.FC<AddAgentPageProps> = ({
  onBack,
  onSaveAndContinue,
  setAgentInvited,
}) => {
  const [emailInput, setEmailInput] = React.useState<string>('');
  const [emails, setEmails] = React.useState<string[]>([]);
  const { inviteAgentToUserProfile } = useHandleAgent();
  const searchParams = useSearchParams();
  const router = useRouter();
  const propertyId = searchParams.get('id')!;
  const [step, setStep] = React.useState(0);

  const handleInvite = async () => {
    if (emailInput.trim() === '') return;

    // Add email to the emails array
    const newEmails = [...emails, emailInput.trim()];
    setEmails(newEmails);

    try {
      await inviteAgentToUserProfile.mutateAsync({
        emails: newEmails,
      });
      setAgentInvited(true);
      setEmailInput(''); // Clear the input field
    } catch (error) {
      console.error('Error while inviting agent:', error);
    }
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmailInput(event.target.value);
  };

  const handleContinueIndependently = () => {
    router.push(`/dashboard/seller/guided-transaction?id=${propertyId}`);
  };

  return (
    <AgentsProvider>
      <section className='flex h-screen-nav flex-col justify-between pt-8'>
        <section className='flex'>
          <section className='flex flex-1 flex-col justify-center'>
            <h2 className='mb-6 text-6xl font-medium'>Add an agent</h2>
            <div className='flex items-center'>
              <InputField
                label=''
                placeholder='Enter email address'
                name={''}
                onChange={handleEmailChange}
                value={emailInput}
              />
              <CustomButton
                className={`${
                  emailInput ? 'bg-black' : 'bg-ocGrey-100'
                } ml-4 w-max min-w-[12.5rem] rounded-3xl px-4 text-white`}
                label='Invite'
                onClick={handleInvite}
              />
            </div>
            <section className='flex items-start'>
              <div className='text-2xl'>
                <p className='my-8 text-center font-medium text-ocGrey-100'>
                  OR
                </p>
                <p className='font-medium'>
                  <button
                    onClick={handleContinueIndependently}
                    className='mt-4'
                  >
                    Continue to transact independently
                  </button>
                </p>
              </div>
            </section>
          </section>

          <div className='mt-4 flex items-start pl-24'>
            <div className='rounded-lg'>
              <SellerAgentsCard headerText='Choose Realtor from the list' />
            </div>
          </div>
        </section>
        <section className='flex w-full items-center justify-between pb-10'>
          <div>
            <ActionButton text='Back' onClick={onBack} />
          </div>
          <div>
            <ActionButton
              text={step === 4 ? 'Save & Continue' : 'Continue'}
              isPrimary
              onClick={
                step === 4 ? onSaveAndContinue : handleContinueIndependently
              }
            />
          </div>
        </section>
      </section>
    </AgentsProvider>
  );
};

export default AddAgentPage;
