"use client"

import React, { useEffect, useState } from "react"
import type { ChartOptions } from "chart.js"
import SellerLineChart from "@/components/agent-chart"
import { PROPERTY_DETAIL_SEARCH_AI_URL } from "@/shared/constants/env"
import { notFound, useSearchParams } from "next/navigation"
import Lightbox from "yet-another-react-lightbox"
import { NewFeatureCard } from "@/components/buy/preview/multi-feature-card"
import CustomMap from "@/components/custom-map"
import Image from "next/image"
import { BuyTab } from "@/components/buy/buy-tab"
import PropertyDetailsCard from "@/components/buy/propertyDetailsCard"
import BuyTable from "@/components/buy/buy-table"
import "yet-another-react-lightbox/styles.css"
import "yet-another-react-lightbox/plugins/thumbnails.css"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails"
import { useAppSelector } from "@/lib/lib/hooks"
import SkeletonLoader from "@/components/skeleton-loader"
import { PropCardLoader } from "@/components/buy/buy-property-card-loader"
import { HeroCarousel, HeroHighlights, ListingAgentCard } from "@/components/buy/preview-hero"
import { Badge } from "@/components/ui/badge"
import { useSelector } from "react-redux"

interface PropertyDetails {
  data: {
    schools: any[]
    propertyInfo?: any
  }
}

const ListingPreview = () => {
  const searchParams = useSearchParams()
  const propertyId = searchParams?.get("propertyId") || ""
  const listingId = searchParams?.get("listingId") || ""
  const [activeTab, setActiveTab] = useState("Statistics")
  const [proprtyData, setPropertyData] = useState([])
  const [tags, setTags] = useState<any>([])
  const [loading, setLoading] = useState(false)
  const [activeStatTab, setActiveStatTab] = useState(0)
  const [showAllSchools, setShowAllSchools] = useState(false)
  const [sortedSchools, setSortedSchools] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetails | null>(null)
  const property: any = useAppSelector((state: any) => state.property.property)
  const lineChartLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"]
  const propertyData = useSelector((state: any) => state.property.claimProperty);
  const lineChartData = [
    {
      label: "Average Sale Price",
      data: [1.47, 1.48, 1.49, 1.48, 1.49, 1.51, 1.55],
      fill: false,
      borderColor: "#000000",
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 0,
    },
  ]
  const lineChartOptions: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value) => {
            const numericValue = typeof value === "string" ? Number.parseFloat(value) : value
            return `$${numericValue.toFixed(2)}m`
          },
          font: {
            size: 14,
            weight: "bold",
          },
          padding: 30,
        },
      },
    },
  }
  const displayedSchools = showAllSchools ? sortedSchools : sortedSchools.slice(0, 3)
  const getPropertyDetails = async () => {
    try {
      setLoading(true)
      setPropertyData([])
      const payload = {
        listingId: +listingId,
        propertyId: +propertyId,
      }
      const response = await fetch(PROPERTY_DETAIL_SEARCH_AI_URL || "http://13.60.114.186:9000/api/search/preference", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()
      
      setPropertyData(data?.data)
      setTags(data?.data?.tags)
      setPropertyDetails(data?.property_detail)
    } catch (error) {
      console.log("error : ", error)
    }
    setLoading(false)
  }

  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index)
    setIsOpen(true)
  }

  const transformData = React.useMemo(() => {
    const prop: any = propertyData?.mls_data?.data
    return {
      display: true || Boolean(Object.keys(prop).length),
      prop,
    }
  }, [propertyId,propertyData])

  const images = React.useMemo(() => {
    if (transformData.prop?.media?.photosList?.length) {
      return transformData.prop.media.photosList.map((img: any) => ({
        src: img?.highRes,
        alt: "Property Image",
      }))
    }
    return [
      {
        src: transformData.prop?.media?.primaryListingImageUrl,
        alt: "Property Image",
      },
    ]
  }, [transformData.prop?.media])

  // useEffect(() => {
  //   if (propertyId && listingId) {
  //     getPropertyDetails()
  //   }
  // }, [propertyId])  

  return (
    <>
      {/* <ItemNav cardRef={cardRef} /> */}
      <div className=" " />
      <div className="flex flex-col p-6 px-20 min-h-screen">
        {loading ? (
          <div className="grid grid-flow-row place-items-center gap-3 sm:gap-4 md:gap-6 md:h-[28rem] md:grid-cols-12 md:gap-7 animate-pulse px-4 sm:px-6 md:px-0">
            <SkeletonLoader className="h-[200px] sm:h-[250px] md:h-[392px] w-full bg-gray-200 md:col-span-9 rounded-lg" />
            <div className="h-[200px] sm:h-[250px] md:h-[392px] w-full md:col-span-3">
              <PropCardLoader className="h-full w-full rounded-lg shadow-lg" />
            </div>
          </div>
        ) : transformData.display ? (
          <div className="grid grid-flow-row gap-1 sm:gap-4 md:gap-6 md:grid-cols-12 md:gap-7 transition-all duration-300 ease-in-out px-4 sm:px-6 md:px-0 flex-grow">
            <HeroCarousel
              className="h-[250px] sm:h-[280px] md:h-[32rem] md:col-span-9 rounded-lg shadow-lg overflow-hidden"
              imageURLs={
                transformData.prop?.media?.photosList?.length
                  ? transformData.prop?.media?.photosList?.map((img: any) => img) || [""]
                  : [{ highRes: transformData.prop?.media?.primaryListingImageUrl }]
              }
              onImageClick={handleImageClick}
            />
            <div className="md:col-span-3 ms-6 md:ms-0   mr-0 md:mr-4 transition-all duration-300 ease-in-out w-full md:w-auto">
              <div className="sticky md:top-24 relative">
                <ListingAgentCard
                  agentName={`${transformData?.prop?.mostRecentBrokerAgent || "Snaphomz Agent"}`}
                  className="h-fit w-full md:w-[20rem] shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
                
                <HeroHighlights
                  className="h-fit mt-2  w-full md:w-[20rem] shadow-lg hover:shadow-xl transition-shadow duration-300"
                  id={propertyId}
                  propertyId={propertyId}
                  listingId={listingId}
                  mortgageDisable={true}
                />
              </div>
            </div>
            <div className="md:col-span-9 md:-mt-4">
            <div className='mt-2 flex flex-col sm:flex-row w-full justify-between items-start sm:items-center gap-3 sm:gap-4 md:gap-0'>
              <div className="space-y-2 w-full sm:w-auto">
                <div className='inline-flex flex-wrap items-center gap-2 sm:gap-3'>
                  <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900'>{`$ ${transformData.prop?.listPrice && transformData.prop?.listPrice.toLocaleString('en-US') || 0}`}</h2>
                  <Badge
                    variant='outline'
                className='h-max border-[#E9FFCC] bg-[#E9FFCC] text-green-500 px-3 sm:px-4 md:px-8 hover:bg-[#E9FFCC] transition-colors duration-200'
                  >
                    {transformData?.prop?.standardStatus || "N/A"}
                  </Badge>
                </div>
{/* 
                <h4 className='py-1 sm:py-2 text-base sm:text-lg md:text-xl font-medium leading-5 sm:leading-6 text-gray-800'>
                  {transformData?.prop?.courtesyOf || "N/A"}
                </h4> */}
                <p className='truncate text-clip text-xl font-bold sm:text-base text-gray-600 leading-5 sm:leading-6'>{`${transformData.prop?.address?.unparsedAddress}, ${transformData.prop?.address?.city}, ${transformData.prop?.address?.stateOrProvince}, ${transformData.prop?.address?.zipCode} ` || transformData.prop?.listingAgent?.fullName || "N/A"}</p>
              </div>
              <div className='flex justify-between gap-x-2 sm:gap-x-4 md:gap-x-10 border-y-[1px] border-y-[#EAEAEA] py-3 sm:py-4 md:py-6 px-2 sm:px-3 md:px-4 rounded-lg bg-white shadow-sm w-full sm:w-auto'>
                <div className='text-center'>
                  <h2 className='text-lg sm:text-xl md:text-2xl font-bold text-gray-900'>
                    {transformData.prop?.property?.bedroomsTotal || 0}
                  </h2>
                  <span className='text-xs sm:text-sm text-gray-500'>
                    {transformData.prop?.property?.bedroomsTotal || 0 > 1
                      ? 'Bedrooms'
                      : 'Bedroom'}
                  </span>
                </div>
                <div className='flex-1 border-x-[1px] border-x-gray-200 px-2 sm:px-3 md:px-6 text-center'>
                  <h2 className='text-lg sm:text-xl md:text-2xl font-bold text-gray-900'>
                    {transformData.prop?.property?.bathroomsTotal || 0}
                  </h2>
                  <span className='text-xs sm:text-sm text-gray-500'>
                    {transformData?.prop?.property?.bathroomsTotal || 0 > 1
                      ? 'Bathrooms'
                      : 'Bathroom'}
                  </span>
                </div>

                <div className='text-center'>
                  <h2 className='text-lg sm:text-xl md:text-2xl font-bold text-gray-900'>
                    {transformData.prop?.property?.livingArea || "N/A"}
                  </h2>
                  <span className='text-xs sm:text-sm text-gray-500'>
                    $&nbsp;{transformData.prop?.pricePerSqFt || "N/A"}
                    &nbsp;(Price per sq.ft)
                  </span>
                </div>
              </div>
            </div>

            <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 md:gap-x-3 py-3 sm:py-4'>
              <button className='flex border border-orange-300  h-max flex-1 items-center gap-x-2 rounded-lg  px-3 sm:px-4 py-2.5 sm:py-3 text-left font-light text-gray-800 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50'>
                <Image
                  alt='bed'
                  height={20}
                  width={24}
                  className="sm:h-6 sm:w-6"
                  src='/assets/images/bed-black.svg'
                />
                <p className='text-sm font-semibold'>{transformData.prop?.property?.propertyType || "N/A"}</p>
              </button>
              <button className='flex h-max  border border-orange-300  flex-1 items-center gap-x-2 rounded-lg  px-3 sm:px-4 py-2.5 sm:py-3 text-left font-light text-gray-800 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50'>
                <Image
                  alt='bed'
                  height={20}
                  width={20}
                  className="sm:h-6 sm:w-6"
                  src='/assets/images/calendar.svg'
                />
                <p className='text-sm font-semibold'>Built in {transformData.prop?.property?.yearBuilt}</p>
              </button>
              <button className='flex h-max border border-orange-300  flex-1 items-center gap-x-2 rounded-lg  px-3 sm:px-4 py-2.5 sm:py-3 text-left font-light text-gray-800 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50'>
                <Image
                  alt='bed'
                  height={20}
                  width={20}
                  className="sm:h-6 sm:w-6"
                  src='/assets/images/area-black.svg'
                />
                     <p className='text-sm font-semibold'>{`${transformData.prop?.property?.livingArea || "N/A"}`}</p>
                {/* <p className='text-sm sm:text-base md:text-lg'>{`${transformData.prop?.property?.livingArea || "N/A"} ${transformData.prop?.property?.lotSizeSquareFeet}`}</p> */}
              </button>
            </div>
              {/* <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 py-3 sm:py-4">
                {tags?.length &&
                  tags?.slice(0, 3).map((tag: any, idx: any) => (
                    <button
                      key={idx}
                      className="flex h-max flex-1  items-center gap-x-2 rounded-lg bg-slate-100 px-3 sm:px-4 py-2.5 sm:py-3 text-left font-light text-gray-800 shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50"
                    >
                      <p className="ext-sm font-bold">{tag}</p>
                    </button>
                  ))}
              </div> */}
              {/** BREAK LINE */}
              <span className="block h-[.8px] w-full bg-grey-850"></span>

              <div className="space-y-3 sm:space-y-4 py-4 sm:py-6 md:py-8 text-justify text-sm sm:text-base">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">About This Home</h2>
                {transformData?.prop?.publicRemarks?.length > 0 && (
                  <p className="whitespace-pre-line text-sm sm:text-base leading-relaxed">
                    {transformData?.prop?.publicRemarks}
                  </p>
                )}
              </div>
              {/** BREAK LINE */}
              <span className="block h-[.8px] w-full bg-grey-850"></span>

              {/** LOCATION */}
              <section className="py-4 sm:py-6 md:py-8" id="location">
                <div className="pb-3 sm:pb-4 md:pb-8">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Location</h1>
                  <div className="flex items-center gap-x-1 py-1 sm:py-2 md:py-4 text-sm">
                    <span></span> <span></span> <span></span>{" "}
                  </div>
                </div>

                <div>
                  <div className="h-[200px] sm:h-[250px] md:h-[350px] rounded-lg overflow-hidden">
                    <CustomMap
                      coord={[
                        {
                          lat: parseFloat(transformData.prop?.property?.latitude) || 36.778,
                          lng: parseFloat(transformData.prop?.property?.longitude) || -119.417,
                          id: transformData?.prop?.id,
                          price: transformData.prop?.listPrice,
                        },
                      ]}
                      height="100%"
                      zoom={18}
                    />
                  </div>
                </div>
              </section>

              {/** SCHOOLS NEARBY */}
              {
  Object.keys(propertyDetails?.data.schools || {}).length ? (
    <section id="schools" className="my-4 sm:my-6 md:my-8 w-full overflow-x-auto">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Schools Near by</h2>
      </div>

      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
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

              {/** FEATURES or PROPERTY */}
              {transformData?.prop?.homeFeature ? (
                <section id="property" className="py-4 sm:py-6 md:py-8">
                  <h2 className="py-3 sm:py-4 md:py-6 text-lg sm:text-xl md:text-2xl font-bold">Home Features</h2>
                  <div className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 text-sm text-grey-350">
                    <NewFeatureCard features={property?.features || []} />
                  </div>
                </section>
              ) : (
                <></>
              )}

              {/** PROPERTY ANALYSIS */}
              <section id="analysis" className="my-4 sm:my-6 md:my-8">
                <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl md:text-2xl font-bold">Property Analysis</h2>
                <div className="w-full">
                  <BuyTab />
                </div>
              </section>

              {/* {propertyDetails?.data?.propertyInfo && (
                <section id="property-details" className="py-4 sm:py-6 md:py-8">
                  <PropertyDetailsCard data={propertyDetails?.data} />
                </section>
              )} */}

              
              {/* <h2 className="my-6 text-xl font-bold text-black">Property Analytics</h2>
              <section className="mb-8 flex w-full items-center justify-between border-b border-solid border-[#707070]">
                {["Statistics", "Property Projections", "Payment Calculation"].map((item) => (
                  <section
                    onClick={() => setActiveTab(item)}
                    className={`${activeTab === item && "boder-solid border-b-4 border-black"} px-5 pb-3`}
                    key={item}
                  >
                    <p className="text-md font-bold">{item}</p>
                  </section>
                ))}
              </section>
              <h2 className="text-lg font-medium">Estimated Home Value</h2>
              <p className="mb-8 text-md font-medium text-grey-230">Range of Values: $1,473,000 - $1,554,412</p>
              <section className="border-[#707070} mb-12 flex w-full items-center justify-between border-b border-solid">
                {[
                  { name: "Average Sale Price", value: "$1,518,000" },
                  { name: "Homes Sold", value: "6" },
                  { name: "Sale-to-list", value: "107.3%" },
                ].map((item, i) => (
                  <section
                    onClick={() => setActiveStatTab(i)}
                    className={`${
                      activeStatTab === i && "boder-solid border-b-4 border-black bg-grey-550"
                    } w-full px-5 py-3`}
                    key={i}
                  >
                    <p className="text-lg font-bold">{item.value}</p>
                    <p className="text-xs font-medium text-grey-450">{item.name}</p>
                  </section>
                ))}
              </section>
              <SellerLineChart labels={lineChartLabels} datasets={lineChartData} options={lineChartOptions} /> */}
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
          <div className="h-full w-full">{notFound()}</div>
        )}
      </div>
    </>
  )
}

export default ListingPreview
