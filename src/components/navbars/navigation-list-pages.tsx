'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from '@/components/ui/navigation-menu';
import { AGENT_APPLICATIONS } from '@/shared/constants/env';
import { setMlsBypassModeEnabled } from '@/lib/mls-bypass-mode';

export function NavigationListPages({ isScrolled = false }: { isScrolled?: boolean }) {
  const pathname = usePathname();
  const hiddenTopNavItems = new Set(['/company']);

  // Determine text color based on route
  const getTextColor = (route: string) => {
    if (pathname === '/' || pathname?.startsWith('/home') || pathname === '/home' || pathname === '/home/buy') {
      return 'text-white';
    } else if (pathname?.startsWith('/buy')) {
      return 'text-black';
    } else if (pathname === '/sell') {
      return 'text-black';
    } else if (pathname?.startsWith('/agents')) {
      return 'text-black';
    } else if (pathname === '/company') {
      return 'text-white';
    }
    // Default to white for other routes
    return 'text-white';
  };

  // Check if a route is active
  const isActive = (route: string) => {
    if (route === '/' || route === '/home') {
      return pathname === '/' || pathname === '/home' || pathname === '/home/buy' || pathname?.startsWith('/home/buy');
    }
    return pathname === route || pathname?.startsWith(route + '/');
  };

  const baseTextColorClass = getTextColor(pathname || '');
  // When scrolled, use appropriate text color based on page type (light pages use black, dark pages use white)
  const textColorClass = isScrolled
    ? (pathname === '/sell' ? 'text-black' : 'text-white')
    : baseTextColorClass;

  // Add special class for company page dropdowns
  const dropdownContentClass = pathname === '/company'
    ? 'w-full min-w-[600px] bg-[#FAF9F5] text-black company-dropdown-content'
    : 'w-full min-w-[600px] bg-[#FAF9F5] text-black';

  const handleStateMlsQuickSearch = React.useCallback(() => {
    setMlsBypassModeEnabled(true);
  }, []);

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className={`bg-transparent px-4 hover:bg-transparent hover:underline focus:bg-transparent ${textColorClass}`}>
            <Link href='/' className={isActive('/') ? (isScrolled ? 'text-white' : 'text-white') : textColorClass}>
              Buy
            </Link>
          </NavigationMenuTrigger>
          <NavigationMenuContent className={`${dropdownContentClass} w-auto min-w-[360px]`}>
            <div className='inline-flex flex-row divide-x divide-white p-6 font-medium text-black'>
              <div className='flex flex-col space-y-4 pr-8'>
                {/* <h4 className='text-lg font-medium'>Buy a Home With</h4> */}
                <div className='flex flex-col space-y-3'>
                  <Link
                    href='/buy/browse?q=California'
                    className='text-black hover:text-primary hover:underline'
                    onClick={handleStateMlsQuickSearch}
                  >
                    Homes in California
                  </Link>
                  <Link
                    href='/buy/browse?q=Texas'
                    className='text-black hover:text-primary hover:underline'
                    onClick={handleStateMlsQuickSearch}
                  >
                    Homes in Texas
                  </Link>
                  {/*<Link href={AGENT_APPLICATIONS || ""} className='text-black hover:text-primary hover:underline'>
                    Our Real Estate Agents
                  </Link>*/}
                </div>
              </div>
              <div className='flex flex-col space-y-4 pl-8'>
                <div className='flex flex-col space-y-3'>
                  <Link href='/home/buyer-how-it-works' className='text-black hover:text-primary hover:underline'>
                    How it Works
                  </Link>
                  {/*<Link href='#offer-strength' className='text-black hover:text-primary hover:underline'>
                    Offer Strength Analyzer
                  </Link>*/}
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem className={hiddenTopNavItems.has('/sell') ? 'hidden' : undefined}>
          <NavigationMenuTrigger className={`bg-transparent px-4 hover:bg-transparent hover:underline focus:bg-transparent ${textColorClass}`}>
            <Link href='/sell' className={isActive('/sell') ? textColorClass : textColorClass}>
              Sell
            </Link>
          </NavigationMenuTrigger>
          <NavigationMenuContent className={`${dropdownContentClass} w-auto min-w-[360px]`}>
            <div className='inline-flex flex-row divide-x divide-white p-6 font-medium text-black'>
              <div className='flex flex-col space-y-4 pr-8'>
                <div className='flex flex-col space-y-3'>
                  <Link href='/agents' className='text-black hover:text-primary hover:underline'>
                    With an agents
                  </Link>
                  {/*<Link href={AGENT_APPLICATIONS || ""} className='text-black hover:text-primary hover:underline'>
                    Our Real Estate Agents
                  </Link>*/}
                  <Link href='/home/seller-how-it-works' className='text-black hover:text-primary hover:underline'>
                    How it Works
                  </Link>
                </div>
              </div>
              <div className='flex flex-col space-y-4 pl-8'>
                <div className='flex flex-col space-y-3'>
                  {/*  <Link href='#home-estimator' className='text-black hover:text-primary hover:underline'>
                    Home Estimator
                  </Link>*/}
                  <Link href="#testimonials" className='text-black hover:text-primary hover:underline'>
                    Testimonials
                  </Link>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger className={`bg-transparent px-4 font-medium hover:bg-transparent hover:underline focus:bg-transparent ${textColorClass}`}>
            <Link href='/agents' className={isActive('/agents') ? textColorClass : textColorClass}>
              Agents
            </Link>
          </NavigationMenuTrigger>
          <NavigationMenuContent className={`${dropdownContentClass} w-auto min-w-[260px]`}>
            <div className='inline-flex flex-row p-6 font-medium text-black'>
              <div className='flex flex-col space-y-4 pr-8'>
                {/* <h4 className='text-lg font-medium'>Buy a Home With</h4> */}
                <div className='flex flex-col space-y-3'>
                  <Link href='/home/agents-how-it-works' className='text-black hover:text-primary hover:underline'>
                    How it Works
                  </Link>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {/* <NavigationMenuItem className={hiddenTopNavItems.has('/company') ? 'hidden' : undefined}>
          <Link href='/company' legacyBehavior passHref>
            <NavigationMenuLink className={`bg-transparent px-4 font-medium ${isActive('/company') ? textColorClass : textColorClass}`}>
              Company
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem> */}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
