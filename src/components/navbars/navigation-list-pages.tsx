'use client';

import * as React from 'react';
import Link from 'next/link';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { AGENT_APPLICATIONS } from '@/shared/constants/env';
export function NavigationListPages() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className='bg-transparent px-4 hover:bg-transparent hover:underline focus:bg-transparent'>
            <Link href='/home' className='text-white'>
              Buy
            </Link>
          </NavigationMenuTrigger>
          <NavigationMenuContent className='w-full min-w-[600px] bg-[#FAF9F5]'>
            <div className='flex w-full flex-row divide-x divide-white p-6 font-medium'>
              <div className='flex flex-col space-y-4 pr-8'>
                {/* <h4 className='text-lg font-medium'>Buy a Home With</h4> */}
                <div className='flex flex-col space-y-3'>
                  <Link href='/agents' className='hover:text-primary hover:underline'>
                    Your Agent
                  </Link>
                  <Link  href={AGENT_APPLICATIONS ||""} className='hover:text-primary hover:underline'>
                    Our Real Estate Agents
                  </Link>
                  <Link href='/home/buyer-how-it-works' className='hover:text-primary hover:underline'>
                     How it Works
                  </Link>
                </div>
              </div>
                <div className='flex flex-col space-y-4 pl-8'>
                <div className='flex flex-col space-y-3'>
                  <Link href='#offer-strength' className='hover:text-primary hover:underline'>
                    Offer Strength Analyzer
                  </Link>
                  <Link href="#testimonials" className='hover:text-primary hover:underline'>
                     Testimonials
                  </Link>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger className='bg-transparent px-4 hover:bg-transparent hover:underline focus:bg-transparent'>
            <Link href='/sell' className='text-white'>
              Sell
            </Link>
          </NavigationMenuTrigger>
          <NavigationMenuContent className='w-full min-w-[600px] bg-[#FAF9F5]'>
                   <div className='flex w-full flex-row divide-x divide-white p-6 font-medium'>
              <div className='flex flex-col space-y-4 pr-8'>
                {/* <h4 className='text-lg font-medium'>Buy a Home With</h4> */}
                <div className='flex flex-col space-y-3'>
                  <Link href='/agents' className='hover:text-primary hover:underline'>
                   With an agents
                  </Link>
                  <Link href={AGENT_APPLICATIONS ||""} className='hover:text-primary hover:underline'>
                    Our Real Estate Agents
                  </Link>
                  <Link href='/home/seller-how-it-works' className='hover:text-primary hover:underline'>
                     How it Works
                  </Link>
                </div>
              </div>
                <div className='flex flex-col space-y-4 pl-8'>
                <div className='flex flex-col space-y-3'>
                  <Link href='#home-estimator' className='hover:text-primary hover:underline'>
                   Home Estimator
                  </Link>
                  <Link href="#testimonials" className='hover:text-primary hover:underline'>
                     Testimonials
                  </Link>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
            <NavigationMenuTrigger className='bg-transparent px-4 font-medium text-white'>
                <Link href='/agents' legacyBehavior passHref>
              Agents
              </Link>
            </NavigationMenuTrigger>
                    <NavigationMenuContent className='w-full min-w-[600px] bg-[#FAF9F5]'>
                   <div className='flex w-full flex-row divide-x divide-white p-6 font-medium'>
              <div className='flex flex-col space-y-4 pr-8'>
                {/* <h4 className='text-lg font-medium'>Buy a Home With</h4> */}
                <div className='flex flex-col space-y-3'>
                  <Link href='/home/agents-how-it-works' className='hover:text-primary hover:underline'>
                     How it Works
                  </Link>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <Link href='/company' legacyBehavior passHref>
            <NavigationMenuLink className='bg-transparent px-4 font-medium text-white '>
              Company
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
