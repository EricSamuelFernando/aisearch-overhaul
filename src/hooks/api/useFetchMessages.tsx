import { handleAsync } from '@/lib/api/handleApiResponse';
import { AxiosResponse } from '@/types/axios.types';
import {
  ADD_USER_MESSAGE_CHAT,
  GET_USER_MESSAGES,
  GET_USER_MESSAGE_CHAT,
} from '@/utils/apis';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import client from '@/lib/client';

interface User {
  fullname: string;
}

interface Chat {
  _id: string;
  user: User;
  createdAt: string;
  comment: string;
}

interface ChatResponse {
  result: Chat[];
  total: number;
  page: number;
  limit: number;
}

export const useMessagesApi = (id: string) => {
  const messageInfo = useQuery({
    queryKey: ['address-info', location],
    queryFn: () => {
      return handleAsync<AxiosResponse<any>>(
        client.post,
        `${GET_USER_MESSAGES}/${id}`,
        {
          message: '65da5c7a7d5634ac81e193e3',
          content: 'This is the first message',
          documents: ['https://akekehome.files.wordpress.com/2021/10/akex.jpg'],
        },
      );
    },
  });

  return {
    messageInfo,
  };
};

export const useGetMessages = (id: string) => {
  const queryClient = useQueryClient();

  const userMessages = useQuery<ChatResponse>({
    queryKey: ['user-messages', id],
    queryFn: async () => {
      const { data, status } = await client.get<ChatResponse>(
        `${GET_USER_MESSAGE_CHAT}/${'65f1bcafdcea50ce12d53af7'}`,
      );

      if (status === 200) {
        return data;
      }

      throw new Error('Failed to fetch messages');
    },
    enabled: !!id,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (newComment: { comment: string }) => {
      const { data, status } = await client.post(`${ADD_USER_MESSAGE_CHAT}`, {
        // offerId: id,
        offerId: '65f1bcafdcea50ce12d53af7',
        comment: newComment.comment,
      });

      if (status === 201) {
        return data;
      }

      throw new Error('Failed to add comment');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        // queryKey: ['user-messages', id],
        queryKey: ['user-messages', '65f1bcafdcea50ce12d53af7'],
      });
    },
  });

  return {
    userMessages,
    addCommentMutation,
  };
};
