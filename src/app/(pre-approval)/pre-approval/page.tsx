import PreApprovalSteps from '@/components/pre-approval/pre-approval-steps';
import { Metadata } from 'next';
import Image from 'next/image';
import ActionButtons from '@/components/onboardig/action-buttons';

export const metadata: Metadata = {
  title: 'Add Pre-Approval Documents',
  description: 'Pre-Approval | Snap Homz',
};

type Props = {};

function PreApproval({}: Props) {
  return (
    <section>
      <section className='my-12 grid h-full items-center justify-between gap-x-16 md:grid-cols-3'>
        <section className='hidden h-full items-center justify-center  pr-10 pt-6 md:flex'>
          <Image
            src='/assets/images/v2/dome.png'
            alt='Snap Homz home'
            height={570}
            width={450}
            className='object-contain object-center'
          />
        </section>
        <div className='col-span-2 '>
          <PreApprovalSteps />
        </div>
      </section>

      <ActionButtons />
    </section>
  );
}

export default PreApproval;
