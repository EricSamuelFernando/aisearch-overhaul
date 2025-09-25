import React from 'react';

function layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className='h-full flex-auto rounded-t-[40px] bg-white '
      suppressHydrationWarning
    >
      {children}
    </div>
  );
}

export default layout;
