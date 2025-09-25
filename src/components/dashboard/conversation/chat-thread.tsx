import CustomAvatar from '@/components/customs/avatar';
import { cn, getInitials } from '@/lib/utils';

interface ChatItemProps {
  main?: boolean;
  handleClick?: () => void;
  firstname: string;
  lastname: string;
  lastMessage:string;
  propertyID:string;
  PropertyImg?:string;
  timestamp:string;
}

const ChatThread: React.FC<ChatItemProps> = ({
  firstname,
  lastname,

  timestamp,
  propertyID,
  lastMessage,
  main = true,
  handleClick,
}) => {
  return (
    <div
      onClick={handleClick}
      className={cn('flex items-center w-full gap-x-8', main ? 'cursor-pointer' : '')}
    >
      <div className='relative h-[50px] w-[50px]'>
        <CustomAvatar
          className='h-[8rem] w-[8rem] text-xl text-white'
          alt='avatar-image'
          size={'4rem'}
        >
          {getInitials(firstname, lastname) || 'SH'}
        </CustomAvatar>
      </div>
      <div className='flex flex-col gap-1 w-full'>
      <p className='font-bold'>
          {firstname} {lastname}
        </p>
      <p className='font-bold text-sm'>
          {propertyID} 
      </p>
       
      
        <span className='text-sm font-[400] text-grey-750'>
          {lastMessage ? lastMessage :'Start New Chat' }  
        </span>
        <p className='mt-1 text-right text-[10px] text-gray-500'>
                          {new Date(timestamp).toLocaleTimeString(
                            [],
                            {
                              hour: '2-digit',
                              minute: '2-digit',
                            },
                          )}
                        </p>
      </div>
    </div>
  );
};

export default ChatThread;
