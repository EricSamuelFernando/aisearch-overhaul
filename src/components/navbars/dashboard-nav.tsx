'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import AccountDropdown from '@/components/account-dropdown';
import { info } from '@/components/alert/notify';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth, useAuthActions } from '@/shared/hooks/useAuth';
import { cn } from '@/lib/utils';
import SnapHomz from '@public/assets/images/snaphomz-logo.svg';
import NotificationDropdown from '../dashboard/main/notification-dropdow';
import { storeCookie } from '@/lib/storage';
import { USER_ROLE } from '@/shared/constants/env';

type DashboardNavProps = {
  navClass?: string;
};

const DashboardNav: React.FC<DashboardNavProps> = ({ navClass }) => {
  const { user } = useAuth();
  return (
    // <header className={cn(`fixed top-0 left-0 z-10 w-full bg-primary-100`, `${navClass}`)}>
    //   <div className='mx-auto flex items-center justify-between px-[3.219rem] py-4 w-full'>
    //     <div className='logo'>
    //       <Link href='/home'>
    //         <Image src={SnapHomz} alt='logo' className='h-[3.75rem] w-44' />
    //       </Link>
    //     </div>

    //     <div className='flex items-center justify-between gap-x-6'>
    //       <UserSwitchTab />
    //       <NotificationDropdown />

    //       <AccountDropdown
    //         username={user?.fullname!}
    //         avatar={user?.profile || null}
    //         firstName={user?.firstname!}
    //         lastName={user?.lastname!}
    //       />
    //     </div>
    //   </div>
    // </header>
    <header className={cn(
      `fixed top-0 left-0 z-50 w-full bg-primary-100`,
      `${navClass}`
    )}>
      <div className="mx-auto flex w-full items-center justify-between px-4 sm:px-6 md:px-10 lg:px-[3.219rem] py-3">
        {/* Logo Section */}
        <div className="logo">
          {/* <Link href={user?.email ? "/dashboard" : "/home"}> */}
          <Link href="/home">
            <Image
              src="/assets/images/snaphomz-logo-black.png"
              alt="logo"
              width={200}
              height={59}
              className="h-12 w-auto sm:h-[3.75rem]"
            />
          </Link>
        </div>

        {/* Right Section: Tabs & Dropdowns */}
        <div className="flex items-center gap-4 sm:gap-5 md:gap-6">
          <UserSwitchTab />
          <NotificationDropdown />
          <AccountDropdown
            username={user?.fullname!}
            avatar={user?.profile || null}
            firstName={user?.firstname!}
            lastName={user?.lastname!}
          />
        </div>
      </div>
    </header>

  );
};

export default DashboardNav;

export const UserSwitchTab = () => {
  const { switchUser } = useAuthActions();
  const { user } = useAuth();
  const currentUser = user?.account_type;
  const router = useRouter();
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  const handleSwitch = () => {
    const userType = currentUser?.toLowerCase();
    if (userType === 'buyer') {
      console.log('BUYER');
      switchUser('seller');
      storeCookie({ key: USER_ROLE, value: 'seller' });
    } else if (userType === 'seller') {
      console.log('SELLER');
      switchUser('buyer');
      storeCookie({ key: USER_ROLE, value: 'buyer' });
    } else {
      switchUser('buyer');
      storeCookie({ key: USER_ROLE, value: 'buyer' });
    }
    router.push('/dashboard');
    info({ message: 'Switching User' });
  };

  const handleComingSoon = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    setTooltipOpen(true);
    tooltipTimeoutRef.current = setTimeout(() => setTooltipOpen(false), 2000);
  };

  const handleButtonClick = () => {
    if (currentUser?.toLowerCase() === 'buyer') {
      handleComingSoon();
      return;
    }
    handleSwitch();
  };

  if (!currentUser) return null;

  const isBuyerView = currentUser.toLowerCase() === 'buyer';
  const button = (
    <Button
      type="button"
      roundness='full'
      variant='outline'
      aria-disabled={isBuyerView}
      className={cn(
        'border-[1px] border-black px-6 py-1 font-bold text-black transition-opacity',
        isBuyerView && 'cursor-not-allowed opacity-60'
      )}
      onClick={handleButtonClick}
    >
      {isBuyerView ? (
        <span>I want to sell</span>
      ) : (
        <span>I want to Buy</span>
      )}
    </Button>
  );

  if (!isBuyerView) {
    return button;
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip
        open={tooltipOpen}
        onOpenChange={(open) => {
          if (!open) setTooltipOpen(false);
        }}
      >
        <TooltipTrigger asChild>
          {button}
        </TooltipTrigger>
        <TooltipContent side="bottom">
          Coming soon
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
