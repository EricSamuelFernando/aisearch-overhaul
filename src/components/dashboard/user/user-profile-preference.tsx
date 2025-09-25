import { PropertyPriceData } from '@/components/buy/onboard/property-range';
import { PropertyTypeData } from '@/components/buy/onboard/property-type';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGetPropertyPreference, useUpdatePropertyPreference } from '@/hooks/api/property/usePropertyApi';
import { useAppDispatch, useAppSelector } from '@/lib/hook';
import { cn } from '@/lib/utils';
import { googleMapsApiKey } from '@/shared/constants/env';
import { useAuth } from '@/shared/hooks/useAuth';
import { buyerPropertyPreference } from '@/slices/onboarding/onboarding-selectors';
import { Autocomplete, Libraries, useJsApiLoader } from '@react-google-maps/api';
import { Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const libraries: Libraries = ['places'];

function UserPropfilePreference() {
    const dispatch = useAppDispatch();
    const { propertyType } = useAppSelector(buyerPropertyPreference);
    const { user } = useAuth();
    const [isLoaded,setIsLoaded] = useState(false);
    const { getPropertyPreference } = useGetPropertyPreference(user?.email || '');
    const { updatePropertyPreference } = useUpdatePropertyPreference(user?.email || '')

    const [preferenceData, setPreferenceData] = useState({
        areaPreference: '',
        propertyTypePreference: '',
        propertyPricePreference: {
            max: 0,
            min: 0
        },
    });

    const autoCompleteRef = React.useRef<google.maps.places.Autocomplete | null>(null);

    // const { isLoaded, loadError } = useJsApiLoader({
    //     id: 'google-map-script',
    //     googleMapsApiKey: googleMapsApiKey || '',
    //     libraries,
    // });

    const onLoad = (autoCompletePlaces: google.maps.places.Autocomplete) => {
        autoCompleteRef.current = autoCompletePlaces;
    };

    const handlePlaceChanged = React.useCallback(() => {
        if (autoCompleteRef.current) {
            const place = autoCompleteRef.current.getPlace();
            setPreferenceData((prev) => ({
                ...prev,
                areaPreference: place?.formatted_address || '',
            }));
        }
    }, []);

    useEffect(() => {
        if (getPropertyPreference.data) {
            console.log(getPropertyPreference.data);
            const { preference } = getPropertyPreference.data
            setPreferenceData(pre => {
                return {
                    areaPreference: preference?.city,
                    propertyTypePreference: preference?.propertyType,
                    propertyPricePreference: {
                        max: preference?.priceMax,
                        min: preference?.priceMin,
                    },
                }
            })

        }
    }, [getPropertyPreference.data]);

    // if (loadError) return <PropertyAreaError />;
    if (!isLoaded) return <PropertyAreaLoading />;

    const handleSaveChanges = () => {
        console.log('Changes Saved', preferenceData);

        // Destructure the preferences data
        const { areaPreference, propertyTypePreference, propertyPricePreference } = preferenceData;

        // Ensure propertyPricePreference is parsed correctly if it contains min and max
        const priceMin = propertyPricePreference?.min || 0;
        const priceMax = propertyPricePreference?.max || 0;

        // Save logic with proper mapping
        updatePropertyPreference.mutate({
            city: areaPreference || '', // Default to an empty string if undefined
            propertyType: propertyTypePreference || '', // Default to an empty string if undefined
            priceMin: priceMin, // Use null if not available
            priceMax: priceMax , // Use null if not available
        });
    };

    const handlePreferenceClick = (type: 'propertyTypePreference' | 'propertyPricePreference', value: any) => {
        setPreferenceData((prev) => ({
            ...prev,
            [type]: value,
        }));
    };

    return (
        <section className="flex flex-col gap-4">
            <div className="flex w-full border-b-[1px] items-center border-b-grey-590 pb-4 justify-between">
                <h3 className="font-bold">Preferences</h3>
                <button
                    onClick={handleSaveChanges}
                    className="min-w-[140px] cursor-pointer rounded-full border border-black bg-transparent px-6 py-1 text-black"
                >
                    Save Changes
                </button>
            </div>
            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                    <p className="font-bold text-md">Have a specific area in mind?</p>
                    {isLoaded ? (
                        <Autocomplete onLoad={onLoad} onPlaceChanged={handlePlaceChanged}>
                            <div className="relative h-14">
                                <div className="absolute left-2 top-[50%] h-max -translate-y-[50%] p-2">
                                    <Search className="h-4 w-4" />
                                </div>
                                <Input
                                    type="text"
                                    placeholder="Enter a city or zip code"
                                    value={preferenceData.areaPreference}
                                    onChange={(e) =>
                                        setPreferenceData((prev) => ({
                                            ...prev,
                                            areaPreference: e.target.value,
                                        }))
                                    }
                                    className="h-14 w-full rounded border border-gray-300 pl-10 pr-2 focus:border-0 focus:ring-0"
                                />
                            </div>
                        </Autocomplete>
                    ) : (
                        <div className="relative h-14">
                            <div className="absolute left-2 top-[50%] h-max -translate-y-[50%] p-2">
                                <Search className="h-4 w-4" />
                            </div>
                            <Input
                                type="text"
                                placeholder="Enter a city or zip code"
                                value={preferenceData.areaPreference}
                                onChange={(e) =>
                                    setPreferenceData((prev) => ({
                                        ...prev,
                                        areaPreference: e.target.value,
                                    }))
                                }
                                className="h-14 w-full rounded border border-gray-300 pl-10 pr-2 focus:border-0 focus:ring-0"
                            />
                        </div>
                    )}
                </div>

                {/* Property Type Preference */}
                <div className="flex flex-col gap-4">
                    <p className="font-bold text-md">Select property type</p>
                    <div className="grid w-[50%] grid-cols-2 gap-4">
                        {PropertyTypeData.map(({ id, value, label }) => (
                            <Button
                                key={id}
                                variant="outline"
                                onClick={() => handlePreferenceClick('propertyTypePreference', value)}
                                className={cn(
                                    `w-full rounded-md px-4 py-6 text-black transition-all hover:bg-gray-200`,
                                    preferenceData.propertyTypePreference === value && ['bg-black text-white'],
                                )}
                            >
                                {label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Property Price Preference */}
                <div className="flex flex-col gap-4">
                    <p className="font-bold text-md">How much are you planning to spend on your property?</p>
                    <div className="grid w-[50%] grid-cols-2 gap-4">
                        {PropertyPriceData.map(({ id, value, label }) => (
                            <Button
                                key={id}
                                variant="outline"
                                onClick={() => handlePreferenceClick('propertyPricePreference', value)}
                                className={cn(
                                    `w-full rounded-md px-4 py-6 text-black transition-all hover:bg-gray-200`,
                                    (preferenceData.propertyPricePreference.max === value?.max && preferenceData.propertyPricePreference.min === value?.min) && ['bg-black text-white'],
                                )}
                            >
                                {label}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default UserPropfilePreference;

// Error and Loading Components
const PropertyAreaError = () => (
    <div className="h-full w-full">
        <h3 className="text-lg font-medium leading-8 text-red-500">There was an error loading Google map places</h3>
        <Button className="w-32 font-medium">Retry</Button>
    </div>
);

const PropertyAreaLoading = () => (
    <div className="h-10 w-full animate-pulse rounded-md bg-gray-300 bg-gradient-to-br" />
);
