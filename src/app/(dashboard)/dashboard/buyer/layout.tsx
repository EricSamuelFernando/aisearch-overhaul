import { SwitchLayout } from '@/components/dashboard/main/buyer-dashboard/buyer-dashboard';
import React from 'react';

function layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className='flex-auto rounded-t-[40px] bg-white'
      suppressHydrationWarning
    >
      <SwitchLayout />
      {children}
    </div>
  );
}

export default layout;
