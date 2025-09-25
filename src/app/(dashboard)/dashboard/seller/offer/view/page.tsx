import TransactionOffersDetail from '@/components/dashboard/main/transaction-offer-detail';

type Props = {};

function SellerViewOffer({}: Props) {
  return (
    <section className='min-h-[350px] p-[3.219rem]'>
      <TransactionOffersDetail />
    </section>
  );
}

export default SellerViewOffer;
