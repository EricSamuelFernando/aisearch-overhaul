import { GuideDetails } from './guide-details';
import { StatCards } from './guides';

export function TransactionStages() {
  return (
    <section className='my-12 grid h-full  justify-between gap-x-16 md:grid-cols-4'>
      <div className='col-span-1'>
        <StatCards />
      </div>
      <div className='col-span-3'>
        <GuideDetails />
      </div>
    </section>
  );
}
