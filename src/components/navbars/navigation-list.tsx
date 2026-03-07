'use client';

import * as React from 'react';
import Link from 'next/link';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { setMlsBypassModeEnabled } from '@/lib/mls-bypass-mode';

const handleStateMlsQuickSearch = () => {
  setMlsBypassModeEnabled(true);
};

export function NavigationList({ dark = false }: any) {
  const textClass = dark ? 'text-white' : 'text-black';
  const headingClass = `text-lg font-medium ${textClass}`;

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className={`bg-transparent text-sm px-4 hover:bg-transparent hover:underline focus:bg-transparent ${textClass}`}>
            <Link href='/' className={`${textClass} hover:text-primary`}>
              Buy
            </Link>
          </NavigationMenuTrigger>
          <NavigationMenuContent className='w-full min-w-[600px] bg-[#FAF9F5]'>
            <div className='flex w-full flex-row divide-x divide-black p-6 font-medium'>
              <div className='flex flex-col space-y-4 pr-8'>
                <h4 className={headingClass}>Buy a Home With</h4>
                <div className='flex flex-col space-y-3'>
                  <Link
                    href='/buy/browse?q=California'
                    className='hover:text-primary hover:underline'
                    onClick={handleStateMlsQuickSearch}
                  >
                    Homes in California
                  </Link>
                  <Link
                    href='/buy/browse?q=Texas'
                    className='hover:text-primary hover:underline'
                    onClick={handleStateMlsQuickSearch}
                  >
                    Homes in Texas
                  </Link>
                  {/* <Link href='/login' className='hover:text-primary hover:underline'>
                    Our Real Estate Agents
                  </Link>*/}
                </div>
              </div>
              <div className='flex flex-col space-y-4 pl-8'>
                <h4 className={headingClass}>Resources</h4>
                <div className='flex flex-col space-y-3'>
                  <Link href='/#how-it-works' className='hover:text-primary hover:underline'>
                    How it Works
                  </Link>
                  {/*<Link href='/#strength-analyzer' className='hover:text-primary hover:underline'>
                    Offer Strength Analyzer
                  </Link>*/}
                  <Link href='/#testimonials' className='hover:text-primary hover:underline'>
                    Testimonials
                  </Link>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* <NavigationMenuItem>
          <NavigationMenuTrigger className={`bg-transparent px-4 hover:bg-transparent hover:underline focus:bg-transparent ${textClass}`}>
            <Link href='/sell' className={`${textClass} hover:text-primary`}>
              Sell
            </Link>
          </NavigationMenuTrigger>
          <NavigationMenuContent className='w-full min-w-[600px] bg-[#FAF9F5]'>
            <div className='flex w-full flex-row divide-x divide-black p-6 font-medium'>
              <div className='flex flex-col space-y-4 pr-8'>
                <h4 className={headingClass}>Sell A Home With</h4>
                <div className='flex flex-col space-y-3'>
                  <Link href='/login' className='hover:text-primary hover:underline'>
                    With an Agent
                  </Link>
                  {/* <Link href='/login' className='hover:text-primary hover:underline'>
                    Our Real Estate Agents
                  </Link>* /}
                </div>
              </div>
              <div className='flex flex-col space-y-4 pl-8'>
                <h4 className={headingClass}>Resources</h4>
                <div className='flex flex-col space-y-3'>
                  <Link href='/sell#how-it-works' className='hover:text-primary hover:underline'>
                    How it Works
                  </Link>
                  {/* <Link href='/sell#home-estimator' className='hover:text-primary hover:underline'>
                    Home Estimator
                  </Link>* /}
                  <Link href='/sell#testimonials' className='hover:text-primary hover:underline'>
                    Testimonials
                  </Link>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem> */}

        <NavigationMenuItem>
          <Link href='/agents' legacyBehavior passHref>
            <NavigationMenuLink className={`bg-transparent px-4 font-medium hover:bg-transparent hover:text-primary hover:underline ${textClass}`}>
              Agents
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        {/* <NavigationMenuItem>
          <Link href='/company' legacyBehavior passHref>
            <NavigationMenuLink className={`bg-transparent px-4 font-medium hover:bg-transparent hover:text-primary hover:underline ${textClass}`}>
              Company
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href='/blog' legacyBehavior passHref>
            <NavigationMenuLink className={`bg-transparent px-4 font-medium hover:bg-transparent hover:text-primary hover:underline ${textClass}`}>
              Blog
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem> */}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
