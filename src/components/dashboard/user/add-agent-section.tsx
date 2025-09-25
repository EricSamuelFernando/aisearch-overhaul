import React from 'react';
import Heading from '@/components/heading';
import OnboardingAddAgentForm from '@/components/add-agent/add-agent-form';
import { AgentsCard } from '@/components/add-agent/add-agent-form';
import { AgentsProvider } from '@/providers/agent-list-provider';

type Props = {
  showGuidedTransaction?: boolean;
};

function AddAgentSection({ showGuidedTransaction = true }: Props) {
  return (
    <AgentsProvider>
      <section className='my-8'>
        <div className='h-50 grid grid-cols-5 gap-x-8'>
          <div className='col-span-3 h-full w-full'>
            <Heading
              className='p-0 text-2xl font-semibold'
              title='Add an Agent'
            />
            <div className='w-4/6'>
              <AgentsProvider>
                <OnboardingAddAgentForm
                  showGuidedTransaction={showGuidedTransaction}
                />
              </AgentsProvider>
            </div>
          </div>
          <div className='col-span-2 grid  h-full w-full'>
            <AgentsCard />
          </div>
        </div>
      </section>
    </AgentsProvider>
  );
}

export default AddAgentSection;
