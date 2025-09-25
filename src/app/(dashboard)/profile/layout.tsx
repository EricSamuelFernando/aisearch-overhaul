import React from 'react';

function layout({ children }: { children: React.ReactNode }) {
  return <div className='flex-auto bg-primary-100'>{children}</div>;
}

export default layout;
