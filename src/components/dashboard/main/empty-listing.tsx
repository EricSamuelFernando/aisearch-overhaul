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
import { useState } from 'react';
import axios from 'axios';
import { error, success } from '@/components/alert/notify';
import { useAppDispatch } from '@/lib/hook';
import { setClaimProperty } from '@/slices/property/property-slice';
import { useRouter } from 'next/navigation';

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
  const router = useRouter()
  const dispatch = useAppDispatch();
  const form = useForm({
    initialValues: {
      address: '',
    },
  });

  const handleClaimHome = async () => {
    setLoading(true);
    try {
      const body = {
       address,
      }
      const response = await axios.post(
        `${PROPERTY_SEARCH_AI_URL}/address` || 'https://demo-ai.snaphomz.com/api/search/address',
        body
      );
      console.log("Response : ", response);
      if (response?.data?.searchAddressResult?.data) {
        success({
          message: 'Found the property that matches your criteria',
        });

        const property = response?.data?.searchAddressResult?.data
        const extraInfoProperty = response?.data?.mlsDetailResult?.data
        console.log(property , extraInfoProperty?.media?.primaryListingImageUrl)
        const payload = {
          ...property,
          ...extraInfoProperty,
          public: {
            primaryListingImageUrl: extraInfoProperty?.media?.primaryListingImageUrl
          },
          listing: {
            courtesyOf: property.propertyInfo?.address?.address,
            listPriceLow: property.estimatedValue,
            address: {
              unparsedAddress: property.propertyInfo?.address?.address
            },
            property: {
              bedroomsTotal: property.propertyInfo?.bedrooms,
              bathroomsTotal: property.propertyInfo?.bathrooms,
              pricePerSqFt: ''
            }
          }
        }
        dispatch(setClaimProperty(payload));
        router?.push(`/dashboard/seller/listing/listing-empty`);
      } else {
        error({
          message: 'Property not found',
        });
      }
      // dispatch(setPropertyQuery(response.data?.result.search_query));
      // addProperties(response.data?.result.records);
    } catch (err: any) {
      console.error("Search request failed:", err);
      error({
        message:
          err?.response?.data?.error || "An unexpected error occurred.",
      });
    } finally {
      setLoading(false)
    }
  }



  const AddProperty = useAddProperty();

  return (
    <section className='w-full py-16'>
      <div className='container mx-auto text-center'>
        <Heading
          className='mb-14 text-center text-4xl font-semibold'
          title={title || 'Listing Dashboard'}
        />

        <form
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
        </form>
      </div>
    </section>
  );
};