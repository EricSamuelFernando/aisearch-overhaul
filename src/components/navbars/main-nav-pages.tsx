'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/shared/hooks/useAuth';
import AccountDropdown from '../account-dropdown';
import { MobileSideDrawer } from './main-nav-drawers';
import SnapHomz from '@public/assets/images/snaphomz-logo.svg';
import LoginRegisterModal from '../modals/login-register-modal';
import { NavigationListPages } from './navigation-list-pages';
import useCognitoGoogleAuth from '@/hooks/api/auth/useCognitoGoogleAuth';

type NavDialogState = {
  isBuyHovered: boolean;
  isSellHovered: boolean;
  isMobileDrawer: boolean;
};

const initialState: NavDialogState = {
  isBuyHovered: false,
  isSellHovered: false,
  isMobileDrawer: false,
};

function MainNavPages() {
  const { isLoggedIn, user } = useAuth();
  const pathname = usePathname();
  const [headerHeight, setHeaderHeight] = React.useState(0);
  const [openDialogs, setOpenDialogs] = React.useState<NavDialogState>(initialState);
  const toggleClose = () => setOpenDialogs(initialState);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const headerRef = React.useRef<HTMLDivElement>(null);
  const { cognitoGoogleLogin } = useCognitoGoogleAuth();

  // Determine text color based on route
  const getTextColor = () => {
    if (pathname?.startsWith('/home') || pathname === '/home' || pathname === '/home/buy') {
      return 'text-white';
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

  // Determine background color based on route for scrolled state
  const getBackgroundColor = () => {
    if (pathname?.startsWith('/home') || pathname === '/home' || pathname === '/home/buy') {
      return 'bg-black';
    } else if (pathname === '/sell') {
      return 'bg-white';
    } else if (pathname?.startsWith('/agents')) {
      return 'bg-white';
    } else if (pathname === '/company') {
      return 'bg-black';
    }
    // Default to black for other routes
    return 'bg-black';
  };

  const textColorClass = getTextColor();

  // When scrolled, use appropriate text color based on background
  const finalTextColorClass = isScrolled
    ? (pathname === '/sell' || pathname?.startsWith('/agents') ? 'text-black' : 'text-white')
    : textColorClass;

  // Determine logo based on text color
  const logoSrc = finalTextColorClass === 'text-black'
    ? '/assets/images/logo-black-main.png'
    : '/assets/images/logo-main.png';

  // Determine background class for scrolled state - recalculate based on current pathname
  const scrollBackgroundClass = React.useMemo(() => {
    if (!isScrolled) return 'bg-transparent';

    // Inline the background color logic to ensure pathname is used correctly
    if (pathname?.startsWith('/home') || pathname === '/home' || pathname === '/home/buy') {
      return 'bg-black';
    } else if (pathname === '/sell') {
      return 'bg-white';
    } else if (pathname?.startsWith('/agents')) {
      return 'bg-white';
    } else if (pathname === '/company') {
      return 'bg-black';
    }
    // Default to black for other routes
    return 'bg-black';
  }, [isScrolled, pathname]);

  React.useEffect(() => {
    const handleScroll = () => {
      // Check multiple scroll sources for better compatibility
      const windowScroll = window.scrollY || window.pageYOffset || 0;
      const docScroll = document.documentElement.scrollTop || 0;
      const bodyScroll = document.body.scrollTop || 0;

      // Also check main element scroll if it exists
      const mainElement = document.querySelector('main') as HTMLElement | null;
      const mainScroll = mainElement ? mainElement.scrollTop || 0 : 0;

      // Use the maximum scroll value from all sources
      const scrollPosition = Math.max(windowScroll, docScroll, bodyScroll, mainScroll);

      // Set scrolled state - using threshold of 10px for better responsiveness
      setIsScrolled(scrollPosition > 10);
    };
    // Check initial scroll position after a brief delay to ensure DOM is ready
    const initTimeout = setTimeout(handleScroll, 100);

    // Add scroll listener to window
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Also listen to main element if it exists (check after DOM is ready)
    let mainElementTimeout: NodeJS.Timeout;
    let mainElement: HTMLElement | null = null;

    mainElementTimeout = setTimeout(() => {
      mainElement = document.querySelector('main') as HTMLElement | null;
      if (mainElement) {
        mainElement.addEventListener("scroll", handleScroll, { passive: true });
      }
    }, 200);

    return () => {
      clearTimeout(initTimeout);
      clearTimeout(mainElementTimeout);
      window.removeEventListener("scroll", handleScroll);
      if (mainElement) {
        mainElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const handleMouseLeave = () => {
    setOpenDialogs((prev) => ({
      ...prev,
      isBuyHovered: false,
      isSellHovered: false,
    }));
  };

  const openMobileMenu = () =>
    setOpenDialogs((prev) => ({ ...prev, isMobileDrawer: true }));

  React.useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);

    return () => {
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

  // Build header className
  const headerClassName = React.useMemo(() => {
    const baseClasses = 'fixed left-0 right-0 top-0 z-50 flex w-full items-center justify-between px-4 md:px-8 transition-all duration-300';
    const backgroundClasses = isScrolled
      ? `${scrollBackgroundClass} shadow-lg py-2`
      : 'bg-transparent py-4';

    return `${baseClasses} ${finalTextColorClass} ${backgroundClasses}`;
  }, [finalTextColorClass, isScrolled, scrollBackgroundClass]);

  return (
    <>
      <header
        ref={headerRef}
        className={`${headerClassName} ${pathname === '/company' ? 'company-navbar' : ''}`}
      >


        <div className="hidden md:flex">
          <NavigationListPages isScrolled={isScrolled} />
        </div>

        {/* Logo - Left side on mobile, center on desktop */}
        <Link
          href="/home"
          className="md:absolute md:inset-y-0 md:left-1/2 md:transform md:-translate-x-1/2 flex items-center justify-center"
        >
          <Image
            src={logoSrc}
            height={50}
            width={160}
            unoptimized
            alt="logo"
            className={`transition-all duration-300 object-contain ${isScrolled
              ? 'h-8 w-24 md:h-10 md:w-32'
              : 'h-9 w-28 md:h-12 md:w-36'
              }`}
          />
        </Link>

        <div className={`hidden md:flex items-center gap-x-4 ${finalTextColorClass}`}>
          {isLoggedIn ? (
            <>
              <Link href='/dashboard' className={finalTextColorClass}>
                Dashboard
              </Link>
              <AccountDropdown
                username={user?.fullname!}
                avatar={user?.profile || null}
                firstName={user?.firstname!}
                lastName={user?.lastname!}
              />
            </>
          ) : (
            <>
              <LoginRegisterModal
                label='Login'
                initialStage={0}
                variant={"ghost"}
                className={`w-full font-bold ${finalTextColorClass}`}
              />
              <LoginRegisterModal
                label='Get started'
                initialStage={1}
                variant={"ghost"}
                className={`w-full ${finalTextColorClass} bg-transparent border ${isScrolled
                  ? (pathname === '/sell' || pathname?.startsWith('/agents')
                    ? 'border-black hover:bg-black hover:text-white'
                    : 'border-white hover:bg-white hover:text-black')
                  : (pathname === '/sell' || pathname?.startsWith('/agents')
                    ? 'border-black hover:bg-black hover:text-white'
                    : 'border-white hover:bg-white hover:text-black')
                  } rounded-full transition-all duration-300`}
              />
            </>
          )}
        </div>

        {/* Mobile menu - Right side */}
        <div className="md:hidden flex items-center">
          <button
            className='cursor-pointer'
            onClick={openMobileMenu}
          >
            <Menu className={finalTextColorClass} size={24} />
          </button>
        </div>
      </header>

      {/* <div style={{ paddingTop: isScrolled ? "60px" : "80px" }}></div> */}
      {pathname !== '/company' && (
        <div style={{ paddingTop: isScrolled ? '60px' : '80px' }} />
      )}


      <MobileSideDrawer
        closeDrawer={toggleClose}
        isDrawerOpen={openDialogs.isMobileDrawer}
        handleMouseLeave={handleMouseLeave}
      />
    </>
  );
}

export default MainNavPages;