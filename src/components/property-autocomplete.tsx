'use client';
import { googleMapsApiKey } from '@/shared/constants/env';
import { APIProvider, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { MapPin, Search } from 'lucide-react';
import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import { Input } from './ui/input';

const PropertyAutocomplete: React.FC = () => {
  return (
    <>
      <APIProvider apiKey={googleMapsApiKey!}>
        <AutocompleteCustom
          onPlaceSelect={(place) => {
            console.log(place);
          }}
        />
      </APIProvider>
    </>
  );
};

export default PropertyAutocomplete;

interface Props {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
}
export const AutocompleteCustom = ({ onPlaceSelect }: Props) => {
  const map = useMap();
  const places = useMapsLibrary('places');

  const [sessionToken, setSessionToken] =
    useState<google.maps.places.AutocompleteSessionToken>();

  const [autocompleteService, setAutocompleteService] =
    useState<google.maps.places.AutocompleteService | null>(null);

  const [placesService, setPlacesService] =
    useState<google.maps.places.PlacesService | null>(null);

  const [predictionResults, setPredictionResults] = useState<
    Array<google.maps.places.AutocompletePrediction>
  >([]);

  const [inputValue, setInputValue] = useState<string>('');

  useEffect(() => {
    if (!places || !map) return;

    setAutocompleteService(new places.AutocompleteService());
    setPlacesService(new places.PlacesService(map));
    setSessionToken(new places.AutocompleteSessionToken());

    return () => setAutocompleteService(null);
  }, [map, places]);

  const fetchPredictions = useCallback(
    async (inputValue: string) => {
      if (!autocompleteService || !inputValue) {
        setPredictionResults([]);
        return;
      }

      const request = { input: inputValue, sessionToken };
      const response = await autocompleteService.getPlacePredictions(request);

      setPredictionResults(response.predictions);
    },
    [autocompleteService, sessionToken],
  );

  const onInputChange = useCallback(
    (event: FormEvent<HTMLInputElement>) => {
      const value = (event.target as HTMLInputElement)?.value;

      setInputValue(value);
      fetchPredictions(value);
    },
    [fetchPredictions],
  );

  const handleSuggestionClick = useCallback(
    (placeId: string) => {
      if (!places) return;

      const detailRequestOptions = {
        placeId,
        fields: ['geometry', 'name', 'formatted_address'],
        sessionToken,
      };

      const detailsRequestCallback = (
        placeDetails: google.maps.places.PlaceResult | null,
      ) => {
        onPlaceSelect(placeDetails);
        setPredictionResults([]);
        setInputValue(placeDetails?.formatted_address ?? '');
        setSessionToken(new places.AutocompleteSessionToken());
      };

      placesService?.getDetails(detailRequestOptions, detailsRequestCallback);
    },
    [onPlaceSelect, places, placesService, sessionToken],
  );

  console.log('predictionResults', predictionResults);

  return (
    <div className='autocomplete-container'>
      <div className='relative'>
        <div className='relative h-14'>
          <div className='absolute left-2 top-[50%] h-max -translate-y-[50%] p-2'>
            <Search className='h-4 w-4' />
          </div>
          <Input
            type='text'
            placeholder='Enter a city or zip code'
            value={inputValue}
            onInput={(event: FormEvent<HTMLInputElement>) =>
              onInputChange(event)
            }
            className='h-14 w-full rounded border border-gray-300 pl-10 pr-2'
          />
        </div>
        {predictionResults.length > 0 && (
          <ul className='absolute w-full rounded-b-2xl border border-gray-300 bg-white'>
            {predictionResults.map((place) => {
              const { place_id, description } = place;
              return (
                <li
                  key={place_id}
                  className='custom-list-item cursor-ponter cursor-pointer p-2 px-2  hover:bg-gray-100'
                  onClick={() => handleSuggestionClick(place_id)}
                >
                  <span className='flex items-start gap-x-2'>
                    <span className=''>
                      <MapPin className='h-4 w-4' />
                    </span>
                    <span>
                      <span className='text-sm text-gray-600'>
                        {description}
                      </span>
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
