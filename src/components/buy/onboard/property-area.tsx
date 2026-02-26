'use client';

import * as React from 'react';
import {
  useJsApiLoader,
  Autocomplete,
  Libraries,
} from '@react-google-maps/api';
import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppDispatch, useAppSelector } from '@/lib/hook';

import { googleMapsApiKey } from '@/shared/constants/env';
import { updateBuyerOnboardingPreference } from '@/slices/onboarding/onboarding-slice';
import { buyerPropertyPreference } from '@/slices/onboarding/onboarding-selectors';

// Keep loader options identical across the app (custom-map also loads drawing).
const libraries: Libraries = ['places', 'geometry', 'drawing'];

const PropertyArea: React.FC = () => {
  const [placeResult, updatePlaceResult] = React.useState('');
  const autoCompleteRef = React.useRef<google.maps.places.Autocomplete | null>(
    null,
  );
  const dispatch = useAppDispatch();
  const { preferredPropertyAddress } = useAppSelector(buyerPropertyPreference);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey || '',
    libraries,
    language: "en",
    region: "US",
    version: "weekly",
  });

  const autoCompleteOptions: google.maps.places.AutocompleteOptions = {
    // Only show US regions (states/cities) to keep onboarding focused on the US
    componentRestrictions: { country: 'us' },
    types: ['(regions)'],
    fields: ['formatted_address', 'address_components', 'geometry'],
  };

  const onLoad = (autoCompletePlaces: google.maps.places.Autocomplete) =>
    (autoCompleteRef.current = autoCompletePlaces);

  // Pre-fill the input when the user navigates back in the flow
  React.useEffect(() => {
    if (preferredPropertyAddress) {
      updatePlaceResult(preferredPropertyAddress);
    }
  }, [preferredPropertyAddress]);

  const handlePlaceChanged = React.useCallback(() => {
    if (autoCompleteRef.current) {
      const places = autoCompleteRef.current.getPlace();
      const country = places?.address_components?.find((comp) =>
        comp.types.includes('country'),
      );
      const state = places?.address_components?.find((comp) =>
        comp.types.includes('administrative_area_level_1'),
      );
      // Accept only US state-level results; ignore other countries/levels
      const resolvedAddress =
        places?.formatted_address || state?.long_name || '';
      if (country?.short_name === 'US' && resolvedAddress) {
        updatePlaceResult(resolvedAddress);
        dispatch(
          updateBuyerOnboardingPreference({
            key: 'preferredPropertyAddress',
            value: resolvedAddress,
          }),
        );
      }
    }
  }, [dispatch]);

  if (loadError) return <PropertyAreaError />;
  if (!isLoaded) return <PropertyAreaLoading />;

  return (
    <div className='h-full w-full'>
      <Autocomplete
        onLoad={onLoad}
        onPlaceChanged={handlePlaceChanged}
        options={autoCompleteOptions}
      >
        <div className='relative h-14 w-full'>
          <div className='absolute left-2 top-1/2 h-max -translate-y-1/2 p-2'>
            <Search className='h-4 w-4' />
          </div>
          <Input
            type='text'
            placeholder='Enter a city or zip code'
            value={placeResult}
            onChange={(e) => updatePlaceResult(e.target?.value)}
            className='h-14 w-full rounded border border-gray-300 bg-background pl-10 pr-2 focus:outline-none focus:ring-0'
          />
        </div>
      </Autocomplete>
    </div>
  );
};

const PropertyAreaError = () => (
  <div className='h-full w-full'>
    <h3 className='text-lg font-medium leading-8 text-ocLightOrange'>
      There was an error loading Google map places
    </h3>
    <Button roundness='full' className='w-32 font-medium'>
      Retry
    </Button>
  </div>
);

const PropertyAreaLoading = () => (
  <div className='h-10 w-full animate-pulse rounded-md bg-ocLightOrange bg-gradient-to-br' />
);

export { PropertyArea };
