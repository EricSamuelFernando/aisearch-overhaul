import React, { useState } from 'react';
import { useGetMessages } from '@/hooks/api/useFetchMessages';
import { useNotificationApi } from '@/hooks/api/user/useNotification';
import Image from 'next/image';
import { Loader } from 'lucide-react';

interface CommentProps {
  author: string;
  time: string;
  content: string;
}

interface Chat {
  _id: string;
  comment: string;
  createdAt: string;
  user: {
    fullname: string;
  };
}

const Comment: React.FC<CommentProps> = ({ author, time, content }) => {
  const date = new Date(time);

  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });

  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className='mb-1 rounded-lg p-2'>
      <div className='font-bold text-black'>{author}</div>
      <div className='text-sm font-medium text-[#E8804C]'>{`${formattedTime}, ${formattedDate}`}</div>
      <p className='mt-2 text-black'>{content}</p>
    </div>
  );
};

const AddComment: React.FC<{ id: string }> = ({ id }) => {
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Chat[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userMessages, addCommentMutation } = useGetMessages(id);
  const { notificationsQuery } = useNotificationApi();
  const { isLoading, data } = userMessages;

  React.useEffect(() => {
    if (data?.result) {
      setComments(data.result);
    }
  }, [data]);

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentText(e.target.value);
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await addCommentMutation.mutateAsync({
        comment: commentText,
      });

      const newComment: Chat = {
        _id: response.data.comment._id,
        comment: response.data.comment.comment,
        createdAt: response.data.comment.createdAt,
        user: {
          fullname: response.data.comment.user.fullname,
        },
      };

      setComments((prevComments) => [...prevComments, newComment]);
      setCommentText('');
      notificationsQuery.refetch();
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='bg-grey-690 p-6'>
      <div className='mb-4 flex items-center'>
        <div className='mr-3'>
          <Image
            src='/assets/images/commentIcon.svg'
            alt='Comment Icon'
            width={40}
            height={40}
          />
        </div>

        <h2 className='text-2xl font-medium text-black'>Add Comment</h2>
        <div className='ml-auto'>
          <button>
            <Image
              src='/assets/images/forwardArrow.svg'
              alt='Arrow Icon'
              width={20}
              height={20}
            />
          </button>
        </div>
      </div>

      {isLoading ? (
        <p>Loading comments...</p>
      ) : (
        <div className='flex flex-col text-left'>
          {comments.length === 0 ? (
            <p className='text-center text-gray-500'>No comments found</p>
          ) : (
            comments.map((chat: Chat) => (
              <Comment
                key={chat._id}
                author={chat.user.fullname}
                time={new Date(chat.createdAt).toLocaleString()}
                content={chat.comment}
              />
            ))
          )}
        </div>
      )}

      <div className='relative mt-4'>
        <textarea
          value={commentText}
          onChange={handleCommentChange}
          className='h-[8.93rem] w-full resize-none rounded-lg border bg-white p-2 pr-24 focus:outline-none focus:ring-0'
        />
        <button
          onClick={handleCommentSubmit}
          className={`absolute bottom-4 right-2 rounded-full px-8 py-2 text-sm font-medium text-white ${
            isSubmitting ? 'bg-gray-400' : 'bg-black'
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? <Loader /> : 'Comment'}{' '}
        </button>
      </div>
    </div>
  );
};

export default AddComment;
