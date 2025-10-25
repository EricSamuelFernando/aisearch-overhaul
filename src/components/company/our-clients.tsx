// 'use client';

// import { Carousel } from '@mantine/carousel';
// import { useMediaQuery } from '@mantine/hooks';

// const testimonials = [
//   {
//     name: 'MILTON AUSTIN',
//     title: 'Sales Manager, Sanfransisco',
//     text: `From browsing to signing, everything just flowed. The listings were clear, the agents responsive, and the process — smooth. I found my home faster than I expected.`,
//     img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
//   },
//   {
//     name: 'ALEX RICHARD',
//     title: 'Product Manager, Chicago',
//     text: `Snaphomz helps me connect with serious buyers quickly. The interface is clean, and the snap tools make updates and scheduling super efficient. I’ve closed more deals in less time.`,
//     img: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
//   },
  
// ];

// const OurClients = () => {
//   const mobile = useMediaQuery('(max-width: 768px)');

//   return (
//     <section className="bg-[#FAF0E6] py-20 px-4 max-w-7xl mx-auto text-center">
//       <h2 className="text-3xl font-semibold mb-2">
//         What Our <span className="font-normal">Clients</span> Say
//       </h2>
//       <p className="text-sm text-gray-600 mb-12 max-w-xl mx-auto">
//         We value our customers' authentic opinion on our products.
//       </p>

//       <Carousel
//         withIndicators
//         align="center"
//         slideGap="md"
//         loop
//         slideSize={mobile ? '100%' : '50%'}
//         styles={{
//           control: {
//             backgroundColor: 'transparent',
//             border: 'none',
//             '&[data-inactive]': {
//               opacity: 0.3,
//               cursor: 'default',
//             },
//           },
//           indicator: {
//             width: 10,
//             height: 10,
//             backgroundColor: '#c7b49b',
//             transition: 'background-color 0.3s ease',
//             '&[data-active]': {
//               backgroundColor: '#5a4a32',
//             },
//           },
//         }}
//       >
//         {testimonials.map(({ name, title, text, img }, index) => (
//           <Carousel.Slide key={index}>
//             <div className="max-w-[600px] mx-auto bg-[#EEDFC9] rounded-2xl p-8 h-full flex flex-col justify-between shadow">
//               <div className="text-left mb-6">
//                 <h3 className="font-bold text-sm mb-1">{name}</h3>
//                 <p className="text-xs text-gray-700">{title}</p>
//                 <p className="text-xs mt-4 text-gray-800 leading-relaxed">{text}</p>
//               </div>
//               <img
//                 src={img}
//                 alt={`${name} photo`}
//                 className="w-14 h-14 rounded-full object-cover self-start mt-auto"
//               />
//             </div>
//           </Carousel.Slide>
//         ))}
//       </Carousel>
//     </section>
//   );
// };
// OurClients.tsx
// OurClients.tsx

// OurClients.tsx

// OurClients.tsx



// 'use client';

// import { useState, useEffect } from 'react';
// import { Carousel, Embla } from '@mantine/carousel';
// import { useMediaQuery } from '@mantine/hooks';
// import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

// const testimonials = [
//   {
//     name: 'MILTON AUSTIN',
//     title: 'Sales Manager, San Francisco',
//     text: `From browsing to signing, everything just flowed. The listings were clear, the agents responsive, and the process — smooth. I found my home faster than I expected.`,
//     img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
//   },
//   {
//     name: 'ALEX RICHARD',
//     title: 'Product Manager, Chicago',
//     text: `Snaphomz helps me connect with serious buyers quickly. The interface is clean, and the snap tools make updates and scheduling super efficient. I’ve closed more deals in less time.`,
//     img: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
//   },
// ];

// export default function OurClients() {
//   const isMobile = useMediaQuery('(max-width: 1023px)');
//   const [embla, setEmbla] = useState<Embla | null>(null);

//     const [canScrollPrev, setCanScrollPrev] = useState(false);
//   const [canScrollNext, setCanScrollNext] = useState(false);
//   useEffect(() => {
//     if (!embla) return;

//     setCanScrollPrev(embla.canScrollPrev());
//     setCanScrollNext(embla.canScrollNext());

//     const onSelect = () => {
//       setCanScrollPrev(embla.canScrollPrev());
//       setCanScrollNext(embla.canScrollNext());
//     };

//     embla.on('select', onSelect);
//     embla.on('reInit', onSelect);
//     return () => {
//       embla.off('select', onSelect);
//       embla.off('reInit', onSelect);
//     };
//   }, [embla]);
//   return (
//     <section id="testimonials" className="bg-[#FAF0E6] pt-32 pb-10 px-12">
//       <div className="max-w-6xl mx-auto text-center pb-12 ">
//         <h2 className="text-3xl lg:text-4xl font-medium ">
//           What Our Clients <span className="font-normal">Say</span>
//         </h2>
//         <p className="text-sm text-gray-600 mb-12 max-w-lg mx-auto">
//           We value our customers' authentic opinion on our products.
//         </p>
//       </div>
//       <div className="max-w-7xl mx-auto">
//         {isMobile ? (
//           <Carousel
//             slideSize="100%"
//             slideGap="lg"
//             align="start"
//             loop
//             withIndicators={false}
//             withControls={false}
//             getEmblaApi={setEmbla}
//             styles={{
//               root: { padding: 0 },
//               viewport: { overflow: 'visible' },
//             }}
//           >
//             {testimonials.map(({ name, title, text, img }, idx) => (
//               <Carousel.Slide key={idx}>
//                 <div className="bg-[#EEDFC9] rounded-2xl p-32 h-full flex flex-col justify-between shadow">
//                   <div className="text-left mb-6">
//                     <h3 className="font-bold text-sm mb-1">{name}</h3>
//                     <p className="text-xs text-gray-700">{title}</p>
//                     <p className="text-xs mt-4 text-gray-800 leading-relaxed">{text}</p>
//                   </div>
//                   <img
//                     src={img}
//                     alt={`${name} photo`}
//                     className="w-14 h-14 rounded-full object-cover self-start"
//                   />
//                 </div>
//               </Carousel.Slide>
//             ))}
//           </Carousel>
//         ) : (
//           <div className="grid grid-cols-2 gap-12 px-12">
//             {testimonials.map(({ name, title, text, img }, idx) => (
//               <div
//                 key={idx}
//                 className="bg-[#EEDFC9] rounded-2xl p-16 flex flex-col justify-between "
//               >
//                 <div className="text-left mb-6">
//                   <h3 className="font-bold text-xl mb-1">{name}</h3>
//                   <p className="text-md text-gray-700">{title}</p>
//                   <p className="text-md mt-4 text-gray-800 leading-relaxed">{text}</p>
//                 </div>
//                 <img
//                   src={img}
//                   alt={`${name} photo`}
//                   className="w-14 h-14 rounded-full object-cover self-start"
//                 />
//               </div>
//             ))}
//           </div>
//         )}
//         <div className="flex justify-end mt-8">
//           {/* Left Arrow */}
//                <button
//             onClick={() => embla?.scrollPrev()}
//             disabled={!canScrollPrev}
//             className={`
//               ${canScrollPrev ? 'bg-[#F5EBDF] hover:bg-[#E0D8C7]' : 'bg-[#F5EBDF] cursor-not-allowed'}
//               px-4 py-2 rounded-full 
//             `}
//           >
//             <IconChevronLeft size={20} />
//           </button>

//           <button
//             onClick={() => embla?.scrollNext()}
//             disabled={!canScrollNext}
//             className={`
//               ${canScrollNext ? 'bg-[#F5EBDF] hover:bg-[#E0D8C7]' : 'bg-[#F5EBDF] cursor-not-allowed'}
//               px-4 py-2 rounded-full  ml-4
//             `}
//           >
//             <IconChevronRight size={20} />
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// }


'use client';

import { useState, useEffect } from 'react';
import { Carousel, Embla } from '@mantine/carousel';
import { useMediaQuery } from '@mantine/hooks';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';

const testimonials = [
  {
    name: 'MILTON AUSTIN',
    title: 'Sales Manager, San Francisco',
    text: `From browsing to signing, everything just flowed. The listings were clear, the agents responsive, and the process — smooth. I found my home faster than I expected.`,
    img: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
  {
    name: 'ALEX RICHARD',
    title: 'Product Manager, Chicago',
    text: `Snaphomz helps me connect with serious buyers quickly. The interface is clean, and the snap tools make updates and scheduling super efficient. I’ve closed more deals in less time.`,
    img: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
];

export default function OurClients() {
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const [embla, setEmbla] = useState<Embla | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!embla) return;

    const updateButtons = () => {
      setCanScrollPrev(embla.canScrollPrev());
      setCanScrollNext(embla.canScrollNext());
    };

    updateButtons();
    embla.on('select', updateButtons);
    embla.on('reInit', updateButtons);

    return () => {
      embla.off('select', updateButtons);
      embla.off('reInit', updateButtons);
    };
  }, [embla]);

  return (
    <section id="testimonials" className="bg-[#FAF0E6] pt-24 pb-12 px-4 md:px-12">
      <div className="max-w-6xl mx-auto text-center pb-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium">
          What Our Clients <span className="font-normal">Say</span>
        </h2>
        <p className="text-sm text-gray-600 mb-8 max-w-lg mx-auto">
          We value our customers' authentic opinion on our products.
        </p>
      </div>

      <div className="max-w-7xl mx-auto">
        {isMobile ? (
          // ✅ Responsive MOBILE carousel
          <Carousel
          slideSize="90%"
  slideGap="sm"
  align="center"
  loop
  withIndicators={false}
  withControls={false}
  getEmblaApi={setEmbla}
  styles={{
    root: { padding: 0 },
    viewport: { overflow: 'hidden' },
  }}
  //@ts-ignore
  breakpoints={[
    { maxWidth: 'sm', slideSize: '90%', slideGap: 'xs' },
    { maxWidth: 'md', slideSize: '45%' },
  ]}
          >
            {testimonials.map(({ name, title, text, img }, idx) => (
              <Carousel.Slide key={idx}>
                <div className="bg-[#EEDFC9] rounded-2xl p-5 sm:p-6 md:p-8 flex flex-col justify-between shadow-md w-full min-h-[300px]">
                  <div className="text-left mb-4">
                    <h3 className="font-bold text-base sm:text-lg mb-1">{name}</h3>
                    <p className="text-xs sm:text-sm text-gray-700">{title}</p>
                    <p className="text-sm sm:text-base mt-3 text-gray-800 leading-relaxed">
                      {text}
                    </p>
                  </div>
                  <img
                    src={img}
                    alt={`${name} photo`}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover self-start"
                  />
                </div>
              </Carousel.Slide>
            ))}
          </Carousel>
        ) : (
          // ✅ DESKTOP — unchanged
          <div className="grid grid-cols-2 gap-12 px-12">
            {testimonials.map(({ name, title, text, img }, idx) => (
              <div
                key={idx}
                className="bg-[#EEDFC9] rounded-2xl p-16 flex flex-col justify-between"
              >
                <div className="text-left mb-6">
                  <h3 className="font-bold text-xl mb-1">{name}</h3>
                  <p className="text-md text-gray-700">{title}</p>
                  <p className="text-md mt-4 text-gray-800 leading-relaxed">{text}</p>
                </div>
                <img
                  src={img}
                  alt={`${name} photo`}
                  className="w-14 h-14 rounded-full object-cover self-start"
                />
              </div>
            ))}
          </div>
        )}

        {/* ✅ Navigation Buttons (work for mobile + desktop) */}
        <div className="flex justify-center md:justify-end mt-8 px-2 md:px-12">
          <button
            onClick={() => embla?.scrollPrev()}
            disabled={!canScrollPrev}
            className={`${
              canScrollPrev
                ? 'bg-[#F5EBDF] hover:bg-[#E0D8C7]'
                : 'bg-[#F5EBDF] opacity-60 cursor-not-allowed'
            } px-4 py-2 rounded-full`}
          >
            <IconChevronLeft size={20} />
          </button>

          <button
            onClick={() => embla?.scrollNext()}
            disabled={!canScrollNext}
            className={`${
              canScrollNext
                ? 'bg-[#F5EBDF] hover:bg-[#E0D8C7]'
                : 'bg-[#F5EBDF] opacity-60 cursor-not-allowed'
            } px-4 py-2 rounded-full ml-3`}
          >
            <IconChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
