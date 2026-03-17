import React, { forwardRef, createRef, useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  disableEscapeClose?: boolean;
  backdropBlur?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  fullScreen?: boolean;
}

const CustomModal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen = false,
      onClose,
      disableEscapeClose = false,
      backdropBlur = '',
      children,
      className,
      contentClassName,
      fullScreen = false,
    },
    ref,
  ) => {
    const [isPortalOpen, setIsPortalOpen] = useState(isOpen);
    const modalRef = createRef<HTMLDivElement>();

    useEffect(() => {
      setIsPortalOpen(isOpen);
    }, [isOpen]);

    const handleClose = useCallback(() => {
      if (onClose) {
        onClose();
      }
      setIsPortalOpen(false);
    }, [onClose]);

    const handleBackdropClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        handleClose();
      }
    }, [handleClose]);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
      if (event.key === 'Escape' && !disableEscapeClose) {
        handleClose();
      }
    }, [disableEscapeClose, handleClose]);

    useEffect(() => {
      const handleEscape = handleKeyDown;
      const root = document.body;

      if (isPortalOpen) {
        root.addEventListener('keydown', handleEscape);
        return () => root.removeEventListener('keydown', handleEscape);
      }

      return undefined;
    }, [isPortalOpen, disableEscapeClose, handleKeyDown]);

    if (!isPortalOpen) {
      return null;
    }

    const modalContent = (
      <div
        ref={modalRef}
        className={cn(
          'fixed inset-0 z-50 flex items-center justify-center overflow-auto transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
          className,
        )}
        style={{
          zIndex: 200,
        }}
      >
        {!fullScreen && (
          <div
            className={cn(
              `modal-backdrop fixed inset-0 bg-black/40 backdrop-blur-sm cursor-pointer`,
              backdropBlur,
            )}
            onClick={handleBackdropClick}
          />
        )}
        <div
          className={cn(
            `modal-content relative z-50 m-4 w-full max-h-[calc(100dvh-2rem)] transform overflow-auto rounded-3xl bg-white p-8 shadow-lg transition-transform duration-300 md:min-w-[35rem]`,
            isOpen ? 'scale-100' : 'scale-95',
            contentClassName,
            fullScreen ? 'h-full w-full rounded-none' : '',
          )}
        >
          {children}
        </div>
      </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
  },
);

CustomModal.displayName = 'Custom Modal';

export default CustomModal;
