'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

import CustomProgressBar from '@/components/customs/custom-ring-progress';
import { useSelector } from 'react-redux';
import { selectPropertyInformation } from '@/slices/verification/selectors/selectors';
import { selectVerification } from '@/slices/verification/verification-slice';
import useTimer from '../timer';
import { shortenAddress } from '@/lib/helpers';
import { useEditPropertyFormContext } from '@/providers/edit-property-context';
import { Loader } from 'lucide-react';

type IListingProcessProps = {
  link: string;
  propertyData: any;
  price?: string;
  formattedAddress?: string;
  bed?: string;
  bath?: string;
  size?: string;
  badgeColor?: string;
  currentStatus?: string;
  agent?:any;
};

const ListingProcess: React.FC<IListingProcessProps> = ({ link, propertyData , agent }) => {
  const property_info = useSelector(selectPropertyInformation);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const { timeLeft, startTimer } = useTimer({
    initialTimeLeft: 2 * 60 * 1000,
  });

  const searchParams = useSearchParams();
  const [selectedPropertyId, setSelectedPropertyId] = React.useState<
    string | null
  >(searchParams.get('id'));
  const { methods } = useEditPropertyFormContext();
  const values = methods.getValues();
  // React.useEffect(() => {
  //   if (timeLeft <= 0) {
  //     setStatus('verified');
  //   } else {
  //     startTimer();
  //   }
  // }, [timeLeft, startTimer, setStatus]);

  const isEditEnabled = ['verified', 'now showing'].includes(
    property_info.currentStatus?.toLocaleLowerCase() || '',
  );

  const isGoToTransactionEnabled = ['now showing'].includes(
    property_info.currentStatus?.toLocaleLowerCase() || '',
  );

  const handleEditClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isEditEnabled) {
      event.preventDefault();
    }
  };

  const handleGoToTransaction = () => {
    if (!isGoToTransactionEnabled) {
      router.push(`/dashboard/seller/${propertyId}/transactions?id=${propertyId}`);
    }
  };

  const handleVerifyNow = () => {
    // setIsLoading(true);
    router.push(`/dashboard/seller/listing/create?id=${propertyId}`);
  };

  const router = useRouter();
  const { isVerified } = useSelector(selectVerification);
  const propertyId = useSearchParams().get('id') || '';

  const [tooltipText, setTooltipText] = React.useState<string | null>(null);
  const [isPublished, setIsPublished] = React.useState(false);

  const handleMouseEnter = (tooltip: string) => {
    setTooltipText(tooltip);
  };

  const handleBack = () => {
    router.push('/dashboard?tab=listings');
  };

  const imageUrl =
    property_info?.images[0]?.url || '/assets/icons/tinyHouseSample.svg';

  const handleMouseLeave = () => {
    setTooltipText(null);
  };

  const shortAddress = shortenAddress(
    property_info.propertyAddressDetails.formattedAddress,
  );

  const badgeColorClass = (() => {
    switch (propertyData?.status?.toLocaleLowerCase()) {
      case 'pending':
        return 'bg-[#FFD600]';
      case 'now showing':
        return 'bg-[#ACF337]';
      case 'verified':
        return 'bg-[#00FF00]';
      case 'not verified':
        return 'bg-[#FF8548]';
      case 'under contract':
        return 'bg-[#EFC65D]';
      case 'sold':
        return 'bg-[#0000FF]';
      default:
        return 'bg-[#F7F2EB]';
    }
  })();

  const renderHeader = () => {
    switch (propertyData?.status?.toLowerCase()) {
      case 'pending':
        return (
          <div>
            <p>Once your property is verified, you can publish.</p>
            <div>
              <button
                className={`mt-3 flex items-center justify-center gap-2 rounded px-8 text-md md:h-[2.4rem] md:rounded-[1.625rem] ${isLoading
                    ? 'cursor-not-allowed bg-gray-300 text-gray-600'
                    : 'bg-black text-white'
                  }`}
                onClick={
                  property_info.currentStatus?.toLowerCase() ===
                    'pending verification'
                    ? handleVerifyNow
                    : undefined
                }
                disabled={
                  isLoading ||
                  property_info.currentStatus?.toLowerCase() !==
                  'pending verification'
                }
              >
                {isLoading ? (
                  <Loader className='animate-spin' size={16} />
                ) : (
                  'Verify Now'
                )}
              </button>
            </div>
          </div>
        );
      case 'verified':
        return 'Edit the property and publish when you’re ready.';
      case 'now showing':
        return 'Your property is Live! Wishing you an easy closing.';
      default:
        return '';
    }
  };

  const sideNavItems = [
    {
      name: 'globe',
      icon:
        property_info.currentStatus?.toLowerCase() === 'now showing'
          ? '/assets/icons/black-globe.svg'
          : '/assets/icons/globe.svg',
      tooltip:
        property_info.currentStatus?.toLowerCase() === 'now showing'
          ? 'Published'
          : isPublished
            ? 'Publish'
            : 'Publish',
    },

    { name: 'speaker', icon: '/assets/icons/speaker.svg', tooltip: 'Promote' },
    {
      name: 'convert',
      icon: '/assets/icons/convert.svg',
      tooltip: 'Engagement',
    },
    { name: 'key', icon: '/assets/icons/key.svg', tooltip: 'Concierge' },
  ];

  const navItems = [
    {
      name: 'preview',
      icon: '/assets/icons/preview.svg',
      link: `/dashboard/seller/preview/listingpreview?propertyId=${propertyData?.id}&&listingId=${propertyData?.listingid}`,
    },
    {
      name: 'edit facts',
      icon: '/assets/icons/edit.svg',
      link: `/dashboard/seller/listing/edit?id=${propertyData?.id}`,
      disabled: false,
    },
    {
      name: 'analytics',
      icon: '/assets/icons/analytics.svg',
      link: `/dashboard/seller/${propertyData?.id}/analytics`,
      disabled: true,
    },
    {
      name: 'agreement',
      icon: '/assets/icons/agreement.svg',
      link: `/dashboard/seller/sell-agreement?id=${propertyData?.id}`,
      disabled:true
    },
    {
      name: 'add agent',
      icon: '/assets/icons/addAgent.svg',
      link: `/dashboard/seller/${propertyData?.id}/add-selling-agent?mean_type=snaphomz_agents`,
      //link: `/dashboard/seller/${propertyData?.id}/select-agent`,
      disabled:true
    },
    {
      name: 'document',
      icon: '/assets/icons/documents.png',
      link: `/dashboard/seller/docs?id=${propertyData?.id}&manage=documents`,
      disabled:true
    },
  ];
  
  return (
    <section className='h-screen-nav bg-grey-190 py-6'>
      <section
        className='flex cursor-pointer items-center px-[3.219rem]'
        style={{ paddingTop: '0', marginTop: '0', marginBottom: '0' }}
        onClick={handleBack}
      >
        <Image
          src='/assets/images/arrow-back.svg'
          alt='Back'
          height={19}
          width={18}
        />
        <p className='ml-5 cursor-pointer text-md font-medium' onClick={() => router.push('/dashboard/seller')} >
          Back to dashboard
        </p>
      </section>

      <section className='mt-24 flex justify-between px-[3.219rem]'>
        <section className='w-1/2'>
          <section className="w-[35.75rem] rounded-2xl bg-black p-7 shadow-lg">
            {/* Top Row: Image, Info, Progress */}
            <section className="flex items-start gap-6">
              <div className="rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={propertyData?.mls_data?.data?.media?.primaryListingImageUrl||"/assets/images/placeholder.svg"}
                  alt={propertyData?.mls_data?.data?.courtseyOf || 'Property'}
                  height={123}
                  width={123}
                  unoptimized
                  className="object-cover rounded-xl"
                />
              </div>

              <div className="flex flex-col justify-between text-white space-y-2 flex-grow">
                <h2 className="text-xl font-semibold">{propertyData?.mls_data?.data?.address?.unparsedAddress}</h2>
                <p className="text-sm text-gray-300">{propertyData?.mls_data?.data?.courtseyOf}</p>
              </div>

              <div className="ml-auto">
                <CustomProgressBar
                  trackColor="#4B5563"
                  indicatorColor="#F97316"
                  size={90}
                  progress={25}
                  trackWidth={8}
                  indicatorWidth={8}
                  label={
                    <p className="text-sm text-white font-medium text-center">25%</p>
                  }
                />
              </div>
            </section>

            {/* Bottom Section: Icons and Details */}
            <section className="mt-8 flex flex-col items-center">
              <div className="flex justify-around w-full max-w-[75%]">
                <div className="flex flex-col items-center">
                  <Image src="/assets/images/bed.svg" alt="Bed" height={30} width={30} />
                  <p className="text-white mt-2 text-sm">{propertyData?.mls_data?.data?.property?.bedroomsTotal} Bed</p>
                </div>
                <div className="flex flex-col items-center">
                  <Image src="/assets/images/bath.svg" alt="Bath" height={30} width={30} />
                  <p className="text-white mt-2 text-sm">{propertyData?.mls_data?.data?.property?.bathroomsTotal} Bath</p>
                </div>
                <div className="flex flex-col items-center">
                  <Image src="/assets/images/feet.png" alt="Size" height={30} width={30} />
                  <p className="text-white mt-2 text-sm">
                    {propertyData?.mls_data?.data?.property?.livingArea} {propertyData?.mls_data?.data?.pricePerSqFt || 0}
                  </p>
                </div>
              </div>

              {/* <div className="flex items-center mt-6">
      <p className="text-lg text-gray-300">{propertyData?.bedRooms} bed</p>
      <Image
        src="/assets/images/ellipse.svg"
        alt="Dot"
        height={5}
        width={5}
        className="mx-4"
      />
      <p className="text-lg text-gray-300">{propertyData?.bathRooms} bath</p>
      <Image
        src="/assets/images/ellipse.svg"
        alt="Dot"
        height={5}
        width={5}
        className="mx-4"
      />
      <p className="text-lg text-gray-300">
        {property_info.lotSizeValue} {property_info.lotSizeUnit}
      </p>
    </div> */}
            </section>
          </section>
          <section
            className={`mt-4 inline-block rounded-full ${badgeColorClass}`}
          >
            <p className='px-4 text-base font-bold'>
              {propertyData?.status?.toLocaleUpperCase()}
            </p>
          </section>
        </section>

        <section className='ml-12 flex items-start pt-12'>
          <p className='text-medium w-9/12 text-[2.5rem] text-black'>
            {renderHeader()}
          </p>
        </section>

        <nav className='absolute right-12 top-36'>
          <ul>
            {sideNavItems.map(({ name, icon, tooltip }, index) => (
              <li
                key={name}
                className='relative mb-10 flex h-[4.625rem] w-[4.625rem] items-center justify-center rounded-full bg-white'
                onMouseEnter={() => setTooltipText(tooltip)}
                onMouseLeave={() => setTooltipText(null)}
              >
                <Image
                  width={37}
                  height={37}
                  objectFit='contain'
                  src={
                    (name === 'globe' && status === 'verified') ||
                      (index === 0 && isPublished)
                      ? '/assets/icons/pause.svg'
                      : icon
                  }
                  alt={name}
                />

                {tooltipText === tooltip && (
                  <div className='absolute left-0 top-0 mt-[-1.5rem] whitespace-nowrap rounded bg-black px-2 py-1 text-xs text-white'>
                    {tooltip}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </section>
      <nav className='absolute bottom-0 left-0 right-0 z-10 flex w-full items-center justify-between bg-ocOrange px-[3.219rem] md:h-[8rem]'>
        <ul className='flex w-3/5 items-center justify-between'>
          {navItems.map(({ icon, name, link, disabled }) => {
            const isRestricted =
              // (name === 'edit facts' && !isEditEnabled) ||
              (name === 'analytics' && disabled) || (name === 'agreement' && disabled)|| (name === "add agent" && propertyData?.selling_agent?.agent_id ) || (name === "add agent" && agent  )

            return link ? (
              <Link
                href={isRestricted ? '#' : link}
                key={name}
                onClick={isRestricted ? handleEditClick : undefined}
              >
                <li className='flex flex-col items-center'>
                  <Image
                    width={29}
                    height={40}
                    objectFit='contain'
                    src={icon}
                    alt={name}
                    className={`${isRestricted ? 'cursor-not-allowed opacity-50' : ''
                      }`}
                  />
                  <p
                    className={`mt-3 text-[1.2rem] font-medium capitalize ${isRestricted
                        ? 'cursor-not-allowed text-white opacity-50'
                        : 'text-white'
                      }`}
                  >
                    {name}
                  </p>
                </li>
              </Link>
            ) : (
              <li className='flex flex-col items-center' key={name}>
                <Image
                  width={29}
                  height={40}
                  objectFit='contain'
                  src={icon}
                  alt={name}
                  className={`${isRestricted ? 'cursor-not-allowed opacity-50' : ''
                    }`}
                />

                <p
                  className={`mt-3 text-[1.2rem] font-medium capitalize ${isRestricted
                      ? 'cursor-not-allowed text-white opacity-50'
                      : 'text-white'
                    }`}
                >
                  {name}
                </p>
              </li>
            );
          })}
        </ul>
        <button
          className={`rounded px-12 md:h-[2.875rem] md:rounded-[1.625rem] ${!isGoToTransactionEnabled
              ? 'bg-black text-white'
              : 'cursor-not-allowed bg-[#BFBFBF] text-white'
            }`}
          onClick={handleGoToTransaction}
          // disabled={!isGoToTransactionEnabled}
        >
          Go to Transaction
        </button>
      </nav>
    </section>
  );
};

export default ListingProcess;
