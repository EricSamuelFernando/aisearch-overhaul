'use client';

import CustomTable from '@/components/CustomTable';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAgentOfferApi } from '@/hooks/api/agent/useFetchAgentOffers';
import { formatCurrency } from '@/lib/utils';

interface IOfferRow {
  id: string;
  financeType: string;
  offerPrice: string;
  downPayment: string;
  loanAmount: string;
  appraisalContingency: boolean;
  inspectionContingency: string;
  strength: string;
}

function TransactionOfferListView(
  propertyOffers: any,
) {
  const dummyOffers = [
    {
      _id: '1',
      financeType: 'cash',
      offerPrice: { amount: 500000 },
      downPayment: { amount: 500000 },
      loanAmount: { amount: 0 },
      appraisalContingency: true,
      inspectionContingency: { amount: 7, unit: 'days' },
    },
    {
      _id: '2',
      financeType: 'loan',
      offerPrice: { amount: 550000 },
      downPayment: { amount: 110000 },
      loanAmount: { amount: 440000 },
      appraisalContingency: false,
      inspectionContingency: { amount: 10, unit: 'days' },
    },
  ];
  const params = useSearchParams();
  const id = params?.get('id');
  const type = params?.get('type');
  const res = dummyOffers;
  // const { propertyOffers } = useAgentOfferApi(id as string);
  // const { data, isLoading, isFetching } = propertyOffers;
  // const res = data?.data?.data?.result;

  const tableData: any = () =>
    propertyOffers?.propertyOffers?.map((item: any) =>
      tableRow({
        id: item.id!,
        financeType: item.financeType.toUpperCase(),
        offerPrice: formatCurrency(item?.price?.toString(), 'USD'),
        downPayment: formatCurrency(item?.downPayment?.toString(), 'USD'),
        loanAmount: formatCurrency(item.loanAmount?.toString(), 'USD'),
        inspectionContingency: item.inspectionContingencyPrice,
        appraisalContingency: item.apprasalContingencyPrice,
        strength: 'Strong',
      }),
    );

  const tableRow = ({
    id,
    financeType,
    appraisalContingency,
    downPayment,
    inspectionContingency,
    loanAmount,
    offerPrice,
    strength,
  }: IOfferRow) => ({
    id,
    'Finance Type': financeType,
    'Offer Price': offerPrice,
    'Down Payment': downPayment,
    'Loan Amount': loanAmount,
    'Appraisal Contingency': appraisalContingency ? 'Yes' : 'No',
    'Inspection Contingency': inspectionContingency,
    Strength: strength,
    Action: (
      <Link
        href={`/dashboard/seller/offer/view?id=${id}`}
        className='w-max rounded-full border border-black bg-white px-6 py-1 text-black'
      >
        View
      </Link>
    ),
  });

  const columns = [
    { header: 'Finance Type', accessor: 'Finance Type' },
    { header: 'Offer Price', accessor: 'Offer Price' },
    { header: 'Down Payment', accessor: 'Down Payment' },
    { header: 'Loan Amount', accessor: 'Loan Amount' },
    { header: 'Appraisal Contingency', accessor: 'Appraisal Contingency' },
    { header: 'Inspection Contingency', accessor: 'Inspection Contingency' },
    { header: 'Strength', accessor: 'Strength' },
    { header: 'Action', accessor: 'Action' },
  ];
  
  return (
    <section>
      <aside className='my-4 grid grid-cols-9 items-center gap-x-8'>
        {/* <div className='col-span-6 flex items-center justify-between px-8'>
          <div className='flex items-center justify-between gap-x-2'>
            <CustomInput
              leftSection={
                <Image
                  src='/assets/icons/search-p.svg'
                  alt={`test`}
                  height={22}
                  width={22}
                />
              }
              placeholder='Search File'
              className='rounded-3xl  md:w-[300px]'
            />
            <Filter className='cursor-pointer text-gray-700' />
          </div>
        </div> */}
        {/* <div className='col-span-3'>
          <AgentPropertyCard />
        </div> */}
      </aside>
      <CustomTable
        data={tableData()}
        columns={columns}
        loading={false}
      />
    </section>
  );
}

export default TransactionOfferListView;
