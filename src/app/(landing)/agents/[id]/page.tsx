'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Star, Phone, ArrowLeft, ArrowRight, Bed, Bath, Square } from 'lucide-react';
import MainNavPages from '@/components/navbars/main-nav-pages';
import { Agent } from '@/types/agent.types';

// Helper: Formats 12000 -> 12,000
function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  return value.toLocaleString('en-US');
}

// Helper: Formats 500000 -> $500,000
function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  return `$${value.toLocaleString('en-US', {
    maximumFractionDigits: 0,
  })}`;
}

// Formats 502552457 -> $502M
function formatMillions(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A';
  const millions = value / 1_000_000;
  return `$${Math.round(millions)}M`;
}

const SECTION_IDS = [
  'agent-info',
  'success-metrics',
  'performance-metrics',
  'featured-sales',
  'active-listings',
] as const;

type SectionId = (typeof SECTION_IDS)[number];
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
  const [activeSection, setActiveSection] = useState<SectionId>('agent-info');

  useEffect(() => {
    if (!id) return;

    const controller = new AbortController();

    async function loadAgent() {
      setStatus('loading');
      try {
        const res = await fetch(`/api/agents/${id}`, { signal: controller.signal });
        if (!res.ok) {
          setAgent(null);
          setStatus('not-found');
          return;
        }
        const data: Agent = await res.json();
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

  // Scroll spy using IntersectionObserver
  useEffect(() => {
    if (!agent || status !== 'loaded') return;

    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '-40% 0px -40% 0px',
      threshold: 0.1,
    };

    const callback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id as SectionId;
          if (SECTION_IDS.includes(id)) {
            setActiveSection(id);
          }
        }
      });
    };

    const observer = new IntersectionObserver(callback, observerOptions);

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [agent, status]);

  // Click navigation (smooth scroll to section)
  const handleNavClick = (sectionId: SectionId) => {
    setActiveSection(sectionId);

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const getLinkClass = (sectionId: SectionId) => {
    const isActive = activeSection === sectionId;
    return `text-left pl-4 border-l-2 text-sm transition-colors duration-200 cursor-pointer w-full ${isActive
        ? 'border-black font-bold text-black'
        : 'border-transparent text-gray-600 hover:text-black'
      }`;
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white text-black">
        <MainNavPages  />
        <div className="pt-28 pb-20 container mx-auto px-4 sm:px-6 lg:px-8">
          <p>Loading agent...</p>
        </div>
      </div>
    );
  }

  if (status === 'not-found' || !agent) {
    return (
      <div className="min-h-screen bg-white text-black">
        <MainNavPages  />
        <div className="pt-28 pb-20 container mx-auto px-4 sm:px-6 lg:px-8">
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

  const totalDeals = (agent as any).totalDeals ?? 0;

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

  const brokerageAndLocation = `${agent.brokerageName || (agent as any).Brokerage || 'Real Estate Agent'
    } - ${agent.city ?? ''}${agent.city && agent.state ? ', ' : ''}${agent.state ?? ''}`;

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <MainNavPages  />

      <div className="pt-28 pb-20 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="text-sm text-gray-500 mb-8 flex items-center gap-2">
          <Link href="/agents/search" className="hover:text-black transition-colors">
            Agent list
          </Link>
          &gt;
          <span className="text-black font-medium">Agent Profile</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="hidden lg:block lg:col-span-3">
            <div className="sticky top-40 space-y-4">
              <nav className="flex flex-col space-y-3">
                <button
                  type="button"
                  onClick={() => handleNavClick('agent-info')}
                  className={getLinkClass('agent-info')}
                >
                  Agent Info
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick('success-metrics')}
                  className={getLinkClass('success-metrics')}
                >
                  Success Metrics
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick('performance-metrics')}
                  className={getLinkClass('performance-metrics')}
                >
                  Performance Metrics
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick('featured-sales')}
                  className={getLinkClass('featured-sales')}
                >
                  Sold Homes
                </button>
                <button
                  type="button"
                  onClick={() => handleNavClick('active-listings')}
                  className={getLinkClass('active-listings')}
                >
                  Active/For Sale Homes
                </button>
              </nav>
            </div>
          </aside>

          <div className="lg:col-span-9 space-y-8">
            <div className="bg-[#f7f2e9] rounded-[2rem] p-6 flex flex-col md:flex-row md:items-center md:justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white flex-shrink-0">
                  <Image
                    src={agent.profile_image_url || '/assets/images/agetn-hero-deop.jpg'}
                    alt={agent.full_name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-black mb-1">{agent.full_name}</h2>

                  {agent.licenseNumber && (
                    <p className="text-xs text-gray-500">
                      License {agent.licenseNumber}
                    </p>
                  )}

                  <p className="flex items-center gap-2 text-sm text-gray-700 mt-1">
                    <Star className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                    <span className="font-semibold">
                      {agent.rating ? agent.rating.toFixed(1) : 'N/A'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-4 md:mt-0 flex flex-col items-end gap-1">
                {agentPhone && (
                  <a
                    href={`tel:${agentPhone}`}
                    className="inline-flex items-center gap-2 bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-900 transition-colors -mr-2"
                  >
                    <Phone className="w-4 h-4" />
                    {agentPhone}
                  </a>
                )}
                <p className="text-gray-600 text-sm text-right mt-1">
                  {brokerageAndLocation}
                </p>
              </div>
            </div>

            <section id="agent-info" className="scroll-mt-32">
              <h3 className="text-lg font-bold text-black mb-4">Agent Info</h3>
              <div className="bg-[#f7f2e9] rounded-[2rem] p-6 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-2">
                  <p>
                    <span className="text-gray-500">Name:</span>{' '}
                    <span className="font-semibold text-black">{agent.full_name}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Email:</span>{' '}
                    <span className="font-semibold text-black">{agent.email}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Phone:</span>{' '}
                    <span className="font-semibold text-black">{agentPhone}</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <p>
                    <span className="text-gray-500">Location:</span>{' '}
                    <span className="font-semibold text-black">
                      {agent.city}, {agent.state}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-500">Brokerage:</span>{' '}
                    <span className="font-semibold text-black">
                      {agent.brokerageName || (agent as any).Brokerage}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-500">Service Regions:</span>{' '}
                    <span className="font-semibold text-black">
                      {agent.primary_service_regions}
                    </span>
                  </p>
                </div>
              </div>
            </section>

            <section id="success-metrics" className="scroll-mt-32">
              <h3 className="text-lg font-bold text-black mb-4">Success Metrics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  label="Total Sales (lifetime)"
                  value={formatMillions(dealVolume as number)}
                />
                <MetricCard
                  label="Sales (last 12 months)"
                  value={formatMillions(salesVolumeLast12Months as number)}
                />
                <MetricCard
                  label="Highest Sale"
                  value={formatMillions(highestSaleValue as number)}
                />
                <MetricCard
                  label="Active Listings"
                  value={formatNumber(agent.active_listings_count as number)}
                />
              </div>
            </section>

            <section id="performance-metrics" className="scroll-mt-32">
              <h3 className="text-lg font-bold text-black mb-4">Performance Metrics</h3>
              <div className="bg-[#f7f2e9] rounded-[2rem] p-8 shadow-sm text-sm">
                <div className="mb-8 border-b border-gray-300/50 pb-8">
                  <h4 className="font-bold text-lg mb-6">Career</h4>
                  <div className="space-y-4">
                    <RowItem
                      label="Total Deals"
                      value={formatNumber(totalDeals as number)}
                    />
                    <RowItem
                      label="Total Sales (lifetime)"
                      value={formatMillions(dealVolume as number)}
                    />
                    <RowItem
                      label="Sales (last 12 months)"
                      value={formatMillions(salesVolumeLast12Months as number)}
                    />
                    <RowItem
                      label="Highest Sale"
                      value={formatMillions(highestSaleValue as number)}
                    />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-6">Market Expertise</h4>
                  <div className="space-y-4">
                    <RowItem
                      label="Properties Sold Last Year"
                      value={formatNumber(homesSoldLastYear as number)}
                    />
                    <RowItem
                      label="Active Listings (API)"
                      value={formatNumber(agent.active_listings_count as number)}
                    />
                    <RowItem
                      label="Commission Rate"
                      value={commissionRateDisplay}
                    />
                    <RowItem
                      label="Estimated GCI"
                      value={formatMillions(estimatedGci as number)}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section id="featured-sales" className="scroll-mt-32">
              <div className="flex justify-between items-end mb-4">
                <h3 className="text-lg font-bold text-black">Sold Homes</h3>
                <div className="flex gap-2">
                  <NavButton icon={<ArrowLeft className="w-4 h-4" />} />
                  <NavButton icon={<ArrowRight className="w-4 h-4" />} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <PropertyCard
                  status="Sold"
                  statusColor="bg-orange-500"
                  price="$ 250,000"
                  address="6401 Mclntryre Grey, Kentucky"
                  beds="3"
                  baths="2"
                  sqft="1.01"
                />
                <PropertyCard
                  status="Sold"
                  statusColor="bg-orange-500"
                  price="$ 250,000"
                  address="4123 West Avenue, Kentucky"
                  beds="3"
                  baths="2"
                  sqft="1.01"
                />
                <PropertyCard
                  status="Sold"
                  statusColor="bg-orange-500"
                  price="$ 250,000"
                  address="8899 North St, Kentucky"
                  beds="3"
                  baths="2"
                  sqft="1.01"
                />
              </div>
            </section>

            <section id="active-listings" className="scroll-mt-32">
              <div className="flex justify-between items-end mb-4">
                <h3 className="text-lg font-bold text-black">Active/For Sale Homes</h3>
                <div className="flex gap-2">
                  <NavButton icon={<ArrowLeft className="w-4 h-4" />} />
                  <NavButton icon={<ArrowRight className="w-4 h-4" />} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <PropertyCard
                  status="For Sale"
                  statusColor="bg-[#82C91E]"
                  price="$ 250,000"
                  address="6401 Mclntryre Grey, Kentucky"
                  beds="3"
                  baths="2"
                  sqft="1.01"
                />
                <PropertyCard
                  status="For Sale"
                  statusColor="bg-[#82C91E]"
                  price="$ 250,000"
                  address="6401 Mclntryre Grey, Kentucky"
                  beds="3"
                  baths="2"
                  sqft="1.01"
                />
                <PropertyCard
                  status="For Sale"
                  statusColor="bg-[#82C91E]"
                  price="$ 250,000"
                  address="6401 Mclntryre Grey, Kentucky"
                  beds="3"
                  baths="2"
                  sqft="1.01"
                />
              </div>

              <div className="mt-8 flex justify-center">
                <Link href="/agents/search">
                  <button className="border border-black rounded-full px-6 py-2 text-sm font-medium hover:bg-black hover:text-white transition-colors">
                    Back to Agent List
                  </button>
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#f7f2e9] rounded-[2rem] p-6 flex flex-col justify-between h-40 shadow-sm">
      <div className="flex gap-1 mb-2">
        {[...Array(7)].map((_, i) => (
          <div key={`orange-${i}`} className="w-1.5 h-4 bg-orange-500 rounded-sm" />
        ))}
        <div className="w-1.5 h-4 bg-gray-400 rounded-sm" />
      </div>
      <div className="flex flex-col">
        <p className="text-3xl font-bold text-black tracking-tight leading-none">
          {value}
        </p>
        <p className="text-gray-500 text-sm font-medium mt-2">{label}</p>
      </div>
    </div>
  );
}

function RowItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-500">{label}</span>
      <span className="text-black font-bold">{value}</span>
    </div>
  );
}

function NavButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="w-10 h-10 rounded-full bg-[#EADDD7] flex items-center justify-center hover:bg-[#DCCBC3] transition-colors text-black">
      {icon}
    </button>
  );
}

function PropertyCard({
  status,
  statusColor,
  price,
  address,
  beds,
  baths,
  sqft,
}: any) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer bg-white">
      <div className="h-48 bg-gray-300 relative">
        <Image
          src="/assets/images/agents-hero.jpg"
          alt="Property"
          fill
          className="object-cover"
        />
        <div
          className={`absolute top-4 left-4 ${statusColor} text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider`}
        >
          {status}
        </div>
      </div>
      <div className="bg-[#111111] p-5 text-white">
        <h4 className="text-xl font-bold mb-1">{price}</h4>
        <p className="text-gray-400 text-xs mb-4">{address}</p>
        <div className="flex items-center gap-4 text-sm text-gray-300 border-t border-gray-800 pt-4">
          <div className="flex items-center gap-2">
            <Bed className="w-4 h-4" /> <span>{beds} Bed</span>
          </div>
          <div className="flex items-center gap-2">
            <Bath className="w-4 h-4" /> <span>{baths} Bath</span>
          </div>
          <div className="flex items-center gap-2">
            <Square className="w-4 h-4" /> <span>{sqft} sqft</span>
          </div>
        </div>
      </div>
    </div>
  );
}
