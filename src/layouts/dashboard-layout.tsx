'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import DashboardNav from '@/components/navbars/dashboard-nav';
import Footer from '@/components/shared/footer';

type Props = {
  children: React.ReactNode;
};

function DashboardLayout({ children }: Readonly<Props>) {
  const pathname = usePathname();

  const isSpecialPage =
    pathname.includes('/listingprocess') ||
    pathname.includes('/guided-transaction') ||
    pathname.includes('/estimated-cost');

  const navClass = isSpecialPage ? 'bg-[#F7F2EB]' : 'bg-primary-100';
  const isChatPage = pathname === '/dashboard/chat';

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardNav navClass={navClass} />
      <section className="flex-grow">
        <div className={`${isChatPage ? "" : 'mt-[5.5rem]'}`}>{children}</div>
      </section>
      {/* Footer placed normally at the bottom */}
      {!isChatPage && (
        <footer className="mt-4">
          <Footer />
        </footer>
      )}
    </div>
  );
}

export { DashboardLayout };
