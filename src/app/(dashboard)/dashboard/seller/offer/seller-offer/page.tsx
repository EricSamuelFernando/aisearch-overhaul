'use client';
import CounterOfferComponent from '@/components/dashboard/main/counter-offer';

type Props = {};

function TransactionViewOffer({}: Props) {
  return (
    <section className='min-h-[350px] p-[3.219rem]'>
      <CounterOfferComponent />
    </section>
  );
}

export default TransactionViewOffer;
