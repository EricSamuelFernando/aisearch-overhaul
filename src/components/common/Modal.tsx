import React, { ReactElement } from 'react';
import { cn } from '../../utils/styleUtilities';

type IModalProps = {
  children: ReactElement;
  isOpen: boolean;
  className?: string;
  closeModal?: () => void;
  useChildStyle?: boolean;
};

const Modal: React.FC<IModalProps> = ({
  children,
  isOpen,
  closeModal,
  className,
  useChildStyle = false,
}) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // if (e.target === e.currentTarget) {
    //   closeModal()
    // }
  };
  return (
    <div
      onClick={handleBackdropClick}
      className={cn(
        'fixed inset-0 z-[999] grid h-screen min-h-screen w-screen place-items-center bg-black bg-opacity-60 backdrop-blur-sm transition-opacity duration-300',
        {
          'pointer-events-auto opacity-100': isOpen,
          'pointer-events-none opacity-0': !isOpen,
        },
      )}
    >
      {useChildStyle ? (
        children
      ) : (
        <div className='text-blue-gray-500 relative m-4 w-2/5 min-w-[40%] max-w-[40%] rounded-2xl bg-white font-sans text-base font-light leading-relaxed antialiased shadow-2xl'>
          {children}
        </div>
      )}
    </div>
  );
};

export default Modal;
