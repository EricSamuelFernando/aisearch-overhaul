

// 'use client';

// import { useCallback, useEffect, useState } from 'react';
// import SpeechInput from '../speech-input';
// import { Button } from '@/components/ui/button';
// import { useRouter } from 'next/navigation';
// import axios from 'axios';
// import { usePropertyStore } from '@/store/use-property-store';
// import { useAppDispatch, useAppSelector } from '@/lib/hook';
// import { incrementSearchCount, initializeTempUserId } from '@/slices/onboarding/property-preference';
// import { RootState } from '@/lib/store';
// import { useRegister } from '@/hooks/api/auth/useRegister';
// import { useAuth } from '@/shared/hooks/useAuth';
// import Geolocation from './geolocation';
// import { error, success } from '../alert/notify';
// import { toast } from 'react-toastify';
// import { message } from '@public/assets/icons';
// import { PROPERTY_SEARCH_AI_URL, PROPERTY_SEARCH_DATA_LIMIT_AI_URL } from '@/shared/constants/env';
// import { setPropertyQuery } from '@/slices/property/property-slice';

// const StarIcon = () => (
//   <img
//     src="/assets/icons/stars.svg"
//     width={25}
//     height={25}
//     alt="search icon"
//     className="inline-block ml-2 "
//   />
// );

// export default function HeroTab() {
//   const [activeTab, setActiveTab] = useState<string | null>('buy');
//   const router = useRouter();

//   // Determine if we're on specific pages (home, sell, agents, company)
//   //@ts-ignore
//   const isHomePage = router.pathname === '/home' || router.pathname === '/sell' || router.pathname === '/agents' || router.pathname === '/company';

//   return (
//     <div>
//       {/* Only display the "buy" and "sell" options for the specified pages */}
//       {isHomePage && (
//         <div className="flex flex-row items-center gap-x-1">
//           {['buy', 'sell'].map((item) => {
//             return (
//               <div
//                 key={item}
//                 onClick={() => setActiveTab(item)}
//                 className={`flex h-8 cursor-pointer items-center justify-center rounded-tl-sm rounded-tr-sm px-2.5 bg-${activeTab?.toLocaleLowerCase() === item.toLocaleLowerCase()
//                   ? 'white'
//                   : 'transparent'
//                   }`}
//               >
//                 <h3 className="text-sm font-medium uppercase text-black">
//                   {item}
//                 </h3>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       <HeroSearchForm />
//     </div>
//   );
// }

// export const HeroSearchForm = ({
//   placeholderText,
//   searchType,
// }: {
//   placeholderText?: string;
//   searchType?:string;
// }) => {
//   const {
//     allProperties,
//     addProperties,
//     clearProperties,
//     setSearchedQuery,
//     setIsLoading,
//     isLoading,
//   } = usePropertyStore();
//   const router = useRouter();
//   const [searchTerm, setSearchTerm] = useState<string>('');
//   const [isSearching, setIsSearching] = useState(false);
//   const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
//   const { user } = useAuth()
//   const { email } = useRegister()
//   const dispatch = useAppDispatch()



//   const { tempUserId, searchCount } = useAppSelector((state: RootState) => state.propertyPreference);

//   const userId = user?.id || email || tempUserId

//   useEffect(() => {
//     dispatch(initializeTempUserId());
//   }, [dispatch]);

//   const handleNavigate = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSearching(true);
//     const query = searchTerm.trim();  
//     const requestBody: Record<string, any> = {
//       user: userId,
//       query,
//     };

//     const sendSearchRequest = async (body: Record<string, any>) => {
//       try {
//         const response = await axios.post(
//           PROPERTY_SEARCH_AI_URL || 'http://13.60.114.186:9000/api/search',
//           {
//             ...body
//           }
//         );
        
//         clearProperties();
//         dispatch(incrementSearchCount());
//         dispatch(setPropertyQuery(response.data?.result.search_query));
//         setSearchedQuery(response.data?.result.records);
//         addProperties(response.data?.result.records);

//         if (searchCount + 1 >= 6 && !user?.email) {
//           success({
//             message:
//               'You have reached the search limit for non-logged-in users. Please create an account to continue.',
//           });
//         }

//         if (searchTerm) {
//           router.push(`/buy/browse?q=${searchTerm}`);
//         }
//       } catch (err: any) {
//         console.error("Search request failed:", err);
//         error({
//           message:
//             err?.response?.data?.error || "An unexpected error occurred.",
//         });
//       } finally {
//         setIsSearching(false);
//       }
//     };

//     const getLocation = (): Promise<GeolocationCoordinates | null> => {
//       return new Promise((resolve) => {
//         if (!navigator.geolocation) {
//           console.warn("Geolocation is not supported by this browser.");
//           resolve(null);
//           return;
//         }

//         navigator.geolocation.getCurrentPosition(
//           (position) => resolve(position.coords),
//           (err) => {
//             console.warn("Geolocation access denied or failed:", err.message);
//             resolve(null);
//           }
//         );
//       });
//     };

//     const coords = await getLocation();
//     if (coords) {
//       requestBody.location = {
//         accuracy: coords.accuracy,
//         latitude: coords.latitude,
//         longitude: coords.longitude,
//         altitude: coords.altitude,
//         altitudeAccuracy: coords.altitudeAccuracy,
//         heading: coords.heading,
//         speed: coords.speed,
//       };  
//       setLocation({ latitude: coords.latitude, longitude: coords.longitude });
//     }

//     await sendSearchRequest(requestBody);
//   };

//   return (
//     <div className="flex gap-2 w-full">
//       <form
//         className=" 
//        relative w-full rounded-xl border-0 p-1 bg-white md:flex md:items-center md:space-y-0
//         "
//         onSubmit={handleNavigate}
//       > 
//       {/* {
//          searchTerm === ""  &&  <StarIcon  />
//       } */}
//       {searchTerm === "" && (
//    <span className="pointer-events-none absolute left-3 sm:top-[48.333333%] top-1/4 -translate-y-1/2 md:left-3">
//      <StarIcon />
//    </span>
//  )}
     
//       {/* <SpeechInput value={searchTerm} setValue={setSearchTerm} searchType={searchType} className="pr-2" /> */}
//      <SpeechInput value={searchTerm} setValue={setSearchTerm} searchType={searchType} className="pl-10 pr-2" />
//         <Button
//           type="submit"
//           size="lg"
//           className="rounded-xl bg-[#F07639] hover:bg-orange-700 font-bold w-full md:w-auto"
//         >
//           <div className="flex w-full justify-between gap-2 items-center">
//             {isSearching ? (
//               <div
//                 className="text-surface inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
//                 role="status"
//               >
//                 <span className="!absolute !-m-px !-h-px !-w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
//                   Loading...
//                 </span>
//               </div>
//             ) : null}
//             <span>Begin Journey</span>
//           </div>
//         </Button>
//       </form>
//     </div>
//   );
// };




'use client';

import { useCallback, useEffect, useState } from 'react';
import SpeechInput from '../speech-input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { usePropertyStore } from '@/store/use-property-store';
import { useAppDispatch, useAppSelector } from '@/lib/hook';
import { incrementSearchCount, initializeTempUserId } from '@/slices/onboarding/property-preference';
import { RootState } from '@/lib/store';
import { useRegister } from '@/hooks/api/auth/useRegister';
import { useAuth } from '@/shared/hooks/useAuth';
import Geolocation from './geolocation';
import { error, success } from '../alert/notify';
import { toast } from 'react-toastify';
import { message } from '@public/assets/icons';
import { PROPERTY_SEARCH_AI_URL, PROPERTY_SEARCH_DATA_LIMIT_AI_URL } from '@/shared/constants/env';
import { setPropertyQuery } from '@/slices/property/property-slice';

const StarIcon = () => (
  <img
    src="/assets/icons/stars.svg"
    width={25}
    height={25}
    alt="search icon"
    className="inline-block ml-2 "
  />
);

export default function HeroTab() {
  const [activeTab, setActiveTab] = useState<string | null>('buy');
  const router = useRouter();

  // Determine if we're on specific pages (home, sell, agents, company)
  //@ts-ignore
  const isHomePage = router.pathname === '/home' || router.pathname === '/sell' || router.pathname === '/agents' || router.pathname === '/company';

  return (
    <div>
      {/* Only display the "buy" and "sell" options for the specified pages */}
      {isHomePage && (
        <div className="flex flex-row items-center gap-x-1">
          {['buy', 'sell'].map((item) => {
            return (
              <div
                key={item}
                onClick={() => setActiveTab(item)}
                className={`flex h-8 cursor-pointer items-center justify-center rounded-tl-sm rounded-tr-sm px-2.5 bg-${activeTab?.toLocaleLowerCase() === item.toLocaleLowerCase()
                  ? 'white'
                  : 'transparent'
                  }`}
              >
                <h3 className="text-sm font-medium uppercase text-black">
                  {item}
                </h3>
              </div>
            );
          })}
        </div>
      )}

      <HeroSearchForm />
    </div>
  );
}

export const HeroSearchForm = ({
  placeholderText,
  searchType,
}: {
  placeholderText?: string;
  searchType?:string;
}) => {
  const {
    allProperties,
    addProperties,
    clearProperties,
    setSearchedQuery,
    setIsLoading,
    isLoading,
  } = usePropertyStore();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const { user } = useAuth()
  const { email } = useRegister()
  const dispatch = useAppDispatch()



  const { tempUserId, searchCount } = useAppSelector((state: RootState) => state.propertyPreference);

  const userId = user?.id || email || tempUserId

  useEffect(() => {
    dispatch(initializeTempUserId());
  }, [dispatch]);

  const handleNavigate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    const query = searchTerm.trim();  
    const requestBody: Record<string, any> = {
      user: userId,
      query,
    };

    const sendSearchRequest = async (body: Record<string, any>) => {
      try {
        const response = await axios.post(
          PROPERTY_SEARCH_AI_URL || 'http://13.60.114.186:9000/api/search',
          {
            ...body
          }
        );
        
        clearProperties();
        dispatch(incrementSearchCount());
        dispatch(setPropertyQuery(response.data?.result.search_query));
        setSearchedQuery(response.data?.result.records);
        addProperties(response.data?.result.records);

        if (searchCount + 1 >= 6 && !user?.email) {
          success({
            message:
              'You have reached the search limit for non-logged-in users. Please create an account to continue.',
          });
        }

        if (searchTerm) {
          router.push(`/buy/browse?q=${searchTerm}`);
        }
      } catch (err: any) {
        console.error("Search request failed:", err);
        error({
          message:
            err?.response?.data?.error || "An unexpected error occurred.",
        });
      } finally {
        setIsSearching(false);
      }
    };

    const getLocation = (): Promise<GeolocationCoordinates | null> => {
      return new Promise((resolve) => {
        if (!navigator.geolocation) {
          console.warn("Geolocation is not supported by this browser.");
          resolve(null);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position.coords),
          (err) => {
            console.warn("Geolocation access denied or failed:", err.message);
            resolve(null);
          }
        );
      });
    };

    const coords = await getLocation();
    if (coords) {
      requestBody.location = {
        accuracy: coords.accuracy,
        latitude: coords.latitude,
        longitude: coords.longitude,
        altitude: coords.altitude,
        altitudeAccuracy: coords.altitudeAccuracy,
        heading: coords.heading,
        speed: coords.speed,
      };  
      setLocation({ latitude: coords.latitude, longitude: coords.longitude });
    }

    await sendSearchRequest(requestBody);
  };

return ( 
  <div className="flex gap-2 w-full">
    <form
      onSubmit={handleNavigate}
      className="
        relative w-full max-w-[560px] mx-auto
        rounded-xl border-0 p-1 bg-white
        flex items-center gap-2
        h-12 md:h-14                   /* pill height: smaller on mobile */
      "
    >
      {/* Star icon */}
      {searchTerm === '' && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
          <StarIcon />
        </span>
      )}

      {/* Input takes remaining space */}
      <SpeechInput
        value={searchTerm}
        setValue={setSearchTerm}
        searchType={searchType}
        className="pl-10 pr-2 flex-1 min-w-0 h-full"   /* same pill, mobile-friendly */
      />

      {/* Begin Journey button — compact on mobile, desktop unchanged */}
      <Button
        type="submit"
        className="
          shrink-0
          rounded-lg md:rounded-xl
          bg-[#F07639] hover:bg-orange-700 font-bold
          h-8  md:h-11                 /* smaller height on mobile */
          px-3 md:px-6                 /* tighter padding on mobile */
          text-[13px] md:text-base     /* smaller label on mobile */
        "
      >
        <div className="flex items-center gap-2">
          {isSearching && (
            <div
              className="text-surface inline-block h-4 w-4 md:h-5 md:w-5 animate-spin rounded-full border-2 border-solid border-current border-e-transparent"
              role="status"
            />
          )}
          <span>Begin Journey</span>
        </div>
      </Button>
    </form>
  </div>
);

};