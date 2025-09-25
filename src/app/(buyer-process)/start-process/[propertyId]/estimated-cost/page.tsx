'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { cn } from '@/lib/utils';
import { Navigate } from '@/lib/Navigate';
import { usePurchaseProcessStore } from '@/store/use-purchase-process-store';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

type Name =
  | 'detailed_analytics'
  | 'buyer_showings'
  | 'assisted_disclosure'
  | 'platform_assisted'
  | 'review_cma'
  | 'closing_services'
  | 'agent_assisted_showings';

type FormField = {
  name: Name;
  title: string;
  subTitle: string;
  price: number;
};

const formFields: FormField[] = [
  {
    name: 'detailed_analytics',
    title: 'Review Detailed Analytics on property & obtain CMA',
    subTitle: '(15$ per property)',
    price: 15,
  },
  {
    name: 'agent_assisted_showings',
    title: 'Agent Assisted Showing Buyer Showings',
    subTitle: '(150$ per property)',
    price: 150,
  },
  {
    name: 'assisted_disclosure',
    title: 'AI assisted Disclosure Summary',
    subTitle: '(15$ per property)',
    price: 15,
  },
  {
    name: 'platform_assisted',
    title: `Move Forward with a Platform Assisted Offer template 
  And send offer to Listing Agent`,
    subTitle: '(250$ per property)',
    price: 250,
  },
  {
    name: 'review_cma',
    title: 'Review CMA & Disclosures with an expert for 15 mins',
    subTitle: '($100 per session)',
    price: 100,
  },
  {
    name: 'closing_services',
    title: `Closing Services`,
    subTitle: '( Flat $2500 per transaction )',
    price: 2500,
  },
];

const EstimatedCostPage: React.FC = () => {
  const { combinedProcessState, updateBuyerPreference } =
    usePurchaseProcessStore();
  const [selectedServices, setSelectedServices] = React.useState<Name[]>([]);

  const { propertyId: id = '' } = useParams<{
    propertyId: string;
  }>();

  const stateId = combinedProcessState.property;

  React.useEffect(() => {
    if (id && id !== stateId) {
      updateBuyerPreference('property', id);
    }
  }, [id, stateId, updateBuyerPreference]);

  const totalPrice = React.useMemo(() => {
    return selectedServices.reduce((total, serviceName) => {
      const service = formFields.find((field) => field.name === serviceName);
      return total + (service?.price || 0);
    }, 0);
  }, [selectedServices]);

  const handleServiceToggle = (name: Name) => {
    setSelectedServices((prev) =>
      prev.includes(name)
        ? prev.filter((service) => service !== name)
        : [...prev, name],
    );
  };

  if (stateId !== id) {
    return <Navigate to={`/start-process/${id}/transaction-agreement`} />;
  }

  return (
    <div className='adjusted-win-height flex w-full flex-col overflow-hidden pb-3'>
      <div className='flex h-full w-full flex-col justify-center pt-5'>
        <div className='grid gap-8 md:grid-cols-2'>
          {formFields.map(({ name, title, subTitle }) => (
            <div
              key={name}
              className={cn(
                'flex flex-row items-center justify-between rounded-3xl border border-grey-850 p-5',
                selectedServices.includes(name) ? 'bg-white' : 'bg-transparent',
              )}
            >
              <div className='space-y-0.5'>
                <Label className='text-base'>{title}</Label>
                <p className='text-sm text-muted-foreground'>{subTitle}</p>
              </div>
              <Switch
                checked={selectedServices.includes(name)}
                onCheckedChange={() => handleServiceToggle(name)}
              />
            </div>
          ))}
        </div>
        <div className='my-10 flex justify-end'>
          <div>
            <p className='text-xl text-ocOrange'>Estimated Cost</p>
            <h3 className='text-right text-2xl font-bold'>${totalPrice}</h3>
          </div>
        </div>
        <div className='mt-2 flex flex-col'>
          <Link href={`/start-process/${id}/transaction-agreement`}>
            <Button
              roundness='full'
              className='h-8 w-28 border-2 border-black bg-transparent px-9 py-2 text-black hover:border-none'
            >
              Back
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EstimatedCostPage;
