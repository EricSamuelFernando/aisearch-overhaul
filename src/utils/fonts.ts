import localFont from 'next/font/local';

export const satoshi = localFont({
  src: [
    {
      path: '../../public/assets/fonts/satoshi-italics.ttf',
      style: 'italics',
    },
    {
      path: '../../public/assets/fonts/satoshi.ttf',
      style: 'normal',
    },
  ],
  variable: '--font-satoshi',
});
