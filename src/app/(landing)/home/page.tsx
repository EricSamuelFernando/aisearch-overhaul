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


'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import MainTestimonial from '../../../components/main-testimonial';
import { ChooseYourMeans } from '@/components/buy/choose-your-means';
import { HeroSearchForm } from '@/components/main/hero-tab';
import { WeMakeItEasy } from '@/components/buy/we-make-it-easy';
import { OfferStrengthAnalyzer } from '@/components/buy/offer-strength-analyzer';
import { useRegister } from '@/hooks/api/auth/useRegister';
import { RootState } from '@/lib/store';
import { useAppDispatch, useAppSelector } from '@/lib/hook';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMediaQuery } from '@mantine/hooks';
import {
  incrementSearchCount,
  initializeTempUserId,
} from '@/slices/onboarding/property-preference';
import { PROPERTY_SEARCH_PREFERENCE_AI_URL } from '@/shared/constants/env';
import OurClients from '@/components/company/our-clients';
import MainNavPages from '@/components/navbars/main-nav-pages';
import { Radio } from '@mantine/core';
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

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<any[]>(questions);
  const { email } = useRegister();
  const dispatch = useAppDispatch();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      setTimeout(() => {
        setIsOpen(true);
      }, 20000);
      localStorage.setItem('hasVisited', 'true');
    }
  }, []);

  const handleAnswerChange = (
    e: React.ChangeEvent<any>,
    index: number
  ) => {
    const updated = [...answers];
    updated[index].answer = e.target.value;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsOpen(false);
      submitAnswers();
    }
  };

  const { tempUserId, searchCount } = useAppSelector(
    (state: RootState) => state.propertyPreference
  );

  useEffect(() => {
    dispatch(initializeTempUserId());
  }, [dispatch]);

  const submitAnswers = async () => {
    const userId = email || tempUserId;
    const userPreferences = {
      user: userId,
      preference: answers.map((q) => q.answer).join(' '),
    };

    try {
      const response = await fetch(
        PROPERTY_SEARCH_PREFERENCE_AI_URL ||
        'http://13.60.114.186:9000/api/search/preference',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userPreferences),
        }
      );

      if (response.ok) {
        const data = await response.json();
        dispatch(incrementSearchCount());

        if (searchCount + 1 >= 6) {
          alert(
            'You have reached the search limit for non-logged-in users. Please create an account to continue.'
          );
        } else {
          console.log(`Searching for: ${searchCount}`);
        }
        console.log('API Response:', data);
      } else {
        console.error('API request failed');
      }
    } catch (error) {
      console.error('Error submitting answers:', error);
    }
  };

  // ——————————————————————————————————————————————————————————————————————————————
  // 1) List out the eight image paths
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

  const angles = [185, 210, 235, 260, 285, 310, 335, 355, 185, 210, 235, 260, 285, 310, 335, 355];

  const radiusPx = 580;
  const centerYOffset = 100;

  const rotatingRef = useRef(null);

  useEffect(() => {
    const el = rotatingRef.current;
    if (el) {
      //@ts-ignore
      el.animate(
        [
          { transform: 'rotate(0deg)' },
          { transform: 'rotate(360deg)' },
        ],
        {
          duration: 60000,
          iterations: Infinity,
          easing: 'linear',
        }
      );
    }
  }, []);

  const [activeTab, setActiveTab] = useState('Transaction');
  const [searchMethod, setSearchMethod] = useState<string>('');
  

  return (
    <>
      <MainNavPages />
      {/* <section className="bg-[#170800] text-white h-screen relative pt-24 -mt-24 overflow-hidden "> */}
      <section className="bg-[#170800] text-white min-h-screen relative pt-24 -mt-24 overflow-hidden md:h-screen">

        {/* <section className="flex flex-col  justify-end h-full items-center text-center py-24 px-4"> */}
        <section className="flex flex-col justify-end h-full items-center text-center py-16 px-4 md:py-24">

          {/* <div className="flex justify-center  items-center w-full overflow-visible"> */}
            {/* <div className="absolute top-32 w-[1200px] h-[1000px]"> */}
            <div className="hidden md:flex justify-center items-center w-full overflow-visible">

            <div className="absolute top-24 md:top-32 w-[600px] h-[500px] md:w-[1200px] md:h-[1000px]">


              {cardImages.map((image, i) => {
                const angle = (360 / cardImages.length) * i;
                return (
                  <div
                    key={i}
                    // className="absolute w-[150px] h-[150px] top-[46%] left-[45%] transform -translate-x-1/2 -translate-y-1/2"
                    className="absolute w-[80px] h-[80px] md:w-[150px] md:h-[150px] top-[46%] left-[45%] transform -translate-x-1/2 -translate-y-1/2"

                    style={{
                      transform: `rotate(${angle}deg) translateX(430px)`,
                    }}
                  >
                    <div
                      className="w-full h-full"

                    >
                      <Image
                        src={image}
                        alt={`home-landing-${i + 1}`}
                        width={120}
                        height={120}
                        className="rounded-3xl object-cover w-full h-full"
                      />
                    </div>
                  </div>
                );
              })}

            </div>
          </div>
          <div className="relative z-30  h-full -bottom-20  justify-end flex flex-col items-center text-center gap-8 max-w-[900px]">
            {/* Updated Headline */}
            {/* <h1
              className="
      text-white
      text-[2rem] font-medium leading-none
      md:text-[3rem] 
    " */}
    <h1
  className="
    text-white
    text-[2.8rem]           /* < md (phones) — bigger */
    sm:text-[2.6rem]        /* small tablets */
    md:text-[3rem]          /* >= md (desktop) — unchanged */
    font-medium
    leading-snug md:leading-tight
    tracking-tight
  "
  style={{ fontFamily: 'Satoshi' }}
>
  <span className="block tracking-tighter font-medium">Buying a home</span>
 <span className="block tracking-tighter">
    <span className="font-medium">should be </span>
    <span className="italic font-extralight">Very Easy</span>
    {/* ↑ italic + lighter accent color to match the image */}
  </span></h1>

            {/* Subheading */}
            <p className=" text-[1rem] font-medium md:text-[1rem] text-[#CEB28B]" >
              First end-to-end guided real estate platform
            </p>

            {/* FULL-WIDTH SEARCH PILL */}
            {/* <div className="w-[600px] relative z-100 px-4 md:px-0 text-black"> */}
              <div className="w-full md:w-[600px] relative z-100 px-2 md:px-0 text-black">

                   
                      <HeroSearchForm 
                      searchType ={searchMethod}
                    />
                    
                  
              
                {/* <div className="flex gap-4 justify-center text-sm  mb-2 text-white mt-4"> */}
                {/* <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center text-sm mb-2 text-white mt-4">

                    <label className="flex items-center">
                      <Radio
                        value="nlp"
                        label="Search by Location"
                          size='xs'
                        checked={searchMethod === "nlp"}
                        onChange={() => setSearchMethod("nlp")}
                        className="mr-2"
                      />
                    </label>
                    <label className="flex items-center">
                      <Radio
                        value="address"
                        label="Search by Full Address"
                        size='xs'
                        checked={searchMethod === "address"}
                        onChange={() => setSearchMethod("address")}
                        className="mr-2"
                      />
                    </label>
                </div> */}
                 <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center text-sm mb-2 text-white mt-4">
  <label className="flex items-center">
    <Radio
      value="nlp"
      label="Search by Location"
      size={isDesktop ? 'xs' : 'lg'}   
      checked={searchMethod === 'nlp'}
      onChange={() => setSearchMethod('nlp')}
      className="mr-2"
    />
  </label>

  <label className="flex items-center">
    <Radio
      value="address"
      label="Search by Full Address"
      size={isDesktop ? 'xs' : 'lg'}   
      checked={searchMethod === 'address'}
      onChange={() => setSearchMethod('address')}
      className="mr-2"
    />
  </label>
</div>

            </div>
           

            {/* “Conversational search Powered by AI” */}
            {/* <div className="text-white text-[1rem]"> */}
            <div className="text-white text-[1.2rem] md:text-[1rem]">
              <span className="font-medium">Conversational search&nbsp;</span>
              <span className="font-bold underline">
                Powered by AI
              </span>
            </div>

          </div>
        </section>
        {/* <div className="bg-gradient-to-t absolute bottom-0 h-60 w-full from-[#050505] to-transparent"> */}
        {/* <div className="absolute bottom-0 h-36 w-full" style={{ background: 'linear-gradient(to bottom, rgba(25, 7, 0, 0) 4.07%, #190700 55.92%)' }}> */}
        <div className="absolute bottom-0 h-20 md:h-36 w-full" style={{ background: 'linear-gradient(to bottom, rgba(25, 7, 0, 0) 4.07%, #190700 55.92%)' }}>

        </div>
      </section>

      <ChooseYourMeans />
      <WeMakeItEasy />
      <OfferStrengthAnalyzer />
      <OurClients />
      <Footer />
    </>
  );
}
