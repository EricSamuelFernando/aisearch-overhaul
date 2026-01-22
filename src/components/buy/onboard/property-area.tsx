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
import { useAppDispatch } from '@/lib/hook';

import { googleMapsApiKey } from '@/shared/constants/env';
import { updateBuyerOnboardingPreference } from '@/slices/onboarding/onboarding-slice';

const libraries: Libraries = ['places'];

const PropertyArea: React.FC = () => {
  const [placeResult, updatePlaceResult] = React.useState('');
  const autoCompleteRef = React.useRef<google.maps.places.Autocomplete | null>(
    null,
  );
  const dispatch = useAppDispatch();

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey || '',
    libraries,
  });

  const onLoad = (autoCompletePlaces: google.maps.places.Autocomplete) =>
    (autoCompleteRef.current = autoCompletePlaces);

  const handlePlaceChanged = React.useCallback(() => {
    if (autoCompleteRef.current) {
      const places = autoCompleteRef.current.getPlace();
      if (places?.formatted_address) {
        updatePlaceResult(places.formatted_address);
        dispatch(
          updateBuyerOnboardingPreference({
            key: 'preferredPropertyAddress',
            value: places.formatted_address,
          }),
        );
      }
    }
  }, [dispatch]);

  if (loadError) return <PropertyAreaError />;
  if (!isLoaded) return <PropertyAreaLoading />;

  return (
    <div className='h-full w-full'>
      <Autocomplete onLoad={onLoad} onPlaceChanged={handlePlaceChanged}>
        <div className='relative h-14'>
          <div className='absolute left-2 top-[50%] h-max -translate-y-[50%] p-2'>
            <Search className='h-4 w-4' />
          </div>
          <Input
            type='text'
            placeholder='Enter a city or zip code'
            value={placeResult}
            onChange={(e) => updatePlaceResult(e.target?.value)}
            className='h-14 w-full rounded border border-gray-300 pl-10 pr-2 focus:border-0 focus:ring-0'
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
