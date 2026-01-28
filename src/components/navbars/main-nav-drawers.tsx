'use client';

import * as React from 'react';
import Image from 'next/image';
import { nanoid } from 'nanoid';
import Link from 'next/link';

import CustomDrawer from '../customs/drawer';
import NavLink from '@/components/shared/nav-link';
import { cn } from '@/lib/utils';
import { mainNavsLinks } from '@/data/links';

interface MobileSideDrawerProps {
  closeDrawer: () => void;
  isDrawerOpen?: boolean;
  handleMouseLeave: () => void;
}

const MobileSideDrawer: React.FC<MobileSideDrawerProps> = ({
  closeDrawer,
  isDrawerOpen = false,
  handleMouseLeave,
}) => {
  return (
    <CustomDrawer
      position='right'
      isOpen={isDrawerOpen}
      onClose={closeDrawer}
      className='flex w-3/4 flex-col p-8'
    >
      <button className='flex justify-end' onClick={closeDrawer}>
        <Image
          src='/assets/images/close.svg'
          objectFit='contain'
          alt='close'
          height={16}
          width={16}
        />
      </button>

      <nav className='flex-auto'>
        <ul className='flex h-full flex-col items-center justify-center gap-y-4 text-black '>
          {mainNavsLinks.map((item) => (
            <li onClick={closeDrawer} key={nanoid()}>
              <NavLink
                slug={item.href?.replace('/', '')!}
                href={item.href!}
                rel={item.external ? 'noreferrer' : ''}
                className='flex items-center gap-x-2 font-medium uppercase'
                activeClass='border-black borde-b-[1px]'
                handleMouseEnter={() => { }}
                handleMouseLeave={handleMouseLeave}
              >
                {item.title}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
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