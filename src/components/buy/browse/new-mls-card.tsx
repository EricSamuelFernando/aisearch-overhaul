'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Icons } from '@/components/icons';
import { MlsPropertyListing } from '@/interfaces/mls-data.interface';
import { imageLoader } from '@/utils/image-loader';
import { formatCurrency } from '@/lib/utils';
import { usePropertyActions } from '@/shared/hooks/useProperty';
import { useCallback } from 'react';

import { usePropertyStore } from '@/store/use-property-store';
import { CheckSquare, Square } from 'lucide-react';
import { useRouter } from 'next/navigation';

const NewMLSPropertyCard = (props: Readonly<MlsPropertyListing>) => {
  const { saveMlsProperty } = usePropertyActions();
  const router = useRouter();

  // Comparison Store
  const { isCompareMode, toggleCompareProperty, selectedCompareProperties } = usePropertyStore();

  const isSelectedForCompare = selectedCompareProperties.some((p: any) => {
    // Robust ID check
    const pId = p.data.id || p.data._id || p.data.ListingKey;
    const myId = props.ListingKey;
    return pId == myId;
  });

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isCompareMode) {
      e.preventDefault();
      e.stopPropagation();
      toggleCompareProperty({
        data: props,
        type: 'mls'
      });
      return;
    }
    const router = useRouter();


    const isSelectedForCompare = selectedCompareProperties.some((p: any) => {
      // Robust ID check
      const pId = p.data.id || p.data._id || p.data.ListingKey;
      const myId = props.ListingKey;
      return pId == myId;
    });

    const handleClick = useCallback((e: React.MouseEvent) => {
      if (isCompareMode) {
        e.preventDefault();
        e.stopPropagation();
        toggleCompareProperty({
          data: props,
          type: 'mls'
        });
        return;
      }
      saveMlsProperty(props);
      router.push(`/buy/${props.ListingKey}/mls/preview`);
    }, [props, saveMlsProperty, isCompareMode, router, toggleCompareProperty]);

    // Conditional wrapper: Div in compare mode, Link otherwise logic handled via onClick prevention
    // Actually, we can just use a Div with onClick for both, or keep Link and preventDefault.
    // Using a Div is safer to avoid hydration errors or nesting issues if we messed up.
    // But to keep it simple, we can just intercept the Link interaction.
    router.push(`/buy/${props.ListingKey}/mls/preview`);
  }, [props, saveMlsProperty, isCompareMode, router, toggleCompareProperty]);

  // Conditional wrapper: Div in compare mode, Link otherwise logic handled via onClick prevention
  // Actually, we can just use a Div with onClick for both, or keep Link and preventDefault.
  // Using a Div is safer to avoid hydration errors or nesting issues if we messed up.
  // But to keep it simple, we can just intercept the Link interaction.

  return (
    <div
      onClick={handleClick}
      className={`relative max-h-100 flex w-full cursor-pointer flex-col overflow-hidden rounded-xl shadow-md transition duration-300 ${isSelectedForCompare ? 'ring-4 ring-ocOrange' : ''}`}
    >
      {/* Compare Mode Checkbox Overlay */}
      {isCompareMode && (
        <div className="absolute top-4 left-4 z-50">
          <button
            disabled={selectedCompareProperties.length >= 4 && !isSelectedForCompare}
            onClick={(e) => {
              e.stopPropagation();
              toggleCompareProperty({
                data: props,
                type: 'mls'
              });
            }}
            className={`p-2 rounded-full transition-all duration-200 ${isSelectedForCompare
              ? 'bg-ocOrange text-white'
              : selectedCompareProperties.length >= 4
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-white/80 text-gray-500 hover:bg-white hover:text-ocOrange'
              }`}
          >
            {isSelectedForCompare ? <CheckSquare size={24} /> : <Square size={24} />}
            {isSelectedForCompare && <span className="sr-only">Selected</span>}
          </button>
          <span
            className={`ml-2 px-2 py-1 rounded-md text-sm font-bold shadow-sm transition-all duration-200 ${isSelectedForCompare
              ? 'bg-ocOrange text-white'
              : selectedCompareProperties.length >= 4
                ? 'bg-gray-100 text-gray-400 opacity-50'
                : 'bg-white/80 text-black'
              }`}
          >
            {isSelectedForCompare ? 'Selected' : selectedCompareProperties.length >= 4 ? 'Limit Reached' : 'Compare'}
          </span>
        </div>
      )}

      <div className='relative aspect-video h-44 w-full object-cover object-center'>
        <Image
          className='aspect-video h-full w-full object-cover object-center'
          fill
          loader={imageLoader}
          alt='snaphomz-property-image'
          src={props?.Media?.[0]?.Thumbnail ?? '/assets/images/placeholder.svg'}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/assets/images/placeholder.svg';
          }}
        />
      </div>
      <div className='flex flex-1 flex-col bg-black px-5 pb-2 pt-1 text-white'>
        <div className='pt-0.5'>
          <div className='mb-1.5 flex items-center justify-between'>
            <h3 className='truncate text-xl font-bold leading-8'>
              {formatCurrency(props.ListPrice || 0, 'USD')}
            </h3>
          </div>
          <p className='mb-2.5 line-clamp-2 text-sm'>{props.UnparsedAddress}</p>
        </div>
        <div className='flex flex-1 flex-col justify-end'>
          <div className='flex items-start justify-between'>
            {[
              { icon: 'bed.svg', value: props.BedroomsTotal, unit: 'Bed' },
              {
                icon: 'bathroom-white.svg',
                value: props.BathroomsTotalInteger,
                unit: 'Bath',
              },
              {
                icon: 'area-white.svg',
                value: props.LotSizeArea,
                unit: props.LotSizeUnits || 'sqft',
              },
            ].map((item, index) => (
              <div
                key={item.icon}
                className={
                  index === 1
                    ? 'flex flex-1 flex-col items-center justify-center px-8'
                    : ''
                }
              >
                <div className='relative mb-1 h-6 w-6'>
                  <Image
                    fill
                    alt={item.unit}
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                    src={`/assets/images/${item.icon}`}
                  />
                </div>
                <div className='flex items-center gap-x-2 text-base font-bold leading-6 text-white'>
                  {index === 1 && <Icons.Elipsis />}
                  <span>{`${item.value || 0} ${item.unit}`}</span>
                  {index === 1 && <Icons.Elipsis />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewMLSPropertyCard;