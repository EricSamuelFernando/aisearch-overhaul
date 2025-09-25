'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

const steps = [
  { path: '/finance-process', label: 'Financial Process' },
  { path: '/options', label: 'Options' },
  { path: '/preapproved-documents', label: 'Pre-approved Documents' },
  { path: '/buy-with-cash', label: 'Buy with Cash' },
  { path: '/spoken-to-lenders', label: 'Spoken to Lenders' },
  { path: '/add-agent', label: 'Add Agent' },
  { path: '/transaction-agreement', label: 'Transaction Agreement' },
];

export default function StartProcessProgress() {
  const pathname = usePathname();
  const currentStepIndex = steps.findIndex((step) =>
    pathname.includes(step.path),
  );
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className='mt-[100px] h-2 w-full min-w-[500px] overflow-hidden rounded-full bg-gray-200'>
      <div
        className='h-full bg-ocOrange transition-all duration-300 ease-in-out'
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
