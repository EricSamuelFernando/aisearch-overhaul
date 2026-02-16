'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Play, ChevronRight } from 'lucide-react'
import MainNavPages from '@/components/navbars/main-nav-pages'
import LoginRegisterModal from '@/components/modals/login-register-modal'

const tabContent = {
  buy: {
    heading: 'Choose how you want to begin ',
    subheading: 'Start the way that fits you best: bring your own agent',
    subheading2: ' match with a local expert, or use guided tools inside Snaphomz',
    image: '/assets/images/home/01.png',
    steps: [
      {
        title: "Let's get acquainted",
        desc: `Create your profile on Snaphomz and set your budget, locations, and must-haves. Use AI-powered search to increase your chances of finding the right home`,
      },
      {
        title: "Let's get financially ready",
        desc: `Upload or process your pre-approval documents in one place.  
Connect securely with Plaid to explore mortgage options  
and get quick insights with AI summaries`,
      }
      ,
      {

        title: "Let's bring your agent on board",
        desc: `Work with your agent inside Snaphomz to manage agreements  
and track every interaction. Use built-in messaging and  
AI summaries to keep each decision clear`,
      },
      {
        title: "Let's seal the deal",
        desc: `Draft and review offers with confidence and track title  
and escrow activity digitally in Snaphomz. Stay informed  
at every step with simple AI summaries`,
      },
    ],
  },
  sell: {
    heading: 'Sell your home',
    subheading: 'Choose one of three possible ways',
    subheading2: 'to introduce lorem to your home',
    image: '/assets/images/home/sell-02.png',
    steps: [
      {
        title: 'Claim your property',
        desc: `Set up dashboard by claiming properties you own. Manage details, store documents securely and get AI insights to stay informed on market timing and rates.`,
      },
      {
        title: 'Get your listing ready',
        desc: `List your property on SnapHomz or publish it to MLS.
Maximize your sale price, with our AI-generated descriptions, disclosures, and market insights.`,
      },
      {
        title: "Let's bring your agent onboard",
        desc: `Collaborate with an agent, share documents, track communication, and use AI summaries for clear property insights on SnapHomz.`,
      },
      {
        title: 'Review offers and close the deal',
        desc: `Compare offers with ease using SnapHomz's list or grid view and AI offer strength meter. Send counteroffers, track contingencies, and monitor the closing process. `,
      },
    ],
  },
  agent: {
    heading: 'Become a Snaphomz agent',
    subheading: 'Choose one of three possible ways',
    subheading2: 'to introduce lorem to your home',
    image: '/assets/images/home/agents-01.png',
    steps: [
      {
        title: 'Private agents',
        desc: `Smart Match Quiz: Take our quick preference quiz
Your Wish List: Tell us your must-haves and nice-to-haves
Budget Blueprint: Set your comfortable price range`,
      },
      {
        title: 'Partner agents',
        desc: `Smart Suggestions: Browse personalized home listings
Virtual Tours: Explore homes from your couch
Quick Filters: Save time with intelligent search features`,
      },
    ],
  },
} as const

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState<keyof typeof tabContent>('buy')
  const [activeIndex, setActiveIndex] = useState(0)

  const handleStepChange = (index: number) => {
    setActiveIndex(index)
  }

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash === 'buy' || hash === 'sell' || hash === 'agent') {
      setActiveTab(hash)
    }
  }, [])

  useEffect(() => {
    setActiveIndex(0)
  }, [activeTab])

  const content = tabContent[activeTab]

  return (
    <>
      {/* "€"€"€"€"€ Video Hero "€"€"€"€"€ */}

      {/* Fixed Navbar */}
      <div className="fixed w-full z-50 top-0 left-0 bg-black">
        <MainNavPages />
      </div>
      {/* "€"€"€"€"€ Sub-Nav + Headline "€"€"€"€"€ */}
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
              Here's How it Works
            </h2>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              Your next move should feel simple, not stressful. Snaphomz takes the hard parts of buying or selling and makes them clear and manageable, so “home sweet home” actually feels that way
            </p>
            <hr />
          </div>
        </div>
        <div className="bg-gradient-to-r from-[#231E1E] via-[#a5a5a4] to-[#231E1E] py-10">
          <ul className="max-w-6xl mx-auto flex justify-between space-x-8 px-4">
            <li>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('buy')
                  window.history.replaceState(null, '', '#buy')
                }}
                className={`${activeTab === 'buy' ? 'text-orange-500' : 'text-white'} font-medium hover:text-orange-400`}
              >
                Buy your dream home
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('sell')
                  window.history.replaceState(null, '', '#sell')
                }}
                className={`${activeTab === 'sell' ? 'text-orange-500' : 'text-white'} font-medium hover:text-orange-400`}
              >
                Sell your home
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('agent')
                  window.history.replaceState(null, '', '#agent')
                }}
                className={`${activeTab === 'agent' ? 'text-orange-500' : 'text-white'} font-medium hover:text-orange-400`}
              >
                Become a Snaphomz agent
              </button>
            </li>
          </ul>
        </div>
        <div className="max-w-6xl mx-auto flex h-[320px] flex-col-reverse items-center gap-8 px-4 md:flex-row">
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h1 className="text-4xl font-bold text-black">
              {content.heading}
            </h1>
            <p className="mt-2 text-lg text-gray-500">
              {content.subheading}
              <br />
              {content.subheading2}
            </p>
          </div>
          <div className="w-full md:w-1/2 flex justify-center md:justify-end self-end">
            <Image
              src={content.image}
              alt="Hands holding keys and house"
              width={280}
              height={190}
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
                {content.steps.map((step, i) => {
                  const active = i === activeIndex;
                  return (
                    <li
                      key={i}
                      className="relative cursor-pointer"
                      onClick={() => handleStepChange(i)}
                    >
                      {/* Corrected Circle Indicator */}
                      <span
                        className={`absolute -left-7 top-1 w-4 h-4 rounded-full ${active ? 'bg-orange-500' : 'border-2 border-gray-300 bg-white'
                          }`}
                      />
                      {/* Step Description */}
                      <div
                        className={`rounded-lg p-6 ${active ? 'bg-white' : ''}`}
                      >
                        <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                        <p className="mt-2 text-gray-600 whitespace-pre-line">{step.desc}</p>

                      </div>
                    </li>
                  );
                })}
              </ul>
              {activeTab === 'buy' ? (
                <p className="mt-8 text-gray-700">
                  Ready to Get Started?{' '}
                  <LoginRegisterModal
                    label="Sign up free today"
                    initialStage={1}
                    variant="link"
                    className="p-0 text-orange-500 underline underline-offset-4 hover:text-orange-400"
                    registerDefaults={{ userType: 'buyer', startAt: 'send-code' }}
                  />
                </p>
              ) : null}
              {/* Circle Indicator Row */}
              {/*
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
              */}
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
