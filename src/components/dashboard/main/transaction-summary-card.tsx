import { Button } from '@/components/ui/button';
import { AgentOfferResponse } from '@/interfaces/property.interface';
import { formatCurrency } from '@/lib/utils';
import { TransactionSummaryCardItem } from './transaction-summary-cardItem';

export const TransactionSummaryCard = ({
  offer,
}: {
  offer: AgentOfferResponse;
}) => {
  return (
    <div className='my-0 w-[400px] rounded-xl bg-grey-430 px-4 pb-8'>
      <div className='my-8 grid grid-cols-2 items-center  justify-between gap-4 px-4 pt-8'>
        <TransactionSummaryCardItem
          title='Offer Price'
          description={formatCurrency(
            +offer.offerPrice.amount,
            offer.offerPrice.currency || 'USD',
          )}
        />
        <TransactionSummaryCardItem
          title='Down Payment'
          description={formatCurrency(
            +offer.downPayment.amount,
            offer.downPayment.currency || 'USD',
          )}
        />
        <TransactionSummaryCardItem
          title='Loan Amount'
          description={formatCurrency(
            +offer.loanAmount.amount,
            offer.loanAmount.currency || 'USD',
          )}
        />
        <TransactionSummaryCardItem
          title='Finance Contingency'
          description={`${offer.financeContingency.amount} ${offer.financeContingency.unit}`}
        />
        <TransactionSummaryCardItem
          title='Inspection Contingency'
          description={`${offer.inspectionContingency.amount} ${offer.inspectionContingency.unit}`}
        />
      </div>
      <div className='flex items-center  gap-x-2'>
        {/* <CustomButton
          label="Accept"
          className="bg-black text-white w-[150px] border-[1px] border-black rounded-full py-1"
        /> */}

        <Button className='w-[150px]' roundness='full'>
          Accept
        </Button>

        <Button variant='outline' className='w-[150px]' roundness='full'>
          Respond to Offer
        </Button>

        {/* <CustomButton
          label="Respond to Offer"
          className="bg-transparent w-[150px] text-black rounded-full border-[1px]  py-1 border-black"
        /> */}
      </div>
    </div>
  );
};
