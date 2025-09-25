import { useQuery } from '@tanstack/react-query';

import { handleAsync } from '@/lib/api/handleApiResponse';
import client from '@/lib/client';
import { AxiosResponse } from '@/types/axios.types';
import { SELLER_ANALYTICS } from '@/utils/apis';

const useGetSellerAnalytics = () => {
  return useQuery({
    queryKey: ['seller-analytics'],
    queryFn: () =>
      handleAsync<AxiosResponse<any>>(client.get, SELLER_ANALYTICS),
  });
};

export default useGetSellerAnalytics;
