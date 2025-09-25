import { handleAsync } from '@/lib/api/handleApiResponse';
import { AxiosResponse } from '@/types/axios.types';
import { IAuthUser } from '@/types/user.types';
import { PLACES_URL } from '@/utils/apis';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import client from '../../lib/client';

export const useFetchPlace = () => {
  const [location, setLocation] = useState<string>('');

  const addressInfo = useQuery({
    queryKey: ['address-info', location],
    queryFn: () => {
      return handleAsync<AxiosResponse<IAuthUser>>(
        client.get,
        `${PLACES_URL}&location=${location}`,
      );
    },
  });

  return {
    addressInfo,
    location,
    setLocation,
  };
};
