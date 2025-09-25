import { Button } from '@/components/ui/button';
import { FC, ReactNode } from 'react';

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
}

const NotificationModal: FC<ModalProps> = ({ onClose, children }) => {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='rounded-[2.5rem] bg-white p-10 shadow-lg'>
        {children}
        <Button
          roundness='full'
          variant='default'
          className='mt-4 border-[1px] px-8 py-1 font-bold text-white'
          onClick={onClose}
        >
          <span>Close</span>
        </Button>
      </div>
    </div>
  );
};

export default NotificationModal;
