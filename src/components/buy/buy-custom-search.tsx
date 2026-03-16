// 'use client';

// import Link from 'next/link';
// import * as React from 'react';
// import { useRouter, useSearchParams } from 'next/navigation';
// import { Button } from '@/components/ui/button';
// import { Icons } from '../icons';
// import SpeechInput from '../speech-input';
// import axios from 'axios';
// import { incrementSearchCount } from '@/slices/onboarding/property-preference';
// import { useAuth } from '@/shared/hooks/useAuth';
// import { useRegister } from '@/hooks/api/auth/useRegister';
// import { useAppDispatch, useAppSelector } from '@/lib/hook';
// import { RootState } from '@/lib/store';
// import { success, error } from '../alert/notify';
// import { usePropertyStore } from '@/store/use-property-store';
// import { PROPERTY_SEARCH_AI_URL } from '@/shared/constants/env';
// import { setPropertyQuery } from '@/slices/property/property-slice';
// import { Input } from '../ui/input';
// import { cn } from '@/lib/utils';

// type Props = {};

// const breadcrumbList = [
//   {
//     name: 'Home',
//     path: '/',
//   },
//   {
//     name: 'Buy a home',
//     path: '/buy',
//   },
//   {
//     name: 'Search listing',
//     path: '/buy/browse',
//   },
// ];

// const BuyBreadCrumb = ({ }: Props) => {
//   return (
//     <div className='sticky z-10 w-full px-4 pb-4 pt-10 md:px-8'>
//       <div className='flex items-center gap-x-2 font-medium'>
//         {breadcrumbList.map((item, idx) => (
//           <React.Fragment key={item.name}>
//             <Link className='text-black' href={item.path}>
//               {item.name}
//             </Link>
//             {breadcrumbList.length - 1 !== idx ? (
//               <span>
//                 <Icons.CheveronRight />
//               </span>
//             ) : null}
//           </React.Fragment>
//         ))}
//       </div>
//     </div>
//   );
// };

// const useScrollPosition = () => {
//   const [scrollPosition, setScrollPosition] = React.useState(0);
//   const [scrollDirection, setScrollDirection] = React.useState<'up' | 'down'>(
//     'up',
//   );
//   const [isScrolling, setIsScrolling] = React.useState(false);

//   React.useEffect(() => {
//     let lastScrollTop = 0;
//     let scrollTimeout: NodeJS.Timeout;

//     const handleScroll = () => {
//       const currentScrollTop =
//         window.pageYOffset || document.documentElement.scrollTop;
//       setScrollPosition(currentScrollTop);

//       if (currentScrollTop > lastScrollTop) {
//         setScrollDirection('down');
//       } else {
//         setScrollDirection('up');
//       }

//       lastScrollTop = currentScrollTop;

//       setIsScrolling(true);
//       clearTimeout(scrollTimeout);
//       scrollTimeout = setTimeout(() => {
//         setIsScrolling(false);
//       }, 2000);
//     };

//     window.addEventListener('scroll', handleScroll, { passive: true });

//     return () => {
//       window.removeEventListener('scroll', handleScroll);
//       clearTimeout(scrollTimeout);
//     };
//   }, []);

//   return { scrollPosition, scrollDirection, isScrolling };
// };

// const BuyCustomSearch = () => {
//   const searchParams = useSearchParams();
//   const searchTerm = searchParams.get('q');
//   const router = useRouter();
//   const [isSearching, setIsSearching] = React.useState(false);
//   const [searchString, setSearchString] = React.useState('');
//   const { scrollDirection, isScrolling } = useScrollPosition();
//   const [isVisible, setIsVisible] = React.useState(true);
//   const [filterData, setFilterData] = React.useState({});
//   const { user } = useAuth()
//   const { email } = useRegister()
//   const dispatch = useAppDispatch()
//   const {
//     allProperties,
//     addProperties,
//     clearProperties,
//     setIsLoading,
//     setSearchedQuery,
//     isLoading,
//   } = usePropertyStore();

//   // Replace this with dynamic user fetching logic if needed
//   const { tempUserId, searchCount } = useAppSelector((state: RootState) => state.propertyPreference);

//   const userId = user?.id || tempUserId
//   const inputRef = React.useRef<HTMLInputElement>(null);
//   const [placeholderText, setPlaceholderText] = React.useState('Start a new search');
//   React.useEffect(() => {
//     const data: Record<string, string | undefined> = {
//       bedRooms: searchParams.get("bedRooms") || undefined,
//       bathRooms: searchParams.get("bathRooms") || undefined,
//       priceMin: searchParams.get("priceMin") || undefined,
//       priceMax: searchParams.get("priceMax") || undefined,
//       sqTfMin: searchParams.get("sqTfMin") || undefined,
//       sqTfMax: searchParams.get("sqTfMax") || undefined,
//       category: searchParams.get("category") || undefined,
//       subCategories: searchParams.get("subCategories") || undefined,
//     };
//     let query = searchTerm;
//     let queryParts: string[] = [];
//     if (data.bedRooms) queryParts.push(`${data.bedRooms} bedroom${data.bedRooms !== "1" ? "s" : ""}`);
//     if (data.bathRooms) queryParts.push(`${data.bathRooms} bathroom${data.bathRooms !== "1" ? "s" : ""}`);
//     if (data.priceMin && data.priceMax) {
//       queryParts.push(`priced between $${data.priceMin} and $${data.priceMax}`);
//     } else if (data.priceMin) {
//       queryParts.push(`priced above $${data.priceMin}`);
//     } else if (data.priceMax) {
//       queryParts.push(`priced below $${data.priceMax}`);
//     }
//     if (data.sqTfMin && data.sqTfMax) {
//       queryParts.push(`with size between ${data.sqTfMin} and ${data.sqTfMax} sq ft`);
//     } else if (data.sqTfMin) {
//       queryParts.push(`larger than ${data.sqTfMin} sq ft`);
//     } else if (data.sqTfMax) {
//       queryParts.push(`smaller than ${data.sqTfMax} sq ft`);
//     }
//     if (data?.category) {
//       console.log("Data : 011 : ", query);
//       query = `${searchTerm} of property sub type ${data?.category}`
//     }
//     if (data?.subCategories) {
//       query = `${searchTerm} of property sub-type ${data?.category} having ${data?.subCategories}`
//     }
//     let naturalQuery = ""
//     // if (searchTerm) {
//     //   naturalQuery = `${searchString} having ${queryParts.join(", ")}.`;
//     //   setSearchString(naturalQuery);
//     // }
//     // if (Object.keys(data)?.length) {
//     //   setFilterData(data)
//     //   naturalQuery = `I want a property having ${queryParts.join(", ")}.`;
//     //   setSearchString(naturalQuery)
//     // }
//     router.push(`/buy/browse?q=${query}`)
//   }, [searchParams, searchTerm]);


//   React.useEffect(() => {
//     if (scrollDirection === 'down' && isScrolling) {
//       setIsVisible(false);
//     } else if (!isScrolling || scrollDirection === 'up') {
//       setIsVisible(true);
//     }
//   }, [scrollDirection, isScrolling]);

//   const sendSearchRequest = async () => {
//     setIsSearching(true)
//     setIsLoading(true)
//     setSearchedQuery("");
//     try {
//       const response = await axios.post(
//         PROPERTY_SEARCH_AI_URL || 'http://13.60.114.186:9000/api/search',
//         {
//           user: userId,
//           query: searchString,
//           // num_records: process.env.SEARCH_RECORDS || 10,
//         }
//       );
//       clearProperties();
//       dispatch(incrementSearchCount());
//       dispatch(setPropertyQuery(response.data?.result.search_query));
//       setSearchedQuery(response.data?.result.records);
//       addProperties(response.data?.result.records);
//       if (searchCount + 1 >= 6 && !user?.email) {
//         success({ message: 'You have reached the search limit for non-logged-in users. Please create an account to continue.' });
//         // if (searchTerm) {
//         //   console.log("Mausam :",searchTerm);

//         //   router.push(`/buy/browse?q=${searchTerm}`);
//         // }
//       } else {
//         console.log(`Searching for: ${searchCount}`);
//       }
//     } catch (err: any) {

//       console.error(err?.response?.data?.error || "An unexpected error occurred.");
//       error({ message: err?.response?.data?.error || "An unexpected error occurred." });
//     } finally {
//       setIsSearching(false)
//       setIsLoading(false);
//     }
//   };
//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (inputRef.current) {
//       inputRef.current.scrollLeft = inputRef.current.scrollWidth;
//     }
//     setSearchString(e.currentTarget.value);
//   };

//   const handleSubmit = React.useCallback(
//     async (e: React.FormEvent) => {
//       e.preventDefault();
//       router.push(`/buy/browse?q=${encodeURIComponent(searchString)}`);
//       await sendSearchRequest()
//     },
//     [router, filterData, searchString, searchTerm],
//   );

//   // React.useEffect(() => {    
//   //   sendSearchRequest()
//   // }, [])  

//   return (
//     <div
//   className={cn(
//     `fixed bottom-0 left-0 right-0 z-40 mx-auto flex w-[60%] flex-col justify-end px-4 transition-all duration-300 ease-in-out md:px-8 
//     group bg-transparent shadow-none hover:shadow-lg`,
//     isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
//   )}
// >
//   {/* <form
//     id='buyer-search-hero-form'
//     className='relative items-center border-orange-400 space-y-3 rounded-md border-2 p-2 md:flex md:space-y-0 bg-transparent group-hover:bg-white transition-colors duration-300'
//     onSubmit={handleSubmit}
//   >
//     <div
//       className={cn(
//         'flex h-12 w-full border-orange-300 items-center rounded-b-md pl-4 transition-colors duration-300',
//         'bg-transparent group-hover:bg-white'
//       )}
//     >
//       <Input
//         ref={inputRef}
//         value={searchString || ''}
//         onChange={handleInputChange}
//         className='w-full rounded-none border-none outline-none hover:border-none hover:outline-none hover:ring-0 focus:border-none focus:outline-none focus:ring-0 bg-transparent group-hover:bg-white'
//       />
//     </div>

//     <Button
//       type='submit'
//       size='lg'
//       className='rounded-md bg-ocOrange font-bold'
//     >
//       <div className='flex w-full items-center justify-between gap-2'>
//         {isSearching ? (
//           <div
//             className='text-surface inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white'
//             role='status'
//           >
//             <span className='sr-only'>Loading...</span>
//           </div>
//         ) : null}
//         <span>New search</span>
//       </div>
//     </Button>
//   </form> */}
//   <form
//   id='buyer-search-hero-form'
//   className='relative items-center space-y-3 rounded-md p-2 md:flex md:space-y-0 transition-colors duration-300'
//   onSubmit={handleSubmit}
//   style={{
//     border: '2px solid transparent', // Remove orange border by default
//     backgroundColor: 'transparent', // Remove the background by default
//     transition: 'border 0.3s ease, background-color 0.3s ease', // Smooth transition for hover effect
//   }}
//   onMouseEnter={(e) => {
//     e.currentTarget.style.border = '2px solid #ffffff'; // Show white border on hover
//     e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)'; // Add white background on hover
//   }}
//   onMouseLeave={(e) => {
//     e.currentTarget.style.border = '2px solid transparent'; // Hide border on mouse leave
//     e.currentTarget.style.backgroundColor = 'transparent'; // Remove the background on mouse leave
//   }}
// >
//   <div
//     className={cn(
//       'flex h-12 w-full items-center rounded-b-md pl-4 transition-colors duration-300',
//       'bg-transparent group-hover:bg-white'
//     )}
//   >
//     <Input
//       ref={inputRef}
//       value={searchString || ''}
//       onChange={handleInputChange}
//       className='w-full rounded-none border-none outline-none hover:border-none hover:outline-none hover:ring-0 focus:border-none focus:outline-none focus:ring-0 bg-transparent group-hover:bg-white'
//     />
//   </div>

//   <Button
//     type='submit'
//     size='lg'
//     className='rounded-md bg-ocOrange font-bold'
//   >
//     <div className='flex w-full items-center justify-between gap-2'>
//       {isSearching ? (
//         <div
//           className='text-surface inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white'
//           role='status'
//         >
//           <span className='sr-only'>Loading...</span>
//         </div>
//       ) : null}
//       <span>New search</span>
//     </div>
//   </Button>
// </form>


//   <div className='flex items-center justify-center py-5'>
//     <p className='font-bold leading-4 text-[#6B7280]'>
//       Snaphomz Conversational Search is Powered By A Custom AI Model.
//     </p>
//   </div>
// </div>


//   );
// };

// export { BuyBreadCrumb, BuyCustomSearch };

'use client';

import Link from 'next/link';
import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '../icons';
import SpeechInput from '../speech-input';
import axios from 'axios';
import { incrementSearchCount } from '@/slices/onboarding/property-preference';
import { useAuth } from '@/shared/hooks/useAuth';
import { useRegister } from '@/hooks/api/auth/useRegister';
import { useAppDispatch, useAppSelector } from '@/lib/hook';
import { RootState } from '@/lib/store';
import { success, error } from '../alert/notify';
import { usePropertyStore } from '@/store/use-property-store';
import { PROPERTY_SEARCH_AI_URL, MLS_SEARCH_LIVE_URL } from '@/shared/constants/env';
import { isMlsBypassModeEnabled, setMlsBypassModeEnabled } from '@/lib/mls-bypass-mode';
import { setPropertyQuery } from '@/slices/property/property-slice';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { useProperty } from '@/shared/hooks/useProperty';
import { Search, X } from 'lucide-react';

let globalLastAutoSearch: string | null = null;

type Props = {};

const StarIcon = () => (
  <img
    src="/assets/icons/stars.svg"
    width={22}
    height={22}
    alt="search icon"
    className="inline-block"
  />
);

const breadcrumbList = [
  {
    name: 'Home',
    path: '/',
  },
  {
    name: 'Search listing',
    path: '/buy/browse',
  },
];

const BuyBreadCrumb = ({ }: Props) => {
  const { currentView } = useProperty();
  return (
    <div
      className={cn(
        currentView === 'grid'
          ? 'sticky w-full max-w-[1600px] mx-auto pl-12 pr-8 pb-4 pt-10 md:pl-16 md:pr-12'
          : 'sticky w-full px-4 pb-4 pt-10 md:px-6',
      )}
    >
      <div className='flex items-center gap-x-2 font-medium'>
        {breadcrumbList.map((item, idx) => (
          <React.Fragment key={item.name}>
            <Link className='text-black' href={item.path}>
              {item.name}
            </Link>
            {breadcrumbList.length - 1 !== idx ? (
              <span>
                <Icons.CheveronRight />
              </span>
            ) : null}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = React.useState(0);
  const [scrollDirection, setScrollDirection] = React.useState<'up' | 'down'>(
    'up',
  );
  const [isScrolling, setIsScrolling] = React.useState(false);

  React.useEffect(() => {
    let lastScrollTop = 0;
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const currentScrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      setScrollPosition(currentScrollTop);

      if (currentScrollTop > lastScrollTop) {
        setScrollDirection('down');
      } else {
        setScrollDirection('up');
      }

      lastScrollTop = currentScrollTop;

      setIsScrolling(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 2000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return { scrollPosition, scrollDirection, isScrolling };
};

const BuyCustomSearch = ({ hideInMap = false }: { hideInMap?: boolean }) => {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('q');
  const router = useRouter();
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchString, setSearchString] = React.useState('');
  const { scrollDirection, isScrolling } = useScrollPosition();
  const [isVisible, setIsVisible] = React.useState(true);
  const [filterData, setFilterData] = React.useState({});
  const [showInputBox, setShowInputBox] = React.useState(false);
  const { currentView } = useProperty();
  const isHiddenInMapMode = hideInMap && currentView === 'map';
  const popupRef = React.useRef<HTMLDivElement>(null);
  const toggleButtonRef = React.useRef<HTMLButtonElement>(null);
  const [isFooterVisible, setIsFooterVisible] = React.useState(false);
  const lastAutoSearchRef = React.useRef<string | null>(null);
  const [isMlsMode, setIsMlsMode] = React.useState(false);
  const [searchAnimatedPlaceholder, setSearchAnimatedPlaceholder] = React.useState('');
  const [searchPromptIndex, setSearchPromptIndex] = React.useState(0);
  const [searchCharIndex, setSearchCharIndex] = React.useState(0);
  const [searchDeleting, setSearchDeleting] = React.useState(false);

  const { user } = useAuth()
  const { email } = useRegister()
  const dispatch = useAppDispatch()
  const {
    allProperties,
    addProperties,
    clearProperties,
    setIsLoading,
    setSearchedQuery,
    isLoading,
  } = usePropertyStore();

  // Replace this with dynamic user fetching logic if needed
  const { tempUserId, searchCount } = useAppSelector((state: RootState) => state.propertyPreference);

  const userId = user?.id || tempUserId
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [placeholderText, setPlaceholderText] = React.useState('Start a new search');
  React.useEffect(() => {
    if (isHiddenInMapMode) return;
    const data: Record<string, string | undefined> = {
      bedRooms: searchParams.get("bedRooms") || undefined,
      bathRooms: searchParams.get("bathRooms") || undefined,
      priceMin: searchParams.get("priceMin") || undefined,
      priceMax: searchParams.get("priceMax") || undefined,
      sqTfMin: searchParams.get("sqTfMin") || undefined,
      sqTfMax: searchParams.get("sqTfMax") || undefined,
      category: searchParams.get("category") || undefined,
      subCategories: searchParams.get("subCategories") || undefined,
    };
    let query = searchTerm;
    let queryParts: string[] = [];
    if (data.bedRooms) queryParts.push(`${data.bedRooms} bedroom${data.bedRooms !== "1" ? "s" : ""}`);
    if (data.bathRooms) queryParts.push(`${data.bathRooms} bathroom${data.bathRooms !== "1" ? "s" : ""}`);
    if (data.priceMin && data.priceMax) {
      queryParts.push(`priced between $${data.priceMin} and $${data.priceMax}`);
    } else if (data.priceMin) {
      queryParts.push(`priced above $${data.priceMin}`);
    } else if (data.priceMax) {
      queryParts.push(`priced below $${data.priceMax}`);
    }
    if (data.sqTfMin && data.sqTfMax) {
      queryParts.push(`with size between ${data.sqTfMin} and ${data.sqTfMax} sq ft`);
    } else if (data.sqTfMin) {
      queryParts.push(`larger than ${data.sqTfMin} sq ft`);
    } else if (data.sqTfMax) {
      queryParts.push(`smaller than ${data.sqTfMax} sq ft`);
    }
    if (data?.category) {
      console.log("Data : 011 : ", query);
      query = `${searchTerm} of property sub type ${data?.category}`
    }
    if (data?.subCategories) {
      query = `${searchTerm} of property sub-type ${data?.category} having ${data?.subCategories}`
    }
    let naturalQuery = ""
    const normalizedQuery = (query || '').trim();
    if (!normalizedQuery) return;

    setSearchString(normalizedQuery);
    if (globalLastAutoSearch === normalizedQuery) return;
    globalLastAutoSearch = normalizedQuery;
    // Redundant search logic removed to avoid store clearing race conditions
    /*
    sendSearchRequest(normalizedQuery);
    */
  }, [searchParams, searchTerm, isHiddenInMapMode]);


  React.useEffect(() => {
    if (isHiddenInMapMode) return;
    if (scrollDirection === 'down' && isScrolling) {
      setIsVisible(false);
    } else if (!isScrolling || scrollDirection === 'up') {
      setIsVisible(true);
    }
  }, [scrollDirection, isScrolling, isHiddenInMapMode]);

  React.useEffect(() => {
    if (isHiddenInMapMode || !showInputBox) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        popupRef.current &&
        !popupRef.current.contains(target) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(target)
      ) {
        setShowInputBox(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [showInputBox, isHiddenInMapMode]);

  React.useEffect(() => {
    if (isHiddenInMapMode) return;
    setIsMlsMode(isMlsBypassModeEnabled());

    const handleBypassChange = (event: Event) => {
      const customEvent = event as CustomEvent<boolean>;
      if (typeof customEvent.detail === 'boolean') {
        setIsMlsMode(customEvent.detail);
        return;
      }
      setIsMlsMode(isMlsBypassModeEnabled());
    };

    window.addEventListener('snaphomz:mls-bypass-changed', handleBypassChange as EventListener);
    return () => {
      window.removeEventListener('snaphomz:mls-bypass-changed', handleBypassChange as EventListener);
    };
  }, [isHiddenInMapMode]);

  React.useEffect(() => {
    if (searchString.trim().length > 0) {
      setSearchAnimatedPlaceholder('');
      return;
    }

    const prompts = isMlsMode
      ? [
        'Enter an address, city, neighborhood, or ZIP',
        'Try: Manhattan Beach, CA',
        'Try: Los Angeles, CA 90049',
      ]
      : [
        'Show me homes in Los Angeles under 2M',
        'Find 3-bedroom homes in Manhattan Beach',
        'Homes near top-rated schools in Irvine',
      ];

    const prompt = prompts[searchPromptIndex % prompts.length];
    const doneTyping = searchCharIndex >= prompt.length;
    const doneDeleting = searchCharIndex <= 0;

    const delay = searchDeleting
      ? 45
      : doneTyping
        ? 900
        : 70;

    const timer = setTimeout(() => {
      if (!searchDeleting && !doneTyping) {
        setSearchCharIndex((n) => n + 1);
        return;
      }

      if (!searchDeleting && doneTyping) {
        setSearchDeleting(true);
        return;
      }

      if (searchDeleting && !doneDeleting) {
        setSearchCharIndex((n) => Math.max(0, n - 1));
        return;
      }

      setSearchDeleting(false);
      setSearchPromptIndex((n) => (n + 1) % prompts.length);
    }, delay);

    setSearchAnimatedPlaceholder(prompt.slice(0, searchCharIndex));

    return () => clearTimeout(timer);
  }, [searchString, searchPromptIndex, searchCharIndex, searchDeleting, isMlsMode]);

  const toggleSearchMode = React.useCallback(() => {
    const next = !isMlsMode;
    setMlsBypassModeEnabled(next);
    setIsMlsMode(next);
  }, [isMlsMode]);

  // Hide the floating button when the footer enters view.
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isHiddenInMapMode) return;
    const footer = document.querySelector('footer');
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsFooterVisible(entry.isIntersecting),
      { threshold: 0.01 },
    );

    observer.observe(footer);
    return () => observer.disconnect();
  }, [isHiddenInMapMode]);

  const sendSearchRequest = async (queryToUse?: string) => {
    if (isHiddenInMapMode) return;
    const resolvedQuery = (queryToUse ?? searchString ?? '').trim();
    if (!resolvedQuery) return;
    if (searchCount + 1 >= 6 && !user?.email) {
      error({
        message:
          'You have reached the search limit for non-logged-in users. Please create an account to continue.',
      });
      router.replace("/login")
      return
    } else {
      console.log(`Searching for: ${searchCount}`);
    }
    setIsSearching(true)
    setIsLoading(true)
    setSearchedQuery("");
    try {
      const searchUrl = isMlsBypassModeEnabled()
        ? MLS_SEARCH_LIVE_URL
        : (PROPERTY_SEARCH_AI_URL || 'http://13.60.114.186:9000/api/search');

      const response = await axios.post(
        searchUrl,
        {
          user: userId,
          query: resolvedQuery,
        }
      );
      const searchType = isMlsBypassModeEnabled() ? 'mls' : 'property';
      const records = response.data?.result?.records ?? response.data?.records ?? [];
      const transformedProperties = records.map((p: any) => ({
        data: p,
        type: searchType
      }));

      clearProperties();
      dispatch(incrementSearchCount());
      dispatch(setPropertyQuery(response.data?.result?.search_query ?? response.data?.search_query ?? resolvedQuery));
      setSearchedQuery(transformedProperties);
      addProperties(transformedProperties);

    } catch (err: any) {

      console.error(err?.response?.data?.error || "An unexpected error occurred.");
      error({ message: err?.response?.data?.error || "An unexpected error occurred." });
    } finally {
      setIsSearching(false)
      setIsLoading(false);
    }
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (inputRef.current) {
      inputRef.current.scrollLeft = inputRef.current.scrollWidth;
    }
    setSearchString(e.currentTarget.value);
  };


  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const normalizedQuery = (searchString || '').trim();
      if (!normalizedQuery) return;
      // Prevent the searchParams effect from firing the same search again after router.push.
      lastAutoSearchRef.current = normalizedQuery;
      router.push(`/buy/browse?q=${encodeURIComponent(normalizedQuery)}`);
      await sendSearchRequest(normalizedQuery)
    },
    [router, filterData, searchString, searchTerm],
  );


  if (isHiddenInMapMode) {
    return null;
  }

  return (
    <>
      <div
        className="buy-floating-search"
        style={{
          position: 'fixed',
          left: '50%',
          bottom: '24px',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          display: isFooterVisible ? 'none' : 'block',
        }}
      >
        <button
          onClick={() => setShowInputBox(o => !o)}
          ref={toggleButtonRef}
          style={{
            height: '48px',
            padding: showInputBox ? 0 : '0 18px',
            width: showInputBox ? '48px' : 'auto',
            borderRadius: '9999px',
            backgroundColor: showInputBox ? '#ff6600' : '#ff6600',
            color: '#fff',
            boxShadow: '0 6px 14px rgba(0,0,0,0.18)',
            fontSize: '0.95rem',
            fontWeight: 600,
            lineHeight: '1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          {showInputBox ? <X className="h-6 w-6" /> : 'Continue Search'}
        </button>
      </div>
      {/* <style jsx global>{`
  @keyframes advancedSlideIn {
    0% {
      opacity: 0;
      transform: translateX(-60px) scale(0.95) rotate(-2deg);
      filter: blur(2px);
    }
    40% {
      opacity: 1;
      transform: translateX(20px) scale(1.03) rotate(1deg);
      filter: blur(0);
    }
    70% {
      transform: translateX(-5px) scale(1) rotate(0deg);
    }
    100% {
      transform: translateX(0) scale(1) rotate(0deg);
    }
  }

  .animate-advanced {
    animation: advancedSlideIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    will-change: transform, opacity;
  }

  body[data-mobile-drawer-open='true'] .buy-floating-search,
  body[data-mobile-drawer-open='true'] .buy-floating-search-popup {
    display: none !important;
  }
`}</style> */}


      {showInputBox && (
        <div
          className="buy-floating-search-popup"
          ref={popupRef}
          style={{
            position: 'fixed',
            bottom: '88px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10001,
          }}
        >
          <div
            className="animate-advanced"
            style={{
              width: '90vw',
              maxWidth: '28rem',
              borderRadius: '0.75rem',
              backgroundColor: '#fff',
              boxShadow: '0 10px 15px rgba(0,0,0,0.1)',
              padding: '0.6rem',
            }}
          >
            <form onSubmit={handleSubmit} className="relative z-30 flex items-center gap-2">
              <div className="relative min-w-0 flex-1 rounded-2xl border border-gray-300 bg-white shadow-sm ring-1 ring-black/5 transition focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-orange-200">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <SpeechInput
                  value={searchString}
                  setValue={setSearchString}
                  searchType={isMlsMode ? 'address' : 'nlp'}
                  placeholderText={searchAnimatedPlaceholder}
                  className="w-full"
                  inputClassName="h-11 w-full rounded-2xl border-0 bg-transparent pl-10 pr-28 text-sm text-gray-900 shadow-none outline-none ring-0 placeholder:text-gray-400 focus-visible:ring-0"
                />
                <button
                  type="button"
                  onClick={toggleSearchMode}
                  title={isMlsMode ? 'MLS mode active. Click to switch to AI search.' : 'AI search active. Click to switch to MLS search.'}
                  className={cn(
                    'absolute right-10 top-1/2 -translate-y-1/2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition',
                    isMlsMode
                      ? 'bg-gray-100 text-gray-600 ring-1 ring-gray-200 hover:bg-gray-200'
                      : 'bg-orange-50 text-orange-700 ring-1 ring-orange-200 hover:bg-orange-100'
                  )}
                >
                  {isMlsMode ? 'AI OFF' : 'AI ON'}
                </button>
                {searchString ? (
                  <button
                    type="button"
                    onClick={() => setSearchString('')}
                    className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
              <Button
                type="submit"
                className="h-11 shrink-0 rounded-2xl bg-ocOrange px-4 text-sm font-semibold text-white shadow-sm hover:brightness-95"
              >
                Search
              </Button>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
  @keyframes advancedSlideIn {
    0% {
      opacity: 0;
      transform: translateX(-60px) scale(0.95) rotate(-2deg);
      filter: blur(2px);
    }
    40% {
      opacity: 1;
      transform: translateX(20px) scale(1.03) rotate(1deg);
      filter: blur(0);
    }
    70% {
      transform: translateX(-5px) scale(1) rotate(0deg);
    }
    100% {
      transform: translateX(0) scale(1) rotate(0deg);
    }
  }

  .animate-advanced {
    animation: advancedSlideIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    will-change: transform, opacity;
  }

  body[data-mobile-drawer-open='true'] .buy-floating-search,
  body[data-mobile-drawer-open='true'] .buy-floating-search-popup {
    display: none !important;
  }
`}</style>

      <div id="map-unpin-sentinel" className="h-px" />
      {currentView === 'grid' ? null : (
        <div id="buy-custom-search" className="w-full">
          <div
            className={cn(
              'pt-16 pb-2 border-b border-gray-200',
              currentView === 'map' ? 'px-0' : 'px-6',
              // currentView === 'grid' ? 'text-center' : '',
            )}
          >
            <h2 className="text-xl font-semibold text-gray-800">Start a New Search</h2>
            <p>Snaphomz Conversational Search is Powered By A Custom AI Model</p>
          </div>

          <form
            id='buyer-search-hero-form'
            className={cn(
              'border-t border-gray-100 py-6',
              currentView === 'map'
                ? 'relative top-2 z-20 flex items-center gap-2 rounded-xl bg-white p-2 shadow-md mb-[2px] mr-auto ml-0'
                : 'flex items-center gap-2 rounded-xl bg-white p-2 shadow-md mx-auto',
            )}
            onSubmit={handleSubmit}
            style={{
              width: currentView === 'map' ? '100%' : 'calc(100% - 3rem)',
            }}
          >
            <div
              className={cn(
                'flex h-12 w-full items-center transition-colors duration-300',
                currentView === 'map' || currentView === 'grid'
                  ? 'min-w-0 flex-1 gap-2 bg-transparent h-12'
                  : 'rounded-lg bg-gray-100 pl-4 hover:bg-white focus-within:bg-white',
              )}
            >
              {(currentView === 'map' || currentView === 'grid') && searchString === '' ? (
                <StarIcon />
              ) : null}
              <SpeechInput
                value={searchString}
                setValue={setSearchString}
                inputClassName={cn(
                  'w-full border-none outline-none hover:border-none hover:outline-none hover:ring-0 focus:border-none focus:outline-none focus:ring-0',
                  currentView === 'map' || currentView === 'grid'
                    ? 'bg-transparent'
                    : 'bg-transparent group-hover:bg-white',
                )}
                className={cn('w-full', currentView === 'map' ? 'min-w-0' : '')}
              />
            </div>

            <Button
              type='submit'
              size='lg'
              className={cn(
                'font-bold text-center',
                currentView === 'map'
                  ? 'shrink-0 rounded-xl bg-[#F07639] hover:bg-orange-700 px-4 h-10'
                  : currentView === 'grid'
                    ? 'shrink-0 rounded-xl bg-[#F07639] hover:bg-orange-700 px-4 h-10'
                    : 'w-full md:w-auto rounded-lg bg-ocOrange hover:bg-ocOrange-dark',
              )}
            >
              <div className='flex w-full items-center justify-between gap-2 text-center'>
                {isSearching ? (
                  <div
                    className='text-surface inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white'
                    role='status'
                  >
                    <span className='sr-only'>Loading...</span>
                  </div>
                ) : null}
                <span>{currentView === 'map' || currentView === 'grid' ? 'Enter' : 'New search'}</span>
              </div>
            </Button>
          </form>
        </div>
      )}

    </>

  );
};

export { BuyBreadCrumb, BuyCustomSearch };
