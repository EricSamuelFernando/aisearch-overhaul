"use client";
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function BuyerPage() {
    const rotatingRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = rotatingRef.current;
        if (el) {
            el.animate(
                [
                    { transform: 'rotate(0deg)' },
                    { transform: 'rotate(360deg)' },
                ],
                {
                    duration: 60000,
                    iterations: Infinity,
                    easing: 'linear',
                }
            );
        }
    }, []);

    const [activeTab, setActiveTab] = useState('Transaction');


    return (
        <>
            <main className="bg-[#170800] text-white h-screen relative pt-24 -mt-24 overflow-hidden ">
                <section className="flex flex-col  justify-end h-full items-center text-center py-24 px-4">
                    <div className="flex justify-center  items-center w-full overflow-visible">
                        <div ref={rotatingRef} className="absolute top-12 w-[1200px] h-[1200px]">
                            {Array.from({ length: 14 }, (_, i) => (
                                <div
                                    key={i}
                                    className="absolute w-[120px] h-[120px] top-[45%] left-[45%] transform -translate-x-1/2 -translate-y-1/2"
                                    style={{
                                        transform: `rotate(${i * 25}deg) translateX(420px)`,
                                    }}
                                >
                                    <div
                                        className="w-full h-full"
                                        style={{
                                            transform: `rotate(-${i * 25 + 10}deg)`, // slight left tilt
                                        }}
                                    >
                                        <Image
                                            src={`/assets/images/agents/${i + 1}.jpg`}
                                            alt={`agent-${i + 1}`}
                                            width={120}
                                            height={120}
                                            className="rounded-xl object-cover w-full h-full"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <h1 className="text-4xl font-bold mt-8">
                        Buying a home <br /> should be <span className=" font-light italic">This Easy</span>
                    </h1>
                    <p className="mt-4 text-md text-[#CEB28B]">
                        First end-to-end guided real estate platform
                    </p>

                    <div className="mt-6 flex gap-2 w-full bg-white p-2 rounded-md max-w-md">
                        <input placeholder="Describe Your Dream Home" className="flex-1 px-2" />
                        <Button className="bg-orange-500 hover:bg-orange-600">Begin Journey sdf</Button>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                        Conversational search <span className="text-white font-semibold">Powered by AI</span>
                    </p>
                </section>
            </main>
            <section className="bg-[#fef6ee] border border-white text-black py-32 px-6">
                <h2 className="text-3xl font-semibold text-center mb-4">
                    Choose <span className="text-black font-light">Your</span> Means
                </h2>
                <p className="text-center text-gray-600 mb-16">
                    Gain unprecedented control with guided transactions, approval
                </p>
                <div className="grid md:grid-cols-3 gap-24 max-w-5xl mx-auto">
                    <OptionCard image={'/assets/images/agents/agent-1.jpg'} title="Your Agent" desc="Onboard or invite your personal agent" btn="Get Started" />
                    <OptionCard image={'/assets/images/agents/agent-2.jpg'}  title="Our Agent" desc="Choose from our vetted list of agents" btn="Get Started" highlight />
                    <OptionCard image={'/assets/images/agents/agent-3.jpg'}  title="Do It Yourself" desc="We'll guide you in every step" btn="Coming Soon" disabled />
                </div>
            </section>

            {/* We Make It Easy Section */}
            <section className="bg-[#fef6ee] text-black py-16 px-6">
                <h2 className="text-3xl font-semibold text-center mb-2">
                    We <span className="font-bold">Make It</span> Easy
                </h2>
                <p className="text-center text-gray-600 mb-6">
                    Tailor your homebuying experience — your way, with the guidance you need.
                </p>

                <div className="flex justify-center mb-8">
                    {['Transaction', 'Technology', 'Transparency'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-full mx-1 ${activeTab === tab ? 'bg-black text-white' : 'bg-white text-black'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    <FeatureCard
                        icon="🗨️"
                        title="Guided transactions"
                        desc="Gain unprecedented control with guided transactions, approval workflows, task tracking, and comprehensive closing services."
                    />
                    <FeatureCard
                        icon="⏱️"
                        title="Reduced time for task completion"
                        desc="Our platform increases task efficiency by 50%, saving 30% on routine tasks and 80% on complex ones."
                    />
                    <FeatureCard
                        icon="🧰"
                        title="Concierge services"
                        desc="Concierge Services features let you track aspects from interior design to renovation, landscaping to move-in."
                    />
                </div>
            </section>
            <div className='flex flex-col gap-2 py-12 bg-[#fef6ee] w-full flex items-center  '>
            <h2 className="text-3xl  text-center font-semibold">Offer <span className="font-light">Strength</span> Analyzer</h2>
          <p className="text-gray-600 w-96  text-center">
            Gauge the strength of your bid by comparing your offer price against market data and potential competitor offers
          </p>
          </div>
                  {/* Offer Strength Analyzer Section */}
      <section className="bg-[#fef6ee] text-black grid md:grid-cols-2 gap-4  items-center">
        <div className="flex items-center justify-center bg-[#1e0f05] h-full p-24 ">
          <div className="text-3xl font-bold text-white">80%</div>
        </div>
        <div className="space-y-4 p-12">
         
          <input className=' bg-[#F3EAE1] p-4  w-full rounded-lg ' placeholder="Enter your address or MLS#" />
          <div className="flex items-center bg-[#F3EAE1] p-4 py-3 rounded-lg  w-full justify-between">
            <input className='bg-transparent' placeholder="What is your price?" />
            <Button className="bg-black rounded-full text-xs  text-white">Check Strength</Button>
          </div>
        </div>
      </section>

      {/* What Our Clients Say Section */}
      <section className="bg-[#fef6ee] text-black py-16 px-6">
        <h2 className="text-3xl font-semibold text-center mb-2">
          What Our <span className="font-light">Clients</span> Say
        </h2>
        <p className="text-center text-gray-600 mb-10">
          We value our customers authentic opinion on our products.
        </p>

        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          <TestimonialCard
            name="Milton Austin"
            title="Sales Manager, Sanfransico"
            image="/assets/images/agents/4.jpg"
            text="From browsing to signing, everything just flowed. The listings were clear, the agents responsive, and the process — smooth. I found my home faster than I expected."
          />
          <TestimonialCard
            name="Alex Richard"
            title="Product Manager, Chicago"
            image="/assets/images/agents/5.jpg"
            text="Snaphomz helps me connect with serious buyers quickly. The interface is clean, and the snap tools make updates and scheduling super efficient. I’ve closed more deals in less time."
          />
        </div>
      </section>

        </>
    );
}


function OptionCard({ image, title, desc, btn, highlight = false, disabled = false }:any) {
    return (
      <div className={`relative h-72 overflow-hidden rounded-3xl text-white ${highlight ? 'bg-orange-100' : 'bg-gray-100'} ${disabled ? 'opacity-50' : ''}`}>
        <Image
          src={image}
          alt={title}
          width={500}
          height={300}
          className="object-cover w-full h-full absolute top-0 left-0 z-0"
        />
        <div className="relative flex items-center z-10 p-6 text-center bg-black/40 h-full flex flex-col justify-end">
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="mb-4 text-white text-sm px-4">{desc}</p>
          <Button disabled={disabled} className={` bg-black text-white text-xs rounded-full w-fit hover:opacity-90`}>
            {btn}
          </Button>
        </div>
      </div>
    );
  }

function FeatureCard({ icon, title, desc }: any) {
    return (
        <div className="p-6 bg-[#f8e8d8] rounded-2xl text-center">
            <div className="text-4xl mb-4">{icon}</div>
            <h4 className="font-bold text-lg mb-2">{title}</h4>
            <p className="text-gray-700 text-sm">{desc}</p>
        </div>
    );
}

type TestimonialCardProps = {
  name: string;
  title: string;
  image: string;
  text: string;
};

function TestimonialCard({ name, title, image, text }: TestimonialCardProps) {
    return (
      <div className="bg-[#f8e8d8] p-12 rounded-2xl relative">
        <div className='mb-8'>
            <p className="font-bold text-sm">{name.toUpperCase()}</p>
            <p className="text-xs text-gray-600">{title}</p>
          </div>
        <p className="mb-4 text-sm text-gray-800">{text}</p>
        <div className="flex items-center gap-4 mt-6">
          <Image src={image} alt={name} width={40} height={60} className="rounded-full object-cover" />
          
        </div>
      </div>
    );
  }