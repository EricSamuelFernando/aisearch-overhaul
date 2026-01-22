'use client';
import { Info } from 'lucide-react';
import Link from 'next/link';

import CustomButton from '@/components/custom-button';
import { IProperty } from '@/interfaces/property.interface';
import { useGetSingleProperty } from '@/hooks/api/property/usePropertyApi';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';
import AgentCard from '../main/agent-card';
import PropertyOverview from '../main/property-overview';
import PropertyDetailLoader from './property-detail-loader';
import { PropertyTabs } from './property-tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/shared/hooks/useCurrentUser';

function PropertyDetailLayout() {
  const { propertyId: id } = useParams<{ propertyId: string; item: string }>();
  const { getSingleProperty }:any = useGetSingleProperty(id!);
  const property = getSingleProperty?.data?.data?.data?.property as IProperty;
  const loading = getSingleProperty.isFetching || getSingleProperty.isLoading;

  return (
    <div className='mt-10 grid min-h-[600px] grid-cols-5 gap-x-6'>
      {!loading ? (
        <section>
          <div className='items-between flex flex-col px-[8%] md:col-span-3'>
            <div className='flex flex-1 items-center justify-between gap-x-4'>
              <PropertyOverview
                className='rounded-lg bg-black p-5 text-white md:w-[65%]'
                trailColor='#454545'
                textColor='text-white'
                pathColor='white'
                streetName={property?.price?.amount?.toString()}
                address={property?.propertyAddressDetails?.formattedAddress}
              />

              {property?.buyerAgent ? (
                <AgentCard agent={property?.buyerAgent} />
              ) : (
                <div className='flex-1 text-center'>
                  <Button
                    variant='outline'
                    roundness='full'
                    className='font-semibold'
                  >
                    Add Agent
                  </Button>
                </div>
              )}
            </div>

            <div className='my-8 flex-1 text-grey-610'>
              <div className='relative flex items-center justify-between border-t-[2px] border-grey-630 py-5 before:absolute before:-top-[3px]  before:w-[32%] before:border-t-[4px] before:border-black'>
                <span className='absolute -top-3 left-[32%] h-6 w-6 rounded-full  bg-black'></span>
                <p>Send Offer</p>
                <p>Track Contingencies</p>
                <p>Title and Escrow</p>
                <p>Sign and Close</p>
              </div>
            </div>

            <CreateOffer
              agentAdded={property.buyerAgentAcceptance}
              propertyId={property._id}
            />
          </div>

          <div className='col-span-2 h-full bg-grey-690'>
            <PropertyTabs />
          </div>
        </section>
      ) : (
        <PropertyDetailLoader />
      )}
    </div>
  );
}

export default PropertyDetailLayout;

type CreateOfferProp = {
  agentAdded: boolean;
  propertyId: string;
};

const CreateOffer = ({ agentAdded, propertyId }: CreateOfferProp) => {
  const { userPath } = useCurrentUser();

  return (
    <div className='my-6  flex-1 text-center'>
      <h2 className='mb-4 text-3xl font-[500]'>Start by creating an offer</h2>

      <Button
        asChild
        disabled={!agentAdded}
        roundness='full'
        className={cn('font-bold', agentAdded ? 'bg-[#ccc]' : '')}
      >
        <Link href={`${userPath}/property/${propertyId}/offer/create`}>
          Make Offer
        </Link>
      </Button>

      <div className='relative'>
        <p className='absolute right-[10%] top-0 w-max rounded-lg bg-grey-880 p-4 text-center text-[0.563rem] text-black'>
          Add an agent to this property to activate button
        </p>
      </div>
    </div>
  );
};

const AwaitingAgent = ({
  buyerAgentAcceptance,
  propertyId,
}: {
  buyerAgentAcceptance: string;
  propertyId: string;
}) => {
  const { userPath } = useCurrentUser();

  return (
    <div className='my-6 flex-1 text-center'>
      <h2 className='text-3xl font-[500]'>Waiting for your agent to submit</h2>

      <Button
        asChild
        roundness='full'
        className={cn(
          'w-max font-bold',
          buyerAgentAcceptance ? 'bg-[#ccc]' : '',
        )}
      >
        <Link href={`${userPath}/property/${propertyId}/offer/preview`}>
          View Offer
        </Link>
      </Button>
    </div>
  );
};

const TimeLine = () => {
  return (
    <section>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-3xl font-semibold'>21 Days Left</p>
          <p className='flex items-center justify-center gap-x-2 text-center text-sm'>
            <span className='text-grey-670'>Finance </span>
            <span className='text-sm'>
              <Info height={16} width={16} color='#e8804c' />
            </span>
          </p>
        </div>

        <div>
          <p className='text-3xl font-semibold'>21 Days Left</p>
          <p className='flex items-center justify-center gap-x-2 text-center text-sm'>
            <span className='text-grey-670'>Finance </span>
            <span className='text-sm'>
              <Info height={16} width={16} color='#e8804c' />
            </span>
          </p>
        </div>

        <div>
          <p className='text-3xl font-semibold'>21 Days Left</p>
          <p className='flex items-center justify-center gap-x-2 text-center text-sm'>
            <span className='text-grey-670'>Finance </span>
            <span className='text-sm'>
              <Info height={16} width={16} color='#e8804c' />
            </span>
          </p>
        </div>
      </div>
      <div className='flex items-center justify-center gap-x-2'>
        {/* <CustomButton
          label="Edit Offer"
          className="px-8 py-2 mt-6 text-black bg-transparent border border-black w-max rounded-3xl"
        /> */}

        <Button variant='outline' roundness='full' className='mt-6'>
          Edit Offer
        </Button>

        <Button roundness='full' className='mt-6'>
          Complete
        </Button>

        {/* <CustomButton
          label="Complete"
          className="px-8 py-2 mt-6 text-white bg-black w-max rounded-3xl"
        /> */}
      </div>
    </section>
  );
};
