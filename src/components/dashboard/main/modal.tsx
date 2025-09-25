import React from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
}) => {
  if (!isOpen) return null;

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return createPortal(
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className={`relative rounded-lg bg-white p-4 ${className}`}>
        {title && (
          <div className='mb-2 border-b pb-2'>
            <h2 className='text-lg font-semibold'>{title}</h2>
            <button
              onClick={handleClose}
              className='absolute right-2 top-[-0.8rem] text-4xl text-gray-500 hover:text-gray-800'
              aria-label='Close'
            >
              &times;
            </button>
          </div>
        )}
        <div>{children}</div>
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
