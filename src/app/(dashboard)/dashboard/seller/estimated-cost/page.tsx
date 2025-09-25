import { Metadata } from 'next';
import { EstimatedCostForm } from '@/components/guided-transactions/estimated-costs';

export const metadata: Metadata = {
  title: 'Estimated Costs',
  description: 'Estimated Costs | Snap Homz',
};

type Props = {};

function EstimatedCosts({}: Props) {
  return (
    <section className='h-full'>
      <EstimatedCostForm />
    </section>
  );
}

export default EstimatedCosts;
