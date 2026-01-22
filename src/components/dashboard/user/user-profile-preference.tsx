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
    const [isLoaded, setIsLoaded] = useState(true);
    const { updatePropertyPreference } = useUpdatePropertyPreference(user?.email);
    const { getPropertyPreferenceFromAI } = useGetPropertyPreference(user?.email);

    // Refetch AI API preferences when component mounts to ensure fresh data
    React.useEffect(() => {
        if (user?.email && !getPropertyPreferenceFromAI.data) {
            console.log('🔄 Refetching AI preferences on mount...');
            getPropertyPreferenceFromAI.refetch();
        }
    }, [user?.email]);
    
    // Also refetch when component first mounts
    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (user?.email) {
                console.log('🔄 Refetching AI preferences after mount delay...');
                getPropertyPreferenceFromAI.refetch();
            }
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Initialize preferenceData from user.propertyPreference or fetched preference
    const [preferenceData, setPreferenceData] = useState({
        areaPreference: '',
        propertyTypePreference: '',
        propertyPricePreference: {
            max: 0,
            min: 0
        },
    });

    const autoCompleteRef = React.useRef<google.maps.places.Autocomplete | null>(null);

    // Update preferenceData ONLY from AI API
    useEffect(() => {
        // Only use AI API data
        if (getPropertyPreferenceFromAI.data && !getPropertyPreferenceFromAI.isLoading) {
            const aiResponse:any = getPropertyPreferenceFromAI.data;
            console.log('📊 Loading preferences from AI API:', aiResponse);
            
            // AI API response structure: { preference: { mls_type, property_sub_type, listing_price_max, city, state, ... } }
            const aiPreference = aiResponse?.preference || aiResponse;
            
            // Property type logic:
            // - Only for "Condo", use property_sub_type key and map to "Condomium"
            // - For all other types, use mls_type key
            let propertyType = '';
            if (aiPreference?.property_sub_type === 'Condo') {
                // Only use property_sub_type for Condo, map to "Condomium" (matches PropertyTypeData value)
                propertyType = 'Condomium';
            } else {
                // For all other types, use mls_type
                propertyType = aiPreference?.mls_type || aiPreference?.propertyType || '';
            }
            
            // Normalize propertyType: "Single Family" -> "Single Family Home"
            if (propertyType === 'Single Family') {
                propertyType = 'Single Family Home';
            }
            
            // Map listing_price_max to spendAmount.max
            const priceMax = Number(aiPreference?.listing_price_max) || Number(aiPreference?.spendAmount?.max) || 0;
            const priceMin = Number(aiPreference?.listing_price_min) || Number(aiPreference?.spendAmount?.min) || 0;
            
            // Map city and state to preferredPropertyAddress
            let areaPreference = '';
            if (aiPreference?.city) {
                areaPreference = `${aiPreference.city}${aiPreference.state ? `, ${aiPreference.state}` : ''}`;
            } else {
                areaPreference = aiPreference?.preferredPropertyAddress || '';
            }
            
            const newPreferenceData = {
                areaPreference: areaPreference,
                propertyTypePreference: propertyType,
                propertyPricePreference: {
                    max: priceMax,
                    min: priceMin
                },
            };
            
            console.log('✅ Setting preference data from AI API:', newPreferenceData);
            setPreferenceData(newPreferenceData);
        }
    }, [getPropertyPreferenceFromAI.data, getPropertyPreferenceFromAI.isLoading]);

    // Debug: Log current state
    React.useEffect(() => {
        console.log('🎯 Current preferenceData state:', preferenceData);
        console.log('🎯 AI API data:', getPropertyPreferenceFromAI.data);
        console.log('🎯 AI API loading:', getPropertyPreferenceFromAI.isLoading);
        console.log('🎯 AI API error:', getPropertyPreferenceFromAI.isError);
    }, [preferenceData, getPropertyPreferenceFromAI.data, getPropertyPreferenceFromAI.isLoading, getPropertyPreferenceFromAI.isError]);

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

    const handleSaveChanges = () => {
        console.log('Changes Saved', preferenceData);

        // Destructure the preferences data
        const { areaPreference, propertyTypePreference, propertyPricePreference } = preferenceData;

        // Ensure propertyPricePreference is parsed correctly if it contains min and max
        const priceMin = propertyPricePreference?.min || 0;
        const priceMax = propertyPricePreference?.max || 0;

        // Save logic with proper mapping - saves to GraphQL DB and syncs with AI API
        updatePropertyPreference.mutate({
            preferredPropertyAddress: areaPreference || '',
            city: areaPreference || '', // Also send as city for AI API
            propertyType: propertyTypePreference || '',
            priceMin: priceMin,
            priceMax: priceMax,
                }, {
            onSuccess: (data) => {
                console.log('✅ Preferences updated successfully:', data);
                // Refetch AI API preferences after successful update to get the latest data
                getPropertyPreferenceFromAI.refetch().then(() => {
                    // Update local state with the saved data to ensure UI reflects changes immediately
                    if (data) {
                        let propertyType = data.propertyType || propertyTypePreference;
                        // Normalize propertyType: "Single Family" -> "Single Family Home"
                        if (propertyType === 'Single Family') {
                            propertyType = 'Single Family Home';
                        }
                        // Map "Condo" to "Condomium" if needed (matches PropertyTypeData value)
                        if (propertyType === 'Condo') {
                            propertyType = 'Condomium';
                        }
                        setPreferenceData({
                            areaPreference: data.preferredPropertyAddress || areaPreference,
                            propertyTypePreference: propertyType,
                            propertyPricePreference: {
                                max: Number(data.spendAmount?.max) || priceMax,
                                min: Number(data.spendAmount?.min) || priceMin
                            },
                        });
                    }
                });
            }
        });
    };

    const handlePreferenceClick = (type: 'propertyTypePreference' | 'propertyPricePreference', value: any) => {
        setPreferenceData((prev) => ({
            ...prev,
            [type]: value,
        }));
    };

    // Show loading state only if we don't have any data yet
    if (getPropertyPreferenceFromAI.isLoading && !getPropertyPreferenceFromAI.data) {
        return (
            <section className="flex flex-col gap-4">
                <div className="flex w-full border-b-[1px] items-center border-b-grey-590 pb-4 justify-between">
                    <h3 className="font-bold">Buyer Preference</h3>
                </div>
                <div className="py-8">
                    <div className="h-10 w-full animate-pulse rounded-md bg-gray-200" />
                    <div className="mt-4 h-10 w-full animate-pulse rounded-md bg-gray-200" />
                    <div className="mt-4 h-10 w-full animate-pulse rounded-md bg-gray-200" />
                </div>
            </section>
        );
    }

    // Show error state
    if (getPropertyPreferenceFromAI.isError) {
        return (
            <section className="flex flex-col gap-4">
                <div className="flex w-full border-b-[1px] items-center border-b-grey-590 pb-4 justify-between">
                    <h3 className="font-bold">Buyer Preference</h3>
                </div>
                <div className="py-8">
                    <p className="text-red-500 mb-4">Failed to load preferences from AI API. Please try again.</p>
                    <Button 
                        onClick={() => getPropertyPreferenceFromAI.refetch()}
                        variant="outline"
                    >
                        Retry
                    </Button>
                </div>
            </section>
        );
    }

    return (
        <section className="flex flex-col gap-4">
            <div className="flex w-full border-b-[1px] items-center border-b-grey-590 pb-4 justify-between">
                <h3 className="font-bold">Buyer Preference</h3>
                <button
                    onClick={handleSaveChanges}
                    disabled={updatePropertyPreference.isPending}
                    className="min-w-[140px] cursor-pointer rounded-full border border-black bg-transparent px-6 py-1 text-black disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {updatePropertyPreference.isPending ? 'Saving...' : 'Save Changes'}
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
                        {PropertyTypeData.map(({ id, value, label }) => {
                            // Normalize both values for comparison (case-insensitive, trim whitespace)
                            const savedType = (preferenceData.propertyTypePreference || '').trim();
                            const optionType = (value || '').trim();
                            
                            // Check if they match exactly, or handle special cases
                            const isSelected = savedType === optionType || 
                                             (savedType === 'Single Family' && optionType === 'Single Family Home') ||
                                             (savedType === 'Condo' && optionType === 'Condomium') ||
                                             (savedType === 'Condomium' && optionType === 'Condo') ||
                                             (savedType.toLowerCase() === optionType.toLowerCase());
                            
                            // Debug log for property type selection (only log once per render)
                            if (savedType && id === PropertyTypeData[0].id) {
                                console.log(`🔍 Property Type Comparison:`, {
                                    saved: savedType,
                                    checking: optionType,
                                    isSelected,
                                    allValues: PropertyTypeData.map(d => d.value)
                                });
                            }
                            
                            return (
                                <Button
                                    key={id}
                                    variant="outline"
                                    onClick={() => handlePreferenceClick('propertyTypePreference', value)}
                                    className={cn(
                                        `w-full rounded-md px-4 py-6 text-black transition-all hover:bg-gray-200`,
                                        isSelected && 'bg-black text-white',
                                    )}
                                >
                                    {label}
                                </Button>
                            );
                        })}
                    </div>
                </div>

                {/* Property Price Preference */}
                <div className="flex flex-col gap-4">
                    <p className="font-bold text-md">How much are you planning to spend on your property?</p>
                    <div className="grid w-[50%] grid-cols-2 gap-4">
                        {PropertyPriceData.map(({ id, value, label }) => {
                            const savedMax = Number(preferenceData.propertyPricePreference.max) || 0;
                            const savedMin = Number(preferenceData.propertyPricePreference.min) || 0;
                            const optionMax = Number(value?.max) || 0;
                            const optionMin = Number(value?.min) || 0;
                            
                            // Smart matching logic:
                            // 1. Exact match (preferred): both min and max match exactly
                            // 2. Range match: saved max falls within the option's range
                            //    - For "$1M or less" (0-1000000): if savedMax <= 1000000, it matches
                            //    - For "$1M - $1.2M" (1000000-1200000): if savedMax > 1000000 && savedMax <= 1200000, it matches
                            const exactMatch = Math.abs(savedMax - optionMax) < 1 && Math.abs(savedMin - optionMin) < 1;
                            
                            // Range match: saved max falls within the option range
                            // The saved max is the key indicator - if it's within a range, select that range
                            let rangeMatch = false;
                            if (savedMax > 0) {
                                if (optionMin === 0) {
                                    // First option "$1M or less": match if savedMax <= optionMax
                                    rangeMatch = savedMax <= optionMax;
                                } else {
                                    // Other options: match if savedMax is within the range (greater than min, less than or equal to max)
                                    rangeMatch = savedMax > optionMin && savedMax <= optionMax;
                                }
                            }
                            
                            const isSelected = exactMatch || rangeMatch;
                            
                            // Debug log for price selection (only log once per render)
                            if ((savedMax > 0 || savedMin > 0) && id === PropertyPriceData[0].id) {
                                console.log(`💰 Price Comparison:`, {
                                    saved: { min: savedMin, max: savedMax },
                                    checking: { min: optionMin, max: optionMax, label },
                                    exactMatch,
                                    rangeMatch,
                                    isSelected,
                                    allOptions: PropertyPriceData.map(d => ({ label: d.label, value: d.value }))
                                });
                            }
                            
                            return (
                                <Button
                                    key={id}
                                    variant="outline"
                                    onClick={() => handlePreferenceClick('propertyPricePreference', value)}
                                    className={cn(
                                        `w-full rounded-md px-4 py-6 text-black transition-all hover:bg-gray-200`,
                                        isSelected && 'bg-black text-white',
                                    )}
                                >
                                    {label}
                                </Button>
                            );
                        })}
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
