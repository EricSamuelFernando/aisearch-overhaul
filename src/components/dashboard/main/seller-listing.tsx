'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { EmptyListing } from '@/components/dashboard/main/empty-listing';
import { SellerListings } from './seller-listings';
import { nanoid } from 'nanoid';
import { Fragment } from 'react';
import { PropCardLoader } from '../../buy/buy-property-card-loader';
import { useSellerPropertiesContext } from '@/providers/seller-property-context';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import { useQueryClient } from '@tanstack/react-query';
import { SellerAPIs } from '@/hooks/api/seller';
import { useSelector } from 'react-redux';
import { userData } from '@/slices/auth/auth.slice';
import axios from 'axios';
import { success,error } from '@/components/alert/notify';

type Props = {};

function SellerListing({}: Props) {
  const {getClaimedPropertyAPI} = SellerAPIs()
  const { currentUser } = useCurrentUser();
  const queryClient = useQueryClient();
  const user = useSelector(userData);
  const [properties,setProperties] = useState([]);
  const [loading,setloading] = useState(false);
  const { propertyData } = useSellerPropertiesContext();
  // const loading = propertyData.isLoading || propertyData.isFetching;
  const propertyCount = propertyData.data?.data?.data?.result.length; 
  const AI_SEARCH_ENDPOINT = process.env.NEXT_PUBLIC_AI_BACKEND_BASE_URI||"https://demo-ai.snaphomz.com" 
  const [isDeleted , setIsDeleted] = useState(false)
  const getAllProperties = ()=>{
    setloading(true);
    getClaimedPropertyAPI.mutateAsync(user?.id,{
      onSuccess:(response)=>{
        setProperties(response);
        setloading(false)
      },
      onError:(error)=>{
        console.log(error);
        setloading(false);
      }
    })
  }

  const getSellerProperties = async()=>{
    try{
      setloading(true)
      const response = await axios.get(`${AI_SEARCH_ENDPOINT}/api/v2/get_owner_data?owner_id=${user?.id}`);
      setProperties(response?.data);
    }catch(err: any){
      console.log("Error : ",err);
      error({message:err?.response?.data?.message})
    }
    setloading(false)
  }

  const removeProperty = async (payload: { listingId: string; propertyId: string }) => {
    try {
      setloading(true);
  
      // Convert string IDs to integers
      const listingId = parseInt(payload.listingId, 10);
      const propertyId = parseInt(payload.propertyId, 10);
  
      if (isNaN(listingId) || isNaN(propertyId)) {
        throw new Error("Invalid listingId or propertyId");
      }
  
      // Make the API call to remove the property (adjust method and endpoint as needed)
      const response = await axios.post(`${AI_SEARCH_ENDPOINT}/api/remove_property`, {
        listingId,
        propertyId,
      });  
      // Optionally update properties state here, e.g., refetch or remove locally
      // await getSellerProperties(); // refresh properties after removal
  
    } catch (err: any) {
      console.log("Error removing property:", err);
      error({ message: err?.response?.data?.message || err.message });
    } finally {
      setloading(false);
    }
  };
  

  useEffect(()=>{
    if(user?.id){
      getSellerProperties();
      // getAllProperties()
    }
  },[user?.id , isDeleted])
  useEffect(() => {
    if (currentUser) {
      queryClient.invalidateQueries({ queryKey: ['fetch-seller-properties'] });
    }
  }, [currentUser, queryClient]);  
  return (
    <section>
      {loading ? (
        <div
          className={cn(
            'grid w-full grid-cols-1 place-items-center gap-8 md:grid-cols-2 lg:grid-cols-3',
          )}
        >
          {Array.from({ length: 6 }).map(() => (
            <PropCardLoader key={nanoid()} className='w-full' />
          ))}
        </div>
      ) : (
        <Fragment>
          {!properties?.length ? (
            <EmptyListing />
          ) : (
            <SellerListings 
              properties={properties}
              setIsDeleted={setIsDeleted}
            />
          )}
        </Fragment>
      )}
    </section>
  );
}

export default SellerListing;
