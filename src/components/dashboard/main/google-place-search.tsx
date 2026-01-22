import CustomInput from '@/components/customs/input';
import { CustomDropdown } from '@/components/customs/menu';
import { useLoadScript } from '@react-google-maps/api';
import { googleMapsApiKey } from '@/shared/constants/env';
import React, { useMemo, useState } from 'react';
import usePlacesAutocomplete, {
  Suggestion,
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';

interface PlacesProps {
  setSelected: React.Dispatch<
    React.SetStateAction<{ lat: number; lng: number } | null>
  >;
}

const PlacesComponent: React.FC = () => {
  const { isLoaded } = useLoadScript({
    id: 'google-map-script',
    googleMapsApiKey: googleMapsApiKey!,
    libraries: ['places'],
  });

  if (!isLoaded) return <div>Loading...</div>;
  return <Map />;
};

const Map: React.FC = () => {
  const center = useMemo(() => ({ lat: 43.45, lng: -80.49 }), []);
  const [selected, setSelected] = useState<{ lat: number; lng: number } | null>(
    null,
  );

  return (
    <div className='places-container'>
      <PlacesAutocomplete setSelected={setSelected} />
    </div>
  );
};

const PlacesAutocomplete: React.FC<PlacesProps> = ({ setSelected }) => {
  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete();

  const handleSelect = async (address: string) => {
    setValue(address, false);
    clearSuggestions();

    const results = await getGeocode({ address });
    const { lat, lng } = await getLatLng(results[0]);
    setSelected({ lat, lng });
  };

  return (
    <div>
      <CustomDropdown
        buttonLabel={
          <CustomInput
            label='Street Address'
            placeholder='Enter Address, MLS#'
            className='mt-[0.469rem] w-full'
            value={value}
            onChange={(e) => setValue(e.currentTarget.value)}
          />
        }
        items={
          status === 'OK'
            ? data.map((item: Suggestion) => (
                <span key={item.place_id}>{item.description}</span>
              ))
            : null
        }
      />
    </div>
  );
};

export default PlacesComponent;
