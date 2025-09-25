'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import MainNavPages from '../navbars/main-nav-pages';

export default function HeroLayout({ className = '' }) {
  return (
    <>
      {/* Fixed Navbar */}
      <div className="fixed w-full z-50 top-0 left-0">
        <MainNavPages />
      </div>

      <div className="text-black min-h-screen relative pt-28 -mt-28 overflow-hidden">
        {/* Full-screen hero container */}
        <div className="relative min-h-[100vh] w-full overflow-hidden">
          {/* Background image */}
          <Image
            src="/assets/images/agents-hero.jpg"
            alt="Agents Hero"
            layout="fill"
            objectFit="cover"
            className="z-0"
          />

          {/* Semi-transparent dark overlay (optional, to improve contrast) */}
          <div className="absolute inset-0 bg-black/50 z-10" />

          {/* Content overlaid on top of the image */}
          <div className="absolute inset-0 flex flex-col items-center px-4 sm:px-6 md:px-12 lg:px-20 z-20">
  {/* Spacer to push heading down a bit */}
  <div className="pt-20 md:pt-24 lg:pt-32" />

  {/* 1) Heading */}
  <h1 className="text-center text-3xl sm:text-4xl lg:text-5xl font-semibold text-white drop-shadow-lg">
    Discover Agent Possibilities<br />
    With <span className="italic">Snaphomz</span>
  </h1>

  {/* 2) Black Info Bar */}
  <div className="mt-10 w-full max-w-3xl bg-black rounded-full text-white flex flex-col sm:flex-row items-center justify-between px-6 py-3 shadow-lg">
    {/* Left: small thumbnail + address/location */}
    <div className="flex items-center space-x-4 mb-4 sm:mb-0">
      <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-700">
        <Image
          src="/assets/images/agetn-hero-deop.jpg" // replace with your real thumbnail
          alt="Property Thumbnail"
          width={64}
          height={64}
          objectFit="cover"
        />
      </div>
      <div className="text-left">
        <p className="text-sm font-medium">60 Portersville Rd Atoka,</p>
        <p className="text-xs text-gray-300">Tennessee (TN), 38004</p>
      </div>
    </div>

    {/* Middle: property value */}
    <div className="text-center mb-4 sm:mb-0">
      <p className="text-sm text-gray-300">Property Value</p>
      <p className="text-lg font-semibold">$246,600.829</p>
    </div>

    {/* Right: date of exchange */}
    <div className="text-center">
      <p className="text-sm text-gray-300">Date of Exchange</p>
      <p className="text-lg font-semibold">28 May 2024</p>
    </div>
  </div>

  {/* 3) Frosted-glass Cards (Buyer, Agent, Broker) */}
  <div className="mt-10 w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Card #1 (Buyer) */}
    <div className="relative rounded-2xl overflow-hidden bg-white/40 backdrop-blur-md p-6 flex items-center space-x-4 shadow-lg">
      <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-300">
        <Image
          src="/assets/images/agetn-hero-deop.jpg" // replace with real buyer avatar
          alt="Racheal Wyatt"
          width={48}
          height={48}
          objectFit="cover"
        />
      </div>
      <div>
        <p className="font-semibold text-black">Racheal Wyatt</p>
        <p className="text-sm text-orange-500">Buyer</p>
      </div>
      <div className="ml-auto">
        <button className="text-gray-700 hover:text-gray-900">
          {/* Envelope icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M16 12h2a2 2 0 0 1 2 2v6H4v-6a2 2 0 0 1 2-2h2m4-4v4m0 0L8 13m4 3l4-3m-4-9a4 4 0 0 1 4 4v1H8V6a4 4 0 0 1 4-4z" />
          </svg>
        </button>
      </div>
    </div>

    {/* Card #2 (Agent) */}
    <div className="relative rounded-2xl overflow-hidden bg-white/40 backdrop-blur-md p-6 flex items-center space-x-4 shadow-lg">
      <div className="w-12 h-12 rounded-full bg-blue-200 flex items-center justify-center">
        <span className="font-semibold text-blue-800">JS</span>
      </div>
      <div>
        <p className="font-semibold text-black">John Smith</p>
        <p className="text-sm text-orange-500">Agent</p>
      </div>
    </div>

    {/* Card #3 (Broker) */}
    <div className="relative rounded-2xl overflow-hidden bg-white/40 backdrop-blur-md p-6 flex items-center space-x-4 shadow-lg">
      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
        <span className="font-semibold text-gray-800">KW</span>
      </div>
      <div>
        <p className="font-semibold text-black">Kevin Winston</p>
        <p className="text-sm text-orange-500">Broker</p>
      </div>
    </div>
  </div>
</div>

        </div>
      </div>
    </>
  );
}
