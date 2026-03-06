// 'use client';

// import { useState, useEffect } from 'react';
// import Image from 'next/image';
// import MainTestimonial from '../../../components/main-testimonial';
// import { ChooseYourMeans } from '@/components/buy/choose-your-means';
// import { HeroSearchForm } from '@/components/main/hero-tab';
// import { WeMakeItEasy } from '@/components/buy/we-make-it-easy';
// import { OfferStrengthAnalyzer } from '@/components/buy/offer-strength-analyzer';
// import { useRegister } from '@/hooks/api/auth/useRegister';
// import { RootState } from '@/lib/store';
// import { useAppDispatch, useAppSelector } from '@/lib/hook';
// import { incrementSearchCount, initializeTempUserId } from '@/slices/onboarding/property-preference';
// import { count } from 'console';
// import { PROPERTY_SEARCH_PREFERENCE_AI_URL } from '@/shared/constants/env';

// // Define the questions
// const questions = [
//   {
//     question: "Which city are you looking to search for properties in?",
//     importantNotes: "The city you are searching for properties in.",
//     type: "text",
//     answer: ""
//   },
//   {
//     question: "How many bathrooms do you need in the property?",
//     importantNotes: "The number of bathrooms you need in the property.",
//     type: "text",
//     answer: ""
//   },
//   {
//     question: "How many bedrooms would you like in the property?",
//     importantNotes: "The number of bedrooms you would like in the property.",
//     type: "text",
//     answer: ""
//   },
//   {
//     question: "What type of property are you interested in?",
//     importantNotes: "The type of property you are interested in.",
//     type: "text",
//     answer: ""
//   },
//   {
//     question: "What is your budget range?",
//     importantNotes: "The budget range you have in mind for the property.",
//     type: "text",
//     answer: ""
//   },
//   {
//     question: "What is the current status of the property you’re looking for?",
//     importantNotes: "The current status of the property you are looking for.",
//     type: "text",
//     answer: ""
//   }
// ];

// export default function Home() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [currentStep, setCurrentStep] = useState(0);
//   const [answers, setAnswers] = useState<any[]>(questions);
//   const { email } = useRegister()
//   const dispatch = useAppDispatch()

//   useEffect(() => {
//     const hasVisited = localStorage.getItem('hasVisited');
//     if (!hasVisited) {
//       setTimeout(() => {
//         setIsOpen(true);
//       }, 20000);
//       localStorage.setItem('hasVisited', 'true');
//     }
//   }, []);

//   // Handle the answer change
//   const handleAnswerChange = (e: React.ChangeEvent<any>, index: number) => {
//     const updatedAnswers = [...answers];
//     updatedAnswers[index].answer = e.target.value;
//     setAnswers(updatedAnswers);
//   };

//   // Handle the next question step
//   const handleNext = () => {
//     if (currentStep < questions.length - 1) {
//       setCurrentStep(currentStep + 1);
//     } else {
//       setIsOpen(false);
//       submitAnswers(); // Submit answers when the last step is reached
//     }
//   };

//   const { tempUserId, searchCount } = useAppSelector((state: RootState) => state.propertyPreference);

//   useEffect(() => {
//     dispatch(initializeTempUserId());
//   }, [dispatch]);

//   const submitAnswers = async () => {
//     const userId = email || tempUserId
//     const userPreferences = {
//       user: userId,
//       preference: answers.map((q) => q.answer).join(' ')
//     };

//     try {
//       const response = await fetch(PROPERTY_SEARCH_PREFERENCE_AI_URL || 'http://13.60.114.186:9000/api/search/preference', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(userPreferences)
//       });

//       if (response.ok) {
//         const data = await response.json();
//         dispatch(incrementSearchCount());

//         if (searchCount + 1 >= 6) {
//           alert('You have reached the search limit for non-logged-in users. Please create an account to continue.');
//         } else {
//           console.log(`Searching for: ${searchCount}`);
//         }
//         console.log('API Response:', data);
//       } else {
//         console.error('API request failed');
//       }
//     } catch (error) {
//       console.error('Error submitting answers:', error);
//     }
//   };


//   return (
//     <>
//       <section
//         className={
//           'mx-auto mb-5 grid min-h-[65vh] grid-cols-2 place-items-center space-x-8 bg-black px-4 pb-2 pt-12 md:min-h-[80vh] md:px-8 md:pb-2 md:pt-12'
//         }
//       >
//         <div className='flex w-full flex-col justify-center space-y-4'>
//           <span className="whitespace-pre-line py-2 text-white md:text-5xl"
//             style={{
//               fontFamily: 'Satoshi',
//               fontWeight: 900,
//               fontSize: '80px',
//               lineHeight: '108px',
//               letterSpacing: '0%',
//             }}
//           >
//             {`Buying a Home Should\n Be This Easy`}
//           </span>

//           <p className='text-white text-xl opacity-50 -mt-10'>{`First End-to-End  Guided Real Estate Platform`}</p>
//           <div className='flex w-[90%] flex-col space-y-6'>
//             <HeroSearchForm />
//             <div className='flex space-x-1 text-lg text-white'>
//               <p className='font-medium'>Conversational Search</p>
//               <p className='font-bold underline'>Powered by AI</p>
//             </div>
//           </div>
//         </div>
//         <div className='hidden w-full md:block'>
//           <Image
//             className='h-full w-full'
//             src='/assets/images/OC-Real-Animation-final.gif'
//             sizes='(max-width: 768px 70vh, (max-width: 992px )100vh'
//             alt='Snap Homz | Buyer Anime'
//             loading='lazy'
//             quality={75}
//             width={0}
//             height={0}
//             layout='responsive'
//             style={{ height: '100%' }}
//           />
//         </div>
//       </section>
//       <ChooseYourMeans />
//       <WeMakeItEasy />
//       <OfferStrengthAnalyzer />
//       {/* <MainTestimonial /> */}
//     </>
//   );
// }


// 'use client';

// import { useState, useEffect } from 'react';
// import Image from 'next/image';
// import MainTestimonial from '../../../components/main-testimonial';
// import { ChooseYourMeans } from '@/components/buy/choose-your-means';
// import { HeroSearchForm } from '@/components/main/hero-tab';
// import { WeMakeItEasy } from '@/components/buy/we-make-it-easy';
// import { OfferStrengthAnalyzer } from '@/components/buy/offer-strength-analyzer';
// import { useRegister } from '@/hooks/api/auth/useRegister';
// import { RootState } from '@/lib/store';
// import { useAppDispatch, useAppSelector } from '@/lib/hook';
// import { incrementSearchCount, initializeTempUserId } from '@/slices/onboarding/property-preference';
// import { count } from 'console';
// import { PROPERTY_SEARCH_PREFERENCE_AI_URL } from '@/shared/constants/env';
// import OurClients from '@/components/company/our-clients';

// // Define the questions
// const questions = [
//   {
//     question: "Which city are you looking to search for properties in?",
//     importantNotes: "The city you are searching for properties in.",
//     type: "text",
//     answer: ""
//   },
//   {
//     question: "How many bathrooms do you need in the property?",
//     importantNotes: "The number of bathrooms you need in the property.",
//     type: "text",
//     answer: ""
//   },
//   {
//     question: "How many bedrooms would you like in the property?",
//     importantNotes: "The number of bedrooms you would like in the property.",
//     type: "text",
//     answer: ""
//   },
//   {
//     question: "What type of property are you interested in?",
//     importantNotes: "The type of property you are interested in.",
//     type: "text",
//     answer: ""
//   },
//   {
//     question: "What is your budget range?",
//     importantNotes: "The budget range you have in mind for the property.",
//     type: "text",
//     answer: ""
//   },
//   {
//     question: "What is the current status of the property you’re looking for?",
//     importantNotes: "The current status of the property you are looking for.",
//     type: "text",
//     answer: ""
//   }
// ];

// export default function Home() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [currentStep, setCurrentStep] = useState(0);
//   const [answers, setAnswers] = useState<any[]>(questions);
//   const { email } = useRegister()
//   const dispatch = useAppDispatch()

//   useEffect(() => {
//     const hasVisited = localStorage.getItem('hasVisited');
//     if (!hasVisited) {
//       setTimeout(() => {
//         setIsOpen(true);
//       }, 20000);
//       localStorage.setItem('hasVisited', 'true');
//     }
//   }, []);

//   // Handle the answer change
//   const handleAnswerChange = (e: React.ChangeEvent<any>, index: number) => {
//     const updatedAnswers = [...answers];
//     updatedAnswers[index].answer = e.target.value;
//     setAnswers(updatedAnswers);
//   };

//   // Handle the next question step
//   const handleNext = () => {
//     if (currentStep < questions.length - 1) {
//       setCurrentStep(currentStep + 1);
//     } else {
//       setIsOpen(false);
//       submitAnswers(); // Submit answers when the last step is reached
//     }
//   };

//   const { tempUserId, searchCount } = useAppSelector((state: RootState) => state.propertyPreference);

//   useEffect(() => {
//     dispatch(initializeTempUserId());
//   }, [dispatch]);

//   const submitAnswers = async () => {
//     const userId = email || tempUserId
//     const userPreferences = {
//       user: userId,
//       preference: answers.map((q) => q.answer).join(' ')
//     };

//     try {
//       const response = await fetch(PROPERTY_SEARCH_PREFERENCE_AI_URL || 'http://13.60.114.186:9000/api/search/preference', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(userPreferences)
//       });

//       if (response.ok) {
//         const data = await response.json();
//         dispatch(incrementSearchCount());

//         if (searchCount + 1 >= 6) {
//           alert('You have reached the search limit for non-logged-in users. Please create an account to continue.');
//         } else {
//           console.log(`Searching for: ${searchCount}`);
//         }
//         console.log('API Response:', data);
//       } else {
//         console.error('API request failed');
//       }
//     } catch (error) {
//       console.error('Error submitting answers:', error);
//     }
//   };


//   return (
//     <>

// <section
//   className="
//     relative
//     flex flex-col items-center justify-center
//     bg-[#100C07]     
//     px-4 py-16 md:py-56
//   "
// >
//   {/*** 1) Semicircle of decorative images ***/}
//   <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//     <div className="relative h-[400px] w-full max-w-[1000px]">
//       {/* Image 1 (top-left) */}
//       <div className="absolute top-[-30px] left-[10%] rotate-[-30deg]">
//         <Image
//           src="/assets/images/home-landing8.png"
//           alt="Decor1"
//           width={140}
//           height={140}
//           className="rounded-lg object-cover"
//         />
//       </div>

//       {/* Image 2 (upper-left) */}
//       <div className="absolute top-[-50px] left-[25%] rotate-[-15deg]">
//         <Image
//           src="/assets/images/home-landing7.png"
//           alt="Decor2"
//           width={130}
//           height={130}
//           className="rounded-lg object-cover"
//         />
//       </div>

//       {/* Image 3 (slightly left-of-center) */}
//       <div className="absolute top-[-60px] left-[40%] rotate-[-5deg]">
//         <Image
//           src="/assets/images/home-landing6.png"
//           alt="Decor3"
//           width={140}
//           height={140}
//           className="rounded-lg object-cover"
//         />
//       </div>

//       {/* Image 4 (top-center) */}
//       <div className="absolute top-[-65px] left-[50%] translate-x-[-50%] rotate-0">
//         <Image
//           src="/assets/images/home-landing5.png"
//           alt="Decor4"
//           width={160}
//           height={160}
//           className="rounded-lg object-cover"
//         />
//       </div>

//       {/* Image 5 (slightly right-of-center) */}
//       <div className="absolute top-[-60px] left-[60%] rotate-[5deg]">
//         <Image
//           src="/assets/images/home-landing4.png"
//           alt="Decor5"
//           width={140}
//           height={140}
//           className="rounded-lg object-cover"
//         />
//       </div>

//       {/* Image 6 (upper-right) */}
//       <div className="absolute top-[-50px] left-[75%] rotate-[15deg]">
//         <Image
//           src="/assets/images/home-landing3.png"
//           alt="Decor6"
//           width={130}
//           height={130}
//           className="rounded-lg object-cover"
//         />
//       </div>

//       {/* Image 7 (top-right corner) */}
//       <div className="absolute top-[-30px] left-[90%] rotate-[30deg]">
//         <Image
//           src="/assets/images/home-landing2.png"
//           alt="Decor7"
//           width={120}
//           height={120}
//           className="rounded-lg object-cover"
//         />
//       </div>

//       {/* Image 8 (just below on left) */}
//       <div className="absolute top-[80px] left-[10%] rotate-[-45deg]">
//         <Image
//           src="/assets/images/home-landing1.png"
//           alt="Decor8"
//           width={140}
//           height={140}
//           className="rounded-lg object-cover"
//         />
//       </div>
//     </div>
//   </div>

//   {/*** 2) Centered headline + subheading + search form + “Powered by AI” ***/}
//   <div className="relative z-10 flex flex-col items-center text-center gap-6 max-w-[800px]">
//     {/* Headline */}
//     <h1
//       className="
//         text-white
//         text-[2.5rem] font-extrabold leading-tight
//         md:text-[3.5rem] md:leading-snug
//       "
//       style={{ fontFamily: 'Satoshi' }}
//     >
//       Buying a home should be{' '}
//       <span className="italic">Very Easy</span>
//     </h1>

//     {/* Subheading */}
//     <p
//       className="
//         text-white opacity-70
//         text-[1.125rem] font-medium
//         md:text-[1.25rem]
//       "
//     >
//       First end-to-end guided real estate platform
//     </p>

//     {/* FULL-WIDTH WHITE PILL (3rem tall) WITH SPARKLE ICON + INPUT + BUTTON */}
//     <div className="w-full px-4 md:px-0">
//       <HeroSearchForm />
//     </div>

//     {/* “Conversational search Powered by AI” */}
//     <div className="text-white text-lg">
//       <span className="font-medium">Conversational search&nbsp;</span>
//       <span className="font-bold underline">Powered by AI</span>
//     </div>
//   </div>
// </section>


//       <ChooseYourMeans />
//       <WeMakeItEasy />
//       <OfferStrengthAnalyzer />
//       <OurClients />
//     </>
//   );
// }


// 'use client';

// import { useEffect, useRef, useState } from 'react';
// import Image from 'next/image';
// import MainTestimonial from '../../../components/main-testimonial';
// import { ChooseYourMeans } from '@/components/buy/choose-your-means';
// import { HeroSearchForm } from '@/components/main/hero-tab';
// import { WeMakeItEasy } from '@/components/buy/we-make-it-easy';
// import { OfferStrengthAnalyzer } from '@/components/buy/offer-strength-analyzer';
// import { useRegister } from '@/hooks/api/auth/useRegister';
// import { RootState } from '@/lib/store';
// import { useAppDispatch, useAppSelector } from '@/lib/hook';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import {
//   incrementSearchCount,
//   initializeTempUserId,
// } from '@/slices/onboarding/property-preference';
// import { PROPERTY_SEARCH_PREFERENCE_AI_URL } from '@/shared/constants/env';
// import OurClients from '@/components/company/our-clients';
// import MainNavPages from '@/components/navbars/main-nav-pages';
// import { Radio } from '@mantine/core';

// const questions = [
//   {
//     question: "Which city are you looking to search for properties in?",
//     importantNotes: "The city you are searching for properties in.",
//     type: "text",
//     answer: "",
//   },
//   {
//     question: "How many bathrooms do you need in the property?",
//     importantNotes: "The number of bathrooms you need in the property.",
//     type: "text",
//     answer: "",
//   },
//   {
//     question: "How many bedrooms would you like in the property?",
//     importantNotes: "The number of bedrooms you would like in the property.",
//     type: "text",
//     answer: "",
//   },
//   {
//     question: "What type of property are you interested in?",
//     importantNotes: "The type of property you are interested in.",
//     type: "text",
//     answer: "",
//   },
//   {
//     question: "What is your budget range?",
//     importantNotes: "The budget range you have in mind for the property.",
//     type: "text",
//     answer: "",
//   },
//   {
//     question: "What is the current status of the property you’re looking for?",
//     importantNotes: "The current status of the property you are looking for.",
//     type: "text",
//     answer: "",
//   },
// ];

// export default function Home() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [currentStep, setCurrentStep] = useState(0);
//   const [answers, setAnswers] = useState<any[]>(questions);
//   const { email } = useRegister();
//   const dispatch = useAppDispatch();

//   useEffect(() => {
//     const hasVisited = localStorage.getItem('hasVisited');
//     if (!hasVisited) {
//       setTimeout(() => {
//         setIsOpen(true);
//       }, 20000);
//       localStorage.setItem('hasVisited', 'true');
//     }
//   }, []);

//   const handleAnswerChange = (
//     e: React.ChangeEvent<any>,
//     index: number
//   ) => {
//     const updated = [...answers];
//     updated[index].answer = e.target.value;
//     setAnswers(updated);
//   };

//   const handleNext = () => {
//     if (currentStep < questions.length - 1) {
//       setCurrentStep(currentStep + 1);
//     } else {
//       setIsOpen(false);
//       submitAnswers();
//     }
//   };

//   const { tempUserId, searchCount } = useAppSelector(
//     (state: RootState) => state.propertyPreference
//   );

//   useEffect(() => {
//     dispatch(initializeTempUserId());
//   }, [dispatch]);

//   const submitAnswers = async () => {
//     const userId = email || tempUserId;
//     const userPreferences = {
//       user: userId,
//       preference: answers.map((q) => q.answer).join(' '),
//     };

//     try {
//       const response = await fetch(
//         PROPERTY_SEARCH_PREFERENCE_AI_URL ||
//         'http://13.60.114.186:9000/api/search/preference',
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify(userPreferences),
//         }
//       );

//       if (response.ok) {
//         const data = await response.json();
//         dispatch(incrementSearchCount());

//         if (searchCount + 1 >= 6) {
//           alert(
//             'You have reached the search limit for non-logged-in users. Please create an account to continue.'
//           );
//         } else {
//           console.log(`Searching for: ${searchCount}`);
//         }
//         console.log('API Response:', data);
//       } else {
//         console.error('API request failed');
//       }
//     } catch (error) {
//       console.error('Error submitting answers:', error);
//     }
//   };

//   // ——————————————————————————————————————————————————————————————————————————————
//   // 1) List out the eight image paths
//   const cardImages = [
//     '/assets/images/home-landing8.png',
//     '/assets/images/home-landing7.png',
//     '/assets/images/home-landing6.png',
//     '/assets/images/home-landing5.png',
//     '/assets/images/home-landing4.png',
//     '/assets/images/home-landing3.png',
//     '/assets/images/home-landing2.png',
//     '/assets/images/home-landing1.png',
//     '/assets/images/home-landing6.png',
//     '/assets/images/home-landing5.png',
//     '/assets/images/home-landing4.png',
//     '/assets/images/home-landing3.png',
//     '/assets/images/home-landing2.png',
//     '/assets/images/home-landing1.png',

//   ];

//   const angles = [185, 210, 235, 260, 285, 310, 335, 355, 185, 210, 235, 260, 285, 310, 335, 355];

//   const radiusPx = 580;
//   const centerYOffset = 100;

//   const rotatingRef = useRef(null);

//   useEffect(() => {
//     const el = rotatingRef.current;
//     if (el) {
//       //@ts-ignore
//       el.animate(
//         [
//           { transform: 'rotate(0deg)' },
//           { transform: 'rotate(360deg)' },
//         ],
//         {
//           duration: 60000,
//           iterations: Infinity,
//           easing: 'linear',
//         }
//       );
//     }
//   }, []);

//   const [activeTab, setActiveTab] = useState('Transaction');
//   const [searchMethod, setSearchMethod] = useState<string>('');

//   return (
//     <>
//       <MainNavPages />
//       <section className="bg-[#170800] text-white h-screen relative pt-24 -mt-24 overflow-hidden ">
//         <section className="flex flex-col  justify-end h-full items-center text-center py-24 px-4">
//           <div className="flex justify-center  items-center w-full overflow-visible">
//             <div className="absolute top-32 w-[1200px] h-[1000px]">

//               {cardImages.map((image, i) => {
//                 const angle = (360 / cardImages.length) * i;
//                 return (
//                   <div
//                     key={i}
//                     className="absolute w-[150px] h-[150px] top-[46%] left-[45%] transform -translate-x-1/2 -translate-y-1/2"
//                     style={{
//                       transform: `rotate(${angle}deg) translateX(430px)`,
//                     }}
//                   >
//                     <div
//                       className="w-full h-full"

//                     >
//                       <Image
//                         src={image}
//                         alt={`home-landing-${i + 1}`}
//                         width={120}
//                         height={120}
//                         unoptimized
//                         className="rounded-3xl object-cover w-full h-full"
//                       />
//                     </div>
//                   </div>
//                 );
//               })}

//             </div>
//           </div>
//           <div className="relative z-30  h-full -bottom-20  justify-end flex flex-col items-center text-center gap-8 max-w-[900px]">
//             {/* Updated Headline */}
//             <h1
//               className="
//     text-white
//     font-satoshi
//     text-center
//     tracking-[-0.04em]

//     text-[36px] leading-[42px]
//     sm:text-[48px] sm:leading-[56px]
//     lg:text-[64px] lg:leading-[70px]
//   "
//             >
//               <span className="block font-semibold">
//                 Buying a home
//               </span>

//               <span className="block font-semibold">
//                 should be{' '}
//                 <span className="font-light italic">
//                   Very Easy
//                 </span>
//               </span>
//             </h1>

//             {/* Subheading */}
//             <p className=" text-[1rem] font-medium md:text-[1rem] text-[#CEB28B]" >
//               First end-to-end guided real estate platform
//             </p>

//             {/* FULL-WIDTH SEARCH PILL */}
//            <div className="relative z-10 w-full max-w-[600px] px-4 md:px-0 text-black">


//               <HeroSearchForm
//                 searchType={searchMethod}
//               />



//               <div className="hidden md:flex gap-4 justify-center text-sm mb-2 text-white mt-4">
//                 <label className="flex items-center">
//                   <Radio
//                     value="nlp"
//                     label="Search by Location"
//                     size='xs'
//                     checked={searchMethod === "nlp"}
//                     onChange={() => setSearchMethod("nlp")}
//                     className="mr-2"
//                   />
//                 </label>
//                 <label className="flex items-center">
//                   <Radio
//                     value="address"
//                     label="Search by Full Address"
//                     size='xs'
//                     checked={searchMethod === "address"}
//                     onChange={() => setSearchMethod("address")}
//                     className="mr-2"
//                   />
//                 </label>
//               </div>

//             </div>


//             {/* “Conversational search Powered by AI” */}
//             <div className="text-white text-[1rem]">
//               <span className="font-medium">Conversational search&nbsp;</span>
//               <span className="font-bold underline">
//                 Powered by AI
//               </span>
//             </div>

//           </div>
//         </section>
//         {/* <div className="bg-gradient-to-t absolute bottom-0 h-60 w-full from-[#050505] to-transparent"> */}
//         <div className="absolute bottom-0 h-36 w-full" style={{ background: 'linear-gradient(to bottom, rgba(25, 7, 0, 0) 4.07%, #190700 55.92%)' }}>
//         </div>
//       </section>

//       <ChooseYourMeans />
//       <WeMakeItEasy />
//       <OfferStrengthAnalyzer />
//       <OurClients />
//     </>
//   );
// }


'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Carousel } from '@mantine/carousel';

import MainTestimonial from '../../../components/main-testimonial';
import { ChooseYourMeans } from '@/components/buy/choose-your-means';
import { HeroSearchForm } from '@/components/main/hero-tab';
import { WeMakeItEasy } from '@/components/buy/we-make-it-easy';
import { OfferStrengthAnalyzer } from '@/components/buy/offer-strength-analyzer';
import GetReadyForCollege from '@/components/buy/get-ready-for-college';
import { useRegister } from '@/hooks/api/auth/useRegister';
import { RootState } from '@/lib/store';
import { useAppDispatch, useAppSelector } from '@/lib/hook';
import {
  incrementSearchCount,
  initializeTempUserId,
} from '@/slices/onboarding/property-preference';
import { PROPERTY_SEARCH_PREFERENCE_AI_URL } from '@/shared/constants/env';
import OurClients from '@/components/company/our-clients';
import MainNavPages from '@/components/navbars/main-nav-pages';
import { Radio } from '@mantine/core';
import BuyOrRent from '@/components/buy/buy-or-rent';
import FindPerfectMortgage from '@/components/buy/find-your-mortgage';
import HomeDisclosure from '@/components/buy/home-disclosure';
import Footer from '@/components/shared/footer';

const questions = [
  {
    question: "Which city are you looking to search for properties in?",
    importantNotes: "The city you are searching for properties in.",
    type: "text",
    answer: "",
  },
  {
    question: "How many bathrooms do you need in the property?",
    importantNotes: "The number of bathrooms you need in the property.",
    type: "text",
    answer: "",
  },
  {
    question: "How many bedrooms would you like in the property?",
    importantNotes: "The number of bedrooms you would like in the property.",
    type: "text",
    answer: "",
  },
  {
    question: "What type of property are you interested in?",
    importantNotes: "The type of property you are interested in.",
    type: "text",
    answer: "",
  },
  {
    question: "What is your budget range?",
    importantNotes: "The budget range you have in mind for the property.",
    type: "text",
    answer: "",
  },
  {
    question: "What is the current status of the property you’re looking for?",
    importantNotes: "The current status of the property you are looking for.",
    type: "text",
    answer: "",
  },
];

const HOME_PAGE_TESTIMONIALS = [
  {
    name: 'MILTON AUSTIN',
    title: 'First-time Buyer Specialist, San Diego',
    text: 'Snaphomz cuts the time I spend on offers and disclosures each week. The workflows keep everything organized so I can focus on advising clients instead of chasing paperwork.',
    img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    name: 'ALEX RICHARD',
    title: 'Broker Associate, Austin',
    text: 'The analytics and AI summaries give me clear talking points for every client meeting. I walk in prepared, and my clients feel confident in each decision we make together.',
    img: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
];

// export default function Home() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [currentStep, setCurrentStep] = useState(0);
//   const [answers, setAnswers] = useState<any[]>(questions);
//   const { email } = useRegister();
//   const dispatch = useAppDispatch();

//   useEffect(() => {
//     const hasVisited = localStorage.getItem('hasVisited');
//     if (!hasVisited) {
//       setTimeout(() => {
//         setIsOpen(true);
//       }, 20000);
//       localStorage.setItem('hasVisited', 'true');
//     }
//   }, []);

//   const { tempUserId, searchCount } = useAppSelector(
//     (state: RootState) => state.propertyPreference
//   );

//   useEffect(() => {
//     dispatch(initializeTempUserId());
//   }, [dispatch]);

//   const submitAnswers = async () => {
//     const userId = email || tempUserId;
//     const userPreferences = {
//       user: userId,
//       preference: answers.map((q) => q.answer).join(' '),
//     };

//     try {
//       await fetch(
//         PROPERTY_SEARCH_PREFERENCE_AI_URL ||
//         'http://13.60.114.186:9000/api/search/preference',
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify(userPreferences),
//         }
//       );
//       dispatch(incrementSearchCount());
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   // ——————————————————————————————————————————————————————————————————————————————
//   // 1) List out the eight image paths
//   const cardImages = [
//     '/assets/images/home-landing8.png',
//     '/assets/images/home-landing7.png',
//     '/assets/images/home-landing6.png',
//     '/assets/images/home-landing5.png',
//     '/assets/images/home-landing4.png',
//     '/assets/images/home-landing3.png',
//     '/assets/images/home-landing2.png',
//     '/assets/images/home-landing1.png',
//     '/assets/images/home-landing6.png',
//     '/assets/images/home-landing5.png',
//     '/assets/images/home-landing4.png',
//     '/assets/images/home-landing3.png',
//     '/assets/images/home-landing2.png',
//     '/assets/images/home-landing1.png',
//   ];

//   const [searchMethod, setSearchMethod] = useState<string>('');

//   return (
//     <>
//       <MainNavPages />
//       <section className="bg-[#170800] text-white h-screen relative pt-24 -mt-24 overflow-hidden ">
//         <section className="flex flex-col justify-end h-full items-center text-center py-24 px-4">
//           <div className="flex justify-center items-center w-full overflow-visible">
//             <div className="absolute top-32 md:top-56 lg:top-56 w-[1200px] h-[1000px]">
//               {cardImages.map((image, i) => {
//                 const angle = (360 / cardImages.length) * i;
//                 const radius = window.innerWidth < 420 ? 210 : window.innerWidth < 640 ? 280 : window.innerWidth < 768 ? 300 : 430
//                 let top = "top-[34%]"
//                 if (window.innerHeight > 800) {
//                   top = "top-[54%]"
//                 }

//                 return (
//                   <div
//                     key={i.toString()}
//                     className={
//                       "absolute w-[70px] h-[70px] min-[420px]:w-[90px] min-[420px]:h-[90px] md:w-[150px] md:h-[150px] " +
//                       "left-[47%] min-[420px]:left-[46%] md:left-[43%] lg:left-1/2 " +
//                       "transform -translate-x-1/2 -translate-y-1/2 " +
//                       top
//                     }

//                     style={{
//                       transform: `rotate(${angle}deg) translateX(${radius}px)`,
//                     }}
//                   >
//                     <div
//                       className="w-full h-full"
//                     >
//                       <Image
//                         src={image}
//                         alt={`home-landing-${i + 1}`}
//                         width={120}
//                         height={120}
//                         unoptimized
//                         className="rounded-3xl object-cover w-full h-full"
//                       />
//                     </div>
//                   </div>
//                 );
//               })}

//             </div>
//           </div>
//           <div className="relative z-30 h-full -bottom-20 md:-bottom-10 lg:-bottom-10 justify-end flex flex-col items-center text-center gap-4 sm:gap-8 max-w-[900px] lg:-translate-x-4">
//             {/* Updated Headline */}
//             <h1
//               className="
//                 text-white
//                 font-satoshi
//                 text-center
//                 tracking-[-0.04em]
//                 text-[30px] leading-[42px]
//                 min-[420px]:text-[40px] min-[420px]:leading-[40px]
//                 sm:text-[48px] sm:leading-[56px]
//                 lg:text-[64px] lg:leading-[70px]
//               "
//             >
//               <span className="block font-medium">
//                 Buying a home
//               </span>

//               <span className="block font-normal">
//                 should be{' '}
//                 <span className="font-light italic">
//                   Very Easy
//                 </span>
//               </span>
//             </h1>

//             {/* Subheading - Hidden on mobile */}
//             <p className="hidden md:block text-[1rem] font-medium md:text-[1rem] text-[#CEB28B]">
//               First end-to-end guided real estate platform
//             </p>

//             {/* FULL-WIDTH SEARCH PILL */}
//             <div className="relative z-10 w-full max-w-[600px] px-4 md:px-0 text-black">
//               <HeroSearchForm
//                 searchType={searchMethod}
//               />
//               <div className="flex gap-4 justify-center text-sm  mb-2 text-white mt-4">
//                 <label className="flex items-center">
//                   <Radio
//                     value="nlp"
//                     label="Search by Location"
//                     size='xs'
//                     checked={searchMethod === "nlp"}
//                     onChange={() => setSearchMethod("nlp")}
//                     className="mr-2"
//                   />
//                 </label>
//                 <label className="flex items-center">
//                   <Radio
//                     value="address"
//                     label="Search by Full Address"
//                     size='xs'
//                     checked={searchMethod === "address"}
//                     onChange={() => setSearchMethod("address")}
//                     className="mr-2"
//                   />
//                 </label>
//               </div>

//             </div>


//             {/* “Conversational search Powered by AI” */}
//             <div className="text-white text-[1rem]">
//               <span className="font-medium">Conversational search&nbsp;</span>
//               <span className="font-bold underline">
//                 Powered by AI
//               </span>
//             </div>
//           </div>
//         </section>
//         {/* <div className="bg-gradient-to-t absolute bottom-0 h-60 w-full from-[#050505] to-transparent"> */}
//         <div className="absolute bottom-0 h-36 w-full" style={{ background: 'linear-gradient(to bottom, rgba(25, 7, 0, 0) 4.07%, #190700 55.92%)' }}>
//         </div>
//       </section>

//       <ChooseYourMeans />
//       <WeMakeItEasy />
//       <OfferStrengthAnalyzer />
//       <OurClients />
//     </>
//   );


// }


export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchMethod, setSearchMethod] = useState('');
  const [isHomeSearchActive, setIsHomeSearchActive] = useState(false);
  const dispatch = useAppDispatch();
  const { email } = useRegister();
  const [carouselEmbla, setCarouselEmbla] = useState<any>(null);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const resumeRef = useRef<NodeJS.Timeout | null>(null);
  const AUTOPLAY_DELAY = 4000;

  const { tempUserId } = useAppSelector(
    (state: RootState) => state.propertyPreference
  );

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      setTimeout(() => setIsOpen(true), 20000);
      localStorage.setItem('hasVisited', 'true');
    }
  }, []);

  useEffect(() => {
    dispatch(initializeTempUserId());
  }, [dispatch]);

  useEffect(() => {
    if (!carouselEmbla) return;

    const startAutoplay = () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
      autoplayRef.current = setInterval(() => {
        carouselEmbla.scrollNext();
      }, AUTOPLAY_DELAY);
    };

    const stopAutoplay = () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
        autoplayRef.current = null;
      }
    };

    const scheduleResume = () => {
      if (resumeRef.current) clearTimeout(resumeRef.current);
      resumeRef.current = setTimeout(() => {
        startAutoplay();
      }, AUTOPLAY_DELAY);
    };

    const handlePointerDown = () => {
      stopAutoplay();
      if (resumeRef.current) clearTimeout(resumeRef.current);
    };

    const handlePointerUp = () => {
      scheduleResume();
    };

    startAutoplay();
    carouselEmbla.on('pointerDown', handlePointerDown);
    carouselEmbla.on('pointerUp', handlePointerUp);

    return () => {
      stopAutoplay();
      if (resumeRef.current) clearTimeout(resumeRef.current);
      carouselEmbla.off('pointerDown', handlePointerDown);
      carouselEmbla.off('pointerUp', handlePointerUp);
    };
  }, [carouselEmbla]);

  // Individual image rotation function
  const getImageRotation = (angle: number) => {
    return angle > 180 && angle < 360 ? 'rotate(358deg)' : 'rotate(0deg)';
  };

  const cardImages = [
    '/assets/images/home-landing8.png',
    '/assets/images/home-landing7.png',
    '/assets/images/home-landing6.png',
    '/assets/images/home-landing5.png',
    '/assets/images/home-landing4.png',
    '/assets/images/home-landing3.png',
    '/assets/images/home-landing2.png',
    '/assets/images/home-landing1.png',
    '/assets/images/home-landing6.png',
    '/assets/images/home-landing5.png',
    '/assets/images/home-landing4.png',
    '/assets/images/home-landing3.png',
    '/assets/images/home-landing2.png',
    '/assets/images/home-landing1.png',
  ];

  return (
    <>
      <MainNavPages />

      {/* ================= HERO SECTION ================= */}
      <section className="home-hero relative -mt-24 min-h-[80vh] bg-[#170800] pt-28 text-white md:h-[695px] md:min-h-[695px] md:max-h-[695px] md:pt-24">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* ================= DESKTOP ARC ================= */}

          <div className="hidden md:flex w-full justify-center items-center overflow-visible">
            <div className="home-hero-arc absolute left-1/2 top-32 h-[850px] w-[1200px] -translate-x-[54%]">
              {/* Image 1 */}
              <div
                className="absolute left-1/2 top-[46%] h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 transform"
                style={{ transform: `rotate(0deg) translateX(430px)` }}
              >
                <Image
                  src="/assets/images/home-landing8.png"
                  alt="home-landing-1"
                  width={120}
                  height={120}
                  unoptimized
                  className="rounded-3xl w-full h-full"
                  style={{ objectFit: 'contain', transform: getImageRotation(0) }}
                />
              </div>

              {/* Image 2 */}
              <div
                className="absolute left-1/2 top-[46%] h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 transform"
                style={{ transform: `rotate(25.71deg) translateX(430px)` }}
              >
                <Image
                  src="/assets/images/home-landing1.png"
                  alt="home-landing-2"
                  width={120}
                  height={120}
                  unoptimized
                  className="rounded-3xl w-full h-full"
                  style={{ objectFit: 'contain', transform: getImageRotation(25.71) }}
                />
              </div>

              {/* Image 3 */}
              <div
                className="absolute left-1/2 top-[46%] h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 transform"
                style={{ transform: `rotate(51.43deg) translateX(430px)` }}
              >
                <Image
                  src="/assets/images/home-landing6.png"
                  alt="home-landing-3"
                  width={120}
                  height={120}
                  unoptimized
                  className="rounded-3xl w-full h-full"
                  style={{ objectFit: 'contain', transform: getImageRotation(51.43) }}
                />
              </div>

              {/* Image 4 */}
              <div
                className="absolute left-1/2 top-[46%] h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 transform"
                style={{ transform: `rotate(77.14deg) translateX(430px)` }}
              >
                <Image
                  src="/assets/images/home-landing3.png"
                  alt="home-landing-4"
                  width={120}
                  height={120}
                  unoptimized
                  className="rounded-3xl w-full h-full"
                  style={{ objectFit: 'contain', transform: getImageRotation(77.14) }}
                />
              </div>

              {/* Image 5 */}
              <div
                className="absolute left-1/2 top-[46%] h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 transform"
                style={{ transform: `rotate(102.86deg) translateX(430px)` }}
              >
                <Image
                  src="/assets/images/home-landing4.png"
                  alt="home-landing-5"
                  width={120}
                  height={120}
                  unoptimized
                  className="rounded-3xl w-full h-full"
                  style={{ objectFit: 'contain', transform: getImageRotation(102.86) }}
                />
              </div>

              {/* Image 6 */}
              <div
                className="absolute left-1/2 top-[46%] h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 transform"
                style={{ transform: `rotate(128.57deg) translateX(430px)` }}
              >
                <Image
                  src="/assets/images/home-landing3.png"
                  alt="home-landing-6"
                  width={120}
                  height={120}
                  unoptimized
                  className="rounded-3xl w-full h-full"
                  style={{ objectFit: 'contain', transform: getImageRotation(128.57) }}
                />
              </div>

              {/* Image 7 */}
              <div
                className="absolute left-1/2 top-[46%] h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 transform"
                style={{ transform: `rotate(154.29deg) translateX(430px)` }}
              >
                <Image
                  src="/assets/images/home-landing2.png"
                  alt="home-landing-7"
                  width={120}
                  height={120}
                  unoptimized
                  className="rounded-3xl w-full h-full"
                  style={{ objectFit: 'contain', transform: getImageRotation(154.29) }}
                />
              </div>

              {/* Image 8 */}
              <div
                className="absolute left-1/2 top-[46%] h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 transform"
                style={{ transform: `rotate(180deg) translateX(430px)` }}
              >
                <Image
                  src="/assets/images/home-landing1.png"
                  alt="home-landing-8"
                  width={120}
                  height={120}
                  unoptimized
                  className="rounded-3xl w-full h-full"
                  // style={{ objectFit: 'contain', transform: getImageRotation(180) }}
                  style={{ objectFit: 'contain', transform: 'rotate(531deg)' }}
                />
              </div>

              {/* Image 9 */}
              <div
                className="absolute left-1/2 top-[46%] h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 transform overflow-hidden rounded-3xl"
                style={{ transform: `rotate(205.71deg) translateX(430px)`, }}
              >
                <Image
                  src="/assets/images/home-landing2.png"
                  alt="home-landing-9"
                  fill
                  sizes="150px"
                  unoptimized
                  className="object-cover"
                  style={{ transform: 'rotate(531deg) scale(1.096)', transformOrigin: '50% 50%' }}
                />
              </div>

              {/* Image 10 */}
              <div
                className="absolute left-1/2 top-[46%] h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 transform overflow-hidden rounded-3xl relative"
                style={{ transform: `rotate(231.43deg) translateX(430px)` }}
              >

                <Image
                  src="/assets/images/home-landing3.png"
                  alt="home-landing-10"
                  fill
                  sizes="150px"
                  unoptimized
                  className="object-cover"
                  style={{ transform: 'rotate(480deg) scale(1.25)', transformOrigin: '50% 50%' }}
                />

                {/* <Image
                  src="/assets/images/home-landing3.png"
                  alt="home-landing-10"
                  width={120}
                  height={120}
                  unoptimized
                  className="rounded-3xl w-full h-full"
                  style={{ objectFit: 'contain', transform: 'rotate(458deg)' }}
                  

        
                />*/}
              </div>

              {/* Image 11 */}
              <div
                className="absolute left-1/2 top-[46%] h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 transform overflow-hidden rounded-3xl"
                style={{ transform: `rotate(257.14deg) translateX(430px)` }}
              >
                <Image
                  src="/assets/images/home-landing4.png"
                  alt="home-landing-11"
                  fill
                  sizes="150px"
                  unoptimized
                  className="object-cover"
                  style={{ transform: 'rotate(465deg) scale(1.16)', transformOrigin: '50% 50%' }}
                />
              </div>

              {/* Image 12 */}
              <div
                className="absolute left-1/2 top-[46%] h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 transform overflow-hidden rounded-3xl"
                style={{ transform: `rotate(282.86deg) translateX(430px)` }}
              >
                <Image
                  src="/assets/images/home-landing5.png"
                  alt="home-landing-12"
                  fill
                  sizes="150px"
                  unoptimized
                  className="object-cover"
                  style={{ transform: 'rotate(445deg) scale(1.055)', transformOrigin: '50% 50%' }}
                />
              </div>

              {/* Image 13 */}
              <div
                className="absolute left-1/2 top-[46%] h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 transform transform overflow-hidden rounded-3xl"
                style={{ transform: `rotate(308.57deg) translateX(430px)` }}
              >
                <Image
                  src="/assets/images/home-landing6.png"
                  alt="home-landing-13"
                  fill
                  sizes="150px"
                  unoptimized
                  className="object-cover"
                  style={{ transform: 'rotate(414deg) scale(1.269)', transformOrigin: '50% 50%' }}
                />
              </div>

              {/* Image 14 */}
              <div
                className="absolute left-1/2 top-[46%] h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 transform overflow-hidden rounded-3xl"
                style={{ transform: `rotate(334.29deg) translateX(430px)` }}
              >
                <Image
                  src="/assets/images/home-landing7.png"
                  alt="home-landing-14"
                  fill
                  sizes="150px"
                  unoptimized
                  className="object-cover"
                  style={{ transform: 'rotate(390deg) scale(1.247)', transformOrigin: '50% 50%' }}
                />
              </div>

            </div>
          </div>
          {/* ================= MOBILE ARC ================= */}
          <div className="relative w-full md:hidden pointer-events-none">
            <div className="absolute left-1/2 top-52 h-[220px] w-full max-w-[460px]
                            -translate-x-1/2 overflow-visible">
              {[
                { a: 175, r: 180, size: 95, idx: 0, rot: 18 },
                { a: 211, r: 180, size: 95, idx: 1, rot: -55 },
                { a: 247, r: 180, size: 95, idx: 2, rot: -20 },
                { a: 285, r: 180, size: 95, idx: 3, rot: 18 },
                { a: 324, r: 180, size: 95, idx: 4, rot: 55 },
                { a: 363, r: 180, size: 95, idx: 5, rot: 85 },
              ].map((p, i) => (
                <div
                  key={i}
                  className="absolute overflow-hidden rounded-2xl shadow-sm"
                  style={{
                    left: '50%',
                    top: '110px',
                    width: `${p.size}px`,
                    height: `${p.size}px`,
                    transform: `
                      translate(-50%, -50%)
                      rotate(${p.a}deg)
                      translateX(${p.r}px)
                      rotate(${-p.a + p.rot}deg)
                    `,
                  }}
                >
                  <Image
                    src={cardImages[p.idx]}
                    alt={`mobile-hero-${i}`}
                    width={p.size}
                    height={p.size}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>

          </div>
        </div>


        <section className="relative z-30 flex h-full flex-col items-center justify-start px-4 pt-24 pb-24 md:pb-28 text-center">

          {/* ================= TEXT + SEARCH ================= */}
          <div className="home-hero-content relative z-30 flex w-full max-w-[1600px] flex-col items-center gap-8 mt-24 md:mt-24">

            <h1 className="home-hero-title text-[2rem] font-medium leading-snug tracking-tight sm:text-[2.4rem] md:text-[3rem]">
              <span className="block">Buying a home</span>
              <span className="block">
                should be{' '}
                <span className="font-extralight italic">Very Easy</span>
              </span>
            </h1>

            <p className="home-hero-subtitle text-[1rem] font-medium text-[#CEB28B]">
              First end-to-end guided real estate platform
            </p>

            <div className="relative w-full flex justify-center text-black">
              <div className="home-hero-search-wrap w-full max-w-[1500px]">
                <HeroSearchForm
                  onSearchStateChange={(isActive) => setIsHomeSearchActive(isActive)}
                />
              </div>

              {/* <div className="mt-4 flex justify-center gap-4 text-sm text-white">
                <Radio
                  value="nlp"
                  label="Search by Location"
                  size="xs"
                  checked={searchMethod === 'nlp'}
                  onChange={() => setSearchMethod('nlp')}
                />
                <Radio
                  value="address"
                  label="Search by Full Address"
                  size="xs"
                  checked={searchMethod === 'address'}
                  onChange={() => setSearchMethod('address')}
                />
              </div> */}
            </div>

            <div className="mb-4 flex items-center gap-3 whitespace-nowrap md:mb-6">
              <span
                className={`text-[1rem] font-medium transition-colors ${isHomeSearchActive ? 'text-white md:text-[#2C211A]' : 'text-white'}`}
              >
                Conversational search,
              </span>
              <span
                className={`text-[1rem] font-bold underline transition-colors ${isHomeSearchActive ? 'text-white md:text-[#2C211A]' : 'text-white'}`}
              >
                powered by Snaphomz AI.
              </span>
                <button className="uiverse">
                  <div className="wrapper">
                    <span>BETA</span>
                    <div className="circle circle-12"></div>
                    <div className="circle circle-11"></div>
                    <div className="circle circle-10"></div>
                    <div className="circle circle-9"></div>
                    <div className="circle circle-8"></div>
                    <div className="circle circle-7"></div>
                    <div className="circle circle-6"></div>
                    <div className="circle circle-5"></div>
                    <div className="circle circle-4"></div>
                    <div className="circle circle-3"></div>
                    <div className="circle circle-2"></div>
                    <div className="circle circle-1"></div>
                  </div>
                </button>
            </div>
          </div>
        </section>

        {/* bottom gradient */}
        <div
          className="absolute bottom-0 h-36 w-full"
          style={{
            background:
              'linear-gradient(to bottom, rgba(25,7,0,0) 4.07%, #190700 55.92%)',
          }}
        />
      </section>


      {/* ================= OTHER SECTIONS ================= */}
      <div className="home-sections pt-8 md:pt-10">
        <ChooseYourMeans
          heading="Choose how you buy"
          subheading="Take control of your home purchase with guided transactions, approval workflows, and transparent tracking, no matter how you like to work."
          yourAgentDescription="Bring the agent you already trust and manage everything together on Snaphomz."
          ourAgentDescription="Match with a vetted local expert and handle your entire transaction in one place."
          ctaLabel="Get started"
        />
        <WeMakeItEasy contentPreset="home" />
        <section className="relative pt-8 md:pt-10 home-info-carousel">
          <Carousel
            className="home-carousel"
            slideSize="100%"
            slideGap="0"
            align="start"
            withControls
            withIndicators={false}
            loop
            getEmblaApi={setCarouselEmbla}
            styles={{
              root: { width: '100%' },
              viewport: { overflow: 'hidden' },
              controls: {
                top: '50%',
                transform: 'translateY(-50%)',
                left: 0,
                right: 0,
                padding: '0 12px',
              },
              control: { border: 0, background: 'none', boxShadow: 'none' },
            }}
          >
            <Carousel.Slide>
              <div className="h-[560px] xl:h-[620px] 2xl:h-[680px] flex items-center">
                <GetReadyForCollege />
              </div>
            </Carousel.Slide>
            <Carousel.Slide>
              <div className="h-[560px] xl:h-[620px] 2xl:h-[680px] flex items-start pt-0">
                <FindPerfectMortgage />
              </div>
            </Carousel.Slide>
            <Carousel.Slide>
              <div className="h-[560px] xl:h-[620px] 2xl:h-[680px] flex items-center">
                <HomeDisclosure />
              </div>
            </Carousel.Slide>
            <Carousel.Slide>
              <div className="h-[560px] xl:h-[620px] 2xl:h-[680px] flex items-center">
                <BuyOrRent />
              </div>
            </Carousel.Slide>
          </Carousel>
        </section>

        {/* <OfferStrengthAnalyzer /> */}
        <OurClients
          bgColor="#FFF6EC"
          subtitle="We value our agents' honest feedback on how Snaphomz supports their business."
          testimonials={HOME_PAGE_TESTIMONIALS}
        />
      </div>

      <Footer />
    </>
  );
}

