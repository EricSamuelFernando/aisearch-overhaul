import { Button } from '@/components/ui/button';
import {
  PreApprovalStatusType,
  usePreApprovalContext,
} from '@/providers/pre-approval-provider';
import Heading from '../heading';

function SelectApprovalStatus() {
  const { setCurrentStage, setPreApprovalStatus } = usePreApprovalContext();

  const handleClick = (status: PreApprovalStatusType) => {
    setPreApprovalStatus(status);
    setCurrentStage('2');
  };

  return (
    <section className='md:w-3/5'>
      <Heading
        className='mb-4 p-0 text-2xl font-normal'
        title='Are you Pre Approved?'
      />

      <div className='my-4 space-y-3'>
        <Button size='lg' onClick={() => handleClick(true)} className='w-full'>
          Yes
        </Button>
        <Button
          size='lg'
          onClick={() => handleClick(false)}
          className='w-full'
          variant='outline'
        >
          No
        </Button>

        <Button
          size='lg'
          onClick={() => handleClick('cash')}
          className='w-full bg-transparent text-ocOrange'
          variant='ghost'
        >
          No, I am buying with cash
        </Button>
      </div>
    </section>
  );
}

export default SelectApprovalStatus;
