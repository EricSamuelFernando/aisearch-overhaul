import CloseButton from '@/components/close';
import CustomModal from '@/components/custom-modal';
import { cn } from '@/lib/utils';
import {
  useAddPreApprovals,
  usePreapprovalActions,
} from '@/shared/hooks/useAddPreapproval';
import { ArrowLeft } from 'lucide-react';
import { OnboardSection } from '../onboard';

type Props = {
  opened: boolean;
  open: () => void;
  close: () => void;
};

export function AddAgentModal({ open, opened, close }: Props) {
  const { currentStep } = useAddPreApprovals();
  const { setCurentStep } = usePreapprovalActions();
  return (
    <div>
      <CustomModal
        backdropBlur='pointer-event-none'
        disableEscapeClose={false}
        isOpen={opened}
        onClose={() => {
          close();
          setCurentStep(1);
        }}
        fullScreen
      >
        <section className='m-8'>
          <div
            className={cn(
              'close flex items-center',
              currentStep > 1 ? 'justify-between' : 'justify-end',
            )}
          >
            <span>
              {currentStep > 1 ? (
                <ArrowLeft
                  onClick={() => setCurentStep(currentStep - 1)}
                  size={32}
                  className='cursor-pointer font-light'
                />
              ) : null}
            </span>

            <CloseButton close={close} />
          </div>
          <OnboardSection />
        </section>
      </CustomModal>
    </div>
  );
}

export default AddAgentModal;
