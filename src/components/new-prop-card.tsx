'use client';

import { InfoCard } from '@/components/property-infocard';
import { IProperty } from '@/interfaces/property.interface';
import { formatNumber } from '@/utils/math-utilities';
import { NumberFormatter } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { cn } from '../lib/utils';
import { useAuth } from '../shared/hooks/useAuth';
import CustomButton from './custom-button';
import SkeletonLoader from './skeleton-loader';
import { PropCardLoader } from './buy/buy-property-card-loader';
import ContactAgent from './dashboard/agent/contact-agent';
import { Icons } from './icons';
import Heading from './heading';
import { Button } from '@/components/ui/button';

interface Props extends IProperty {
  infoCard?: React.ReactNode;
  loading?: boolean;
}

function UpdatePropertyCard(props: Props) {
  const {
    images,
    infoCard,
    price,
    propertyAddressDetails,
    numBathroom,
    numBedroom,
    lotSizeUnit,
    lotSizeValue,
    _id,
  } = props;
  return (
    <Link target='_blank' href={`/buy/${_id ? _id : 1}/preview`}>
      <div className='relative h-[200px] w-[350px] rounded-t-lg'>
        {images.length > 0 && images[0].url ? (
          <div>
            <Image
              src={images[0].url}
              alt={props.propertyName}
              className='h-full w-full rounded-t-xl bg-no-repeat'
              fill
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
            <div className='absolute left-4 top-6'>{infoCard}</div>
          </div>
        ) : (
          <div className='flex h-full w-full items-center justify-center text-center'>
            <p>No Image Found</p>
          </div>
        )}
      </div>
      <div className='min-h-[200px] rounded-b-xl bg-black p-8 text-white'>
        <div className='pb-4 pt-2'>
          <p className='pb-2 font-bold'>
            <span>
              <NumberFormatter
                thousandSeparator
                prefix='$ '
                value={price?.amount}
              />
              {price?.amount}
            </span>
          </p>
          <p>{propertyAddressDetails?.formattedAddress}</p>
        </div>

        <div className='features flex items-center space-x-4'>
          <div>
            <div className='relative h-4 w-4'>
              <Image
                fill
                alt='profile'
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
                src='/assets/images/bed.svg'
              />
            </div>

            <div className='flex items-center gap-x-2 font-bold'>
              <span>{numBedroom} Bed</span>
            </div>
          </div>

          <div>
            <div className='relative h-4 w-4'>
              <Image
                fill
                alt='profile'
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
                src='/assets/images/bathroom-white.svg'
              />
            </div>

            <div className='flex items-center gap-x-2 font-bold'>
              <span>{numBathroom} Bath</span>
            </div>
          </div>

          <div>
            <div className='relative h-4 w-4'>
              <Image
                fill
                alt='profile'
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center',
                }}
                src='/assets/images/area-white.svg'
              />
            </div>
            <div className='flex items-center gap-x-2 font-bold'>
              <span>{`${lotSizeUnit} ${lotSizeValue}`}</span>{' '}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function PropertyCard(props: Props) {
  const {
    images,
    infoCard,
    price,
    propertyAddressDetails,
    numBathroom,
    numBedroom,
    lotSizeUnit,
    lotSizeValue,
    loading,
    _id,
  } = props;
  return (
    <section className='w-full md:min-w-[350px]'>
      {loading ? (
        <PropCardLoader />
      ) : (
        <div>
          <div className='relative  h-48  w-full rounded-t-lg'>
            {images.length > 0 && images[0].url ? (
              <div>
                <Image
                  src={images[0].url}
                  alt={props.propertyName}
                  className='h-full w-full rounded-t-xl bg-no-repeat'
                  fill
                  style={{
                    objectFit: 'cover',
                    objectPosition: 'center',
                  }}
                />
                {props.currentStatus ? (
                  <div className='absolute left-4 top-6'>
                    {infoCard}
                    <InfoCard title={props.currentStatus} />
                  </div>
                ) : null}
              </div>
            ) : (
              <div className='flex h-full w-full items-center justify-center text-center'>
                <p>No Image Found</p>
              </div>
            )}
          </div>
          <div className='rounded-b-xl bg-black px-6 py-4 text-white'>
            <div className='py-3'>
              <div className='mb-4 flex items-center justify-between'>
                <p className='text-xl font-bold'>
                  {formatNumber(price?.amount || 0)}
                </p>

                <p className='flex items-center gap-x-2'>
                  <Icons.ColoredAi />
                  <span className='text-2xl text-[#FFE4A8]'>80%</span>
                </p>
              </div>
              <p className='mb-10 text-sm'>
                {propertyAddressDetails?.formattedAddress}
              </p>
            </div>
            <div className='flex items-start justify-between'>
              <div className=''>
                <div className='relative mb-2 h-6 w-6'>
                  <Image
                    fill
                    alt='profile'
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                    src='/assets/images/bed.svg'
                  />
                </div>
                <div className='flex items-center gap-x-2 font-bold'>
                  <span>{numBedroom || 0} Bed</span>
                </div>
              </div>
              <div className='flex flex-1 flex-col  items-center justify-center px-8'>
                <div className='relative mb-2 h-6 w-6'>
                  <Image
                    fill
                    alt='profile'
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                    src='/assets/images/bathroom-white.svg'
                  />
                </div>
                <div className='flex w-full items-center justify-between gap-x-2 font-bold'>
                  <Icons.Elipsis />
                  <span>{numBathroom || 0} Bath</span>
                  <Icons.Elipsis />
                </div>
              </div>
              <div className=''>
                <div className='relative mb-2 h-6 w-6'>
                  <Image
                    fill
                    alt='profile'
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                    src='/assets/images/area-white.svg'
                  />
                </div>
                <div className='flex items-center gap-x-2 font-bold lowercase'>
                  <span>{`${lotSizeValue || 0} ${lotSizeUnit || 'sft'}`}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

type PreviewProp = {
  property: IProperty;
  handleOpenModal: () => void;
  loading: boolean;
};

function PreviewCard({ property, handleOpenModal, loading }: PreviewProp) {
  const [opened, { open, close }] = useDisclosure(false);
  const { user } = useAuth();
  const propertyOwner =
    user !== null &&
    property?.seller._id !== undefined &&
    user?.id === property?.seller._id;
  return (
    <div>
      <ContactAgent opened={opened} close={close} open={open} />
      <div>
        {loading ? (
          <SkeletonLoader className={cn('h-[400px] w-[350px]')} />
        ) : (
          <div>
            <div className='rounded-md bg-[#f4f4f4] px-4 py-6'>
              <Heading
                title='Higlights'
                className='bg-transparent pb-4 text-xl font-light text-black'
              />

              <div className='space-y-3 border-b-[1px] border-b-black pb-4'>
                <div className='flex items-center gap-x-2 font-light text-black'>
                  <Icons.School className='h-10 w-10' />
                  <span>West lake middle High School</span>
                </div>
                <div className='flex items-center gap-x-2 font-light text-black'>
                  <Icons.Title className='h-10 w-10' />
                  <span>Wood Flooring</span>
                </div>{' '}
                <div className='flex items-center gap-x-2 font-light text-black'>
                  <Icons.Hammer className='h-10 w-10' />
                  <span>Newly Remodelled</span>
                </div>
                <div className='px-12 font-light text-black'>
                  <span>No HOA</span>
                </div>
              </div>
              <div>
                {/* <InfoCard
                title={property?.currentStatus}
                className="text-white bg-black"
              />
              <div className="pt-2 pb-3">
                <h2 className="font-bold">{property?.propertyName}</h2>
                <p>{`${property?.propertyAddressDetails?.province}, ${property?.propertyAddressDetails?.state} ${property?.propertyAddressDetails?.postalCode}`}</p>
              </div>

              <div>
                <h3 className="text-sm text-grey-370">Price</h3>
                <p className="text-base font-bold">
                  ${property?.price?.amount}
                </p>
              </div>

              <div className="flex items-center gap-x-6 py-4 border-b-[1px] border-b-black my-4">
                <div>
                  <h3 className="text-sm text-grey-370">Bathroom</h3>
                  <p className="text-base font-bold">{property?.numBathroom}</p>
                </div>
                <div>
                  <h3 className="text-sm text-grey-370">Bed Room</h3>
                  <p className="text-base font-bold">{property?.numBedroom}</p>
                </div>
              </div> */}

                {propertyOwner ? null : (
                  <>
                    {/* <CustomButton
                      label="Start Process"
                      onClick={handleOpenModal}
                      className="w-full text-sm mt-4 font-bold text-white bg-black rounded-md"
                    /> */}

                    <Button
                      onClick={handleOpenModal}
                      className='mt-4 w-full font-bold'
                    >
                      Start Process
                    </Button>

                    <Button
                      variant='ghost'
                      onClick={handleOpenModal}
                      className='mt-4'
                    >
                      Take a Tour
                    </Button>

                    {/* <CustomButton
                      variant="ghost"
                      label="Take a Tour"
                      onClick={handleOpenModal}
                      className="w-full text-base  font-bold text-center bg-transparent text-black"
                    /> */}
                  </>
                )}
              </div>
            </div>
            <div className='rouned-2xl mt-8 flex items-center justify-between gap-x-4 rounded-lg bg-ocOrange px-4 py-6'>
              <div className='flex items-center gap-x-2'>
                <div className='relative h-16 w-16'>
                  <Image
                    src='/assets/images/sold-prty.jpg'
                    alt={`test`}
                    className='h-fit w-fit rounded-full bg-no-repeat'
                    fill
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                  />
                </div>
                <div className='text-sm'>
                  <p className='font-bold'>Daniel Smith</p>
                  <h4 className='text-white'>Listing Agent</h4>
                </div>
              </div>
              <div
                onClick={open}
                className='flex cursor-pointer items-center justify-between gap-x-2 text-sm text-white'
              >
                <div className='flex flex-col items-center justify-center text-center'>
                  <MessageCircle />
                  <span>Message Agent</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { UpdatePropertyCard, PropertyCard, PreviewCard };
