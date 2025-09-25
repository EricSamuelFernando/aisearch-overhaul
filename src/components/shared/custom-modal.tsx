import React, {
  forwardRef,
  createRef,
  useEffect,
  useState,
  useCallback,
} from 'react';
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
  closeDisabled?: boolean;
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
      closeDisabled,
    },
    ref,
  ) => {
    const [isPortalOpen, setIsPortalOpen] = useState(isOpen);
    const modalRef = createRef<HTMLDivElement>();

    useEffect(() => {
      setIsPortalOpen(isOpen);
    }, [isOpen]);

    const handleClose = useCallback(() => {
      if (closeDisabled) {
        setIsPortalOpen(true);
      } else {
        setIsPortalOpen(false);
        onClose?.();
      }
    }, [onClose, closeDisabled]);

    const handleBackdropClick = useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      },
      [handleClose],
    );

    const handleKeyDown = useCallback(
      (event: KeyboardEvent) => {
        if (event.key === 'Escape' && !disableEscapeClose) {
          handleClose();
        }
      },
      [handleClose, disableEscapeClose],
    );

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
        onClick={fullScreen ? undefined : handleBackdropClick}
        style={{
          zIndex: 200,
        }}
      >
        <div
          className={cn(
            `modal-content  z-50 transform  overflow-auto rounded-3xl bg-white shadow-lg transition-transform duration-300`,
            isOpen ? 'scale-100' : 'scale-95',
            contentClassName,
            fullScreen ? 'h-full w-full rounded-none' : '',
          )}
        >
          {children}
        </div>
        {!fullScreen && (
          <div
            className={cn(
              `modal-backdrop pointer-events-none fixed inset-0 bg-black/50 bg-cyan-100 opacity-10`,
              backdropBlur,
            )}
          />
        )}
      </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
  },
);

CustomModal.displayName = 'Custom Modal';

export default CustomModal;
