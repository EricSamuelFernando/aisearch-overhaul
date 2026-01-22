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
//     src="/assets/images/searchbar.png"
//     width={20}
//     height={20}
//     alt="search icon"
//     className="inline-block"
//   />
// );
// export default function HeroTab() {
//   const [activeTab, setActiveTab] = useState<string | null>('buy');

//   return (
//     <div>
//       <div className='flex flex-row items-center gap-x-1 '>
//         {['buy', 'sell'].map((item) => {
//           return (
//             <div
//               key={item}
//               onClick={() => setActiveTab(item)}
//               className={`flex h-8 cursor-pointer items-center justify-center rounded-tl-sm rounded-tr-sm px-2.5 bg-${activeTab?.toLocaleLowerCase() === item.toLocaleLowerCase()
//                 ? 'white'
//                 : 'transparent'
//                 }`}
//             >
//               <h3 className='text-sm font-medium uppercase text-black'>
//                 {item}
//               </h3>
//             </div>
//           );
//         })}
//       </div>
//       <HeroSearchForm />
//     </div>
//   );
// }

// export const HeroSearchForm = ({
//   placeholderText,
// }: {
//   placeholderText?: string;
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

//   // Replace this with dynamic user fetching logic if needed
//   const { tempUserId, searchCount } = useAppSelector((state: RootState) => state.propertyPreference);

//   const userId = user?.id || email || tempUserId

//   useEffect(() => {
//     dispatch(initializeTempUserId());
//   }, [dispatch]);

//   // useEffect(()=>{
//   //   if(navigator.geolocation){
//   //     navigator.geolocation.getCurrentPosition((position)=>{
//   //       setLocation({
//   //         latitude: position.coords.latitude,
//   //         longitude: position.coords.longitude,
//   //       })
//   //     },(error) => {
//   //       console.error('Error getting location:', error)
//   //     })
//   //   }
//   // },[])

//   const handleNavigate = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSearching(true);
//     const query = searchTerm.trim();  
//     const requestBody: Record<string, any> = {
//       user: userId,
//       query,
//       // num_records: process.env.SEARCH_RECORDS || 12,
//     };
  
//     const sendSearchRequest = async (body: Record<string, any>) => {
//       try {
//         const response = await axios.post(
//           PROPERTY_SEARCH_AI_URL || 'http://13.60.114.186:9000/api/search',
//           {
//             // num_records: process.env.SEARCH_RECORDS || 10,
//             ...body
//           }
//         );
//         console.log("Response : ",response);
        
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
//         console.log("Query : ",searchTerm);
        
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
  
//   // Encapsulated API call
//   const searchWithApi = async (requestBody: any) => {
//     const { data } = await axios.post(
//       PROPERTY_SEARCH_AI_URL || 'http://13.60.114.186:9000/api/search',
//       requestBody
//     );
//     return data;
//   };

//   return (
//     <div className='flex gap-2 w-full'>
//       {/* <Geolocation /> */}
//       <form
//         id='buyer-search-hero-form'
//         className='relative items-center  w-full ispace-y-3 rounded-md border-0 p-1 md:flex md:space-y-0 md:bg-white'
//         onSubmit={handleNavigate}>

//         <SpeechInput value={searchTerm} setValue={setSearchTerm}/>
//         <div className="absolute left-4 top-1/2 -translate-y-1/2">
//           <StarIcon />
//         </div>
//         <Button
//           type='submit'
//           size='lg'
//           className='rounded-md bg-ocOrange font-bold'
//         >
//           <div className='flex w-full justify-between gap-2 items-center'>
//             {isSearching ? (
//               <div
//                 className='text-surface inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white'
//                 role='status'
//               >
//                 <span className='!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]'>
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

// export const SearInput = ({
//   placeholderText,
// }: {
//   placeholderText?: string;
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

//   // Replace this with dynamic user fetching logic if needed
//   const { tempUserId, searchCount } = useAppSelector((state: RootState) => state.propertyPreference);

//   const userId = user?.email || email || tempUserId

//   useEffect(() => {
//     dispatch(initializeTempUserId());
//   }, [dispatch]);

//   // useEffect(()=>{
//   //   if(navigator.geolocation){
//   //     navigator.geolocation.getCurrentPosition((position)=>{
//   //       setLocation({
//   //         latitude: position.coords.latitude,
//   //         longitude: position.coords.longitude,
//   //       })
//   //     },(error) => {
//   //       console.error('Error getting location:', error)
//   //     })
//   //   }
//   // },[])

//   const handleNavigate = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSearching(true);
//     const query = searchTerm.trim();
  
//     // Base request body without location
//     const requestBody: Record<string, any> = {
//       user: userId,
//       query,
//       // num_records: process.env.SEARCH_RECORDS,
//     };
  
//     const sendSearchRequest = async (body: Record<string, any>) => {
//       try {
//         const response = await axios.post(
//           PROPERTY_SEARCH_AI_URL || 'http://13.60.114.186:9000/api/search',
//           body
//         );
  
//         clearProperties();
//         dispatch(incrementSearchCount());
//         dispatch(setPropertyQuery(response.data.search_query));
//         setSearchedQuery(response.data.records);
//         addProperties(response.data.records);
  
//         if (searchCount + 1 >= 6 && !user?.email) {
//           success({
//             message:
//               'You have reached the search limit for non-logged-in users. Please create an account to continue.',
//           });
//         }
  
//         if (searchTerm) {
//           router.push(`/buy/browse`);
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
  
//     // Use a Promise wrapper for geolocation
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
  
//       // Optionally update state if needed
//       setLocation({ latitude: coords.latitude, longitude: coords.longitude });
//     }
  
//     await sendSearchRequest(requestBody);
//   };
  
//   const searchWithApi = async (requestBody: any) => {
//     const { data } = await axios.post(
//       PROPERTY_SEARCH_AI_URL || 'http://13.60.114.186:9000/api/search',
//       requestBody
//     );
//     return data;
//   };

//   return (
//     <div className='flex gap-2 border border-[#707070] rounded-lg w-full'>
//       {/* <Geolocation /> */}
//       <form
//         id='buyer-search-hero-form'
//         className='relative items-center  w-full ispace-y-3 rounded-md border-0 p-1 md:flex md:space-y-0 md:bg-white'
//         onSubmit={handleNavigate}>

//         <SpeechInput value={searchTerm} setValue={setSearchTerm} />

//         <Button
//           type='submit'
//           size='lg'
//           className='rounded-md bg-ocOrange font-bold'
//         >
//           <div className='flex w-full justify-between gap-2 items-center'>
//             {isSearching ? (
//               <div
//                 className='text-surface inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white'
//                 role='status'
//               >
//                 <span className='!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]'>
//                   Loading...
//                 </span>
//               </div>
//             ) : null}
//             <span>New Search</span>
//           </div>
//         </Button>
//       </form>

//     </div>
//   );
// };



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
//     src="/assets/images/searchbar.png"
//     width={20}
//     height={20}
//     alt="search icon"
//     className="inline-block"
//   />
// );

// export default function HeroTab() {
//   const [activeTab, setActiveTab] = useState<string | null>('buy');

//   return (
//     <div>
//       <div className="flex flex-row items-center gap-x-1 ">
//         {['buy', 'sell'].map((item) => {
//           return (
//             <div
//               key={item}
//               onClick={() => setActiveTab(item)}
//               className={`flex h-8 cursor-pointer items-center justify-center rounded-tl-sm rounded-tr-sm px-2.5 bg-${activeTab?.toLocaleLowerCase() === item.toLocaleLowerCase()
//                 ? 'white'
//                 : 'transparent'
//                 }`}
//             >
//               <h3 className="text-sm font-medium uppercase text-black">
//                 {item}
//               </h3>
//             </div>
//           );
//         })}
//       </div>
//       <HeroSearchForm />
//     </div>
//   );
// }

// export const HeroSearchForm = ({
//   placeholderText,
// }: {
//   placeholderText?: string;
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
//         id="buyer-search-hero-form"
//         className="relative items-center w-full space-y-3 rounded-md border-0 p-1 md:flex md:space-y-0 md:bg-white"
//         onSubmit={handleNavigate}
//       >
//         <SpeechInput value={searchTerm} setValue={setSearchTerm} />
//         <div className="absolute left-4 top-1/2 -translate-y-1/2">
//           <StarIcon />
//         </div>
//         <Button
//           type="submit"
//           size="lg"
//           className="rounded-md bg-ocOrange font-bold w-full md:w-auto"
//         >
//           <div className="flex w-full justify-between gap-2 items-center">
//             {isSearching ? (
//               <div
//                 className="text-surface inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
//                 role="status"
//               >
//                 <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
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
//     src="/assets/images/searchbar.png"
//     width={25}
//     height={25}
//     alt="search icon"
//     className="inline-block"
//   />
// );

// export default function HeroTab() {
//   const [activeTab, setActiveTab] = useState<string | null>('buy');

//   return (
//     <div>
//       <div className="flex flex-row items-center gap-x-1">
//         {['buy', 'sell'].map((item) => {
//           return (
//             <div
//               key={item}
//               onClick={() => setActiveTab(item)}
//               className={`flex h-8 cursor-pointer items-center justify-center rounded-tl-sm rounded-tr-sm px-2.5 bg-${activeTab?.toLocaleLowerCase() === item.toLocaleLowerCase()
//                 ? 'white'
//                 : 'transparent'
//                 }`}
//             >
//               <h3 className="text-sm font-medium uppercase text-black">
//                 {item}
//               </h3>
//             </div>
//           );
//         })}
//       </div>
//       <HeroSearchForm />
//     </div>
//   );
// }

// export const HeroSearchForm = ({
//   placeholderText,
// }: {
//   placeholderText?: string;
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
//         id="buyer-search-hero-form"
//         className="relative items-center w-full space-y-3 rounded-md border-0 p-1 md:flex md:space-y-0 md:bg-white"
//         onSubmit={handleNavigate}
//       >
//         <SpeechInput value={searchTerm} setValue={setSearchTerm} className="pl-4" />
//         {!searchTerm && (
//           <div className="absolute left-4 top-1/2 -translate-y-1/2">
//             <StarIcon />
//           </div>
//         )}
//         <Button
//           type="submit"
//           size="lg"
//           className="rounded-md bg-ocOrange font-bold w-full md:w-auto"
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
    <div className="relative flex gap-2 w-full">
      <form
  onSubmit={handleNavigate}
  className="
    relative flex w-full items-center gap-2
    rounded-xl bg-white p-2
    overflow-visible
  "
>
  {/* Star + Input */}
  <div className="relative flex min-w-0 flex-1 items-center gap-2 overflow-visible">
    {searchTerm === '' && (
      <StarIcon />
    )}

    <SpeechInput
      value={searchTerm}
      setValue={setSearchTerm}
      searchType={searchType}
      placeholderText={placeholderText}
      className="w-full min-w-0"
    />
  </div>

  {/* Button */}
  <Button
    type="submit"
    size="lg"
    className="
      shrink-0
      rounded-xl
      bg-[#F07639]
      font-bold
      hover:bg-orange-700
      px-4
      z-10
    "
  >
    <div className="flex items-center gap-2">
      {isSearching && (
        <div
          className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-e-transparent"
          role="status"
        />
      )}
      <span className="whitespace-nowrap">
        Begin Journey
      </span>
    </div>
  </Button>
</form>

    </div>
  );
};