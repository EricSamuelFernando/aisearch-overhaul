'use client';

import CustomNativeSelect from '@/components/customs/select';
import { useState } from 'react';

function BuySelect() {
  const [value, setValue] = useState<string | null>('');
  return (
    <CustomNativeSelect
      data={[
        {
          label: 'Santiago',
          value: 'Santiago',
        },
        {
          label: 'Monaco',
          value: 'Monaco',
        },
        {
          label: 'Lisbon',
          value: 'Lisbon',
        },
      ]}
      handleChange={setValue}
      leftSection={<span>Sort:</span>}
      leftSectionWidth={40}
      leftSectionPointerEvents='none'
    />
  );
}

export default BuySelect;
