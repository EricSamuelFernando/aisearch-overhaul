import AppQueryProviders from '@/providers/query-provider';
import React from 'react';

function layout({ children }: { children: React.ReactNode }) {
  return <AppQueryProviders><div className='flex-auto bg-primary-100'>{children}</div></AppQueryProviders>;
}

export default layout;