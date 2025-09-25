// 'use client'

// import CustomProgressBar from '@/components/customs/custom-ring-progress'
// import Image from 'next/image'
// import Link from 'next/link'
// import React from 'react'

// const navItems = [
//   { name: 'preview', icon: '/assets/icons/preview.svg' },
//   {
//     name: 'edit facts',
//     icon: '/assets/icons/edit.svg',
//   },
//   {
//     name: 'analytics',
//     icon: '/assets/icons/analytics.svg',
//   },
//   {
//     name: 'agreement',
//     icon: '/assets/icons/agreement.svg',
//   },
//   {
//     name: 'add agent',
//     icon: '/assets/icons/addAgent.svg',
//   },
//   {
//     name: 'document',
//     icon: '/assets/icons/documents.png',
//   },
// ]

// const sideNavItems = [
//   { name: 'globe', icon: '/assets/icons/globe.svg' },
//   { name: 'speaker', icon: '/assets/icons/speaker.svg' },
//   { name: 'convert', icon: '/assets/icons/convert.svg' },
//   { name: 'key', icon: '/assets/icons/key.svg' },
// ]

// type IListingProcessProps = {
//   header: string
//   link: string
//   verificationStatus: 'pending' | 'verified' | 'live'
// }

// export function ListingProcess({
//   verificationStatus,
//   header,
//   link,
// }: IListingProcessProps) {
//   let statusText = ''
//   let statusClasses = ''

//   switch (verificationStatus) {
//     case 'pending':
//       statusText = 'Once your property is verified, you can publish.'
//       statusClasses = 'text-yellow-700 bg-yellow-100 border-yellow-500'
//       break
//     case 'verified':
//       statusText = 'Publish live whenever you’re ready.'
//       statusClasses = 'text-black bg-green-100 border-green-500'
//       break
//     case 'live':
//       statusText = 'Your property is Live! Wishing you an easy closing.'
//       statusClasses = 'text-black bg-green-100 border-green-500'
//       break
//     default:
//       statusText = ''
//       statusClasses = 'text-black bg-transparent border-transparent'
//   }

//   return (
//     <section className='h-screen-nav py-6'>
//       <Link href='/' className='flex items-center px-[3.219rem]'>
//         <Image
//           src='/assets/icons/backArrow.svg'
//           alt='go back'
//           objectFit='contain'
//           height={23}
//           width={23}
//         />
//         <p className='text-xl font-medium text-black ml-5'>Back to dashboard</p>
//       </Link>
//       <section className='flex justify-between px-[3.219rem] mt-12'>
//         <section className='w-1/2'>
//           <section className='bg-black rounded-[1.25rem] p-8 overflow-hidden'>
//             <section className='flex items-start overflow-hidden'>
//               <section className='rounded-xl overflow-hidden h-[7rem] w-[7rem]'>
//                 <Image
//                   width={123}
//                   height={123}
//                   objectFit='contain'
//                   src={'/assets/icons/tinyHouseSample.svg'}
//                   alt='name of house'
//                 />
//               </section>
//               <section className='mx-8'>
//                 <h2 className='text-xl font-bold text-white'>
//                   3517 W.Gray St. Utica,
//                 </h2>
//                 <p className='text-xl text-white'>Pennsylvania, 57867</p>
//               </section>
//               <section className=''>
//                 <CustomProgressBar
//                   trackColor='#989898'
//                   indicatorColor='#fff'
//                   size={102}
//                   progress={25}
//                   trackWidth={9}
//                   indicatorWidth={9}
//                   label={
//                     <p className='text-center text-white text-base'>25%</p>
//                   }
//                 />
//               </section>
//             </section>
//             <section className='flex items-center justify-center flex-col w-full'>
//               <section className='flex items-center w-[55%] mb-4 mt-16'>
//                 <section className='w-1/3'>
//                   <Image
//                     src='/assets/images/bed.svg'
//                     alt='Bed'
//                     objectFit='contain'
//                     height={31}
//                     width={24}
//                   />
//                 </section>
//                 <section className='flex items-start pl-5 justify-start w-1/3'>
//                   <Image
//                     src='/assets/images/bath.svg'
//                     alt='Bath'
//                     objectFit='contain'
//                     height={31}
//                     width={24}
//                   />
//                 </section>
//                 <section className='flex items-center justify-center pl-8 w-1/3'>
//                   <Image
//                     src='/assets/images/feet.png'
//                     alt='Size'
//                     objectFit='contain'
//                     height={31}
//                     width={24}
//                   />
//                 </section>
//               </section>
//               <section className='flex items-center'>
//                 <p className='text-xl text-grey-190'>3 bed</p>
//                 <Image
//                   src='/assets/images/ellipse.svg'
//                   alt='Dot'
//                   objectFit='contain'
//                   height={5}
//                   width={5}
//                   className='block mx-8'
//                 />
//                 <p className='text-xl text-grey-190'>2 bath</p>
//                 <Image
//                   src='/assets/images/ellipse.svg'
//                   alt='Dot'
//                   objectFit='contain'
//                   height={5}
//                   width={5}
//                   className='block mx-8'
//                 />
//                 <p className='text-xl text-grey-190'>1.51 sft</p>
//               </section>
//             </section>
//           </section>

//           {/* <section className={`mt-4 p-4 border ${statusClasses}`}>
//             <p className='font-medium text-[2.5rem]'>
//               {statusText || 'No status available'}
//             </p>
//           </section> */}
//           <section className='ml-12 flex items-start pt-12'>
//             <p className='text-medium text-[2.5rem] w-9/12 text-black'>
//               {statusText}
//             </p>
//           </section>
//         </section>

//         <section className='ml-12 flex items-center'>
//           <p className='text-medium text-[2.5rem] w-9/12 text-black'>
//             {header}
//           </p>
//         </section>

//         <nav className='absolute top-36 right-12'>
//           <ul>
//             {sideNavItems.map(({ name, icon }) => {
//               return (
//                 <li
//                   className='h-[4.625rem] w-[4.625rem] rounded-full items-center justify-center flex mb-10 bg-white'
//                   key={name}
//                 >
//                   <Image
//                     width={37}
//                     height={37}
//                     objectFit='contain'
//                     src={icon}
//                     alt={name}
//                   />
//                 </li>
//               )
//             })}
//           </ul>
//         </nav>
//       </section>
//       <nav className='left-0 md:h-[8rem] absolute bottom-0 right-0 w-full bg-ocOrange flex items-center justify-between px-[3.219rem] z-10'>
//         <ul className='flex items-center w-3/5 justify-between'>
//           {navItems.map(({ icon, name }) => {
//             return (
//               <li className='flex flex-col items-center' key={name}>
//                 <Image
//                   width={29}
//                   height={40}
//                   objectFit='contain'
//                   src={icon}
//                   alt={name}
//                 />
//                 <p className='mt-5 text-xl font-medium text-white capitalize'>
//                   {name}
//                 </p>
//               </li>
//             )
//           })}
//         </ul>
//         <button className='md:h-[2.875rem] rounded md:rounded-[1.625rem] bg-[#BFBFBF] text-white flex items-center justify-center px-12'>
//           Go to Transaction
//         </button>
//       </nav>
//     </section>
//   )
// }
