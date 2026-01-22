'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useSearchParams } from 'next/navigation';

import { EditPropertyFormProvider } from '@/providers/edit-property-context';
import { selectPropertyInformation } from '@/slices/verification/selectors/selectors';
import ListingProcess from '@/components/sell/listing-process';
import { SellerAPIs } from '@/hooks/api/seller';
import axios from 'axios';
import { AI_BACKEND_BASE_URI } from '@/shared/constants/env';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';
import { userData } from '@/slices/auth/auth.slice';

const SellerListingProcess: React.FC = () => {
  const [loading,setLoading] = useState(false);
  const params = useSearchParams()
  const id = params.get("id");

  const user = useSelector(userData);
  const property_info = useSelector(selectPropertyInformation);
  const [agentInfo , setAgentInfo] = useState<any>({})
  const propertyData = useSelector((state:any)=>state?.property?.claimProperty);
  const AI_SEARCH_ENDPOINT = process.env.NEXT_PUBLIC_AI_BACKEND_BASE_URI||"https://demo-ai.snaphomz.com" 
  const { 
    getClaimedPropertyByIdAPI
  } = SellerAPIs()

  console.log(propertyData)

  const getPropertyInfo = async () => {
    if (!user?.id || !propertyData?.id || !propertyData?.listingid) {
      console.error('Missing required data (user ID, property ID, or listing ID)');
      return;
    }
  
    try {
      const response = await axios.post(`${AI_SEARCH_ENDPOINT}/api/property_with_agent`, {
        owner_id: user.id,
        id: propertyData.id.toString(),
        listingid: propertyData.listingid.toString(),
      });
      console.log(response);
      setAgentInfo(response?.data?.data?.agent_info)
    } catch (e:any) {
      // Better error handling
      console.error('Error fetching property information:', e.response || e.message || e);
    }
  }
  

  useEffect(()=>{
    getPropertyInfo()
  },[])
  // const getPropertyInfo = async()=>{
  //   try{
  //     setPropertyData({});
  //     setLoading(true)
  //     getClaimedPropertyByIdAPI.mutateAsync(""+id,{
  //       onSuccess:(response:any)=>{
  //         console.log("Response :data : ",response);
  //         setPropertyData(response)
  //         setLoading(false)
  //       },
  //       onError:(error:any)=>{
  //         console.log(error);
          
  //       }
  //     })
  //   }catch(error){
  //     console.log(error);
  //     setLoading(false)
  //   }
  // }
  console.log(agentInfo)
  return (
    <>
      <EditPropertyFormProvider initialValues={property_info}>
        <ListingProcess link='' 
          propertyData={propertyData}
          agent={agentInfo}
        
        />
      </EditPropertyFormProvider>
    </>
  );
};

export default SellerListingProcess;
