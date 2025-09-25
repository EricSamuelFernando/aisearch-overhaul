'use client';

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import SignupFlow from '../components/forms/sign-up';
import CustomModal from '@/components/shared/custom-modal';
import { AgentSelection } from '@/components/add-agent/choose-agent';
import { LoanCalculator } from '@/components/modals/loan-calculator';
import { LoginFlow } from '@/components/forms/auth/login-flow';

export interface Modal {
  name: string;
  content: React.ReactNode;
}

export const initialModals: Record<string, React.ReactNode> = {
  login: <LoginFlow origin='modal' />,
  signup: <SignupFlow origin='modal' />,
  'select-agent': <AgentSelection />,
  'loan-calculator': <LoanCalculator />,
};

interface ModalContextType {
  openModal: (name: keyof typeof initialModals) => void;
  closeModal: (cb?: () => void) => void;
  isModalOpen: boolean;
  modalName: string | null;
  modals: Record<string, React.ReactNode>;
  opened: boolean;
  isCloseDisabled: boolean;
  updateCloseDisabled: (state: boolean) => void;
}

const ModalContext = createContext<ModalContextType | null>(null);

export const ModalProvider: React.FC<{
  initialModals: Record<string, React.ReactNode>;
  children: ReactNode;
}> = ({ children, initialModals }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalName, setModalName] = useState<keyof typeof initialModals | null>(
    null,
  );
  const [isCloseDisabled, setIsCloseDisabled] = useState<boolean>(false);

  const openModal = useCallback((name: keyof typeof initialModals) => {
    setIsModalOpen(true);
    setModalName(name);
  }, []);

  const closeModal = useCallback((cb?: () => void) => {
    cb?.();
    setIsModalOpen(false);
    setModalName(null);
  }, []);

  const updateCloseDisabled = (status: boolean) => setIsCloseDisabled(status);

  const contextValue = useMemo(
    () => ({
      openModal,
      closeModal,
      updateCloseDisabled,
      isModalOpen,
      isCloseDisabled,
      modalName,
      modals: initialModals,
      opened: isModalOpen,
    }),
    [
      openModal,
      closeModal,
      isModalOpen,
      modalName,
      initialModals,
      isCloseDisabled,
    ],
  );

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

const ModalComponent: React.FC<{ content: React.ReactNode }> = ({
  content,
}) => {
  return (
    <section className='oveflow-x-hidden min-w-[25rem]  max-w-2xl p-10  md:min-w-[32rem]'>
      {content}
    </section>
  );
};

export const Modals: React.FC = () => {
  const { modals, opened, closeModal, modalName, isCloseDisabled } =
    useModalContext();

  return (
    <CustomModal
      isOpen={opened}
      onClose={isCloseDisabled ? undefined : closeModal}
      disableEscapeClose={true}
      className='backdrop-blur-sm'
      backdropBlur='pointer-event-none'
      closeDisabled={isCloseDisabled}
    >
      <ModalComponent
        content={typeof modalName === 'string' ? modals[modalName] : null}
      />
    </CustomModal>
  );
};
