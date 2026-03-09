// import { PropertyPreview } from '@/components/buy/preview';
// import Footer from '@/components/footer/Footer';

// function Page() {
//   return (
//     <div className='min-h-screen flex flex-col bg-white'>
//       <main className='flex-1 w-full overflow-x-hidden'>
//         <section className='mx-auto w-full max-w-7xl bg-white px-4 pt-4 sm:pt-6 md:px-8 md:pt-8 pb-20 md:pb-24'>
//           <PropertyPreview />
//         </section>
//       </main>
//       <footer className='w-full mt-auto bg-black'>
//         <Footer />
//       </footer>
//     </div>
//   );
// }

// export default Page;


import { PropertyPreview } from '@/components/buy/preview';
import Footer from '@/components/shared/footer';

function Page() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 w-full">
        <section className="mx-auto w-full max-w-7xl px-4 pt-4 sm:pt-6 md:px-8 md:pt-8 pb-20 md:pb-24">
          {/* Prevent child overflow */}
          <div className="w-full min-w-0">
            <PropertyPreview />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Page;
