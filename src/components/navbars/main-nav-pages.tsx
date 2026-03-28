'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftRight, BarChart3, Building2, ChevronDown, ChevronUp, ClipboardCheck, DollarSign, FileText, Film, GraduationCap, Hand, HeartPulse, Image as ImageIcon, LayoutGrid, Menu, MessageSquare, Rocket, Scale, ShieldCheck, Sparkles, Timer, TrendingUp } from 'lucide-react';
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
  const [isQuickAccessOpen, setIsQuickAccessOpen] = React.useState(false);
  const [showMoreTools, setShowMoreTools] = React.useState(false);
  const [snapToolsTooltip, setSnapToolsTooltip] = React.useState<{
    text: string;
    top: number;
    left: number;
    placement: 'top';
  } | null>(null);
  const headerRef = React.useRef<HTMLDivElement>(null);
  const quickAccessRef = React.useRef<HTMLDivElement>(null);
  const { cognitoGoogleLogin } = useCognitoGoogleAuth();

  // Determine text color based on route
  const getTextColor = () => {
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

  // Determine background color based on route for scrolled state
  const getBackgroundColor = () => {
    if (pathname === '/' || pathname?.startsWith('/home') || pathname === '/home' || pathname === '/home/buy') {
      return 'bg-black';
    } else if (pathname?.startsWith('/buy')) {
      return 'bg-white';
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
  const isLightNav =
    pathname?.startsWith('/buy') ||
    pathname === '/sell' ||
    pathname?.startsWith('/agents');

  // When scrolled, use appropriate text color based on background
  const finalTextColorClass = isScrolled
    ? (isLightNav ? 'text-black' : 'text-white')
    : textColorClass;

  // Determine logo based on text color
  const logoSrc = finalTextColorClass === 'text-black'
    ? '/assets/Logos/Snaphomz-Logo-Black (4).png'
    : '/assets/images/logo-main.png';

  // Determine background class for scrolled state - recalculate based on current pathname
  const scrollBackgroundClass = React.useMemo(() => {
    if (!isScrolled) return 'bg-transparent';

    // Inline the background color logic to ensure pathname is used correctly
    if (pathname === '/' || pathname?.startsWith('/home') || pathname === '/home' || pathname === '/home/buy') {
      return 'bg-black';
    } else if (pathname?.startsWith('/buy')) {
      return 'bg-white';
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
    const handleScroll = (event?: Event) => {
      // Check multiple scroll sources for better compatibility
      const windowScroll = window.scrollY || window.pageYOffset || 0;
      const docScroll = document.documentElement.scrollTop || 0;
      const bodyScroll = document.body.scrollTop || 0;

      // Also check main element scroll if it exists
      const mainElement = document.querySelector('main') as HTMLElement | null;
      const mainScroll = mainElement ? mainElement.scrollTop || 0 : 0;

      // Capture scroll on any nested container (non-bubbling scroll events)
      const target = event?.target as HTMLElement | null;
      const targetScroll = target && typeof target.scrollTop === 'number' ? target.scrollTop : 0;

      // Use the maximum scroll value from all sources
      const scrollPosition = Math.max(windowScroll, docScroll, bodyScroll, mainScroll, targetScroll);

      // Set scrolled state - using threshold of 10px for better responsiveness
      setIsScrolled(scrollPosition > 10);
    };
    // Check initial scroll position after a brief delay to ensure DOM is ready
    const initTimeout = setTimeout(handleScroll, 100);

    // Add scroll listener to window
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, { passive: true, capture: true });

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
      document.removeEventListener("scroll", handleScroll, true);
      if (mainElement) {
        mainElement.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  React.useEffect(() => {
    if (!isQuickAccessOpen) return;
    const handleOutsideClick = (event: MouseEvent) => {
      if (!quickAccessRef.current) return;
      if (!quickAccessRef.current.contains(event.target as Node)) {
        setIsQuickAccessOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsQuickAccessOpen(false);
      }
    };
    const handleWheel = (event: WheelEvent) => {
      if (!quickAccessRef.current) return;
      const scrollArea = quickAccessRef.current.querySelector('.snap-tools-scroll') as HTMLElement | null;
      if (!scrollArea || !scrollArea.contains(event.target as Node)) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollArea;
      const delta = event.deltaY;
      const atTop = scrollTop <= 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1;

      if ((delta < 0 && atTop) || (delta > 0 && atBottom)) {
        event.preventDefault();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('wheel', handleWheel);
    };
  }, [isQuickAccessOpen]);

  React.useEffect(() => {
    if (!isQuickAccessOpen && showMoreTools) {
      setShowMoreTools(false);
    }
  }, [isQuickAccessOpen, showMoreTools]);

  const handleSnapToolHover = (event: React.MouseEvent<HTMLElement>, text: string) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setSnapToolsTooltip({
      text,
      top: rect.top - 10,
      left: rect.left + rect.width / 2,
      placement: 'top',
    });
  };

  const clearSnapToolsTooltip = () => {
    if (snapToolsTooltip) setSnapToolsTooltip(null);
  };

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
    const baseClasses = 'fixed left-0 right-0 top-0 z-50 w-full transition-all duration-300';
    const backgroundClasses = isScrolled
      ? `${scrollBackgroundClass} shadow-lg py-2`
      : (pathname === '/do-not-sell-or-share'
        ? 'bg-black py-4'
        : (pathname?.startsWith('/buy') ? 'bg-white py-4' : 'bg-transparent py-4'));

    return `${baseClasses} ${finalTextColorClass} ${backgroundClasses}`;
  }, [finalTextColorClass, isScrolled, scrollBackgroundClass]);

  const isListingPanelWhite =
    pathname?.startsWith('/buy/browse') ||
    /^\/buy\/[^/]+\/prop\/preview/.test(pathname || '');

  return (
    <>
      <header
        ref={headerRef}
        className={`${headerClassName} ${pathname === '/company' ? 'company-navbar' : ''}`}
      >


        <div className="relative mx-auto flex w-full max-w-[1920px] items-center justify-between px-4 md:px-8 xl:px-[78px]">
          <div className="hidden md:flex">
            <NavigationListPages isScrolled={isScrolled} />
          </div>

          {/* Logo - Left side on mobile, center on desktop */}
          <Link
            href="/"
            className="flex items-center justify-center md:absolute md:inset-y-0 md:left-1/2 md:transform md:-translate-x-1/2"
          >
            <Image
              src={logoSrc}
              height={50}
              width={160}
              unoptimized
              alt="logo"
              className={`transition-all duration-300 object-contain ${isScrolled
                ? 'h-10 w-32 md:h-10 md:w-32'
                : 'h-10 w-32 md:h-12 md:w-36'
                }`}
            />
          </Link>

          <div className={`hidden md:flex items-center gap-x-4 ${finalTextColorClass}`}>
            <div className="relative" ref={quickAccessRef}>
              <button
                type="button"
                onClick={() => setIsQuickAccessOpen((prev) => !prev)}
                style={{ width: 32, height: 32 }}
                className={`flex items-center justify-center rounded-lg transition-colors ${finalTextColorClass} ${finalTextColorClass === 'text-black' ? 'hover:bg-black/10' : 'hover:bg-white/10'}`}
                aria-label="Quick access"
                aria-expanded={isQuickAccessOpen}
              >
                <LayoutGrid style={{ width: 18, height: 18 }} />
              </button>
              {isQuickAccessOpen && (
                <div
                  className={`snap-tools-panel absolute right-0 top-full mt-3 w-[300px] rounded-[1.6rem] border-2 p-5 shadow-2xl z-[70] ${isListingPanelWhite
                    ? 'border-black/10 bg-white text-[#0B0B0B]'
                    : 'border-white/60 bg-black text-white'
                    }`}
                >
                  <div className="mb-6 flex items-center justify-between px-1">
                    <h2 className="text-[17px] font-medium">Snap Tools</h2>
                  </div>
                  <div className="relative">
                    {false && showMoreTools && (
                      <div className="pointer-events-none absolute right-0 top-0 bottom-0 flex flex-col justify-between py-2 pr-1">
                        <ChevronUp className={`h-3.5 w-3.5 ${isListingPanelWhite ? 'text-gray-400' : 'text-white/60'}`} />
                        <ChevronDown className={`h-3.5 w-3.5 ${isListingPanelWhite ? 'text-gray-400' : 'text-white/60'}`} />
                      </div>
                    )}
                    <div
                      className={`grid grid-cols-3 gap-x-3 gap-y-7 ${showMoreTools ? 'max-h-[260px] overflow-y-auto overflow-x-hidden pr-3 snap-tools-scroll' : ''}`}
                      onScroll={clearSnapToolsTooltip}
                    >
                      {[
                        {
                          label: 'Disclosures',
                          Icon: FileText,
                          href: 'https://snapdisclosures.snaphomz.com/',
                          tip: 'Clarity for every disclosure, explained simply.',
                        },
                        {
                          label: 'Rent vs. Buy',
                          Icon: ArrowLeftRight,
                          href: 'https://rentvsbuy.snaphomz.com/',
                          tip: 'Compare renting vs buying with real assumptions.',
                        },
                        {
                          label: 'Grad',
                          Icon: GraduationCap,
                          href: 'https://snapgrad.snaphomz.com/?lat=0&lng=0&label=&source=&updatedAt=',
                          tip: 'Schools, colleges, and neighborhood fit insights.',
                        },
                        {
                          label: 'Audit',
                          Icon: ClipboardCheck,
                          href: 'https://snapaudit.snaphomz.com/',
                          tip: 'Summarizes disclosures into clear, buyer-friendly insights and flags key risks fast.',
                        },
                        {
                          label: 'Pre approvals',
                          Icon: ShieldCheck,
                          href: 'https://preapproval.snaphomz.com/',
                          tip: 'Quick pre-approval flow and eligibility check.',
                        },
                        {
                          label: 'Interest',
                          Icon: TrendingUp,
                          href: 'https://snapinterest.snaphomz.com/',
                          tip: "Track today's rates and simple projections.",
                        },
                      ].map(({ label, Icon, href, tip }) => (
                        <a
                          key={label}
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="group relative flex flex-col items-center"
                          onMouseEnter={(event) => handleSnapToolHover(event, tip)}
                          onMouseLeave={clearSnapToolsTooltip}
                        >
                          <div
                            className={`mb-2.5 flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm transition-all duration-300 group-hover:shadow-md ${isListingPanelWhite
                              ? 'border-black/10 bg-black/5 group-hover:bg-[#f28e3d]/15'
                              : 'border-white/10 bg-white/5 group-hover:bg-[#f28e3d]/20'
                              }`}
                          >
                            <Icon style={{ width: 24, height: 24 }} className="text-[#f28e3d]" />
                          </div>
                          <span
                            className={`text-center text-[11px] font-medium ${isListingPanelWhite ? 'text-gray-600' : 'text-gray-300'}`}
                          >
                            {label}
                          </span>
                        </a>
                      ))}
                      {showMoreTools && [
                        { label: 'Snap Predict', Icon: Sparkles },
                        { label: 'Offer Strength Analyzer', Icon: BarChart3 },
                        { label: 'Listing Health Check', Icon: HeartPulse },
                        { label: 'HOA Analyzer', Icon: Building2 },
                        { label: 'Reverse Image Search', Icon: ImageIcon },
                        { label: 'Hold Or Sell', Icon: Hand },
                        { label: 'Price Predictor', Icon: DollarSign },
                        { label: 'Inspection Rebuttal Engine', Icon: MessageSquare },
                        { label: 'Snap Viral', Icon: Rocket },
                        { label: 'Reel to Listing', Icon: Film },
                        { label: 'Property Comps', Icon: Scale },
                        { label: 'STR Vs LTR', Icon: Timer },
                      ].map(({ label, Icon }) => (
                        <button
                          type="button"
                          key={label}
                          className="group flex flex-col items-center"
                          onMouseEnter={clearSnapToolsTooltip}
                          onMouseLeave={clearSnapToolsTooltip}
                        >
                          <div
                            className={`mb-2.5 flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm transition-all duration-300 group-hover:shadow-md ${isListingPanelWhite
                              ? 'border-black/10 bg-black/5 group-hover:bg-[#f28e3d]/15'
                              : 'border-white/10 bg-white/5 group-hover:bg-[#f28e3d]/20'
                              }`}
                          >
                            <Icon style={{ width: 24, height: 24 }} className="text-[#f28e3d]" />
                          </div>
                          <span
                            className={`text-center text-[11px] font-medium leading-tight ${isListingPanelWhite ? 'text-gray-600' : 'text-gray-300'}`}
                          >
                            {label}
                          </span>
                        </button>
                      ))}
                    </div>
                    {snapToolsTooltip && (
                      <div
                        className="pointer-events-none fixed z-[90]"
                        style={{
                          top: snapToolsTooltip.top,
                          left: snapToolsTooltip.left,
                          transform: 'translate(-50%, -100%)',
                        }}
                      >
                        <div className="relative w-[220px] rounded-xl border border-[#f2cfb0] bg-white px-3 py-2 shadow-xl">
                          <p className="text-[11px] font-semibold leading-relaxed text-[#5A2B13]">
                            {snapToolsTooltip.text}
                          </p>
                          <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 border-b border-r border-[#f2cfb0] bg-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-7 text-center">
                    <button
                      type="button"
                      onClick={() => setShowMoreTools((prev) => !prev)}
                      className={`inline-flex items-center justify-center rounded-full border px-5 py-1.5 text-xs font-medium transition-colors ${isListingPanelWhite
                        ? 'border-black/20 text-gray-600 hover:text-black hover:border-black/40'
                        : 'border-white/20 text-white/80 hover:text-white hover:border-white/40'
                        }`}
                    >
                      {showMoreTools ? 'Show less' : '12+ more tools'}
                    </button>
                  </div>
                </div>
              )}
            </div>
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
        </div>
      </header>

      {/* <div style={{ paddingTop: isScrolled ? "60px" : "80px" }}></div> */}
      {pathname !== '/company' && (
        <div style={{ paddingTop: isScrolled ? '60px' : '80px' }} />
      )}


      <MobileSideDrawer
        closeDrawer={toggleClose}
        isDrawerOpen={openDialogs.isMobileDrawer}
      // handleMouseLeave={handleMouseLeave}
      />
    </>
  );
}

export default MainNavPages;
