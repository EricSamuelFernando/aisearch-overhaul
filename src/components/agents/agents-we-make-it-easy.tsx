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
    {
    name: 'ALEX RICHARD',
    title: 'Product Manager, Chicago',
    text: `Snaphomz helps me connect with serious buyers quickly. The interface is clean, and the snap tools make updates and scheduling super efficient. I’ve closed more deals in less time.`,
    img: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  },
];
const AgentsWeMakeItEasy = () => {
  const isMobile = useMediaQuery('(max-width: 1023px)');
   const [embla, setEmbla] = useState<Embla | null>(null);
 
     const [canScrollPrev, setCanScrollPrev] = useState(false);
   const [canScrollNext, setCanScrollNext] = useState(false);
   useEffect(() => {
     if (!embla) return;
 
     setCanScrollPrev(embla.canScrollPrev());
     setCanScrollNext(embla.canScrollNext());
 
     const onSelect = () => {
       setCanScrollPrev(embla.canScrollPrev());
       setCanScrollNext(embla.canScrollNext());
     };
 
     embla.on('select', onSelect);
     embla.on('reInit', onSelect);
     return () => {
       embla.off('select', onSelect);
       embla.off('reInit', onSelect);
     };
   }, [embla]);
   return (
     <section id="testimonials" className="bg-[#FAF0E6] py-20 px-4">
       <div className="max-w-7xl mx-auto text-center">
         <h2 className="text-3xl lg:text-4xl font-semibold mb-2">
           We Make It <span className="font-normal">Easy</span>
         </h2>
         <p className="text-sm text-gray-600 mb-12 max-w-lg mx-auto">
          Tailor your homebuying experience — your way, with the guidance you need.
         </p>
       </div>
       <div className="max-w-7xl mx-auto">
         {isMobile ? (
           <Carousel
             slideSize="100%"
             slideGap="lg"
             align="start"
             loop
             withIndicators={false}
             withControls={false}
             getEmblaApi={setEmbla}
             styles={{
               root: { padding: 0 },
               viewport: { overflow: 'visible' },
             }}
           >
             {testimonials.map(({ name, title, text, img }, idx) => (
               <Carousel.Slide key={idx}>
                 <div className="bg-[#EEDFC9] rounded-2xl p-8 h-full flex flex-col justify-between shadow">
                   <div className="text-left mb-6">
                     <h3 className="font-bold text-sm mb-1">{name}</h3>
                     <p className="text-xs text-gray-700">{title}</p>
                     <p className="text-xs mt-4 text-gray-800 leading-relaxed">{text}</p>
                   </div>
                   <img
                     src={img}
                     alt={`${name} photo`}
                     className="w-14 h-14 rounded-full object-cover self-start"
                   />
                 </div>
               </Carousel.Slide>
             ))}
           </Carousel>
         ) : (
           <div className="grid grid-cols-2 gap-8">
             {testimonials.map(({ name, title, text, img }, idx) => (
               <div
                 key={idx}
                 className="bg-[#EEDFC9] rounded-2xl p-8 flex flex-col justify-between shadow"
               >
                 <div className="text-left mb-6">
                   <h3 className="font-bold text-sm mb-1">{name}</h3>
                   <p className="text-xs text-gray-700">{title}</p>
                   <p className="text-xs mt-4 text-gray-800 leading-relaxed">{text}</p>
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
         <div className="flex justify-end mt-8">
           {/* Left Arrow */}
                <button
             onClick={() => embla?.scrollPrev()}
             disabled={!canScrollPrev}
             className={`
               ${canScrollPrev ? 'bg-[#F5EDE2] hover:bg-[#E0D8C7]' : 'bg-gray-200 cursor-not-allowed'}
               px-4 py-2 rounded-full shadow
             `}
           >
             <IconChevronLeft size={20} />
           </button>
 
           <button
             onClick={() => embla?.scrollNext()}
             disabled={!canScrollNext}
             className={`
               ${canScrollNext ? 'bg-[#F5EDE2] hover:bg-[#E0D8C7]' : 'bg-gray-200 cursor-not-allowed'}
               px-4 py-2 rounded-full shadow ml-4
             `}
           >
             <IconChevronRight size={20} />
           </button>
         </div>
       </div>
     </section>
   );
};

export default AgentsWeMakeItEasy;
