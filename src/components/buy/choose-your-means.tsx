// 'use client';
// import Link from "next/link";

// const ChooseYourMeans = () => {
//   return (
//        <section className="bg-[#FAF0E6] pt-32 px-12 sm:px-16 text-center">
//       {/* Choose Your Means Section */}
//       <div className="max-w-6xl mx-auto text-center">
//         <h2 className="text-3xl sm:text-4xl font-medium ">
//           Choose Your <span className="font-normal">Means</span>
//         </h2>
//         <p className="text-xs sm:text-sm text-gray-600 mb-20 max-w-[600px] mx-auto">
//           Gain unprecedented control with guided transactions, approval
//         </p>

//         {/* Card Grid Layout */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16 sm:gap-16">
//           {/* Team member 1 */}
//           <div className="rounded-2xl overflow-hidden  relative cursor-pointer">
//             <img
//               src="/assets/images/landing-means.png"
//               alt="Proper Name"
//               className="relative w-full h-full object-cover "
//             />
//             <div className="absolute rounded-2xl bottom-0 left-0 right-0   text-white p-6 text-center">
//                 <p className="font-bold text-md text-center">Your Agent</p>
//                 <p className="text-xs">Onboard or invite your personal agent</p>
//                 <button  onClick={() => window.location.href = "https://preprod.snaphomz.com/agents"}  className="mt-4 px-6 py-2 bg-black text-white text-sm rounded-full transition duration-200">
//                   Get Started
//                 </button>
//               </div>
//           </div>


//           {/* Team member 2 */}
//           <div className="rounded-2xl overflow-hidden  relative group cursor-pointer">
//             <img
//               src="/assets/images/landing-means1.png"
//               alt="Proper Name"
//               className="w-full h-full object-cover"
//             />
//              <div className="absolute bottom-0 left-0 right-0 text-white p-6 text-center">
//                 <p className="font-bold text-md text-center">Your Agent</p>
//                 <p className="text-xs">Choose from our vetted list of agents</p>
//                 <button  onClick={() => window.location.href = "https://preprod.snaphomz.com/agents"} className="mt-4 px-6 py-2 bg-black text-white text-sm rounded-full transition duration-200">
//                   Get Started
//                 </button>
//               </div>
//           </div>

//           {/* Team member 3 */}
//           <div className="rounded-2xl overflow-hidden relative group cursor-pointer">
//             <img
//               src="/assets/images/landing-means2.png"
//               alt="Proper Name"
//               className="w-full h-full object-cover "
//             />
//               <div className="absolute bottom-0 left-0 right-0  text-[#e5e3e357] p-6 text-center">
//                 <p className="font-bold text-md text-center">Do It Yourself</p>
//                 <p className="text-xs ">We’ll guide you in every step</p>
//                 {/* <button  onClick={() => window.location.href = "https://preprod.snaphomz.com/home"} className="mt-4 px-6 py-2 bg-black text-white text-sm rounded-full transition duration-200">
//                   Coming Soon
//                   </button> */}
//                   <button
//   disabled
//   className="mt-4 px-6 py-2 rounded-full text-sm
//              bg-black text-white transition duration-200
//              disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none"
// >
//   Coming Soon
// </button>

//               </div>
//           </div>
//         </div>
//       </div>
//     </section>

//   );
// };

// export { ChooseYourMeans };


'use client';
import Link from 'next/link';

const cards = [
  {
    img: '/assets/images/landing-means.png',
    title: 'Your Agent',
    subtitle: 'Onboard or invite your personal agent',
    href: 'https://preprod.snaphomz.com/agents',
    cta: 'Get Started',
    disabled: false,
  },
  {
    img: '/assets/images/landing-means1.png',
    title: 'Our Agent',
    subtitle: 'Choose from our vetted list of agents',
    href: 'https://preprod.snaphomz.com/agents',
    cta: 'Get Started',
    disabled: false,
  },
  {
    img: '/assets/images/landing-means2.png',
    title: 'Do It Yourself',
    subtitle: 'We’ll guide you in every step',
    href: '#',
    cta: 'Coming Soon',
    disabled: true,
  },
];

const ChooseYourMeans = () => {
  return (
    <section className="bg-[#FAF0E6] pt-32 px-4 sm:px-16 text-center">
      <div className="max-w-6xl mx-auto">
        {/* Heading (same copy, mobile style tightened) */}
        <h2 className="text-[32px] sm:text-4xl font-medium tracking-tight">
          Choose Your <span className="italic font-normal">Means</span>
        </h2>
        <p className="mt-2 text-[13px] sm:text-sm text-gray-600 mb-8 sm:mb-20 max-w-[600px] mx-auto">
          Gain unprecedented control with guided transactions, approval
        </p>

        {/* ---------------- MOBILE: Snap Carousel ---------------- */}
   {/* ---------------- MOBILE: Snap Carousel ---------------- */}
<div className="md:hidden">
  <div
    className="
      relative -mx-4 px-4
      overflow-x-auto
      snap-x snap-mandatory
      flex gap-4
      scrollbar-none
    "
  >
    <div className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-[#FAF0E6] to-transparent" />
    <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-[#FAF0E6] to-transparent" />

    {cards.map((card, i) => (
      <article
        key={i}
        className="
          snap-center shrink-0
          w-[82%] max-w-[420px]
          rounded-[24px] overflow-hidden relative
          aspect-[4/4.7]    /* tall-ish card */
          bg-transparent
        "
      >
        {/* Image fills + slight overscan to kill any sub-pixel edge */}
        <img
          src={card.img}
          alt={card.title}
          className="
            absolute inset-0 h-full w-full object-cover
            rounded-[inherit] scale-[1.02]
            will-change-transform
          "
        />

        {/* Bottom fade, same radius so corners match perfectly */}
        <div className="
          absolute inset-0 rounded-[inherit]
          bg-gradient-to-t from-black/55 via-black/25 to-transparent
          pointer-events-none
        " />

        <div className="absolute bottom-0 left-0 right-0 p-6 text-white text-center">
          <p className="text-[18px] font-semibold">{card.title}</p>
          <p className="mt-1 text-[13px] opacity-90">{card.subtitle}</p>

          {card.disabled ? (
            <button
              disabled
              className="mt-4 inline-flex items-center justify-center rounded-full px-5 py-2 text-sm bg-black/80 text-white opacity-60 cursor-not-allowed"
            >
              {card.cta}
            </button>
          ) : (
            <a
              href={card.href}
              className="mt-4 inline-flex items-center justify-center rounded-full px-5 py-2 text-sm bg-black text-white hover:bg-black/90 transition"
            >
              {card.cta}
            </a>
          )}
        </div>
      </article>
    ))}
  </div>
</div>


        {/* ---------------- DESKTOP: your original grid (unchanged) ---------------- */}
        <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-16 sm:gap-16">
          {/* Card 1 */}
          <div className="rounded-2xl overflow-hidden relative cursor-pointer">
            <img
              src="/assets/images/landing-means.png"
              alt="Your Agent"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 text-white p-6 text-center">
              <p className="font-bold text-md">Your Agent</p>
              <p className="text-xs">Onboard or invite your personal agent</p>
              <button
                onClick={() => (window.location.href = 'https://preprod.snaphomz.com/agents')}
                className="mt-4 px-6 py-2 bg-black text-white text-sm rounded-full transition duration-200"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="rounded-2xl overflow-hidden relative cursor-pointer">
            <img
              src="/assets/images/landing-means1.png"
              alt="Our Agent"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 text-white p-6 text-center">
              <p className="font-bold text-md">Our Agent</p>
              <p className="text-xs">Choose from our vetted list of agents</p>
              <button
                onClick={() => (window.location.href = 'https://preprod.snaphomz.com/agents')}
                className="mt-4 px-6 py-2 bg-black text-white text-sm rounded-full transition duration-200"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="rounded-2xl overflow-hidden relative cursor-pointer">
            <img
              src="/assets/images/landing-means2.png"
              alt="Do It Yourself"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/25 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 text-white p-6 text-center">
              <p className="font-bold text-md">Do It Yourself</p>
              <p className="text-xs">We’ll guide you in every step</p>
              <button
                disabled
                className="mt-4 px-6 py-2 bg-black text-white text-sm rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>
        {/* ------------------------------------------------------- */}
      </div>
    </section>
  );
};

export { ChooseYourMeans };
