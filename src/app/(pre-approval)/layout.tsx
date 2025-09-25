import { ProgressBar } from '@/components/pre-approval/progress-bar';
import { PreApprovalProvider } from '@/providers/pre-approval-provider';

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import SnapHomz from '@public/assets/images/snaphomz-logo.svg';

export const metadata: Metadata = {
  title: 'Verify Email',
  description: 'Verify Email | Snap Homz',
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex min-h-screen w-screen flex-col overflow-hidden bg-[#faf9f5]  pt-4'>
      <PreApprovalProvider>
        <header className='px-6 py-2 md:px-12'>
        <div className='logo'>
          <Link href='/dashboard'>
            <Image src={SnapHomz} alt='logo' className='h-[3.75rem] w-44' />
          </Link>
        </div>
        </header>
        {/* <ProgressBar totalSteps={5} /> */}
        <main className='h-full'>{children}</main>
      </PreApprovalProvider>
    </div>
  );
}
