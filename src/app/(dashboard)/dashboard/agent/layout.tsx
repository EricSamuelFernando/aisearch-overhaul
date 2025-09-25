import React, { ReactNode } from 'react';
import { AgentPropertiesProvider } from '@/providers/agent-property-provider';

const AgentLayout = ({ children }: { children: ReactNode }) => {
  return (
    <AgentPropertiesProvider>
      <section
        className='h-full flex-auto rounded-t-[40px] bg-white'
        suppressHydrationWarning
      >
        {children}
      </section>
    </AgentPropertiesProvider>
  );
};

export default AgentLayout;
