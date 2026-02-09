'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { IProperty } from '@/interfaces/property.interface';
import { formatCurrency } from '@/lib/utils';
import { usePropertyActions } from '@/shared/hooks/useProperty';
import NImage from 'next/image';
import { imageLoader } from '@/utils/image-loader';
import { Icons } from '@/components/icons';
import { useAppSelector } from '@/lib/hook';
import EmblaCarousel from '@/components/customs/carousel/embla-carousel';
import { useRouter } from 'next/navigation';
import { Bath, BedDouble, Ruler } from 'lucide-react';
import { TransRoundedButton } from '../dashboard/main/TransRoundedButton';

type PropertyCardsProps = IProperty;

const SellPropertyCards = (props: any) => {
    const { saveCurrenctProperty } = usePropertyActions();
    const router = useRouter();
    const { propertyQuery } = useAppSelector((state) => state.property);
    const [carouselEvent, setCarouselEvent] = useState(false);

    const slides = props?.propertyData?.media?.photosList?.slice(0, 4)?.map((image: any, idx: number) => {
        if (!image?.lowRes) return null;
        return (
            <div key={idx} className="relative w-full h-full aspect-video">
                <NImage
                    src={image.lowRes}
                    alt="snaphomz-property-image"
                    fill
                    unoptimized
                    className="object-cover"
                />
            </div>
        );
    });

    const handleClick = (e: React.MouseEvent) => {
        if (!carouselEvent) {
            props?.openClick?.()
        }
    };

    const handleCarouselButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCarouselEvent(true);
        setTimeout(() => setCarouselEvent(false), 300);
    };

    return (
        <div
            onClick={handleClick}
            className="flex w-full min-h-[520px] max-h-[520px] cursor-pointer flex-col overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl bg-black border border-gray-800 hover:border-ocOrange hover:scale-[1.02] group"
        >
            {/* Image / Carousel Section */}
            <div className="relative h-60 w-full overflow-hidden">
                {props?.propertyData?.media?.photosList?.length ? (
                    <div className="relative h-full">
                        <EmblaCarousel
                            slides={slides}
                            options={{ loop: true }}
                            onScrollButtonClick={handleCarouselButtonClick}
                        />
                        <div className="absolute top-3 left-3 bg-ocOrange px-2 py-1 rounded-md shadow-sm">
                            <span className="text-white text-xs font-bold">
                                {props?.propertyData?.standardStatus || 'FOR SALE'}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="relative h-full w-full">
                        <NImage
                            className="h-full w-full object-cover object-center"
                            fill
                            loader={imageLoader}
                            alt="snaphomz-property-image"
                            src={
                                props?.propertyData?.media?.primaryListingImageUrl
                                    ? props?.propertyData?.media?.primaryListingImageUrl
                                    : '/assets/images/placeholder.svg'
                            }
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/assets/images/placeholder.svg';
                            }}
                        />
                        <div className="absolute top-3 left-3 bg-ocOrange px-2 py-1 rounded-md">
                            <span className="text-white text-xs font-bold">{props?.propertyData?.standardStatus}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="flex flex-1 flex-col justify-start p-4 gap-2 group-hover:bg-black transition-colors duration-300">
                {/* Price */}
                <div className="flex items-center justify-start">
                    <h3 className="text-2xl font-bold text-white group-hover:text-ocOrange transition-colors duration-300">
                        {formatCurrency(props?.propertyData?.listPrice || 0, 'USD')}
                    </h3>
                </div>

                {/* Courtesy */}
              {/* <p className="text-sm text-gray-300">{props?.propertyData?.courtesyOf}</p> */}

                {/* Address */}
                <div className="text-sm text-white leading-snug">
                    <span className="font-medium">{props?.propertyData?.address?.unparsedAddress},</span>
                    {" "}
                    <span>
                        {props?.propertyData?.address?.city}, {props?.propertyData?.address?.stateOrProvince}{' '}
                        {props?.propertyData?.address?.zipCode}
                    </span>
                </div>
                <div
                    className="flex justify-end gap-2 pt-4"
                    onClick={(e) => e.stopPropagation()} // prevent triggering card onClick
                >
                    <TransRoundedButton
                        label='Edit'
                        onClick={() =>
                            router.push(
                                `/dashboard/seller/listing/edit?id=${props?.id}`,
                            )
                        }
                        variant='secondary'
                        className={`w-[30%] py-2 ${props?.isEditEnabled
                            ? 'text-white'
                            : 'cursor-not-allowed opacity-50'
                            }`}
                        disabled={!props?.isEditEnabled}
                    />

                    <TransRoundedButton
                        label={
                            props?.isDeleting === props?.id ? 'Removing...' : 'Remove'
                        }
                        onClick={() => {                            
                            props?.openDeleteModal(props?.id,props?.listing_id)
                        }}
                        variant='danger'
                        className='w-[30%] py-2'
                        disabled={props?.isDeleting === props?.id}
                        loading={props?.isDeleting === props?.id}
                    />
                </div>
                {/* Features */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-700">
                    {[
                        {
                            icon: <BedDouble className="w-4 h-4 text-ocOrange" />,
                            value: props?.propertyData?.property?.bedroomsTotal || 0,
                            unit: 'Bed',
                        },
                        {
                            icon: <Bath className="w-4 h-4 text-ocOrange" />,
                            value: props?.propertyData?.property?.bathroomsTotal || 0,
                            unit: 'Bath',
                        },
                        {
                            icon: <Ruler className="w-4 h-4 text-ocOrange" />,
                            value: props?.propertyData?.property?.livingArea || 0,
                            unit: 'sqft',
                        },
                    ].map((item, index) => (
                        <div key={index} className="flex flex-col text-center w-1/3">
                            {item.icon}
                            <div className="flex items-center gap-1 mt-1 text-white text-base font-semibold">
                                <span>{item.value}</span>
                                <span className="text-xs text-gray-400">{item.unit}</span>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Action Buttons */}
            </div>
        </div>
    );
};

export default SellPropertyCards;
