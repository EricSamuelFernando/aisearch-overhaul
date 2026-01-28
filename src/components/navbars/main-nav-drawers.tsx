'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import CustomDrawer from '../customs/drawer';
import { cn } from '@/lib/utils';
import { useAuth } from '@/shared/hooks/useAuth';
import LoginRegisterModal from '../modals/login-register-modal';
import AccountDropdown from '../account-dropdown';

interface MobileSideDrawerProps {
  closeDrawer: () => void;
  isDrawerOpen?: boolean;
}

const MobileSideDrawer: React.FC<MobileSideDrawerProps> = ({
  closeDrawer,
  isDrawerOpen = false,
}) => {
  const { isLoggedIn, user } = useAuth();
  const [expandedSection, setExpandedSection] = React.useState<string | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <CustomDrawer
      position='right'
      isOpen={isDrawerOpen}
      onClose={closeDrawer}
      className='w-full max-w-sm px-0 py-0'
    >
      <div className="h-full bg-white flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200">
          <span className="text-lg font-semibold text-gray-900">Menu</span>
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
        <div className='flex-1 overflow-y-auto'>
          {/* Buy Section */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('buy')}
              className="w-full flex items-center justify-between px-4 py-4 text-left transition-colors"
            >
              <span className="text-base font-semibold text-gray-900">Buy</span>
              <svg
                className={`w-5 h-5 transform transition-transform duration-200 ${
                  expandedSection === 'buy' ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSection === 'buy' && (
              <div className="px-4 pb-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Buy a Home With
                    </p>
                    <div className="space-y-1 ml-2">
                      <Link
                        href="/login"
                        className="block text-sm text-gray-700 hover:text-primary py-1"
                        onClick={closeDrawer}
                      >
                        Your Agent
                      </Link>
                      <Link
                        href="/login"
                        className="block text-sm text-gray-700 hover:text-primary py-1"
                        onClick={closeDrawer}
                      >
                        Our Real Estate Agents
                      </Link>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Resources
                    </p>
                    <div className="space-y-1 ml-2">
                      <Link
                        href="/home#how-it-works"
                        className="block text-sm text-gray-700 hover:text-primary py-1"
                        onClick={closeDrawer}
                      >
                        How it Works
                      </Link>
                      <Link
                        href="/home#strength-analyzer"
                        className="block text-sm text-gray-700 hover:text-primary py-1"
                        onClick={closeDrawer}
                      >
                        Offer Strength Analyzer
                      </Link>
                      <Link
                        href="/home#testimonials"
                        className="block text-sm text-gray-700 hover:text-primary py-1"
                        onClick={closeDrawer}
                      >
                        Testimonials
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sell Section */}
          <div className="border-b border-gray-100">
            <button
              onClick={() => toggleSection('sell')}
              className="w-full flex items-center justify-between px-4 py-4 text-left transition-colors"
            >
              <span className="text-base font-semibold text-gray-900">Sell</span>
              <svg
                className={`w-5 h-5 transform transition-transform duration-200 ${
                  expandedSection === 'sell' ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedSection === 'sell' && (
              <div className="px-4 pb-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Sell A Home With
                    </p>
                    <div className="space-y-1 ml-2">
                      <Link
                        href="/login"
                        className="block text-sm text-gray-700 hover:text-primary py-1"
                        onClick={closeDrawer}
                      >
                        With an Agent
                      </Link>
                      <Link
                        href="/login"
                        className="block text-sm text-gray-700 hover:text-primary py-1"
                        onClick={closeDrawer}
                      >
                        Our Real Estate Agents
                      </Link>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Resources
                    </p>
                    <div className="space-y-1 ml-2">
                      <Link
                        href="/sell#how-it-works"
                        className="block text-sm text-gray-700 hover:text-primary py-1"
                        onClick={closeDrawer}
                      >
                        How it Works
                      </Link>
                      <Link
                        href="/sell#home-estimator"
                        className="block text-sm text-gray-700 hover:text-primary py-1"
                        onClick={closeDrawer}
                      >
                        Home Estimator
                      </Link>
                      <Link
                        href="/sell#testimonials"
                        className="block text-sm text-gray-700 hover:text-primary py-1"
                        onClick={closeDrawer}
                      >
                        Testimonials
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Other Navigation Links */}
          <div className="border-b border-gray-100">
            <Link
              href="/agents"
              className="block px-4 py-4 text-base font-semibold text-gray-900 hover:text-primary transition-colors"
              onClick={closeDrawer}
            >
              Agents
            </Link>
          </div>
          <div className="border-b border-gray-100">
            <Link
              href="/company"
              className="block px-4 py-4 text-base font-semibold text-gray-900 hover:text-primary transition-colors"
              onClick={closeDrawer}
            >
              Company
            </Link>
          </div>
          <div className="border-b border-gray-100">
            <Link
              href="/blog"
              className="block px-4 py-4 text-base font-semibold text-gray-900 hover:text-primary transition-colors"
              onClick={closeDrawer}
            >
              Blog
            </Link>
          </div>
        </div>

        {/* Authentication Section */}
        <div className='border-t border-gray-200 px-4 py-4'>
          {isLoggedIn ? (
            <div className="space-y-3">
              <Link 
                href='/dashboard' 
                className='block w-full text-center py-3 px-4 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors'
                onClick={closeDrawer}
              >
                Dashboard
              </Link>
              <div className="flex justify-center">
                <AccountDropdown
                  username={user?.fullname!}
                  avatar={user?.profile || null}
                  firstName={user?.firstname!}
                  lastName={user?.lastname!}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div onClick={closeDrawer}>
                <LoginRegisterModal
                  label='Login'
                  initialStage={0}
                  variant={"ghost"}
                  className='w-full font-medium text-center py-3 px-4 border border-gray-300 rounded-md transition-colors'
                />
              </div>
              <div onClick={closeDrawer}>
                <LoginRegisterModal
                  label='Get Started'
                  initialStage={1}
                  variant={"default"}
                  className='w-full font-medium text-center py-3 px-4 bg-black text-white rounded-md hover:bg-gray-800 transition-colors'
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
            <Link href='/sell#agents'>Our Real Estate Agents</Link>
            {/* <Link href='/sell#agents'>Do it Yourself</Link> */}
          </div>
        </div>
        <div className='flex flex-col space-y-7 pl-14'>
          <h4 className='text-md font-medium'>Resources</h4>
          <div className='flex flex-col space-y-5'>
            <Link href='/sell#how-it-works'>How it Works</Link>
            <Link href='/sell#home-estimator'>Home Estimator</Link>
            <Link href='/sell#testimonials'>Testimonials</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export { BuyDropdownMenu, SellDropdownMenu, MobileSideDrawer };
