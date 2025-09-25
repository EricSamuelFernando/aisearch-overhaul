'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/shared/hooks/useAuth';
import AccountDropdown from '../account-dropdown';
import { MobileSideDrawer } from './main-nav-drawers';
import SnapHomz from '@public/assets/images/snaphomz-logo.svg';
import LoginRegisterModal from '../modals/login-register-modal';
import { NavigationListPages } from './navigation-list-pages';
import useGoogleAuth from '@/hooks/api/auth/useGoogleAuth';

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
  const [headerHeight, setHeaderHeight] = React.useState(0);
  const [openDialogs, setOpenDialogs] = React.useState<NavDialogState>(initialState);
  const toggleClose = () => setOpenDialogs(initialState);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const headerRef = React.useRef<HTMLDivElement>(null);
  const { googleLogin, GoogleOneTapLogin } = useGoogleAuth()

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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

  return (
    <>
<header
  ref={headerRef}
  className={`fixed left-0 text-white right-0 top-0 z-50 flex w-full items-center justify-between px-4 py-4 md:px-8 transition-all duration-300 ${
    isScrolled
      ? "bg-black shadow-lg py-2"
      : "bg-transparent py-4"
  }`}
>

  <div className="hidden md:flex">
    <NavigationListPages />
  </div>

  <Link
    href="/home"
    className="absolute inset-y-0 left-1/2 flex items-center transform -translate-x-1/2"
  >
    <Image
      src="/assets/images/logo-main.png"
      height={59}
      width={200}
      alt="logo"
    />
  </Link>

  <div className="hidden md:flex items-center gap-x-4">
    {isLoggedIn ? (
      <>
        <Link href='/dashboard' className='text-white'>
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
          className='w-full font-bold'
        />
        <LoginRegisterModal
          label='Get started'
          initialStage={1}
          variant={"ghost"}
          className='w-full text-white bg-transparent border border-white rounded-full hover:bg-white hover:text-black transition-all duration-300'
        />
      </>
    )}
  </div>
  <div className="md:hidden flex items-center gap-x-2">
    {!isLoggedIn && (
      <Button
        className='w-full px-4 font-bold'
        type='submit'
        roundness='full'
      >
        <Link href='/register'>Get Started</Link>
      </Button>
    )}

    <button
      className='cursor-pointer'
      onClick={openMobileMenu}
    >
      <Menu className='text-white' />
    </button>
  </div>
</header>

      <div style={{ paddingTop: isScrolled ? "60px" : "80px" }}></div>

      <MobileSideDrawer
        closeDrawer={toggleClose}
        isDrawerOpen={openDialogs.isMobileDrawer}
        handleMouseLeave={handleMouseLeave}
      />
    </>
  );
}

export default MainNavPages;
