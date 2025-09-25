import React from 'react';
import AddAgentSection from '@/components/dashboard/user/add-agent-section';
import UserBackButton from '@/components/dashboard/user/back-button';

type Props = {};

function AddAgentPage({}: Props) {
  return (
    <section className='px-16 py-8'>
      <UserBackButton />
      <AddAgentSection showGuidedTransaction={false} />
    </section>
  );
}

export default AddAgentPage;
