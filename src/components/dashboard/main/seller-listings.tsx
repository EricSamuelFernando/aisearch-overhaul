'use client';

import React from 'react';

import Pagination from '@/components/card-pagination/pagination';

import client from '@/lib/client';
import { useRouter } from 'next/navigation';
import { homeEmpty } from '../../../../public/assets/images';
import { useSellerPropertiesContext } from '../../../providers/seller-property-context';
import { NewEmptyState } from './empty-state';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import { TransRoundedButton } from './TransRoundedButton';
import { setPropertyDetailsAction } from '@/slices/verification/propertyVerification';
import { useDispatch } from 'react-redux';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import DeletePropertyModal from '@/components/modals/deletePropertyModal';
import PageLoader from '@/components/PageLoader';
import { EmptyListing } from './empty-listing';
import Link from 'next/link';
import { PropertySnippet } from './property-snippet';
import { FavouriteModal } from './favourites-modal';
import { setClaimProperty } from '@/slices/property/property-slice';
import axios from 'axios';
import { success, error } from '@/components/alert/notify';
import SellPropertyCards from '@/components/sell/sell-property-card';

const deleteProperty = async (propertyId: string) => {
  return client.delete(`/property/delete/${propertyId}`);
};

export const SellerListings = (props: any) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = React.useState(false);
  const queryClient = useQueryClient();
  const { properties } = props;
  const { propertyData, filters, handlePageChange } =
    useSellerPropertiesContext();
  // const properties = propertyData?.data?.data?.data?.result || [];
  const total = propertyData?.data?.data?.data?.total || 0;
  const propertyCount = properties?.length;
  const AI_SEARCH_ENDPOINT = process.env.NEXT_PUBLIC_AI_BACKEND_BASE_URI || "https://demo-ai.snaphomz.com"
  const reduxDispatch = useDispatch();
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = React.useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = React.useState<any>(null);
  const mutation = useMutation({
    mutationFn: deleteProperty,
    onMutate: (propertyId) => {
      setIsDeleting(propertyId);
      setIsLoading(true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fetch-seller-properties'] });
      setIsLoading(false);
      success({ message: 'We’ve taken care of that property.' });
    },
    onError: (error) => {
      console.error('Failed to delete the property.', error);
      setIsLoading(false);
    },
    onSettled: () => {
      setIsDeleting(null);
      setIsLoading(false);
    },
  });


  const removeProperty = async (payload: { listingId: string; propertyId: string }) => {
    try {      
      setIsLoading(true);
      const listingId = parseInt(payload.listingId, 10);
      const propertyId = parseInt(payload.propertyId, 10);
      if (isNaN(listingId) || isNaN(propertyId)) {
        throw new Error("Invalid listingId or propertyId");
      }
      const response = await axios.post(`${AI_SEARCH_ENDPOINT}/api/delete_owner_seller_data`, {
        listingid: listingId,
        id: propertyId,
      });
      success({ message: 'Property removed successfully' })
      props?.setIsDeleted(true)
    } catch (err: any) {
      console.log("Error removing property:", err);
      error({ message: err?.response?.data?.message || err.message });
    } finally {
      setIsLoading(false);
    }
  };


  const handleDelete = (propertyId: string) => {

  };

  const openDeleteModal = (propertyId: any, listingId: any) => {
    setSelectedPropertyId(propertyId);
    setSelectedProperty(listingId)
  };



  const closeDeleteModal = () => {
    setSelectedPropertyId(null);
  };

  if (isLoading) {
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-white'>
        <PageLoader />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-white'>
        <PageLoader />
      </div>
    );
  }
  return (
    <section className='h-full'>
      {properties?.length === 0 ? (
        <EmptyListing title='Get Started' />
      ) : (
        <>
          {properties?.length ? (
            <div className='flex justify-end'>
              <Link
                onClick={() => {
                  router.push(`/dashboard/seller/listing/new`);
                }}
                type='submit'
                className='rounded-full bg-black px-4 py-2 text-center capitalize text-white'
                href={'/dashboard/seller/listing/new'}
              >
                Claim Another Home
              </Link>
            </div>
          ) : null}

          {!properties?.length ? (
            <div className='grid h-full place-content-center'>
              <NewEmptyState
                img={homeEmpty}
                description={'You have not created any listing yet'}
                ctaText='Create a listing'
                link={`/dashboard/seller/listing/new`}
                showCTA
              />
            </div>
          ) : null}

          <div className='px-10'>
            <div className='py-10'>
              <h1 className='text-center text-5xl font-medium 2xl:text-6xl'>
                Listing Dashboard
              </h1>
            </div>

            <div className='mb-10 mt-12 grid items-center justify-between gap-12 transition duration-700 ease-in md:grid-cols-2 lg:grid-cols-3'>
              {[...properties].reverse()?.map((item: any) => {
                const status = item.status?.toLowerCase();

                const isEditEnabled =
                  status === 'under contract' ||
                  status === 'verified' ||
                  status === 'now showing';

                return (
                  <SellPropertyCards
                    propertyData={item?.mls_data?.data}
                    isEditEnabled={isEditEnabled}
                    isDeleting={isDeleting}
                    openDeleteModal={openDeleteModal}
                    id={item?.id}
                    listing_id={item?.listingid}
                    openClick={() => {
                      const updatedItem = {
                        ...item,
                        imageUrl:
                          (item.images && item.images[0]?.url) ||
                          '/assets/icons/defaultImage.svg',
                      };
                      dispatch(setClaimProperty(item))
                      reduxDispatch(setPropertyDetailsAction(updatedItem));
                      router.push(
                        `/dashboard/seller/listing/listingprocess?id=${item?.id}`,
                      );
                    }}
                  />
                  // <FavouriteModal
                  //   property={{
                  //     name:item?.mls_data?.data?.coucourtesyOf,
                  //     image:item?.mls_data?.data?.media?.primaryListingImageUrl,
                  //     price:item?.mls_data?.data?.listPrice,
                  //     address:item?.mls_data?.data?.address?.unparsedAddress
                  //     }}
                  // >
                  //   <div className='mt-10 flex items-center justify-center gap-3'>
                  //     <TransRoundedButton
                  //       label='Open'
                  //       onClick={() => {
                  //         const updatedItem = {
                  //           ...item,
                  //           imageUrl:
                  //             (item.images && item.images[0]?.url) ||
                  //             '/assets/icons/defaultImage.svg',
                  //         };
                  //         dispatch(setClaimProperty(item))
                  //         reduxDispatch(setPropertyDetailsAction(updatedItem));
                  //         router.push(
                  //           `/dashboard/seller/listing/listingprocess?id=${item?.id}`,
                  //         );
                  //       }}
                  //       variant='primary'
                  //       className='w-[30%] py-2'
                  //     />

                  //     <TransRoundedButton
                  //       label='Edit'
                  //       onClick={() =>
                  //         router.push(
                  //           `/dashboard/seller/listing/edit?id=${item?.id}`,
                  //         )
                  //       }
                  //       variant='secondary'
                  //       className={`w-[30%] py-2 ${
                  //         isEditEnabled
                  //           ? 'text-white'
                  //           : 'cursor-not-allowed opacity-50'
                  //       }`}
                  //       disabled={!isEditEnabled}
                  //     />

                  //     <TransRoundedButton
                  //       label={
                  //         isDeleting === item?.id ? 'Removing...' : 'Remove'
                  //       }
                  //       onClick={() => openDeleteModal(item)}
                  //       variant='danger'
                  //       className='w-[30%] py-2'
                  //       disabled={isDeleting === item?.id}
                  //       loading={isDeleting === item?.id}
                  //     />
                  //   </div>
                  // </FavouriteModal>
                );
              })}
            </div>

            <Pagination
              totalPages={Math.ceil(total / filters.limit!)}
              onPageChange={(page) => {
                handlePageChange(+page);
              }}
              currentPage={+filters.page!}
              totalItems={total}
              itemsPerPage={+filters.limit!}
            />
          </div>
        </>
      )}

      {selectedPropertyId && (
        <DeletePropertyModal
          onClose={closeDeleteModal}
          onProceed={() => removeProperty({ propertyId: selectedPropertyId, listingId: selectedProperty })}
        />
      )}
    </section>
  );
};
