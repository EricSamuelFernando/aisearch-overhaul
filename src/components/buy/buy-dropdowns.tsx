'use client';

import { useProperty, usePropertyActions } from '@/shared/hooks/useProperty';
import { PropertyView } from '@/types/property.types';
import { Grid, Map, SlidersHorizontal } from 'lucide-react';
import { useReducer } from 'react';
import CustomNativeSelect from '@/components/customs/select';
import { cn } from '@/lib/utils';

const data = [
  {
    label: '1',
    value: '1',
  },
  {
    label: '2',
    value: '2',
  },
  {
    label: '3',
    value: '3',
  },
];

interface State {
  price: string;
  bed: string;
  bath: string;
  type: string;
  filter: string;
}

type Action = { type: 'SET_VALUE'; field: keyof State; payload: string };

const initialState: State = {
  price: '',
  bed: '',
  bath: '',
  type: '',
  filter: '',
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'SET_VALUE':
      return { ...state, [action.field]: action.payload };
    default:
      return state;
  }
};

function BuyDropdowns() {
  const [{ price, bed, bath, type, filter }, dispatch] = useReducer(
    reducer,
    initialState,
  );

  const handleInputChange = (field: keyof State, event: string) => {
    dispatch({ type: 'SET_VALUE', field, payload: event });
  };

  return (
    <div className='grid grid-cols-5 items-center justify-between'>
      <div className='col-span-4 my-4  flex items-center gap-x-8'>
        <CustomNativeSelect
          data={data}
          value={price}
          handleChange={(e: any) => handleInputChange('price', e)}
          leftSection={<span className='pr-1 text-sm'>Price</span>}
          leftSectionWidth={40}
          leftSectionPointerEvents='none'
          className='w-[120px]'
        />
        <CustomNativeSelect
          data={data}
          value={bed}
          handleChange={(e) => handleInputChange('bed', e)}
          leftSection={<span className='pr-1'>Bed</span>}
          leftSectionWidth={40}
          leftSectionPointerEvents='none'
          className='w-[120px]'
        />
        <CustomNativeSelect
          data={data}
          value={bath}
          handleChange={(e) => handleInputChange('bath', e)}
          leftSection={<span className='pr-1 text-sm'>Bath</span>}
          leftSectionWidth={40}
          leftSectionPointerEvents='none'
          className='w-[120px]'
        />
        <CustomNativeSelect
          data={data}
          value={type}
          handleChange={(e) => handleInputChange('type', e)}
          leftSection={<span className='pr-1 text-sm'>Type</span>}
          leftSectionWidth={80}
          leftSectionPointerEvents='none'
          className='w-[120px]'
        />

        <CustomNativeSelect
          data={data}
          value={filter}
          handleChange={(e) => handleInputChange('filter', e)}
          leftSection={
            <span className='flex items-center gap-x-1 text-sm'>
              <SlidersHorizontal height={16} width={16} />
            </span>
          }
          leftSectionWidth={40}
          leftSectionPointerEvents='none'
          className='w-[120px] px-1'
        />
      </div>
      <ViewSelection />
    </div>
  );
}

export const ViewSelection = () => {
  const { currentView } = useProperty();
  const { savePropertyView: setPropertyView } = usePropertyActions();

  const handleSwitch = (view: PropertyView) => {
    setPropertyView(view);
  };
  return (
    <div className='col-span-1 flex items-center justify-end space-x-2'>
      <p
        onClick={() => {
          handleSwitch('map');
        }}
        className={cn(
          'flex cursor-pointer items-center gap-x-1',
          currentView === 'map' ? 'text-black' : 'text-[#a7a7a7]',
        )}
      >
        <span>Map</span>
        <Map />
      </p>
      <p
        onClick={() => {
          handleSwitch('grid');
        }}
        className={cn(
          'flex cursor-pointer items-center gap-x-1',
          currentView === 'grid' ? 'text-black' : 'text-[#a7a7a7]',
        )}
      >
        <span>Grid</span>
        <Grid />
      </p>
    </div>
  );
};

export default BuyDropdowns;
