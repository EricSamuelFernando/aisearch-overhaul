'use client';

import * as React from 'react';
import { nanoid } from 'nanoid';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import {
  FloorIcon,
  HammerIcon,
  HouseIcon,
  SchoolIcon,
} from '@public/assets/icons';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import { AddAgentProcess } from '../onboard';
import { Tooltip } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGetLatestFieldsAnswer } from '@/hooks/api/property-tour/usePropertyTour';
import { useSelector } from 'react-redux';
import { userData } from '@/slices/auth/auth.slice';
import { MORTGAGE_APPLICATION_URL } from '@/shared/constants/env';

interface HeroHighlightsProps {
  className?: string;
  feature?: string;
  houseFeature?: string;
  id: string;
  offerTerms?: string;
  schoolDistrict?: string;
  mortgageDisable?:boolean
  propertyId?:string
  listingId?:string
}

const HeroHighlights: React.FC<HeroHighlightsProps> = ({
  className,
  feature = 'Newly Remodelled',
  houseFeature = 'Wood Flooring',
  id,
  offerTerms = 'Final Offer Terms',
  schoolDistrict = 'School',
  mortgageDisable,
  propertyId,
  listingId
}) => {
  const router = useRouter()

  const currentUser = useSelector(userData);

  const { data, error, isLoading, isError } = useGetLatestFieldsAnswer(currentUser?.id, propertyId);

  console.log(data?.resp)

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col space-y-6 rounded-lg bg-grey-390 px-5 py-6',
        className,
      )}
    >
      <h4 className='text-xl font-medium leading-8'>Highlights</h4>
      <div className='flex w-full flex-col gap-3 border-b border-grey-850  pb-4'>
        <HightLightComponent icon={SchoolIcon} title={schoolDistrict} />
        <HightLightComponent icon={FloorIcon} title={houseFeature} />
        <HightLightComponent icon={HammerIcon} title={feature} />
        <HightLightComponent icon={HouseIcon} title={offerTerms} />
      </div>
      <div className="flex w-full flex-col space-y-2">
        
           
         { typeof data?.id === 'number' ?
         <>
          <Button className="w-full text-lg font-medium" type="button">
          <Link
            href={""}
            onClick={(e) => {
              e.preventDefault();
              router.push(`${MORTGAGE_APPLICATION_URL}/start-process?listingId=${listingId}&propertyId=${propertyId}&means=snaphomz_agents`);
            }}
            className="w-full" // Make the link take the full width of the button
          >
           Continue The Process
          </Link>
        </Button>
        <Button className="w-full text-lg bg-orange-500 font-medium" type="button">
           <Link
             href={""}
             onClick={(e) => {
               e.preventDefault();
               router.push(`/start-process/${id}/transaction-agreement`);
             }}
             className="w-full" // Make the link take the full width of the button
           >
             Start New Process
           </Link>
         </Button>
        </>
        :
      //   <Button className="w-full text-lg font-medium" type="button" disabled>
      //   <Link
      //     href={""}
      //     onClick={(e) => {
      //       e.preventDefault();
      //       router.push(`/start-process/${id}/transaction-agreement`);
      //     }}
      //     className="w-full" // Make the link take the full width of the button
      //   >
      //     Start The Process
      //   </Link>
      // </Button>
       <Tooltip className='cursor-pointer' title="Coming Soon" placement="bottom">
          <span> {/* Wrap button with a span so the tooltip works */}
            <Button className="w-full text-lg font-medium" type="button" disabled>
              <Link href={`/take-tour/${id}/finance-process`} className="w-full">
                 Start The Process
              </Link>
            </Button>
          </span>
        </Tooltip>
        }
       

        <Tooltip className='cursor-pointer' title="Coming Soon" placement="bottom">
          <span> {/* Wrap button with a span so the tooltip works */}
            <Button className="w-full text-lg font-medium" type="button" disabled>
              <Link href={`/take-tour/${id}/finance-process`} className="w-full">
                Advanced Analytics
              </Link>
            </Button>
          </span>
        </Tooltip>

        {/* <AddAgentProcess/> */}
      </div>

    </div>
  );
};

type HightLightComponentProps = {
  icon: string | StaticImport;
  title: string;
};

const HightLightComponent = ({
  icon,
  title,
}: HightLightComponentProps): React.ReactElement => (
  <div className='inline-flex items-center space-x-6' key={title}>
    <Image
      alt={`Highlight ${title}`}
      src={icon}
      width={24}
      height={24}
      className='object-contain object-center'
    />
    <p className='text-base font-medium text-black'>{title}</p>
  </div>
);

export { HeroHighlights };
