'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

import CustomDrawer from '../customs/drawer';
import { cn } from '@/lib/utils';
import { useAuth } from '@/shared/hooks/useAuth';
import LoginRegisterModal from '../modals/login-register-modal';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import { getInitials } from '@/lib/helpers';

interface MobileSideDrawerProps {
  closeDrawer: () => void;
  isDrawerOpen?: boolean;
}

const MobileSideDrawer: React.FC<MobileSideDrawerProps> = ({
  closeDrawer,
  isDrawerOpen = false,
}) => {
  const { isLoggedIn, user } = useAuth();
  const { userLogout } = useUserAuthApi();
  const [showAvatar, setShowAvatar] = React.useState(Boolean(user?.profile));
  const [isAccountMenuOpen, setIsAccountMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setShowAvatar(Boolean(user?.profile));
    if (!isDrawerOpen) setIsAccountMenuOpen(false);
  }, [user?.profile, isDrawerOpen]);

  React.useEffect(() => {
    if (typeof document === 'undefined') return;
    if (isDrawerOpen) {
      document.body.setAttribute('data-mobile-drawer-open', 'true');
    } else {
      document.body.removeAttribute('data-mobile-drawer-open');
    }
    return () => {
      document.body.removeAttribute('data-mobile-drawer-open');
    };
  }, [isDrawerOpen]);

  return (
    <CustomDrawer
      position='right'
      isOpen={isDrawerOpen}
      onClose={closeDrawer}
      className='w-full max-w-sm px-0 py-0'
    >
      <div className="h-full bg-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <Link href="/home" onClick={closeDrawer} className="flex items-center">
            <Image
              src="/assets/Logos/Snaphomz-Logo-Black (4).png"
              alt="Snaphomz"
              width={120}
              height={32}
              className="h-8 w-auto object-contain"
            />
          </Link>
          <button
            className='flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors'
            onClick={closeDrawer}
          >
            <Image
              src='/assets/images/close.svg'
              objectFit='contain'
              alt='close'
              height={16}
              width={16}
            />
          </button>
        </div>

        {/* Navigation Content */}
        <div className='flex-1 px-6 py-8'>
          <div className="space-y-6">
            <Link
              href="/home"
              className="block text-lg font-normal text-gray-900 hover:text-primary transition-colors"
              onClick={closeDrawer}
            >
              Home
            </Link>
            <Link
              href="/sell"
              className="block text-lg font-normal text-gray-900 hover:text-primary transition-colors"
              onClick={closeDrawer}
            >
              Sell
            </Link>
            <Link
              href="/agents"
              className="block text-lg font-normal text-gray-900 hover:text-primary transition-colors"
              onClick={closeDrawer}
            >
              Agents
            </Link>
            <Link
              href="/company"
              className="block text-lg font-normal text-gray-900 hover:text-primary transition-colors"
              onClick={closeDrawer}
            >
              Company
            </Link>
          </div>
        </div>

        {/* Authentication Section */}
        <div className='px-6 py-6 space-y-4'>
          {isLoggedIn ? (
            <div className="space-y-4">
              <Link
                href='/dashboard'
                className='block w-full text-center py-3 px-6 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors'
                onClick={closeDrawer}
              >
                Dashboard
              </Link>

              <div className="rounded-2xl border border-gray-200 bg-[#FAFAFA] p-4">
                <button
                  type="button"
                  className="flex w-full items-center gap-3"
                  onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                >
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-500 text-sm font-medium text-white">
                    {user?.profile && showAvatar ? (
                      <img
                        src={user.profile}
                        alt="Profile"
                        className="h-full w-full object-cover"
                        onError={() => setShowAvatar(false)}
                      />
                    ) : (
                      getInitials(user?.firstname || '', user?.lastname || '') || 'SH'
                    )}
                  </div>
                  <p className="flex-1 truncate text-left text-sm font-medium text-gray-800">
                    {user?.fullname || 'Signed in'}
                  </p>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-500 transition-transform ${isAccountMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isAccountMenuOpen && (
                  <div className="mt-4 space-y-2">
                    <Link
                      href='/account'
                      className='block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50'
                      onClick={closeDrawer}
                    >
                      Account
                    </Link>
                    <Link
                      href='/profile'
                      className='block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50'
                      onClick={closeDrawer}
                    >
                      Profile
                    </Link>
                    <button
                      className='block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50'
                      onClick={() => {
                        userLogout.mutate();
                        closeDrawer();
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div onClick={closeDrawer}>
                <LoginRegisterModal
                  label='Get Started'
                  initialStage={1}
                  variant={"default"}
                  className='w-full font-medium text-center py-3 px-6 bg-black text-white rounded-full hover:bg-gray-800 transition-colors'
                />
              </div>
              <div onClick={closeDrawer}>
                <LoginRegisterModal
                  label='Log in'
                  initialStage={0}
                  variant={"ghost"}
                  className='w-full font-medium text-center py-3 px-6 border border-gray-300 rounded-full transition-colors text-gray-700 hover:text-black'
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </CustomDrawer>
  );
};

interface DropdownMenuProps {
  isOpen: boolean;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
  headerHeight: number;
}

const BuyDropdownMenu: React.FC<DropdownMenuProps> = ({
  isOpen,
  handleMouseEnter,
  handleMouseLeave,
  headerHeight,
}) => {
  return (
    <div
      className={cn(
        'fixed left-0 right-0 z-40 hidden w-screen transform overflow-hidden border border-black bg-gray-100 transition-all duration-500 md:block',
        isOpen
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none -translate-y-10 opacity-0',
      )}
      style={{ top: `${headerHeight}px` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className='flex flex-row divide-x divide-gray-400 px-4 py-12 md:px-8'>
        <div className='flex flex-col space-y-7 pr-14'>
          <h4 className='text-md font-medium'>Buy a Home With</h4>
          <div className='flex flex-col space-y-5'>
            <Link href='/home#agents'>Your Agent</Link>
            <Link href='/home#agents'>Our Real Estate Agents</Link>
            {/* <Link href='/home#agents'>Do it Yourself</Link> */}
          </div>
        </div>
        <div className='flex flex-col space-y-7 pl-14'>
          <h4 className='text-md font-medium'>Resources</h4>
          <div className='flex flex-col space-y-5'>
            <Link href='/home#how-it-works'>How it Works</Link>
            <Link href='/home#strength-analyzer'>Offer Strength Analyzer</Link>
            <Link href='/home#testimonials'>Testimonials</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const SellDropdownMenu: React.FC<DropdownMenuProps> = ({
  isOpen,
  handleMouseEnter,
  handleMouseLeave,
  headerHeight,
}) => {
  return (
    <div
      className={cn(
        'fixed left-0 right-0 z-40 hidden w-screen transform overflow-hidden border border-black bg-gray-100 transition-all duration-500 md:block',
        isOpen
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none -translate-y-10 opacity-0',
      )}
      style={{ top: `${headerHeight}px` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className='flex flex-row divide-x divide-gray-400 px-4 py-12 md:px-8'>
        <div className='flex flex-col space-y-7 pr-14'>
          <h4 className='text-md font-medium'>Sell A Home With</h4>
          <div className='flex flex-col space-y-5'>
            <Link href='/sell#agents'>With an Agent</Link>
            {/* <Link href='/sell#agents'>Our Real Estate Agents</Link>*/}
            {/* <Link href='/sell#agents'>Do it Yourself</Link> */}
          </div>
        </div>
        <div className='flex flex-col space-y-7 pl-14'>
          <h4 className='text-md font-medium'>Resources</h4>
          <div className='flex flex-col space-y-5'>
            <Link href='/sell#how-it-works'>How it Works</Link>
            {/* <Link href='/sell#home-estimator'>Home Estimator</Link>*/}
            <Link href='/sell#testimonials'>Testimonials</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export { BuyDropdownMenu, SellDropdownMenu, MobileSideDrawer };
