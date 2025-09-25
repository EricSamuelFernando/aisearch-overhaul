import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { useModalContext } from '@/providers/modal-provider';
import { usePreApprovalContext } from '@/providers/pre-approval-provider';

export const LenderPreApproval = () => {
  const { setUseAffilateLender } = usePreApprovalContext();
  const { openModal } = useModalContext();

  return (
    <section className='my-4 md:w-3/5'>
      <Heading
        className='mb-4 p-0 text-xl font-normal'
        title='Get pre-approval from lender'
      />

      <div className='space-y-3'>
        <Button
          className='w-full'
          size='lg'
          onClick={() => setUseAffilateLender(true)}
        >
          Use Our Affiliate Lender
        </Button>
        <Button className='w-full' variant='outline' size='lg'>
          I will get approval later{' '}
        </Button>
        <Button
          onClick={() => {
            openModal('loan-calculator');
          }}
          className='w-full bg-transparent text-ocOrange'
          variant='ghost'
        >
          See a loan Calculator
        </Button>{' '}
      </div>
    </section>
  );
};
