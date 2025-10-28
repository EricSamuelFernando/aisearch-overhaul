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
import { BookmarkCheck } from 'lucide-react';
import {EstimatedMarketValue} from '../preview-hero/EstimatedMarketValue';


const defaultEstimatedData: any = {
  houseValue: "$450,460",
  houseValueDescription: "Overall readiness assessment",
  estimatedRent: "$3,700",
  rentChange: "-$250",
  rentDescription: "Valued in Rent and lost in Mortgage",
  projectedGain: "22.6%",
  projectedGainDescription: "Post-graduation enrolment rates",
};
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
  const property: any = useAppSelector((state) => state.property.property);
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

      debugger
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

  console.log(propertyData)
  const [showAllSchools, setShowAllSchools] = React.useState(false);
  const [sortedSchools, setSortedSchools] = React.useState<any[]>([]);

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
          <HeroCollege
            className='h-[200px] sm:h-[250px] md:h-[28rem] md:col-span-9 rounded-lg shadow-lg overflow-hidden'
            imageURLs={
              transformData.prop?.media?.photosList?.length ?
                transformData.prop?.media?.photosList?.map((img: any) => img) || [''] :
                [{ highRes: transformData.prop?.media?.primaryListingImageUrl }]
            }
            onImageClick={handleImageClick}
          />
          <div className="relative right-0  mr-0 md:mr-4 transition-all duration-300 ease-in-out w-full md:w-auto">
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



          <div className='md:col-span-9 md:-mt-4 md:h-[28rem]'>
            <div className='mt-2 flex flex-col sm:flex-row w-full justify-between items-start sm:items-center gap-3 sm:gap-4 md:gap-0'>
              <div className="space-y-2 w-full sm:w-auto">
                <div className='inline-flex flex-wrap items-center gap-2 sm:gap-3'>
                  <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900'>{`$ ${transformData.prop?.listPrice && transformData.prop?.listPrice.toLocaleString('en-US') || 0}`}</h2>
                  {/* <Badge
                    variant='outline'
                className='h-max border-[#E9FFCC] bg-[#E9FFCC] text-green-500 px-3 sm:px-4 md:px-8 hover:bg-[#E9FFCC] transition-colors duration-200'
                  >
                    {transformData?.prop?.standardStatus || propertyDatas?.property_detail?.data?.propertyInfo?.standardStatus || "N/A"}
                  </Badge> */}
                </div>

                {/* <h4 className='py-1 sm:py-2 text-base sm:text-lg md:text-xl font-medium leading-5 sm:leading-6 text-gray-800'>
                  {transformData?.prop?.courtesyOf || "N/A"}
                </h4> */}
                <p className='truncate text-clip text-xl font-bold sm:text-base text-gray-600 leading-5 sm:leading-6' style={{ fontFamily: "Satoshi" }}>{`${transformData.prop?.address?.unparsedAddress || propertyDatas?.property_detail?.data?.propertyInfo?.address?.address || "N/A"}, ${transformData.prop?.address?.city || propertyDatas?.property_detail?.data?.propertyInfo?.address?.city || "N/A"}, ${transformData.prop?.address?.stateOrProvince || propertyDatas?.property_detail?.data?.propertyInfo?.address?.stateOrProvince || "N/A"}, ${transformData.prop?.address?.zipCode || propertyDatas?.property_detail?.data?.propertyInfo?.address?.zip || "N/A"}` || transformData.prop?.listingAgent?.fullName || "N/A"}</p>
              </div>
              {/* <div className='flex justify-between gap-x-2 sm:gap-x-4 md:gap-x-10 border-y-[1px] border-y-[#EAEAEA] py-3 sm:py-4 md:py-6 px-2 sm:px-3 md:px-4 rounded-lg bg-white shadow-sm w-full sm:w-auto'>
                <div className='text-center'>
                  <h2 className='text-lg sm:text-xl md:text-2xl font-bold text-gray-900'>
                    {transformData.prop?.property?.bedroomsTotal || propertyDatas?.property_detail?.data?.propertyInfo?.bedrooms || 0}
                  </h2>
                  <span className='text-xs sm:text-sm text-gray-500'>
                    {transformData.prop?.property?.bedroomsTotal || propertyDatas?.property_detail?.data?.propertyInfo?.bedrooms || 0 > 1
                      ? 'Bedrooms'
                      : 'Bedroom'}
                  </span>
                </div>
                <div className='flex-1 border-x-[1px] border-x-gray-200 px-2 sm:px-3 md:px-6 text-center'>
                  <h2 className='text-lg sm:text-xl md:text-2xl font-bold text-gray-900'>
                    {transformData.prop?.property?.bathroomsTotal || propertyDatas?.property_detail?.data?.propertyInfo?.bathrooms || 0}
                  </h2>
                  <span className='text-xs sm:text-sm text-gray-500'>
                    {transformData?.prop?.property?.bathroomsTotal || propertyDatas?.property_detail?.data?.propertyInfo?.bathrooms || 0 > 1
                      ? 'Bathrooms'
                      : 'Bathroom'}
                  </span>
                </div>

                <div className='text-center'>
                  <h2 className='text-lg sm:text-xl md:text-2xl font-bold text-gray-900'>
                    {transformData.prop?.property?.livingArea  || propertyDatas?.property_detail?.data?.propertyInfo?.livingSquareFeet || "N/A"}
                  </h2>
                  <span className='text-xs sm:text-sm text-gray-500'>
                    $&nbsp;{transformData.prop?.pricePerSqFt || propertyDatas?.property_detail?.data?.propertyInfo?.pricePerSquareFoot || "N/A"}
                    &nbsp;(Price per sq.ft)
                  </span>
                </div>
              </div> */}
            </div>

            {/* <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 md:gap-x-3 py-3 sm:py-4'>
              <button className='flex border border-orange-300  h-max flex-1 items-center gap-x-2 rounded-lg  px-3 sm:px-4 py-2.5 sm:py-3 text-left font-light text-gray-800 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50'>
                <Image
                  alt='bed'
                  height={20}
                  width={24}
                  className="sm:h-6 sm:w-6"
                  src='/assets/images/bed-black.svg'
                />
                <p className='text-sm font-semibold'>{transformData.prop?.property?.propertyType || propertyDatas?.property_detail?.data?.propertyInfo?.propertyType || "N/A"}</p>
              </button>
              <button className='flex h-max border border-orange-300  flex-1 items-center gap-x-2 rounded-lg  px-3 sm:px-4 py-2.5 sm:py-3 text-left font-light text-gray-800 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50'>
                <Image
                  alt='bed'
                  height={20}
                  width={20}
                  className="sm:h-6 sm:w-6"
                  src='/assets/images/calendar.svg'
                />
                <p className='text-sm font-semibold'>Built in {transformData.prop?.property?.yearBuilt || propertyDatas?.property_detail?.data?.propertyInfo?.yearBuilt || "N/A"}</p>
              </button>
              <button className='flex h-max border border-orange-300  flex-1 items-center gap-x-2 rounded-lg  px-3 sm:px-4 py-2.5 sm:py-3 text-left font-light text-gray-800 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50'>
                <Image
                  alt='bed'
                  height={20}
                  width={20}
                  className="sm:h-6 sm:w-6"
                  src='/assets/images/area-black.svg'
                />
                     <p className='text-sm font-semibold'>{`${transformData.prop?.property?.livingArea || propertyDatas?.property_detail?.data?.propertyInfo?.livingSquareFeet || "N/A"}`}</p>
               </button>
            </div> */}

            <div className='flex items-stretch justify-between gap-2 sm:gap-3  mt-5 md:gap-x-3 py-3 sm:py-4 border border-gray-200 rounded-xl px-4 bg-white shadow-sm'>
              {/* 1. Year Built */}
              <div className='flex h-max flex-1 items-center gap-6 py-2.5 sm:py-3 text-left ms-4'>
                <Image
                  alt='house'
                  height={20}
                  width={20}
                  className="sm:h-6 sm:w-6"
                  src='/assets/images/residental.png' // Assuming a house icon for property type
                /> {/* Checkbox-like icon */}
                <div className='flex flex-col text-left'>
                  <p className='text-lg font-semibold text-gray-800 leading-none'>
                    {transformData.prop?.property?.yearBuilt || propertyDatas?.property_detail?.data?.propertyInfo?.yearBuilt || "N/A"}
                  </p>
                  <p className='text-xs font-light text-gray-500'>Year Built</p>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="h-10 w-px bg-gray-200 self-center"></div>

              {/* 2. Property Type (Single Family Residence) */}
              <div className='flex h-max flex-1 items-center gap-6 py-2.5 sm:py-3 text-left ms-4'>
                <Image
                  alt='house'
                  height={20}
                  width={20}
                  className="sm:h-6 sm:w-6"
                  src='/assets/images/resd.png' // Assuming a house icon for property type
                />
                <div className='flex flex-col text-left'>
                  <p className='text-lg font-semibold text-gray-800 leading-none'>
                    {transformData.prop?.property?.propertyType || propertyDatas?.property_detail?.data?.propertyInfo?.propertyType || "N/A"}
                  </p>
                  <p className='text-xs font-light text-gray-500'>Family Residence</p>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="h-10 w-px bg-gray-200 self-center"></div>

              {/* 3. Square Footage */}
              <div className='flex h-max flex-1 items-center gap-6 py-2.5 sm:py-3 text-left ms-4'>
                <Image
                  alt='area'
                  height={20}
                  width={20}
                  className="sm:h-6 sm:w-6"
                  src='/assets/images/area-black.svg'
                />
                <div className='flex flex-col text-left'>
                  <p className='text-lg font-semibold text-gray-800 leading-none'>
                    {`${transformData.prop?.property?.livingArea || propertyDatas?.property_detail?.data?.propertyInfo?.livingSquareFeet || "N/A"}`}
                  </p>
                  <p className='text-xs font-light text-gray-500'>Sqft Area</p>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="h-10 w-px bg-gray-200 self-center"></div>

              {/* 4. Price/Sqft (Hardcoded for structure, as this data path wasn't in your original JS) */}
              <div className='flex h-max flex-1 items-center gap-6 py-2.5 sm:py-3 text-left ms-4'>
                <div className="text-xl font-bold text-gray-800 leading-none">$</div>
                <div className='flex flex-col text-left'>
                  <p className='text-lg font-semibold text-gray-800 leading-none'>
                    {"281"}
                  </p>
                  <p className='text-xs font-light text-gray-500'>Price/sqft</p>
                </div>
              </div>
            </div>


            <div className='flex flex-wrap items-center justify-between gap-2 sm:gap-3 py-2 sm:py-2'>
              <EstimatedMarketValue defaultEstimatedData={defaultEstimatedData} />
              </div>

            {/* <div className='flex flex-wrap items-center justify-between gap-2 sm:gap-3 py-2 sm:py-2'>
              {tags?.length && tags?.slice(0, 3).map((tag: any, idx: any) => (
                <button key={idx} className='flex h-max  border  border-orange-500 flex-1 items-center gap-x-2 rounded-lg  px-3 sm:px-4 py-2.5 sm:py-3 text-left font-light text-gray-800 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50'>
                  <BookmarkCheck  />
                  <p className='text-xs font-semibold '>{tag}</p>
                </button>
              ))}
            </div> */}
            {/** BREAK LINE */}
            {/* <span className='block h-[.8px] w-full bg-grey-850'></span> */}

            <div className='space-y-3 sm:space-y-4 py-4 sm:py-6 md:py-8 text-justify text-sm sm:text-base'>
              <h2 className='text-xl sm:text-2xl md:text-3xl font-bold'>About This Home</h2>
              {
                transformData?.prop?.publicRemarks?.length > 0 && (
                  <p className="whitespace-pre-line text-sm sm:text-base leading-relaxed">
                    {
                      transformData?.prop?.publicRemarks
                    }
                  </p>
                )
              }
            </div>
            {/** BREAK LINE */}
            <span className='block h-[.8px] w-full bg-grey-850'></span>

            {/** LOCATION */}
            {/* <section className='py-4 sm:py-6 md:py-8' id='location'>
              <div className='pb-3 sm:pb-4 md:pb-8'>
                <h1 className='text-lg sm:text-xl md:text-2xl font-bold'>Location</h1>
                <div className='flex items-center gap-x-1 py-1 sm:py-2 md:py-4 text-sm'>
                  <span></span> <span></span> <span></span>{' '}
                </div>
              </div>

              <div>
                <div className='h-[200px] sm:h-[250px] md:h-[350px] rounded-lg overflow-hidden'>
                  <CustomMap
                    coord={[
                      {
                     lat: propertyData?.listing?.property?.latitude || 36.778,
                        lng: propertyData?.listing?.property?.longitude || -119.417,
                        id: transformData?.prop?.reapiId,
                        price: transformData.prop?.listPrice
                      },
                    ]}
                    height='100%'
                    zoom={18}
                  />
                </div>
              </div>
            </section> */}
            {/** LOCATION */}
            <section className='py-4 sm:py-6 md:py-8' id='location'>
              <div className='pb-3 sm:pb-4 md:pb-8'>
                <h1 className='text-lg sm:text-xl md:text-2xl font-bold'>Location</h1>
                <div className='flex flex-col sm:flex-row gap-2 sm:gap-4 py-2 sm:py-4 text-sm'>
                  <span className='font-semibold'>California</span>
                  <span className='font-semibold'>Mountain View</span>
                  <span className='font-semibold'>94043</span>
                  <span className='font-semibold'>Sterling Estates</span>
                </div>
              </div>

              <div>
                <div className='h-[200px] sm:h-[250px] md:h-[350px] rounded-lg overflow-hidden'>
                  <CustomMap
                    coord={[{
                      lat: propertyData?.listing?.property?.latitude || propertyDatas?.property_detail?.data?.propertyInfo?.latitude || 36.778,
                      lng: propertyData?.listing?.property?.longitude || propertyDatas?.property_detail?.data?.propertyInfo?.longitude || -119.417,
                      id: transformData?.prop?.reapiId,
                      price: transformData.prop?.listPrice
                    }]}
                    height='100%'
                    zoom={18}
                  />
                </div>
              </div>
            </section>


            {/** FEATURES or PROPERTY */}
            {transformData?.prop?.homeFeature ? <section id='property' className='py-4 sm:py-6 md:py-8'>
              <h2 className='py-3 sm:py-4 md:py-6 text-lg sm:text-xl md:text-2xl font-bold'>Home Features</h2>
              <div className='grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-sm text-grey-350'>
                <NewFeatureCard features={property?.features || []} />
              </div>
            </section> : <></>}

            {/** SCHOOLS NEARBY */}

            {
              Object.keys(propertyDetails?.data.schools || {}).length ? (
                <section id="schools" className="my-4 sm:my-6 md:my-8 w-full overflow-x-auto">
                  <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Schools Near by</h2>
                  </div>

                  <div className="overflow-x-auto w-full">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            School Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Grades
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            City
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                            Ratings
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {displayedSchools.slice(0, showAllSchools ? displayedSchools.length : 3).map((school) => (
                          <tr key={school.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{school.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.type}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.grades}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.city}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{school.rating}/10</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Show More Button below the table */}
                    {sortedSchools.length > 3 && (
                      <div className="flex justify-center mt-4">
                        <button
                          onClick={() => setShowAllSchools(!showAllSchools)}
                          className="text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-white text-gray-800 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <span>{showAllSchools ? 'Show Less' : 'Show More'}</span>
                          <svg
                            className={`w-4 h-4 transition-transform duration-200 ${showAllSchools ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                  <br />
                </section>
              ) : <></>
            }



            {/** PROPERTY ANALYSIS */}
            <section id='analysis' className='my-4 sm:my-6 md:my-8'>
              <h2 className='mb-3 sm:mb-4 text-lg sm:text-xl md:text-2xl font-bold'>Property Analysis</h2>
              <div className='w-full'>
                <BuyTab />
              </div>
            </section>

            {/* {propertyDetails?.data?.propertyInfo && (
              <section id='property-details' className='py-4 sm:py-6 md:py-8'>
                <PropertyDetailsCard data={propertyDetails?.data} />
              </section>
            )} */}


          </div>
          {/* Lightbox Gallery */}
          <Lightbox
            open={isOpen}
            close={() => setIsOpen(false)}
            index={currentImageIndex}
            slides={images}
            plugins={[Zoom, Thumbnails]}
            styles={{ container: { backgroundColor: "rgba(0, 0, 0, .9)" } }}
            render={{
              buttonPrev: () => null,
              buttonNext: () => null,
              buttonZoom: () => null,
              buttonThumbnails: () => null,
            }}
          />
        </div>
      ) : (
        <div className='h-full w-full'>{notFound()}</div>
      )}
    </>
  );
};

export { PropertyPreview };