'use client';

import CustomTable from '@/components/CustomTable';
import { CustomInput } from '@/components/customs/input';
import { Filter, Grid2X2, Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAgentCreatePropertyContext } from '@/providers/agent-property-provider';
import { useAgentOfferApi } from '@/hooks/api/agent/useFetchAgentOffers';
import { nanoid } from 'nanoid';
import { AgentPropertyCard } from '../agent/agent-property-card';

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

export const singleOfferdata = {
  agentApproval: false,
  agentApprovalDate: null,
  _id: '65f1bcafdcea50ce12d53af7',
  currentStatus: 'pending',
  financeType: 'loan',
  offerCreator: 'agent',
  apprasalContingency: false,
  financeContingency: {
    amount: '90',
    unit: 'days',
  },
  inspectionContingency: {
    amount: '90',
    unit: 'days',
  },
  closeEscrow: false,
  offerPrice: {
    amount: 500000,
    currency: 'USD',
  },
  downPayment: {
    amount: 50000,
    currency: 'USD',
  },
  loanAmount: {
    amount: 200000,
    currency: 'USD',
  },
  submitWithOutAgentApproval: false,
  property: {
    _id: '65e23cb54fcac786881da3d9',
    propertyAddressDetails: {
      formattedAddress: '711 Kent Ave',
      latitude: '39.284462',
      longitude: '-76.734069',
      placeId: 'ChIJ__8v5VwCyIkRTgVx3TbjHN4',
      streetNumber: '711',
      streetName: 'Kent Ave',
      city: 'Catonsville',
      province: 'Maryland',
      state: 'MD',
      postalCode: '21228',
      country: 'United States',
    },
    images: [
      {
        url: 'http://res.cloudinary.com/dv0bdcxeh/image/upload/v1710079331/ocreal/zxigpfixkwy3wvunkmjp.png',
        thumbNail:
          'https://res.cloudinary.com/dv0bdcxeh/image/upload/c_limit,h_60,w_90/v1710079331/ocreal/zxigpfixkwy3wvunkmjp.png',
        _id: '65edbd8171460c5502d42c59',
      },
    ],
    videos: [
      {
        url: 'http://res.cloudinary.com/dv0bdcxeh/video/upload/v1710079354/ocreal/pgi75j29sxy3zvzp872f.mp4',
        thumbNail:
          'https://res.cloudinary.com/dv0bdcxeh/video/upload/c_limit,h_60,w_90/v1710079354/ocreal/pgi75j29sxy3zvzp872f.jpg',
        _id: '65edbd8171460c5502d42c5a',
      },
    ],
    listed: true,
    propertyName: '711 Kent Ave',
    currentStatus: 'Now Showing',
    seller: '65af4f272ee63e9ecce25e94',
    sellerAgentAcceptance: true,
    buyerAgentAcceptance: false,
    propertyDocument: [
      {
        name: 'Document1',
        url: '/document1',
        _id: '65ff4a4e1d48bb46c6cad14b',
      },
      {
        name: 'Document2',
        url: '/document2',
        _id: '65ff4a4e1d48bb46c6cad14c',
      },
    ],
    brokers: [
      {
        agent: '65b335cbf5ed5bf50790a6c8',
        role: 'Listing Agent',
        _id: '65e8e0453461813da0b27109',
      },
      {
        agent: '65b335cbf5ed5bf50790a6c8',
        role: 'Co-Agent',
        _id: '65e8e0453461813da0b2710a',
      },
    ],
    features: [
      {
        feature: 'Testing',
        icon: '8',
        description: 'Description',
        _id: '65ff4a4e1d48bb46c6cad14d',
      },
      {
        feature: 'Nothing Really',
        icon: 'down-left-and-up-right-to-center',
        description: 'Licences',
        _id: '65ff4a4e1d48bb46c6cad14e',
      },
    ],
    propertyTaxes: [
      {
        amount: 3195,
        currency: 'USD',
        dateSeen: ['2024-02-13T21:24:57.593Z'],
        _id: '65ff4a4e1d48bb46c6cad14f',
      },
      {
        amount: 4509,
        currency: 'USD',
        dateSeen: ['2024-01-13T21:24:57.593Z'],
        _id: '65ff4a4e1d48bb46c6cad150',
      },
    ],
    status: [
      {
        status: 'Now Showing',
        eventTime: '2024-03-20T20:00:13.477Z',
        _id: '65fb404db92defd32ec9e63a',
      },
      {
        status: 'Now Showing',
        eventTime: '2024-03-20T20:01:40.948Z',
        _id: '65fb40a468062c8f29442a4e',
      },
    ],
    createdAt: '2024-03-01T20:38:13.558Z',
    updatedAt: '2024-03-23T21:31:58.503Z',
    lotSizeUnit: 'Acres',
    lotSizeValue: '8456',
    numBathroom: '1',
    numBedroom: '3',
    price: {
      amount: 60000,
      currency: '$',
    },
    propertyType: 'Residential Income',
    sellerAgent: '65b335cbf5ed5bf50790a6c8',
    buyerAgent: '65b335cbf5ed5bf50790a6c8',
    propertyDescription: '',
  },
  buyer: {
    _id: '65af4f272ee63e9ecce25e94',
    email: 'johnloydlegend@gmail.com',
    emailVerified: true,
    createdAt: '2024-01-23T05:31:19.146Z',
    updatedAt: '2024-04-04T22:16:46.600Z',
    __v: 0,
    account_type: 'seller',
    firstname: 'James',
    fullname: 'James Iweobi',
    lastname: 'Iweobi',
    mobile: {
      number_body: '7089349206',
      mobile_extension: '+234',
      raw_mobile: '+2347089349206',
      _id: '65fb3b8b17b492341c92a841',
    },
    token_expiry_time: '2024-04-04T22:26:46.598Z',
    verification_code: '399483',
    stripe_customer_id: 'cus_PX7tUFLLAAosQn',
    preApproval: true,
    preApprovalDocument: {
      url: 'https://ocrealbucket.s3.amazonaws.com/65af4f272ee63e9ecce25e94/propertyDocUpload/download/2024-03-09T13%3A31%3A40.298Z',
      expiryDate: '2024-03-21T23:00:00.000Z',
    },
  },
  seller: {
    _id: '65af4f272ee63e9ecce25e94',
    email: 'johnloydlegend@gmail.com',
    emailVerified: true,
    createdAt: '2024-01-23T05:31:19.146Z',
    updatedAt: '2024-04-04T22:16:46.600Z',
    __v: 0,
    account_type: 'seller',
    firstname: 'James',
    fullname: 'James Iweobi',
    lastname: 'Iweobi',
    mobile: {
      number_body: '7089349206',
      mobile_extension: '+234',
      raw_mobile: '+2347089349206',
      _id: '65fb3b8b17b492341c92a841',
    },
    token_expiry_time: '2024-04-04T22:26:46.598Z',
    verification_code: '399483',
    stripe_customer_id: 'cus_PX7tUFLLAAosQn',
    preApproval: true,
    preApprovalDocument: {
      url: 'https://ocrealbucket.s3.amazonaws.com/65af4f272ee63e9ecce25e94/propertyDocUpload/download/2024-03-09T13%3A31%3A40.298Z',
      expiryDate: '2024-03-21T23:00:00.000Z',
    },
  },
  sellerAgent: {
    completedOnboarding: false,
    _id: '65b335cbf5ed5bf50790a6c8',
    email: 'johnloydlegend@gmail.com',
    connectedUsers: ['65af4f272ee63e9ecce25e94', '65df3ae28adb0389bb5438c3'],
    verification_code: '',
    token_expiry_time: null,
    emailVerified: true,
    createdAt: '2024-01-26T04:32:11.306Z',
    updatedAt: '2024-04-20T17:12:40.989Z',
    __v: 0,
    firstname: 'James',
    fullname: 'James Iweobi',
    lastname: 'Iweobi',
    licence_number: 'EDOSJJWN3',
    mobile: {
      number_body: '7089349206',
      mobile_extension: '+234',
      raw_mobile: '+2347089349206',
      _id: '65b51978be5cdc57142ee938',
    },
    region: 'New Your',
  },
  buyerAgent: {
    completedOnboarding: false,
    _id: '65b335cbf5ed5bf50790a6c8',
    email: 'johnloydlegend@gmail.com',
    connectedUsers: ['65af4f272ee63e9ecce25e94', '65df3ae28adb0389bb5438c3'],
    verification_code: '',
    token_expiry_time: null,
    emailVerified: true,
    createdAt: '2024-01-26T04:32:11.306Z',
    updatedAt: '2024-04-20T17:12:40.989Z',
    __v: 0,
    firstname: 'James',
    fullname: 'James Iweobi',
    lastname: 'Iweobi',
    licence_number: 'EDOSJJWN3',
    mobile: {
      number_body: '7089349206',
      mobile_extension: '+234',
      raw_mobile: '+2347089349206',
      _id: '65b51978be5cdc57142ee938',
    },
    region: 'New Your',
  },
  status: [],
  createdAt: '2024-03-13T14:48:15.755Z',
  updatedAt: '2024-03-13T14:48:15.755Z',
  documents: [],
};

function AgentListView() {
  const agentCreateProperty = useAgentCreatePropertyContext();
  const params = useSearchParams();
  const id = params?.get('id');
  const type = params?.get('type');
  const { propertyOffers } = useAgentOfferApi(id as string);
  const { data, isLoading, isFetching } = propertyOffers;
  const res = data?.data?.data?.result;

  // const tableData: any = () =>
  //   res?.map((item: any) =>
  //     tableRow({
  //       id: item._id!,
  //       financeType: item.financeType,
  //       offerPrice: item.offerPrice.amount.toString(),
  //       downPayment: item.downPayment.amount.toString(),
  //       loanAmount: item.loanAmount.amount.toString(),
  //       inspectionContingency: `${item.inspectionContingency.amount} ${item.inspectionContingency.unit}`,
  //       appraisalContingency: item.apprasalContingency,
  //       strength: 'Strong',
  //     })
  //   )

  const tableData: any = () =>
    Array.from({ length: 5 })?.map((item: any) =>
      tableRow({
        id: nanoid()!,
        financeType: singleOfferdata.financeType,
        offerPrice: singleOfferdata.offerPrice.amount.toString(),
        downPayment: singleOfferdata.downPayment.amount.toString(),
        loanAmount: singleOfferdata.loanAmount.amount.toString(),
        inspectionContingency: `${singleOfferdata.inspectionContingency.amount} ${singleOfferdata.inspectionContingency.unit}`,
        appraisalContingency: singleOfferdata.apprasalContingency,
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
        href={`/dashboard/agent/property/view-offer?id=${id}`}
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
        <div className='col-span-6 flex items-center justify-between px-8'>
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

          <div className='flex items-center justify-end gap-x-2'>
            <Grid2X2
              onClick={() => agentCreateProperty?.setView('grid')}
              className='cursor-pointer text-gray-700'
              size={28}
            />
            <Menu
              onClick={() => agentCreateProperty?.setView('list')}
              className='cursor-pointer text-gray-700'
              size={28}
            />
          </div>
        </div>
        <div className='col-span-3'>
          <AgentPropertyCard />
        </div>
      </aside>
      <CustomTable
        data={tableData()}
        columns={columns}
        loading={isLoading || isFetching}
      />
    </section>
  );
}

export default AgentListView;
