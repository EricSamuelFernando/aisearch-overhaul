'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Star, ArrowLeft, ArrowRight, Bed, Bath, Square, Building2, MapPin, DollarSign, Wallet, FileText, Trophy, ShoppingBag } from 'lucide-react';
import MainNavPages from '@/components/navbars/main-nav-pages';
import { Agent } from '@/types/agent.types';

// Helper: Formats 12000 -> 12,000
function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  return value.toLocaleString('en-US');
}

// Formats 502552457 -> $502M
function formatMillions(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  const millions = value / 1_000_000;
  return `$${Math.round(millions)}M`;
}

type LoadStatus = 'loading' | 'loaded' | 'not-found';

export default function AgentProfilePage() {
  const params = useParams();
  const id =
    typeof params?.id === 'string'
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : '';

  const [agent, setAgent] = useState<any | null>(null);
  const [status, setStatus] = useState<LoadStatus>('loading');

  // Tabs State for Properties Section
  const [propertyTab, setPropertyTab] = useState<'sold' | 'active'>('sold');

  const GRAPHQL_URI =
    process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL ||
    'http://localhost:4000/auth/graphql';

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    async function loadAgent() {
      setStatus('loading');
      try {
        const res = await fetch(GRAPHQL_URI, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apollo-require-preflight': 'true',
          },
          body: JSON.stringify({
            query: `
              query ExternalAgentById($id: String!) {
                externalAgentById(id: $id) {
                  id
                  full_name
                  email
                  phone
                  brokerage
                  locationRaw
                  city
                  state
                  primary_service_regions
                  profile_image_url
                  jobTitle
                  licenseNumber
                  languages
                  avgRating
                  avgRatingForCustomerDisplay
                  dealVolume
                  salesVolumeLastYear
                  purchaseVolumeLastYear
                  transactionVolumeLastYear
                  estimated_gci
                  commission_rate
                  homesSoldLastYear
                  homesPurchasedLastYear
                  homeTransactionsLastYear
                  numHomesClosed
                  totalDeals
                  averagePurchasePriceLastYear
                  averageSalePriceLastYear
                  averageTransactionPriceLastYear
                  highestPurchasePriceLastYear
                  highestSalePriceLastYear
                  highestTransactionPriceLastYear
                  highestDealPrice
                  active_listings_count
                  active_listings_json
                  description
                  website
                  profileUrl
                  recommendationsCount
                  socialMediaUrls
                  forSaleCount
                  forSaleMin
                  forSaleMax
                  recentlySoldCount
                  recentlySoldMin
                  recentlySoldMax
                  address
                  office
                }
              }
            `,
            variables: { id },
          }),
          signal: controller.signal,
        });
        if (!res.ok) {
          setAgent(null);
          setStatus('not-found');
          return;
        }
        const json = await res.json();
        const data: Agent | null = json?.data?.externalAgentById || null;
        if (!data) {
          setAgent(null);
          setStatus('not-found');
          return;
        }
        setAgent(data);
        setStatus('loaded');
      } catch (error) {
        if ((error as any).name !== 'AbortError') {
          setAgent(null);
          setStatus('not-found');
        }
      }
    }

    loadAgent();

    return () => controller.abort();
  }, [id]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#F9F3EB] text-black">
        <MainNavPages />
        <div className="pt-32 pb-20 max-w-[1280px] mx-auto px-12">
          <p>Loading agent...</p>
        </div>
      </div>
    );
  }

  if (status === 'not-found' || !agent) {
    return (
      <div className="min-h-screen bg-[#F9F3EB] text-black">
        <MainNavPages />
        <div className="pt-32 pb-20 max-w-[1280px] mx-auto px-12">
          <p>Agent not found.</p>
          <Link href="/agents/search" className="text-blue-600 underline">
            Back to agent list
          </Link>
        </div>
      </div>
    );
  }

  const agentPhone =
    (agent as any).Phone ||
    (agent as any).phone ||
    (agent as any).phone_number ||
    (agent as any).phoneNumber;

  const dealVolume =
    (agent as any).dealVolume ||
    (agent as any)['Deal Volume'] ||
    (agent as any).total_sales_lifetime ||
    0;

  const salesVolumeLast12Months =
    (agent as any).salesVolumeLastYear ??
    (agent as any).sales_last_12_months ??
    0;

  const highestSaleValue =
    (agent as any).highest_sale_value ??
    (agent as any).highestSalePriceLastYear ??
    0;

  const homesSoldLastYear =
    (agent as any).homesSoldLastYear ??
    (agent as any).total_deals_past_year ??
    null;

  const commissionRateRaw =
    (agent as any).commission_rate ??
    (agent as any).CommissionRate ??
    (agent as any).commissionRate ??
    null;

  const commissionRateDisplay =
    commissionRateRaw === null ||
      commissionRateRaw === undefined ||
      commissionRateRaw === ''
      ? 'N/A'
      : String(commissionRateRaw);

  const estimatedGci = (agent as any).estimated_gci ?? null;

  return (
    <div className="min-h-screen bg-[#F9F3EB] text-black font-sans">
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
      <div className="fixed w-full z-50 top-0 left-0">
        <MainNavPages />
      </div>

      <div className="pt-32 pb-32 max-w-[1280px] mx-auto">
        {/* Breadcrumb Container with standard padding */}
        <div className="px-6 md:px-6">
          <div className="text-sm font-medium text-gray-500 mb-8 flex items-center gap-2">
            <Link href="/agents/search" className="hover:text-black transition-colors">
              Agent list
            </Link>
            &gt;
            <span className="text-black font-bold">Agent Profile</span>
          </div>

          {/* Page Title with standard padding */}
          <h1 className="text-[48px] font-bold text-black mb-20">Agent Profile</h1>
        </div>

        <div className="space-y-20 px-6 md:px-6">

          {/* ROW 1: Agent Information */}
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-[200px] shrink-0">
              <h3 className="text-[15px] font-bold text-black pt-2">Agent Information</h3>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row gap-16 items-start">

                {/* Image */}
                <div className="w-[380px] h-[380px] relative shrink-0">
                  <div className="relative w-full h-full rounded-[32px] overflow-hidden bg-gray-200">
                    <Image
                      src={agent.profile_image_url || '/assets/images/agent-hero-drop.jpg'}
                      alt={agent.full_name}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      quality={100}
                      priority
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 w-full pt-4">
                  <div className="mb-10">
                    <h2 className="text-[32px] font-bold text-black mb-1">{agent.full_name}</h2>
                    <p className="text-gray-500 text-lg">{(agent as any).jobTitle || 'Real Estate Agent'}</p>
                  </div>

                  <div className="space-y-5 max-w-xl">
                    <div className="flex justify-between items-center border-b border-gray-300 pb-3">
                      <span className="font-medium text-black">Mobile</span>
                      <span className="text-black">{agentPhone || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-300 pb-3">
                      <span className="font-medium text-black">Email</span>
                      <span className="text-black truncate max-w-[200px]" title={agent.email}>
                        {agent.email || 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-300 pb-3">
                      <span className="font-medium text-black">Ratings</span>
                      <div className="flex items-center gap-1.5">
                        <Star className="w-4 h-4 text-orange-400 fill-orange-400" />
                        <span className="text-black font-bold">
                          {(agent.rating || agent.avgRating) ? (agent.rating || agent.avgRating).toFixed(1) : 'N/A'}
                        </span>
                        <span className="text-gray-400">/50 reviews</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center border-b border-[#E8E3DE] pb-3">
                      <span className="font-medium text-black">Past Year Deals</span>
                      <span className="text-black">{formatNumber(homesSoldLastYear)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3">
                      <span className="font-medium text-black">Commission</span>
                      <span className="text-black">{commissionRateDisplay}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 2: Listings Summary */}
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-[200px] shrink-0">
              <h3 className="text-[15px] font-bold text-black pt-2">Agent Listings Summary</h3>
            </div>
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <SummaryCard
                  icon={<Building2 className="w-6 h-6 text-gray-800" strokeWidth={1.5} />}
                  label="Properties Sold"
                  value={formatNumber(homesSoldLastYear)}
                />
                <SummaryCard
                  icon={<MapPin className="w-6 h-6 text-gray-800" strokeWidth={1.5} />}
                  label="Active Listings"
                  value={formatNumber(agent.active_listings_count)}
                />
                <SummaryCard
                  icon={<DollarSign className="w-6 h-6 text-gray-800" strokeWidth={1.5} />}
                  label="Estimated GCI Lifetime"
                  value={formatMillions(estimatedGci)}
                />
              </div>
            </div>
          </div>

          {/* ROW 3: Performance Overview */}
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-[200px] shrink-0">
              <h3 className="text-[15px] font-bold text-black pt-2">Agent Sales Performance Overview</h3>
            </div>
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <PerformanceCard
                  icon={<Wallet className="w-6 h-6 text-gray-800" strokeWidth={1.5} />}
                  label="Total Sales"
                  value={formatMillions(dealVolume)}
                  badge="Lifetime"
                />
                <PerformanceCard
                  icon={<FileText className="w-6 h-6 text-gray-800" strokeWidth={1.5} />}
                  label="Sales"
                  value={formatMillions(salesVolumeLast12Months)}
                  badge="Last 12 Months"
                />
                <PerformanceCard
                  icon={<Trophy className="w-6 h-6 text-gray-800" strokeWidth={1.5} />}
                  label="Highest Sales"
                  value={formatMillions(highestSaleValue)}
                  badge="Lifetime"
                />
                <PerformanceCard
                  icon={<ShoppingBag className="w-6 h-6 text-gray-800" strokeWidth={1.5} />}
                  label="Cheapest Sales"
                  value="$N/A"
                  badge="Lifetime"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ROW 4: Properties Tabs & Carousel */}
        <div className="mt-20">
          {/* Tabs Container - Flush Left, Full Width */}
          <div className="pt-10 border-t border-[#E8E3DE] px-6 md:px-6">
            <div className="flex gap-8 mb-10 border-b border-gray-200 w-full relative">
              <button
                onClick={() => setPropertyTab('sold')}
                className={`pb-4 text-[18px] font-semibold transition-colors relative ${propertyTab === 'sold' ? 'text-black' : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                Sold Properties
                {propertyTab === 'sold' && (
                  <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#FF7A00] rounded-t-full" />
                )}
              </button>
              <button
                onClick={() => setPropertyTab('active')}
                className={`pb-4 text-[18px] font-semibold transition-colors relative ${propertyTab === 'active' ? 'text-black' : 'text-gray-400 hover:text-gray-600'
                  }`}
              >
                Active For Sale
                {propertyTab === 'active' && (
                  <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#82C91E] rounded-t-full" />
                )}
              </button>
            </div>
          </div>

          {/* New Carousel Structure - Full Width, Standard Padding to align with Titles */}
          <div className="relative w-full">
            <div className="flex">
              <div className="flex-1 min-w-0 overflow-hidden relative">
                <div>
                  {propertyTab === 'sold' ? (
                    <PropertyCarousel
                      items={[...Array(6)].map((_, i) => i)}
                      badge="Sold"
                      badgeColor="bg-[#FF7A00]"
                    />
                  ) : (
                    <PropertyCarousel
                      items={[...Array(4)].map((_, i) => i + 10)}
                      badge="For Sale"
                      badgeColor="bg-[#82C91E]"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-[#EFE3D2] rounded-[24px] p-8 min-h-[180px] flex flex-col justify-between border border-transparent hover:border-gray-200 transition-colors">
      <div>{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
        <p className="text-[28px] font-bold text-black">{value}</p>
      </div>
    </div>
  );
}

function PerformanceCard({ icon, label, value, badge }: { icon: React.ReactNode; label: string; value: string; badge: string }) {
  return (
    <div className="bg-[#EFE3D2] rounded-[24px] p-8 min-h-[180px] flex flex-col justify-between relative group border border-transparent hover:border-gray-200 transition-colors">
      <div>{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
        <p className="text-[28px] font-bold text-black">{value}</p>
      </div>
      <div className="absolute bottom-6 right-6">
        <span className="bg-[#FFEAD5] text-[#FF7A00] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
          {badge}
        </span>
      </div>
    </div>
  );
}

function PropertyCarousel({ items, badge, badgeColor }: { items: number[], badge: string, badgeColor: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -344, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 344, behavior: 'smooth' });
  };

  return (
    <div className="mt-8 relative w-full">
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto overflow-y-hidden scroll-smooth scrollbar-hide overscroll-x-contain pl-6 md:pl-6"
        onWheel={(e) => {
          const container = e.currentTarget;
          const isScrollable = container.scrollWidth > container.clientWidth;

          if (!isScrollable) return;

          if (e.deltaY !== 0) {
            e.preventDefault();
            container.scrollLeft += e.deltaY;
          }
        }}
      >
        {items.map((idx) => (
          <div key={idx} className="w-[320px] flex-shrink-0 first:ml-0">
            <PropertyCard index={idx} status={badge} statusColor={badgeColor} />
          </div>
        ))}
      </div>

      {/* Scroll Buttons - Left Aligned to Content Area */}
      <div className="flex gap-3 mt-6 justify-start pl-6 md:pl-6">
        <button onClick={scrollLeft} className="w-12 h-12 rounded-full bg-[#F3EFEA] flex items-center justify-center hover:bg-gray-200 transition-colors">
          <ArrowLeft className="w-5 h-5 text-black" />
        </button>
        <button onClick={scrollRight} className="w-12 h-12 rounded-full bg-[#F3EFEA] flex items-center justify-center hover:bg-gray-200 transition-colors">
          <ArrowRight className="w-5 h-5 text-black" />
        </button>
      </div>
    </div>
  )
}

function PropertyCard({ index, status, statusColor }: { index: number; status: string; statusColor: string }) {
  return (
    <div className="group cursor-pointer flex flex-col h-full w-[320px]">
      {/* Image Container - Fixed Aspect Ratio and Height */}
      <div className="relative rounded-t-[24px] overflow-hidden bg-gray-200 w-full h-[220px]">
        <Image
          src="/assets/images/agents-hero.jpg"
          alt="Property"
          fill
          sizes="320px"
          quality={100}
          priority
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badge */}
        <span className={`absolute top-4 left-4 ${statusColor} text-white text-[10px] font-bold px-4 py-1.5 rounded-full z-10 uppercase tracking-wide`}>
          {status}
        </span>
      </div>

      {/* Content Container - Black Background with Consistent Height */}
      <div className="bg-[#111111] rounded-b-[24px] p-6 text-white min-h-[160px] flex flex-col justify-between">
        <div>
          <h3 className="text-[28px] font-bold mb-2">$ 250,000</h3>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-2">
            640 162th ky Gray, Kentucky(KY), 40734
          </p>
        </div>

        <div className="flex items-center gap-5 text-xs font-semibold text-white mt-auto">
          <div className="flex items-center gap-2">
            <Bed className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            <span>3 Bed</span>
          </div>
          <div className="flex items-center gap-2">
            <Bath className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            <span>2 Bath</span>
          </div>
          <div className="flex items-center gap-2">
            <Square className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            <span>1.51 sft</span>
          </div>
        </div>
      </div>
    </div>
  );
}
