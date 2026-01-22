import client from '@/lib/client';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { removeFalsyValues } from '@/lib/utils';

interface Mobile {
  number_body: string;
  mobile_extension: string;
  raw_mobile: string;
  _id: string;
}

interface Agent {
  connectedUsers: {
    default: [];
  };
  completedOnboarding: boolean;
  _id: string;
  email: string;
  verification_code: string;
  token_expiry_time: null | string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
  firstname: string;
  fullname: string;
  lastname: string;
  licence_number: string;
  mobile: Mobile;
  region: string;
}

interface SearchResult {
  message: string;
  data: {
    result: Agent[];
    total: number;
    page: number;
    limit: number;
  };
  success: boolean;
}

const fetchAgents = async (
  search: string,
  limit: number,
  page: number,
): Promise<SearchResult> => {
  // API call removed - returning empty response to prevent multiple calls
  return {
    message: '',
    data: {
      result: [],
      total: 0,
      page: page,
      limit: limit,
    },
    success: true,
  } as SearchResult;
};

const useAgentsSearch = (search: string, limit: number, page: number) => {
  return useQuery({
    queryKey: ['user-agents', 'agents', search, limit, page],
    queryFn: () => fetchAgents(search, limit, page),
    placeholderData: keepPreviousData,
    enabled: false, // Disabled to prevent multiple API calls on all pages
  });
};

export default useAgentsSearch;
