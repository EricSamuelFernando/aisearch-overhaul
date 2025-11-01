'use client';

import * as React from 'react';
import Image from 'next/image';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";

import CustomMap from '@/components/custom-map';
import SkeletonLoader from '@/components/skeleton-loader';

import { PropCardLoader } from '../buy-property-card-loader';
import { BuyTab } from '../buy-tab';
import BuyTable from '../buy-table';
import ItemNav from './ItemNav';
import { useGetSingleProperty } from '@/hooks/api/property/usePropertyApi';
import { useAppSelector } from '@/lib/hook';
import {
  HeroCollege,
  HeroCarousel,
  HeroHighlights,
  ListingAgentCard
} from '../preview-hero';
import { Badge } from '@/components/ui/badge';
import { NewFeatureCard } from './multi-feature-card';
import { PROPERTY_DETAIL_SEARCH_AI_URL } from "@/shared/constants/env"
import { useSelector } from 'react-redux';
import PropertyDetailsCard from '../propertyDetailsCard';
import { BookmarkCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { EstimatedMarketValue } from '../preview-hero/EstimatedMarketValue';
import HomeHighlights from '../preview-hero/HomeHighlights';
import SchoolsNearAddress from '../preview-hero/SchoolsNearAddress';
import TopCollegesSection from '../preview-hero/PropertySummaryBar';
import InteriorOffersSection from '../preview-hero/InteriorOffersSection';
import PropertyHistorySection from '../preview-hero/PropertyHistorySection';
import InterestRatePredictor from '../preview-hero/InterestRatePredictor';
import PaymentCalculator from '../preview-hero/PaymentCalculator';
import NearbyHomesSection from '../preview-hero/NearbyHomesSection';

const defaultEstimatedData: any = {
  houseValue: "$450,460",
  houseValueDescription: "Overall readiness assessment",
  estimatedRent: "$3,700",
  rentChange: "-$250",
  rentDescription: "Valued in Rent and lost in Mortgage",
  projectedGain: "22.6%",
  projectedGainDescription: "Post-graduation enrolment rates",
};


interface HomeHighlightsProps {
  highlights: string[];
  description: string;
  stats: {
    daysOnMarket: string;
    views: string;
    saves: string;
    sellLikelihood: string;
  };
  floorPlanSrc: string;
  threeDHomeSrc: string;
}

// 2. Create the Data Object



const PropertyPreview: React.FC = () => {
  const leftSection = React.useRef<HTMLDivElement>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [proprtyData, setPropertyData] = React.useState([]);
  const [propertyDatas, setpropertyDatas] = React.useState<any>(null);
  interface PropertyDetails {
    data: {
      schools: any[];
      propertyInfo?: any;

    };
  }

  const [propertyDetails, setPropertyDetails] = React.useState<PropertyDetails | null>(null);
  const property: any = useAppSelector((state:any) => state.property.property);
  const [tags, setTags] = React.useState<any>([])
  // const propertyData: any = useAppSelector((state) => state);
  const [loading, setLoading] = React.useState(false)
  const [isCardIntersecting, setIsCardIntersecting] = React.useState(false);
  const { propertyId: id = '' } = useParams<{
    propertyId: string;
    item: string;
  }>();
  const searchParams = useSearchParams()
  const province = searchParams.get('province') || ""
  const city = searchParams.get('city') || ""
  const propertyId = searchParams.get('propertyId') || "";
  const listingId = searchParams.get('listingId') || "";
  const mostRecentStatus = searchParams.get('mostRecentStatus') || ""
  const { getSingleProperty: { isFetching } } = useGetSingleProperty(id!);
  const propertyData = useSelector((state: any) => state.property.property)
  // React.useEffect(() => {
  //   getSingleProperty.mutate()
  // }, [])


  const HomeHighlightsData: HomeHighlightsProps = {
    highlights: [
      "VAULTED CEILINGS",
      "NEARBY PARKS",
      "RICH HARDWOOD FLOORS",
      "STAINLESS STEEL APPLIANCES"
    ],
    description:
      "An enchanting tree-lined walkway leads to the front door. Enter to find a bright, open entryway. The light-filled primary suite awaits on this level of the home, complete with beautiful open beam ceilings, updated bath, walk-in closet/laundry and fireplace. " +
      "The open stairwell ascends to the spacious living room featuring gorgeous cathedral ceilings and tons of natural light. The formal dining room and updated kitchen open to a spacious wrap-around deck shaded by majestic oak trees, perfect for entertaining or dining al fresco. This level also features two additional bedrooms and a full bath...",
    stats: {
      daysOnMarket: "3 days",
      views: "721",
      saves: "18",
      sellLikelihood: "98%",
    },
    floorPlanSrc: '/assets/images/floor.png',
    threeDHomeSrc: '/assets/images/building.png',
  };


  const schoolPropsData: any = {
    address: "1912 Madison Avenue",
    district: "Texas City Independent School District",
    schools: [
      {
        rating: '2 / 10',
        name: 'La Marque Elementary School',
        type: 'Public - Serves this home',
        grades: 'K to 5',
        distance: '0.9 mi',
      },
      {
        rating: '2 / 10',
        name: 'Hayley Elementary School',
        type: 'Public - Serves this home',
        grades: 'K to 5',
        distance: '0.9 mi',
      },
      {
        rating: '2 / 10',
        name: 'LA MARQUE MIDDL',
        type: 'Public - Serves this home',
        grades: 'K to 5',
        distance: '0.9 mi',
      },
      {
        rating: '2 / 10',
        name: 'La Marque High School',
        type: 'Public - Serves this home',
        grades: 'K to 5',
        distance: '0.9 mi',
      },
    ],
  };

  const DUMMY_PROPERTY_DATA = {
    yearBuilt: '2020',
    propertyType: 'Single Family Residence', // Component displays 'Single'
    sqftArea: '7666',
    pricePerSqft: '$281',
  };


  const getPropertyDetails = async (id: string) => {
    try {
      setLoading(true);
      setPropertyData([]);
      const payload = {
        listingId: +id || listingId,
        propertyId: parseInt(propertyData?.id) || parseInt(propertyId)
      };
      const response = await fetch(PROPERTY_DETAIL_SEARCH_AI_URL || 'http://13.60.114.186:9000/api/search/preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // debugger
      const data = await response.json();
      setpropertyDatas(data)
      localStorage.setItem('stateOrProvince', data.data.address.stateOrProvince || '')
      localStorage.setItem('listingId', String(data.data.listingId))
      localStorage.setItem('propertyType', data.data.property.propertyType || '')
      localStorage.setItem('propertyId', String(data.property_id || data.data.property_detail?.property_id))
      // just the raw (unparsed) street address
      localStorage.setItem('propertyAddress', data.data.address.unparsedAddress || '');
      localStorage.setItem('propertyAddress1', data.data.address.countyOrParish || '');
      localStorage.setItem('propertyAddress2', data.data.address.zipCode || '');
      localStorage.setItem('listPrice', data.data.listPrice || '');



      setPropertyData(data?.data)
      setTags(data?.data?.tags)
      setPropertyDetails(data?.property_detail)
    } catch (error) {
      console.log("error : ", error);
    }
    setLoading(false);

  }


  React.useEffect(() => {
    const handleIntersect: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio > 0) {
          setIsCardIntersecting(true);
        } else {
          setIsCardIntersecting(false);
        }
      });
    };

    const observerOptions = {
      root: null,
      threshold: 0,
      rootMargin: '-50px',
      triggerOnce: true,
    };
    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    const leftCard = leftSection.current;
    const cardContainer = cardRef.current;

    if (leftCard && cardContainer) {
      observer.observe(leftCard);
      observer.observe(cardContainer);
    }

    return () => {
      if (leftCard && cardContainer) {
        observer.unobserve(leftCard);
        observer.unobserve(cardContainer);
      }
    };
  }, []);

  React.useEffect(() => {
    if (property?.listingId) {
      getPropertyDetails(property?.listingId)
    }
  }, [property]);

  React.useEffect(() => {
    if (listingId || propertyId) {
      getPropertyDetails(listingId)
    }
  }, [property]);

  const transformData = React.useMemo(() => {
    const prop: any = proprtyData
    return {
      display: true || Boolean(Object.keys(prop).length),
      prop,
    };
  }, [proprtyData, id]);

  console.log(propertyDatas, "propertyDatas")
  const [showAllSchools, setShowAllSchools] = React.useState(false);
  const [sortedSchools, setSortedSchools] = React.useState<any[]>([]);


  const [openSection, setOpenSection] = React.useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const sections = [
    {
      id: "home",
      title: "Home highlights",
      content: (
        <HomeHighlights
          highlights={HomeHighlightsData.highlights}
          description={HomeHighlightsData.description}
          stats={HomeHighlightsData.stats}
          floorPlanSrc={HomeHighlightsData.floorPlanSrc}
          threeDHomeSrc={HomeHighlightsData.threeDHomeSrc}
        />
      ),
    },
    {
      id: "schools",
      title: "Schools Nearby",
      content: (
        <SchoolsNearAddress
          address={schoolPropsData.address}
          district={schoolPropsData.district}
          schools={schoolPropsData.schools}
        />
      ),
    },
    {
      id: "college",
      title: "College Readiness",
      content: <TopCollegesSection />,
    },
    {
      id: "offers",
      title: "What this place offers",
      content: <InteriorOffersSection />,
    },
    {
      id: "interest",
      title: "Interest rate predictor",
      content: <InterestRatePredictor />,
    },
    {
      id: "payment",
      title: "Payment calculator",
      content: <PaymentCalculator />,
    },
    {
      id: "history",
      title: "Price history",
      content: <PropertyHistorySection />,
    },
    {
      id: "tax",
      title: "Tax history",
      content: <div>Tax history content here</div>,
    },
  ];


  React.useEffect(() => {
    if (propertyDetails?.data?.schools) {
      const schools = Object.values(propertyDetails.data.schools);
      const sorted = schools.sort((a: any, b: any) => {
        const ratingA = parseFloat(a.rating) || 0;
        const ratingB = parseFloat(b.rating) || 0;
        return ratingB - ratingA; // Sort in descending order
      });
      setSortedSchools(sorted);
    }
  }, [propertyDetails?.data?.schools]);

  const displayedSchools = showAllSchools ? sortedSchools : sortedSchools.slice(0, 3);

  const [isOpen, setIsOpen] = React.useState(false);
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  const images = React.useMemo(() => {
    if (transformData.prop?.media?.photosList?.length) {
      return transformData.prop.media.photosList.map((img: any) => ({
        src: img?.highRes,
        alt: "Property Image"
      }));
    }
    return [{
      src: transformData.prop?.media?.primaryListingImageUrl,
      alt: "Property Image"
    }];
  }, [transformData.prop?.media]);

  console.log(transformData)
  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setIsOpen(true);
  };
  return (
    <>
      <ItemNav cardRef={cardRef} />
      <div className='mt-12 sm:mt-16 md:mt-24' />
      {loading ? (
        <div className='grid grid-flow-row place-items-center gap-3 sm:gap-4 md:gap-6 md:h-[28rem] md:grid-cols-12 md:gap-7 animate-pulse px-4 sm:px-6 md:px-0'>
          <SkeletonLoader className='h-[200px] sm:h-[250px] md:h-[392px] w-full bg-gray-200 md:col-span-9 rounded-lg' />
          <div className='h-[200px] sm:h-[250px] md:h-[392px] w-full md:col-span-3'>
            <PropCardLoader className='h-full w-full rounded-lg shadow-lg' />
          </div>
        </div>
      ) : transformData.display ? (

        <div className='grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-12 md:gap-7 h-auto md:h-[28rem] transition-all duration-300 ease-in-out px-4 sm:px-6 md:px-0'>

          <div className='md:col-span-9 col-span-12 flex flex-col' ref={leftSection}>
            <HeroCollege
              className='h-[200px] sm:h-[250px] md:h-[28rem] w-full rounded-lg shadow-lg overflow-hidden'
              imageURLs={
                transformData.prop?.media?.photosList?.length ?
                  transformData.prop?.media?.photosList?.map((img: any) => img) || [''] :
                  [{ highRes: transformData.prop?.media?.primaryListingImageUrl }]
              }
              onImageClick={handleImageClick}
            />
            <div className='mt-3 flex flex-col sm:flex-row w-full justify-between items-start sm:items-center gap-3 sm:gap-4 md:gap-0'>
              <div className="space-y-1 w-full sm:w-auto">
                <div className='inline-flex flex-wrap items-center gap-2 sm:gap-3'>
                  <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900'>
                    {`$ ${transformData.prop?.listPrice && transformData.prop?.listPrice.toLocaleString('en-US') || 0}`}
                  </h2>
                </div>
                <p className='truncate text-clip text-lg font-bold sm:text-base text-gray-600 leading-5 sm:leading-6' style={{ fontFamily: "Satoshi" }}>
                  {`${transformData.prop?.address?.unparsedAddress || propertyDatas?.property_detail?.data?.propertyInfo?.address?.address || "N/A"}, ${transformData.prop?.address?.city || propertyDatas?.property_detail?.data?.propertyInfo?.address?.city || "N/A"}, ${transformData.prop?.address?.stateOrProvince || propertyDatas?.property_detail?.data?.propertyInfo?.address?.stateOrProvince || "N/A"}, ${transformData.prop?.address?.zipCode || propertyDatas?.property_detail?.data?.propertyInfo?.address?.zip || "N/A"}` || transformData.prop?.listingAgent?.fullName || "N/A"}
                </p>
              </div>
            </div>

            <div className='flex items-stretch justify-between gap-x-2 sm:gap-x-3 mt-4 md:gap-x-3 py-3 sm:py-4 border border-gray-200 rounded-xl px-2 sm:px-4 bg-white shadow-sm'>

              {[
                {
                  value: transformData.prop?.property?.yearBuilt || propertyDatas?.property_detail?.data?.propertyInfo?.yearBuilt || "N/A",
                  label: "Year Built",
                  iconSrc: '/assets/images/residental.png', // Checkbox-like icon
                  iconAlt: 'year built',
                  isPrice: false,
                },
                {
                  value: transformData.prop?.property?.propertyType || propertyDatas?.property_detail?.data?.propertyInfo?.propertyType || "N/A",
                  label: "Family Residence",
                  iconSrc: '/assets/images/resd.png',
                  iconAlt: 'property type',
                  isPrice: false,
                },
                {
                  value: `${transformData.prop?.property?.livingArea || propertyDatas?.property_detail?.data?.propertyInfo?.livingSquareFeet || "N/A"}`,
                  label: "Sqft Area",
                  iconSrc: '/assets/images/area-black.svg',
                  iconAlt: 'area',
                  isPrice: false,
                },
                {
                  value: "281", // Static value matching screenshot
                  label: "Price/sqft",
                  iconSrc: null, // Custom price icon
                  iconAlt: 'price per sqft',
                  isPrice: true,
                },
              ].map((item, index) => (
                <React.Fragment key={item.label}>
                  <div className='flex h-max flex-1 items-center gap-x-2 sm:gap-x-3 py-1 sm:py-2 text-left justify-center sm:justify-start min-w-[22%]'>
                    {/* Icon/Symbol */}
                    {item.iconSrc ? (
                      <Image
                        alt={item.iconAlt}
                        height={18} // Smaller on mobile
                        width={18}
                        className="h-4 w-4 sm:h-6 sm:w-6 shrink-0"
                        src={item.iconSrc}
                      />
                    ) : (
                      <div className="text-lg font-bold text-gray-800 leading-none shrink-0">$</div>
                    )}

                    {/* Text Content */}
                    <div className='flex flex-col text-left'>
                      <p className='text-sm sm:text-lg font-semibold text-gray-800 leading-none whitespace-nowrap'>
                        {item.value}
                      </p>
                      <p className='text-xs font-light text-gray-500 whitespace-nowrap'>
                        {item.label}
                      </p>
                    </div>
                  </div>

                  {/* Vertical Divider (Hidden between items on very small screens, shown on sm+) */}
                  {index < 3 && <div className="hidden sm:block h-10 w-px bg-gray-200 self-center"></div>}

                  {/* Mobile Divider (Ensures proper spacing on mobile for stats that wrap/stack if necessary) */}
                  {index === 1 && <div className="block sm:hidden h-10 w-px bg-gray-200 self-center"></div>}
                </React.Fragment>
              ))}
            </div>

            {/* Estimated Market Value (image_60fd3b.png) */}
            <div className='flex flex-wrap items-center justify-between gap-2 sm:gap-3 py-2 sm:py-2'>
              <EstimatedMarketValue defaultEstimatedData={defaultEstimatedData} />
            </div>
          </div>


          <div className="relative right-0  mr-0 md:mr-4 transition-all duration-300 ease-in-out w-[325px] md:w-auto">
            <ListingAgentCard
              agentName={`${transformData?.prop?.listingAgent?.fullName || "Snaphomz Agent"}`}
              email={transformData?.prop?.listingAgent?.email}
              className="h-fit w-full md:w-[23rem] shadow-lg hover:shadow-xl transition-shadow duration-300"
            />
            <br />
            <HeroHighlights
              className="h-[210px] sm:h-[260px] md:h-[25.4rem] w-full md:w-[23rem] shadow-lg hover:shadow-xl transition-shadow duration-300"
              id={id}
              propertyId={propertyData?.id}
              listingId={propertyData?.listingId}
            />
          </div>
          {/* <div className="md:col-span-3 col-span-12 relative w-full transition-all duration-300 ease-in-out">
       
        <ListingAgentCard
          agentName={`${transformData?.prop?.listingAgent?.fullName || "Snaphomz Agent"}`}
          email={transformData?.prop?.listingAgent?.email}
          className="h-fit w-full shadow-lg hover:shadow-xl transition-shadow duration-300"
        />
        
      
        <br  />
        
       
        <HeroHighlights
          className="h-auto md:h-[25.4rem] w-full shadow-lg hover:shadow-xl transition-shadow duration-300"
          id={id}
          propertyId={propertyData?.id}
          listingId={propertyData?.listingId}
        />
    </div> */}

          <div className="col-span-12 divide-y divide-gray-200 border-t border-gray-200 mt-6">
            {/* Accordion List (Home Highlights, Schools, Offers, History, etc.) */}
            {sections.map((section) => (
              <div key={section.id} className="border-b border-gray-200">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between py-4 text-left focus:outline-none transition-all"
                >
                  <span className="font-semibold text-[16px] text-gray-900">
                    {section.title}
                  </span>
                  {openSection === section.id ? (
                    <ChevronUp className="text-gray-600 transition-transform duration-200" />
                  ) : (
                    <ChevronDown className="text-gray-600 transition-transform duration-200" />
                  )}
                </button>

                {/* Accordion Content */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${openSection === section.id ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                >
                  <div className="pb-4">{section.content}</div>
                </div>
              </div>
            ))}

            {/* Nearby Homes Section (Similar Homes) */}
            <div>
              <h2 className='text-xl font-bold mt-8 mb-4'>Nearby Homes</h2>
              <NearbyHomesSection nearbyHomes={propertyDatas?.nearbyHomes?.data} />
            </div>
          </div>

          {/* Commented out sections kept for reference */}
          {/* ... (rest of the original component structure) */}

        </div>

      ) : (
        <div className='h-full w-full'>{notFound()}</div>
      )}
    </>
  );
};

export { PropertyPreview };