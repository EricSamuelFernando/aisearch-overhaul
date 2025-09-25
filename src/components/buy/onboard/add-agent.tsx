import { AgentsProvider } from '@/providers/agent-list-provider';
import { AddAgentForm } from './add-agent-form';

export const AddAgentProcess = () => {
  return (
    <AgentsProvider>
      <div className='col-span-1 space-y-6'>
        <h1 className='py-8 text-4xl font-bold'>Add an Agent?</h1>
        <AddAgentForm />
      </div>
    </AgentsProvider>
  );
};
