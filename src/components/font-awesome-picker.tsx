'use client';
import SkeletonLoader from '@/components/skeleton-loader';
import { useFontAwesomeIconPack } from '@/hooks/utils/useIconPack';
import React from 'react';
import Popover from './customs/popover';
import { Edit2Icon } from 'lucide-react';
import CustomInput from './customs/input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { cn } from '../lib/utils';
import { IconName } from '@fortawesome/fontawesome-svg-core';

export type FontAwesomeIconPickerProps = {
  value?: string;
  onChange?: (value: string) => void;
};

function FontAwesomePicker({ value, onChange }: FontAwesomeIconPickerProps) {
  const [searchText, setSearchText] = React.useState('');
  const iconPack = useFontAwesomeIconPack();

  if (!iconPack) {
    return <SkeletonLoader className='h-4 w-4' />;
  }

  const iconsFiltered = iconPack.filter((icon) => {
    return icon.iconName.includes(searchText.toLowerCase());
  });

  return (
    <Popover
      placement='top'
      trigger='click'
      initialOpen={false}
      onClose={() => console.log('Popover closed!')}
      content={
        <section>
          <CustomInput
            leftSection={<Edit2Icon size={12} />}
            leftSectionPointerEvents='none'
            label='Name'
            placeholder='Search'
            onChange={(e) => setSearchText(e.currentTarget.value)}
          />
          <div className='my-4 h-1 bg-gray-400' />
          <div className='iconPicker__iconsContainer oveflow-auto flex h-[200px] flex-1 flex-wrap content-start justify-between gap-x-4 gap-y-4 overflow-y-auto overflow-x-hidden p-3'>
            {iconsFiltered.map((icon) => (
              <div
                className='iconPicker__iconWrapper min-w-1/6  py-1'
                key={icon.iconName}
              >
                <button
                  className={cn(
                    'inline-flex h-full min-h-7 w-full cursor-pointer  items-center justify-center rounded border border-solid border-gray-300 px-2 py-1 text-center',
                    icon.iconName === value ? 'bg-ocOrange text-white' : '',
                  )}
                  title={icon.iconName}
                  onClick={() => onChange?.(icon.iconName)}
                >
                  <FontAwesomeIcon icon={icon} />
                </button>
              </div>
            ))}
          </div>
        </section>
      }
    >
      <FontAwesomeIcon
        className='cursor-pointer'
        icon={['fas', value as IconName]}
        color='#556ee6'
      />
    </Popover>
  );
}

export default FontAwesomePicker;
