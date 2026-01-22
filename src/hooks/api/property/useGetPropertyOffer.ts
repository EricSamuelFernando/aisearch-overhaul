import client, { pickErrorMessage, pickResult } from '@/lib/client';
import { useQuery } from '@tanstack/react-query';

const getPropertyOffer = async (id: string) => {
  // API call completely disabled - /property/user/property-offer/{id} will NOT be called
  // Original API call commented out:
  // return await client
  //   .get(`property/user/property-offer/${id}`)
  //   .then(pickResult, pickErrorMessage);
  
  // Returning empty response to prevent any network requests
  return {
    success: true,
    message: '',
    data: null,
  };
};

export const useGetPropertyOffer = (id: string) => {
  return useQuery({
    queryKey: ['propertyOffer'],
    queryFn: () => getPropertyOffer(id),
    enabled: false, // Completely disabled - will NOT execute even if refetched
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};
