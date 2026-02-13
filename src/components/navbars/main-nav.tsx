// 'use client';

// import * as React from 'react';
// import Image from 'next/image';
// import Link from 'next/link';
// import { Menu } from 'lucide-react';

// import { Button } from '@/components/ui/button';
// import { useAuth } from '@/shared/hooks/useAuth';
// import AccountDropdown from '../account-dropdown';
// import { MobileSideDrawer } from './main-nav-drawers';
// import SnapHomz from '@public/assets/images/snaphomz-logo.svg';
// import LoginRegisterModal from '../modals/login-register-modal';
// import { NavigationList } from './navigation-list';
// import useGoogleAuth from '@/hooks/api/auth/useGoogleAuth';
// import { GoogleLogin } from '@react-oauth/google';

// type NavDialogState = {
//   isBuyHovered: boolean;
//   isSellHovered: boolean;
//   isMobileDrawer: boolean;
// };

// const initialState: NavDialogState = {
//   isBuyHovered: false,
//   isSellHovered: false,
//   isMobileDrawer: false,
// };

// function MainNav({dark = false}:any) {
//   const { isLoggedIn, user } = useAuth();
//   const [headerHeight, setHeaderHeight] = React.useState(0);
//   const [openDialogs, setOpenDialogs] = React.useState<NavDialogState>(initialState);
//   const toggleClose = () => setOpenDialogs(initialState);
//   const [isScrolled, setIsScrolled] = React.useState(false);
//   const headerRef = React.useRef<HTMLDivElement>(null);
//   const { googleLogin, GoogleOneTapLogin } = useGoogleAuth()

//   React.useEffect(() => {
//     const handleScroll = () => {
//       if (window.scrollY > 50) {
//         setIsScrolled(true);
//       } else {
//         setIsScrolled(false);
//       }
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   const handleMouseLeave = () => {
//     setOpenDialogs((prev) => ({
//       ...prev,
//       isBuyHovered: false,
//       isSellHovered: false,
//     }));
//   };

//   const openMobileMenu = () =>
//     setOpenDialogs((prev) => ({ ...prev, isMobileDrawer: true }));

//   React.useEffect(() => {
//     const updateHeaderHeight = () => {
//       if (headerRef.current) {
//         setHeaderHeight(headerRef.current.offsetHeight);
//       }
//     };

//     updateHeaderHeight();
//     window.addEventListener('resize', updateHeaderHeight);

//     return () => {
//       window.removeEventListener('resize', updateHeaderHeight);
//     };
//   }, []);




//   return (
//     <>
//      <header
//   ref={headerRef}
//   className={`fixed left-0 right-0 top-0 z-50 flex w-full max-w-[100vw] items-center justify-between px-4 transition-all md:px-8 
//     ${dark ? 'bg-transparent ' : 'bg-white - shadow-md'} 
//     ${isScrolled ? 'py-2' : 'py-4 md:py-5'}`}
// >

//         <NavigationList />
//         <Link href='/home' className='relative' >
//           <Image
//             src= { dark ?  "/assets/images/snaphomz-logo-dark.svg" : "/assets/images/logo-01.svg"}
//             height={200}
//             width={200}
//             alt='logo'
//             className={`transition-all duration-300 ease-in-out ${isScrolled
//               ? "w-[150px] h-[44px] md:w-[200px] md:h-[58px] lg:w-[250px] lg:h-[72px]"
//               : "w-[150px] h-[44px] md:w-[100px] md:h-[30px] lg:w-[200px] lg:h-[50px]"
//               }`}
//           />
//         </Link>
//         {isLoggedIn ? (
//           <div className='flex items-center gap-x-4'>
//             <Link href='/dashboard' className='text-black'>
//               Dashboard
//             </Link>

//             <AccountDropdown
//               username={user?.fullname!}
//               avatar={user?.profile || null}
//               firstName={user?.firstname!}
//               lastName={user?.lastname!}
//             />
//           </div>
//         ) : (
//           <div className='flex items-center gap-x-4'>
//             <LoginRegisterModal
//               label='Login'
//               initialStage={0}
//               variant={"ghost"}
//               className={`w-full  font-bold ${dark ? 'text-white':'' }`}
//             />
//             <LoginRegisterModal
//               label='Get started'
//               initialStage={1}
//               variant={"default"}
//               className={`hidden w-full rounded-full px-6 font-bold md:block ${dark ? 'border border-white':'' }`}
//             />
//             <Button
//               className='block border border-white w-full px-6 font-bold md:hidden'
//               type='submit'
//               roundness='full'
//             >
//               <Link href='/register'>Get Started</Link>
//             </Button>

//           </div>
//         )}
//         <button
//           className='ml-3 block cursor-pointer md:hidden'
//           onClick={openMobileMenu}
//         >
//           <Menu className='text-white' />
//         </button>
//       </header>
//       {/* <div style={{ paddingTop: isScrolled ? "60px" : "80px" }}></div> */}

//       <MobileSideDrawer
//         closeDrawer={toggleClose}
//         isDrawerOpen={openDialogs.isMobileDrawer}
//         handleMouseLeave={handleMouseLeave}
//       />
//       <br />
//       <br />
//     </>
//   );
// }

// export default MainNav;


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
import { NavigationList } from './navigation-list';
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

function MainNav() {
  const { isLoggedIn, user } = useAuth();
  const [headerHeight, setHeaderHeight] = React.useState(0);
  const [openDialogs, setOpenDialogs] = React.useState<NavDialogState>(initialState);
  const toggleClose = () => setOpenDialogs(initialState);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const headerRef = React.useRef<HTMLDivElement>(null);
  const { cognitoGoogleLogin } = useCognitoGoogleAuth();

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
        className={`fixed inset-x-0 top-0 z-50 w-full bg-[#FAF9F5] transition-all duration-300 ${isScrolled ? "shadow-md py-3" : "py-4"}`}
      >
        {/* Main Navigation Row */}
        <div className="flex w-full items-center justify-between px-8 md:px-12">
          {/* Logo + Navigation - Left Side */}
          <div className="flex items-center gap-x-6">
            {/* Logo */}
            <Link href="/home" className="flex items-center">
            <Image src="/assets/Logos/Snaphomz-Logo-Black (4).png" 
              height={54} width={170} alt="Snaphomz logo" className={`transition-all duration-300 ${isScrolled ? "h-[28px] w-[120px]" : "h-[54px] w-[170px]"}`} /> </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center">
              <NavigationList />
            </div>
          </div>

          {/* Desktop Auth/User Section - Right Side */}
          <div className="hidden md:flex items-center gap-x-4">
            {isLoggedIn ? (
              <>
                <Link href='/dashboard' className='text-gray-600 hover:text-black font-normal text-sm'>
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
                  className='font-normal text-gray-600 hover:text-black bg-transparent hover:bg-transparent text-sm px-0'
                />
                <LoginRegisterModal
                  label='Get started'
                  initialStage={1}
                  variant={"default"}
                  className='rounded-full px-5 py-2 font-normal bg-black text-white hover:bg-gray-800 transition-all duration-300 text-sm'
                />
              </>
            )}
          </div>

          {/* Mobile Auth/Menu Section - Right Side */}
          <div className="md:hidden flex items-center gap-x-2">
            {isLoggedIn ? (
              <Link href='/dashboard' className='text-black text-sm font-medium hover:text-primary'>
                Dashboard
              </Link>
            ) : (
              <Button
                className='px-3 py-2 font-bold text-sm'
                type='submit'
                roundness='full'
              >
                <Link href='/register'>Get Started</Link>
              </Button>
            )}
            <button
              className='cursor-pointer p-2 rounded-md hover:bg-gray-200 transition-colors'
              onClick={openMobileMenu}
            >
              <Menu className='text-black w-6 h-6' />
            </button>
          </div>
        </div>
      </header>

      <div className={`${isScrolled ? "pt-[70px] md:pt-[60px]" : "pt-[90px] md:pt-[80px]"}`}></div>

      <MobileSideDrawer
        closeDrawer={toggleClose}
        isDrawerOpen={openDialogs.isMobileDrawer}
      />
    </>
  );
}

export default MainNav;
