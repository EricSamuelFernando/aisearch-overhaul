'use client';

import { useForm } from '@mantine/form';

import useAddProperty from '../../../hooks/api/user/useAddProperty';
import Heading from '@/components/heading';
import Places from './places-search';
import { storeCookie } from '../../../lib/storage';
import { PROPERTY_SEARCH_AI_URL, USER_ROLE } from '../../../shared/constants/env';
import { Button } from '@/components/ui/button';
import { ButtonLoader } from '@/components/loader';
import {
  IPropertyAgent,
  ISeller,
  PropertyDocument,
} from '@/interfaces/property.interface';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { error, success } from '@/components/alert/notify';
import { useAppDispatch } from '@/lib/hook';
import { setClaimProperty, setPropertyQuery } from '@/slices/property/property-slice';
import { useRouter } from 'next/navigation';
import SearchComponent from '@/components/search-component';
import { useMLSProperties } from '@/hooks/api/property/useMLSProperties';
import Image from 'next/image';
import PropertyCardLists from '@/components/buy/browse/property-card-list';
import { formatCurrency } from '@/lib/utils';
import { imageLoader } from '@/utils/image-loader';
import { Pagination } from '@mantine/core';

interface IPropertyAddressDetails {
  formattedAddress: string;
  latitude: string;
  longitude: string;
  placeId: string;
  streetNumber: string;
  streetName: string;
  city: string;
  province: string;
  state: string;
  postalCode: string;
  country: string;
}
interface Price {
  amount: number;
  currency: string;
}

interface Broker {
  agent: string;
  role: string;
  _id: string;
}
interface Feature {
  feature: string;
  icon: string;
  description: string;
  _id?: string;
}

interface PropertyTax {
  amount: number;
  currency: string;
  dateSeen: string[];
  _id: string;
}

interface Status {
  status: string;
  eventTime: string;
  _id: string;
}

export interface Property {
  propertyAddressDetails: IPropertyAddressDetails;
  images: { url: string }[];
  propertyDocument: PropertyDocument[];
  propertyName: string;
  longitude: string;
  latitude: string;
  price: Price;
  propertyType: string;
  propertyDescription: string;
  videos: { url: string }[];
  lotSizeValue: string;
  lotSizeUnit: string;
  numBathroom: string;
  numBedroom: string;
  yearBuild: number | null;
  _id: string;

  listed: boolean;
  currentStatus: string;
  seller?: ISeller;
  sellerAgentAcceptance: boolean;
  buyerAgentAcceptance: boolean;
  brokers: Broker[];
  features: Feature[];
  propertyTaxes: PropertyTax[];
  status: Status[];
  createdAt: string;
  updatedAt: string;
  sellerAgent?: IPropertyAgent;
  buyerAgent?: IPropertyAgent;
}

type EmptyListingProp = {
  title?: string;
};
export const EmptyListing = ({ title }: EmptyListingProp) => {
  const [address, setAddress] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState(true)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showButton, setShowButton] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isFetching, setIsFetching] = useState(false)
  const router = useRouter()
  const { mutatePropertySearch, status: propertySearchStatus, data } = useMLSProperties()

  const form = useForm({
    initialValues: {
      address: '',
    },
  });

  const onPressItem = (item: any) => {
    setSelectedItem(item)
    setSearchTerm(item?.listing?.address?.unparsedAddress || '')
    setShowDropdown(false)
    setShowButton(true)
  }

  // const handleClaimHome = async () => {
  //   setLoading(true);
  //   try {
  //     const body = {
  //       address: address,
  //     }
  //     const response = await axios.post(
  //       `${PROPERTY_SEARCH_AI_URL}/address` || 'http://13.60.114.186:9000/api/search/address',
  //       body
  //     );
  //     if (response.data?.result.records?.length) {
  //       success({
  //         message: 'Found the property that matches your criteria',
  //       });
  //       dispatch(setClaimProperty(response.data?.result.records?.[0]));
  //       router?.push(`/dashboard/seller/listing/listing-empty`);
  //     } else {
  //       error({
  //         message: 'Property not found',
  //       });
  //     }
  //     // dispatch(setPropertyQuery(response.data?.result.search_query));
  //     // addProperties(response.data?.result.records);
  //   } catch (err: any) {
  //     console.error("Search request failed:", err);
  //     error({
  //       message:
  //         err?.response?.data?.error || "An unexpected error occurred.",
  //     });
  //   } finally {
  //     setLoading(false)
  //   }
  // }


  // Trigger property search when search term changes
  useEffect(() => {
    if (searchTerm) {
      setIsFetching(true)
      mutatePropertySearch(searchTerm)
      // Trigger search with the term
    } else {
      setIsFetching(false)
    }
  }, [searchTerm, mutatePropertySearch])





  const AddProperty = useAddProperty();

  return (
    <section className='w-full py-16 '>
      <div className='container mx-auto text-center'>
        <Heading
          className='mb-14 text-center text-4xl font-semibold'
          title={title || 'Listing Dashboard'}
        />

        <div className='relative w-full'>



          <SearchComponent
            onSearch={setSearchTerm} // Update search term
            inputSearchString={searchTerm}
            loading={isFetching}
            className='w-full'
          />

          {
              data ? <PaginatedGrid data={data} /> :""
          }

          {/* <div className="flex w-full  flex-wrap">{
             (showDropdown && data) ? (
              < >
             {Array.isArray(data) && data.map((props, index) => (

<div
 onClick={() => onPressItem(props)}
className="flex w-[300px] min-h-[520px] max-h-[520px] cursor-pointer flex-col overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl bg-white border border-gray-100 hover:border-ocOrange hover:scale-[1.02] group"
>

<div className="relative h-60 w-full overflow-hidden">
  
    <div className="relative h-full w-full">
      <Image
        className="h-full w-full object-cover object-center"
        fill
        loader={imageLoader}
        alt="snaphomz-property-image"
        src={
          parseInt(props?.listing?.media?.photosCount) > 0
            ? props?.listing?.media?.primaryListingImageUrl
            : '/assets/images/placeholder.svg'
        }
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = '/assets/images/placeholder.svg';
        }}
      />
      <div className="absolute top-3 left-3 bg-ocOrange px-2 py-1 rounded-md">
        <span className="text-white text-xs font-bold">{props?.listing?.standardStatus}</span>
      </div>
    </div>
  
</div>


<div className="flex flex-1 flex-col justify-between p-5 space-y-4 group-hover:bg-gray-50 transition-colors duration-300">

  <div className="flex items-center justify-between">
    <h3 className="text-2xl font-bold text-gray-900 group-hover:text-ocOrange transition-colors duration-300">
      {formatCurrency(props?.listing?.listPriceLow || 0, 'USD')}
    </h3>
  </div>


  <p className="text-base text-gray-600 line-clamp-2">
    <span className="font-medium">{props?.listing?.address?.unparsedAddress}</span>,{' '}
    {props?.listing?.address?.city}, {props?.listing?.address?.stateOrProvince}{' '}
    {props?.listing?.address?.zipCode}
  </p>


  <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100">
    {[
      {
        icon: 'bed.svg',
        iconAlt: '🛏️',
        value: props?.listing?.property?.bedroomsTotal || 0,
        unit: 'Bed',
      },
      {
        icon: 'bathroom-white.svg',
        iconAlt: '🚿',
        value: props?.listing?.property?.bathroomsTotal || 0,
        unit: 'Bath',
      },
      {
        icon: 'area-white.svg',
        iconAlt: '📏',
        value: props?.listing?.property?.livingArea || 0,
        unit: props?.listing?.pricePerSqFt || 'sqft',
      },
    ].map((item, index) => (
      <div
        key={index}
        className={
          index === 1
            ? 'flex flex-1 flex-col items-center justify-center px-4'
            : 'flex flex-col items-center'
        }
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{item.iconAlt}</span>
          <span className="text-base font-semibold text-gray-800">{item.value}</span>
        </div>
        <span className="text-xs text-gray-500">{item.unit}</span>
      </div>
    ))}
  </div>
</div>
</div> 
         <div
           onClick={() => onPressItem(item)}
           key={index}
           className="p-2 cursor-pointer items-center flex gap-2 text-left hover:bg-gray-100"
         >
           <Image
             src={item?.listing?.media?.primaryListingImageUrl}
             alt=""
             width={60}
             height={40}
             className="rounded-md w-28 h-20"
           />
           <p className="text-sm font-bold">
             {item?.listing?.address?.unparsedAddress}
           </p>
         </div>
       ))}
            </>
             )
             :""
            }
         </div> */}

        </div>
        {/* {showButton && (
        <Button
          className="text-white bg-black font-medium text-base mt-6 w-44"
          type="submit"
          disabled={!selectedItem}
          onClick={handleSubmit}>
          Claim home
        </Button>
      )} */}

        {/* <form
          onSubmit={form.onSubmit((values) => console.log(values))}
          className='text mx-auto mt-4 flex flex-col items-center text-center md:w-[500px]'
        >
          <div className='my-6 w-full'>
            <Places setFilter={AddProperty?.setFilter} setAddress={setAddress} />
          </div> 

           <Button
            onClick={() => {
              handleClaimHome()
              storeCookie({ key: USER_ROLE, value: 'seller' });
              // AddProperty?.addPropertyMutation.mutate();
            }}
            disabled={loading}
            type='submit'
            roundness='full'
          >
            {AddProperty?.addPropertyMutation.isPending ? (
              <ButtonLoader />
            ) : null}
            Claim a Home
          </Button>
        </form> */}


      </div>
    </section>
  );
};





const ITEMS_PER_PAGE = 8; // 4 cols * 2 rows

const PaginatedGrid = ({ data }:any) => {
  const [currentPage, setCurrentPage] = useState(1);

  const dispatch = useAppDispatch();
  const router = useRouter()

  // Pagination logic
  const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = data.slice(startIndex, endIndex);


  const handleSubmit = async (data: any) => {
    console.log(data)
    dispatch(setClaimProperty(data));
    // success({ message: 'Found the property that matches your criteria',});
    router?.push(`/dashboard/seller/listing/listing-empty`);


  }


  return (
    <>
      <div className="grid mt-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
        {currentData.map((props: any, index: number) => (
          <div
            key={index}
            className="cursor-pointer flex flex-col overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl bg-white border border-gray-100 hover:border-ocOrange hover:scale-[1.02] group"
          >
            <div className="relative h-60 w-full overflow-hidden">
              <div className="relative h-full w-full">
                <Image
                  className="h-full w-full object-cover object-center"
                  fill
                  loader={imageLoader}
                  alt="snaphomz-property-image"
                  src={
                    parseInt(props?.listing?.media?.photosCount) > 0
                      ? props?.listing?.media?.primaryListingImageUrl
                      : '/assets/images/placeholder.svg'
                  }
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/images/placeholder.svg';
                  }}
                />
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-between p-4 space-y-2 group-hover:bg-gray-50 transition-colors duration-300">
              <p className="text-sm text-gray-600 line-clamp-2">
                <span className="font-medium">{props?.listing?.address?.unparsedAddress}</span>,{' '}
                {props?.listing?.address?.city}, {props?.listing?.address?.stateOrProvince}{' '}
                {props?.listing?.address?.zipCode}
              </p>

              <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100">
                {[
                  {
                    iconAlt: '🛏️',
                    value: props?.listing?.property?.bedroomsTotal || 0,
                    unit: 'Bed',
                  },
                  {
                    iconAlt: '🚿',
                    value: props?.listing?.property?.bathroomsTotal || 0,
                    unit: 'Bath',
                  },
                  {
                    iconAlt: '📏',
                    value: props?.listing?.property?.livingArea || 0,
                    unit: props?.listing?.pricePerSqFt || 'sqft',
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className={
                      index === 1
                        ? 'flex flex-1 flex-col items-center justify-center px-4'
                        : 'flex flex-col items-center'
                    }
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{item.iconAlt}</span>
                      <span className="text-base font-semibold text-gray-800">{item.value}</span>
                    </div>
                    <span className="text-xs text-gray-500">{item.unit}</span>
                  </div>
                ))}
              </div>

              <Button
                className="rounded-full"
                type="submit"
                onClick={() => handleSubmit(props)}
              >
                Claim home
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination Control */}
      {totalPages > 1 && (
        <div className="flex justify-center  mt-8">
          <Pagination
            total={totalPages}
            value={currentPage}
            onChange={setCurrentPage}
            size="md"
            color='orange'
            radius="xl"
            withControls
            withEdges
          />
        </div>
      )}
    </>
  );
};
