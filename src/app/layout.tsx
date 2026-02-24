
// import { Metadata } from 'next';
// import Script from 'next/script';
// import NextTopLoader from 'nextjs-toploader';
// import 'regenerator-runtime/runtime';

// import { satoshi } from '../utils/fonts';
// import { Providers } from './providers';
// import { useEffect } from 'react';

// export const metadata: Metadata = {
//   title: 'Snaphomz',
//   description: 'Home | Snap Homz',
// };

// export default async function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {

//   return (
//     <html lang='en' className={satoshi.variable} suppressHydrationWarning>
//       <head>
//         <meta
//           name='viewport'
//           content='minimum-scale=1, maximum-scale=1, initial-scale=1, width=device-width, user-scalable=no'
//         />
//         <Script src='https://widget.cloudinary.com/v2.0/global/all.js' />
//         <script
//           src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
//           async
//           defer
//         ></script>

//       </head>
//       <body
//         suppressHydrationWarning={true}
//         style={satoshi.style}
//         className='font-satoshi min-h-screen min-w-full scroll-smooth '
//       >
//         <NextTopLoader
//           color='#F07639'
//           showSpinner={false}
//           showForHashAnchor={false}
//         />
//         <Providers>{children}</Providers>
//       </body>
//     </html>
//   );
// }
// src/app/layout.tsx
// src/app/layout.tsx
import Script from 'next/script';
import { metadata as md } from './metadata';
import { satoshi } from '../utils/fonts';
import { ClientRoot } from '../components/ClientRoot';

export const metadata = {
  title: md.title,
  description: md.description,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="h-full overflow-auto"
      suppressHydrationWarning
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* these can live in a server component */}
        <Script src="https://widget.cloudinary.com/v2.0/global/all.js" />
        <script
          key="google-maps"
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_MAP_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places,geometry,drawing`}
          async
          defer
        />
      </head>

      <body
        style={satoshi.style}
        className="h-full flex flex-col font-satoshi scroll-smooth overflow-auto"
      >
        <ClientRoot>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </ClientRoot>
      </body>
    </html>
  );
}
