'use client';

import { CustomInput } from '@/components/customs/input';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { useAgentOfferApi } from '@/hooks/api/agent/useFetchAgentOffers';
import { AgentOfferResponse } from '@/interfaces/property.interface';
import { formatCurrency } from '@/lib/utils';
import { useAgentCreatePropertyContext } from '@/providers/agent-property-provider';
import { Filter, Grid2X2, Heart, Menu, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import TourSchedule from '../main/tour-schedule';
import { SellerOwnerCard } from './agent-documents';
import { SummaryCardItem } from './shared';
import { AgentPropertyCard, AgentPropertyCardButtons } from '../agent/agent-property-card';

type Props = {};

const result = [
  {
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
  },
];

function AgentGridView({}: Props) {
  const agentCreateProperty = useAgentCreatePropertyContext();

  const params = useSearchParams();
  const id = params?.get('id');
  const type = params?.get('type');
  const { propertyOffers } = useAgentOfferApi(id as string);
  const { data, isLoading, isFetching } = propertyOffers;
  const res = data?.data?.data?.result;

  console.log({ propertyOffers });

  return (
    <section className='grid grid-cols-9  gap-8'>
      <aside className='col-span-6'>
        <div className='flex items-center justify-between border-b border-b-gray-300 px-8 py-6'>
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

        <div className='my-6 grid grid-cols-2 gap-x-6'>
          {/* {!isLoading &&
            !isFetching &&
            res?.map((item: any) => (
              <OfferCard
                key={item._id}
                offer={item}
                type={type == 'listing' ? 'listing' : 'buy-leads'}
              />
            ))} */}
          {result?.map((item: any) => (
            <OfferCard
              key={item._id}
              offer={item}
              type={type == 'listing' ? 'listing' : 'buy-leads'}
            />
          ))}
        </div>
      </aside>
      <aside className='col-span-3'>
        <AgentPropertyCard buttons={<AgentPropertyCardButtons />} />
        <div>
          <div className='flex items-center justify-between py-6'>
            <Heading title='Upcoming Tour' />
            <Link href='/dashboard/seller' className='text-[1.125rem]'>
              View all
            </Link>
          </div>
          <TourSchedule showButton={true} />
        </div>

        <div className='my-6'>
          <SellerOwnerCard name={res ? res[0]?.seller.fullname : ''} />
        </div>
      </aside>
    </section>
  );
}

export default AgentGridView;

const OfferCard = ({
  offer,
  type,
}: {
  offer: AgentOfferResponse;
  type: 'listing' | 'buy-leads';
}) => {
  return (
    <div className='rounded-b-2xl bg-[#f8f8f8]'>
      <div className='w-full rounded-2xl bg-ocOrange p-4'>
        <div className='grid grid-cols-2 items-center justify-between'>
          <div className='col-span-1'>
            <span className='inline-block rounded-lg bg-[#ffb576] px-4 text-black'>
              New
            </span>
          </div>
          <div className='col-span-1 flex justify-end gap-x-2'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-[#d16f3e]'>
              <Heart className='text-white' fill='white' />
            </div>
            <div className='relative flex h-10 w-10 items-center justify-center rounded-full bg-[#d16f3e]'>
              <MessageCircle className='text-white' fill='white' />
              <span className='absolute text-xs font-bold'>3</span>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-x-4 py-3'>
          <Image
            alt='profile'
            height={80}
            width={80}
            className='rounded-full object-cover object-center'
            src={'/assets/images/Mask Group 43.png'}
          />

          <div>
            <h2 className='text-lg font-bold'>{'Robin Scherbatsky'}</h2>
            <p className='email text-sm font-light text-white'>
              Robin.sche@gmail.com
            </p>
            <p className='mobile text-sm text-white'>Mobile: (415) 342 4992</p>
          </div>
        </div>
      </div>

      <div className='pb-6'>
        <div className='grid grid-cols-2 gap-4 p-4'>
          <SummaryCardItem
            title={<span className='text-sm font-normal'>Offer Price</span>}
            description={
              <span className='text-lg font-bold'>
                {formatCurrency(
                  +offer.offerPrice.amount,
                  offer.offerPrice.currency,
                )}
              </span>
            }
          />
          <SummaryCardItem
            title={<span className='text-sm font-normal'>Finance Type</span>}
            description={
              <span className='text-lg font-bold'>
                {offer.financeType.toUpperCase()}
              </span>
            }
          />
          <SummaryCardItem
            title={<span className='text-sm font-normal'>Down Payment</span>}
            description={
              <span className=' text-base'>
                {formatCurrency(
                  +offer.downPayment.amount,
                  offer.downPayment.currency,
                )}
              </span>
            }
          />{' '}
          <SummaryCardItem
            title={<span className='text-sm font-normal'>Loan Amount</span>}
            description={
              <span className=' text-base'>
                {formatCurrency(
                  +offer.loanAmount.amount,
                  offer.loanAmount.currency,
                )}
              </span>
            }
          />
        </div>

        {/* <CustomButton
          label="View Offer"
          className="bg-black py-1 rounded-full w-max px-4 text-white mx-4"
        /> */}

        <Button roundness='full' className='mx-4 w-max px-4 text-white'>
          View Offer
        </Button>
      </div>
    </div>
  );
};
