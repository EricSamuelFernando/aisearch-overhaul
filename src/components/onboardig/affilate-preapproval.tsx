import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/lib/hook';
import { RootState } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  setPreApprovalAffiliates,
  setWorkWithLender,
} from '@/slices/onboarding/property-preference';

export function AffiliatePreApproval() {
  const preApprovalAffiliates = useAppSelector(
    (state: RootState) => state.propertyPreference.preApprovalAffiliates,
  );

  const dispatch = useAppDispatch();

  const handleClick = (value: boolean) => {
    dispatch(setPreApprovalAffiliates(value));
  };

  return (
    <section className='grid h-full place-content-center space-y-6 py-10 md:w-3/5'>
      <Heading
        className='font-normal sm:text-2xl md:text-3xl lg:text-3xl'
        title='Would you like to obtain a 
        pre-approval with our affiliates?'
      />

      <div className='w-5/6 space-y-3'>
        <Button
          variant='outline'
          size='lg'
          onClick={() => handleClick(true)}
          className={cn(
            `w-full rounded-md px-4  py-6 transition-all  hover:bg-none`,
            preApprovalAffiliates
              ? 'bg-black text-white'
              : 'bg-white text-black',
          )}
        >
          Yes
        </Button>
        <Button
          variant='outline'
          onClick={() => handleClick(false)}
          className={cn(
            `w-full rounded-md px-4  py-6 transition-all  hover:bg-none`,
            !preApprovalAffiliates
              ? 'bg-black text-white'
              : 'bg-white text-black',
          )}
          size='lg'
        >
          No
        </Button>
      </div>
    </section>
  );
}

export function WorkWithLender() {
  const workWithLender = useAppSelector(
    (state: RootState) => state.propertyPreference.workWithLender,
  );

  const dispatch = useAppDispatch();

  const handleClick = (value: boolean) => {
    dispatch(setWorkWithLender(value));
  };

  return (
    <section className='grid h-full place-content-center space-y-6 py-10 md:w-3/5'>
      <Heading
        className='font-normal sm:text-2xl md:text-3xl lg:text-3xl'
        title='Do you want to work with a lender and upload your pre-approval?'
      />

      <div className='w-5/6 space-y-3'>
        <Button
          variant='outline'
          size='lg'
          onClick={() => handleClick(true)}
          className={cn(
            `w-full rounded-md px-4  py-6 transition-all  hover:bg-none`,
            workWithLender ? 'bg-black text-white' : 'bg-white text-black',
          )}
        >
          Yes
        </Button>
        <Button
          variant='outline'
          onClick={() => handleClick(false)}
          className={cn(
            `w-full rounded-md px-4  py-6 transition-all  hover:bg-none`,
            !workWithLender ? 'bg-black text-white' : 'bg-white text-black',
          )}
          size='lg'
        >
          No
        </Button>
      </div>
    </section>
  );
}
