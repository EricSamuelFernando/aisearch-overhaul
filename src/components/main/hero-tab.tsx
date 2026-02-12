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

import { useCallback, useEffect, useLayoutEffect, useState, useRef } from 'react';
import { Paperclip, FileText, Image as ImageIcon, Search as SearchIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SpeechInput from '../speech-input';
import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';
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

type Suggestion = {
  id: string;
  text: string;
};

const buyerSuggestions: Suggestion[] = [
  { id: '1', text: '3-bedroom homes near top-rated schools in Manhattan Beach' },
  { id: '2', text: "I'm looking for 4-bedroom houses in Los Angeles, California with a pool" },
  { id: '3', text: "Explain what an HOA is like I’m 5." },
  { id: '4', text: 'Compare school ratings between Redondo and Torrance' },
];

const sellerSuggestions: Suggestion[] = [
  { id: '1', text: "What’s my home worth in today’s market?" },
  { id: '2', text: "How can I increase my home’s value before selling?" },
  { id: '3', text: "What are the closing costs when selling a home?" },
  { id: '4', text: "How long will it take to sell my home in my area?" },
];

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
  onSearchStateChange,
}: {
  placeholderText?: string;
  searchType?: string;
  onSearchStateChange?: (expanded: boolean) => void;
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

  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const homeAttachMenuRef = useRef<HTMLDivElement>(null);
  const [typedPlaceholder, setTypedPlaceholder] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [lockedHeight, setLockedHeight] = useState<number | null>(null);

  // Typing Animation Effect
  // Typing Animation Effect
  useEffect(() => {
    // Only run typing animation if NOT on seller page (or if we want it on buyer only)
    // The user request "in this seller search bar keep this" likely refers to the screenshot design
    // which has "Describe Your Dream Home"
    // Let's assume we want typing for buyer home, and specific text for others.

    const placeholders = [
      "Show me homes in San Jose under $2M",
      "Find a 3-bedroom condo in Miami",
      "What is the crime rate in Chicago?",
      "Homes with a pool in Austin"
    ];
    let index = 0;
    let subIndex = 0;
    let isDeleting = false;
    let loopTimeout: NodeJS.Timeout;
    const type = () => {
      const currentText = placeholders[index];
      if (isDeleting) {
        setTypedPlaceholder(currentText.substring(0, subIndex));
        subIndex--;
      } else {
        setTypedPlaceholder(currentText.substring(0, subIndex));
        subIndex++;
      }
      let typeSpeed = isDeleting ? 30 : 80;
      if (!isDeleting && subIndex === currentText.length + 1) {
        typeSpeed = 2000; // Pause at end before deleting
        isDeleting = true;
      } else if (isDeleting && subIndex === 0) {
        isDeleting = false;
        index = (index + 1) % placeholders.length;
        typeSpeed = 500; // Pause before typing next
      }
      loopTimeout = setTimeout(type, typeSpeed);
    };

    // Only start typing if placeholderText is NOT provided (i.e. on Home page where we want dynamic)
    // On Sell page, we pass a specific placeholder.
    if (!placeholderText) {
      loopTimeout = setTimeout(type, 1000);
    }

    return () => clearTimeout(loopTimeout);
  }, [placeholderText]);

  // Handle Outside Clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      // Attachment Menus
      // Checks if the click target is inside the "Home" attachment menu
      const clickedHome = homeAttachMenuRef.current && homeAttachMenuRef.current.contains(event.target as Node);

      // If the menu is open AND the click was NOT inside either menu, close it.
      if (showAttachMenu && !clickedHome) {
        setShowAttachMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showAttachMenu]);

  const handleAttachmentClick = (type: 'image' | 'pdf') => {
    setShowAttachMenu(false);
    setTimeout(() => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
        fileInputRef.current.accept = type === 'image' ? "image/*" : "application/pdf";
        fileInputRef.current.click();
      }
    }, 0);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    console.log('File selected:', file.name, file.type);

    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset input
    }
  };



  const { tempUserId, searchCount } = useAppSelector((state: RootState) => state.propertyPreference);

  const userId = user?.id || email || tempUserId

  useEffect(() => {
    dispatch(initializeTempUserId());
  }, [dispatch]);

  const handleSearchSubmit = async (queryToSearch: string) => {
    if (!queryToSearch.trim()) return;

    setIsExpanded(true);
    if (onSearchStateChange) onSearchStateChange(true);

    setIsSearching(true);

    const requestBody: Record<string, any> = {
      user: userId,
      query: queryToSearch,
    };

    const sendSearchRequest = async (body: Record<string, any>) => {
      if (searchCount + 1 >= 6 && !user?.email) {
        error({
          message:
            'You have reached the search limit for non-logged-in users. Please create an account to continue.',
        });
        router.replace("/login")
        return
      }
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

        if (queryToSearch) {
          router.push(`/buy/browse?q=${queryToSearch}`);
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

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchSubmit(searchTerm);
  };

  const handleSuggestionClick = (text: string) => {
    setSearchTerm(text);
    handleSearchSubmit(text); // This function triggers the expansion
    setIsInputFocused(false);
  };

  const pathname = usePathname();
  const isSeller = searchType?.toLowerCase() === 'sell' || pathname?.includes('sell');
  const currentSuggestions = isSeller ? sellerSuggestions : buyerSuggestions;
  const shouldLockLayout = pathname === '/' || pathname?.includes('/home');

  useLayoutEffect(() => {
    if (!shouldLockLayout || lockedHeight !== null || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    if (rect.height) setLockedHeight(rect.height);
  }, [shouldLockLayout, lockedHeight]);

  return (
    <div
      className="relative w-full"
      style={shouldLockLayout && lockedHeight ? { height: lockedHeight } : undefined}
    >
      <motion.div
        ref={cardRef}
        layout
        initial={false}
        animate={{
          borderRadius: isExpanded ? 32 : 12,
          padding: isExpanded ? 50 : 8,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`bg-white shadow-xl shadow-black/5 mx-auto bg-clip-padding relative overflow-visible w-full max-w-[1100px]${shouldLockLayout ? ' absolute left-0 right-0 top-0' : ''}`}
      >
      <form
        onSubmit={onFormSubmit}
        className="relative flex w-full items-center gap-2"
      >
        <div className="flex w-full items-center gap-2 relative z-20">
          {/* Star + Input */}
          <div className="relative flex min-w-0 flex-1 items-center gap-2 overflow-visible">
            {searchTerm === '' && (
              <StarIcon />
            )}

            <SpeechInput
              value={searchTerm}
              setValue={setSearchTerm}
              searchType={searchType}
              placeholderText={placeholderText || typedPlaceholder}
              className="w-full min-w-0 overflow-visible"
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
            />

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <div className="relative" ref={homeAttachMenuRef}>
              {/* Clip Icon Button */}
              <div
                className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors text-gray-400 hover:text-gray-600"
                onClick={() => setShowAttachMenu(!showAttachMenu)}
              >
                <Paperclip className="w-7 h-7" />
              </div>
              {/* Dropdown Menu (Image / PDF) */}
              <AnimatePresence>
                {showAttachMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-full right-0 mb-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-20"
                  >
                    <div className="flex flex-col p-1.5 gap-1">
                      <button
                        onClick={() => handleAttachmentClick('image')}
                        type="button"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
                      >
                        <ImageIcon className="w-4 h-4 text-blue-500" />
                        <span>Image</span>
                      </button>
                      <button
                        onClick={() => handleAttachmentClick('pdf')}
                        type="button"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left"
                      >
                        <FileText className="w-4 h-4 text-red-500" />
                        <span>PDF</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
        </div>
      </form >

      {/* Integrated Suggestions Dropdown */}
      <AnimatePresence>
        {!searchTerm && isInputFocused && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full border-t border-gray-100/50"
          >
            <div className="p-4 pt-4 text-left">
              <p className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-wider pl-2">
                Try Asking
              </p>
              <div className="space-y-1">
                {currentSuggestions.map((suggestion) => (
                  <motion.div
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    // ... animation props if any
                    className="flex items-center gap-3 p-3 bg-white hover:bg-orange-50/50 cursor-pointer border-t border-gray-100 first:border-t-0 transition-colors"
                  >
                    <SearchIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 text-sm leading-relaxed">{suggestion.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </div>
  );
};
