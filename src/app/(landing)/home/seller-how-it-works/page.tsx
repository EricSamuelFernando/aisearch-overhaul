'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Play, ChevronRight } from 'lucide-react'
import MainNavPages from '@/components/navbars/main-nav-pages'


const steps = [
  {
    title: "Claim your property",
    desc: `Set up dashboard by claiming properties you own. Manage details, store documents securely and get AI insights to stay informed on market timing and rates.`,
  },
  {
    title: "Get your listing ready",
    desc: `List your property on SnapHomz or publish it to MLS.
Maximize your sale price, with our AI-generated descriptions, disclosures, and market insights.`,
  },
  {
    title: "Let’s bring your agent onboard",
    desc: `Collaborate with an agent, share documents, track communication, and use AI summaries for clear property insights on SnapHomz.`,
  },
  {
    title: "Review offers and close the deal",
    desc: `Compare offers with ease using SnapHomz’s list or grid view and AI offer strength meter. Send counteroffers, track contingencies, and monitor the closing process. `,
  },
]


export default function HowItWorksPage() {
  const [activeIndex, setActiveIndex] = useState(0)

  const handleStepChange = (index: number) => {
    setActiveIndex(index)
  }

  return (
    <>
      <div className="fixed w-full z-50 top-0 left-0 bg-black">
        <MainNavPages />
      </div>
      <div className='pt-16'>
        <div className="relative bg-gradient-to-r from-white to-orange-200 py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="relative bg-gray-200 rounded-lg overflow-hidden h-0 pb-[40%]">
              <button
                aria-label="Play video"
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="bg-white bg-opacity-75 p-3 rounded-full">
                  {/* <Play className="w-6 h-6 text-orange-500" /> */}
                                      <iframe
        width="100%"
        height="100%"
        className="absolute inset-0 w-full h-full object-cover rounded-lg"
        src="https://www.youtube.com/embed/wxnCua71Bpc?si=F1eRw19_WSuh1Rn4"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
                </div>
              </button>
            </div>
            <h2 className="mt-8 text-5xl font-bold text-black">
              Here’s How it Works
            </h2>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              Your home’s about to skip a width. Whether it’s finding or farewell,
              Snaphomz turns the complex into compelling, because home sweet home
              should actually be sweet.
            </p>
            <hr />
          </div>
        </div>
        <div className="bg-gradient-to-r from-[#231E1E] via-[#a5a5a4] to-[#231E1E] py-10">
          <ul className="max-w-6xl mx-auto flex justify-between space-x-8 px-4">
            <li>
              <a
                href="#buy"
                className="text-orange-500 font-medium hover:text-orange-400"
              >
                Buy your dream home
              </a>
            </li>
            <li>
              <a
                href="#sell"
                className="text-white font-medium hover:text-gray-300"
              >
                Sell your home
              </a>
            </li>
            <li>
              <a
                href="#agent"
                className="text-white font-medium hover:text-gray-300"
              >
                Become a Snaphomz agent
              </a>
            </li>
          </ul>
        </div>
        <div className="max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center gap-8 px-4">
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl font-bold text-black">
              Sell your home
            </h1>
            <p className="mt-2 text-lg text-gray-500">
              Choose one of three possible ways
              <br />
              to introduce lorem to your home
            </p>
          </div>
          <div className="w-full md:w-1/2 flex justify-center md:justify-end">
            <Image
              src="/assets/images/home/sell-02.png"
              alt="Hands holding keys and house"
              width={240}
              height={160}
              priority
            />
          </div>
        </div>
        <div className="bg-[#FAF9F5] px-4 py-14">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            {/* Left side: Steps List */}
            <div className="relative pl-8">
              {/* Vertical Line */}
              <div className="absolute top-0 bottom-0 left-3 w-[2px] bg-gray-200" />
              <ul className="space-y-12">
                {steps.map((step, i) => {
                  const active = i === activeIndex;
                  return (
                        <li key={i} className="relative">
                      {/* Corrected Circle Indicator */}
                      <span
                        onClick={() => handleStepChange(i)}
                        className={`absolute -left-7 top-1 w-4 h-4 rounded-full cursor-pointer ${
                          active ? 'bg-orange-500' : 'border-2 border-gray-300 bg-white'
                        }`}
                      />
                      {/* Step Description */}
                      <div
                        className={`rounded-lg p-6 ${active ? 'bg-white' : ''}`}
                      >
                        <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                        <p className="mt-2 text-gray-600 whitespace-pre-line">{step.desc}</p>
                        {active && (
                          <div className="mt-4 flex justify-end items-center w-full">
                            {/* "Learn more" text aligned to the right */}
                            <span className="text-orange-500 font-medium mr-2">Learn more</span>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
              {/* Circle Indicator Row */}
              <div className="mt-12 flex justify-center md:justify-start space-x-2">
               {steps.map((_, i) => (
                  <span
                    key={i}
                    onClick={() => handleStepChange(i)}
                    className={`block w-2 h-2 rounded-full cursor-pointer ${
                      i === activeIndex ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Right side: Images */}
            <div className="flex justify-center">
              <div className="bg-white rounded-lg h-64 md:h-auto md:aspect-video">
                <Image
                  src="/assets/images/home/03.png"
                  alt="Step screenshot"
                  width={640}
                  height={160}
                  priority
                />
                <Image
                  src="/assets/images/home/02.png"
                  alt="Step screenshot"
                  width={640}
                  height={160}
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  )
}
