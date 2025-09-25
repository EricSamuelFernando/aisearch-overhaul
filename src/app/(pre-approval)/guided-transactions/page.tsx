import { TransactionStages } from '@/components/guided-transactions/transaction-stages';
import { Metadata } from 'next';
import { TransactionProvider } from '@/providers/guided-transactions-provider';

export const metadata: Metadata = {
  title: 'Guided Transactions',
  description: 'Guided Transactions | Snap Homz',
};

type Props = {};

function GuidedTransactions({}: Props) {
  return (
    <TransactionProvider>
      <TransactionStages />
    </TransactionProvider>
  );
}

export default GuidedTransactions;
