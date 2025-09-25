// 'use client';

// import React, { useEffect, useState } from 'react';
// import { usePathname, useSearchParams } from 'next/navigation';

// import MainNav from '@/components/navbars/main-nav';
// import Footer from '@/components/shared/footer';
// import { useTokenLoginMutation } from '@/hooks/api/auth/useUserAuthApi';

// type Props = {
//   children: React.ReactNode;
// };

// function MainLayout({ children }: Readonly<Props>) {
//   const pathname = usePathname();
//   const searchParams = useSearchParams()
//   const { mutate: loginWithToken } = useTokenLoginMutation();
//   const [location, setLocation] = useState({
//     latitude:0,
//     longitude:0
//   });

//   useEffect(() => {
//     const token = searchParams.get('token');
//     if (token) {
//       loginWithToken();
//     }
//   }, []);
 
// // useEffect(() => {
// //   if('geolocation' in navigator) {
// //     // Retrieve latitude & longitude coordinates from `navigator.geolocation` Web API
// //     navigator.geolocation.getCurrentPosition(({ coords }) => {
// //         const { latitude, longitude } = coords;
// //         console.log(coords)
// //         setLocation({ latitude, longitude });
// //     })
// // }
// // },[])
// // console.log(location)
//   return (
//     <>
//       <MainNav />
//       <main>{children}</main>
//       {typeof pathname === 'string' &&
//       ['browse', 'preview'].some((path) => pathname.includes(path)) ? null : (
//         <Footer />
//       )}
//     </>
//   );
// }

// export { MainLayout };


'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

import MainNav from '@/components/navbars/main-nav';
import Footer from '@/components/shared/footer';
import { useTokenLoginMutation } from '@/hooks/api/auth/useUserAuthApi';

type Props = {
  children: React.ReactNode;
};

function MainLayout({ children }: Readonly<Props>) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { mutate: loginWithToken } = useTokenLoginMutation();
  const [location, setLocation] = useState({
    latitude: 0,
    longitude: 0,
  });

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      loginWithToken();
    }
  }, []);

  // Optionally, you can add geolocation code if required
  // useEffect(() => {
  //   if('geolocation' in navigator) {
  //     navigator.geolocation.getCurrentPosition(({ coords }) => {
  //       const { latitude, longitude } = coords;
  //       setLocation({ latitude, longitude });
  //     });
  //   }
  // }, []);

  // Check if the pathname includes any routes where you want to hide the header and footer
  const shouldHideHeaderFooter = ['sell', 'agents', 'company', 'home'].some(path => pathname.includes(path));

  return (
    <>
      {/* Conditionally render MainNav (Header) based on the route */}
      {!shouldHideHeaderFooter && <MainNav />}

      <main>{children}</main>

      {/* Conditionally render Footer based on the route */}
      {typeof pathname === 'string' &&
      ['browse', 'preview'].some((path) => pathname.includes(path)) ? null : (
        <Footer />
      )}
    </>
  );
}

export { MainLayout };
