'use client';

import CustomNativeSelect from '@/components/customs/select';
import React, { useEffect, useState } from 'react';

const unitOptions = [
  { label: 'No', value: 'no' },
  { label: 'Yes', value: 'yes' },
];

// Generate day options from 0 to 30 with proper pluralization
const dayOptions = Array.from({ length: 31 }, (_, i) => ({
  label: i === 0 ? '0' : i === 1 ? '1 day' : `${i} days`,
  value: i.toString(),
}));


export type CustomSelectType = {
  label: React.ReactNode;
  setVal: (field: string, value: any) => void;
  amtKey: string;
  unitKey: string;
  initialAmount: number;
  initialUnit: string;
};

export default function Component({
  label,
  setVal,
  amtKey,
  unitKey,
  initialAmount = 0,  // Default value
  initialUnit = 'yes', // Default value
}: CustomSelectType) {
  const [amount, setAmount] = useState<number>(initialAmount);
  const [unit, setUnit] = useState(initialUnit);

  useEffect(() => {
    console.log('Initial values:', { initialAmount, initialUnit });
    setAmount(initialAmount);
    setUnit(initialUnit);
  }, [initialAmount, initialUnit]);

  const handleDayChange = (val: string) => {
    console.log('Day changed:', val);
    const newAmount = parseInt(val);
    setAmount(newAmount);
    setVal(amtKey, newAmount);
  };

  const handleUnitChange = (val: string) => {
    console.log('Unit changed:', val);
    setUnit(val);
    setVal(unitKey, val);
  };

  return (
    <div className='h-full w-full'>
      <div className='mb-[1.2rem]'>
        <span className='text-sm !text-grey-250'>{label}</span>
      </div>
      <div className='focus flex h-12 w-full items-center justify-center rounded border border-solid border-[#c4c4c4] bg-grey-880 p-2'>
        {/* Yes/No Select */}
        <CustomNativeSelect
          parentClass='!border-none'
          defaultValue={unit}
          data={unitOptions}
          value={unit}
          className='h-full w-full border-none bg-transparent focus:outline-none'
          handleChange={(val) => handleUnitChange(val!)}
        />
        
        <span className='mx-2 block w-[1px] bg-grey-530'></span>
        
        {/* Day Selection Dropdown */}
  {unit === 'yes' && (
  <>
    <span className='mx-2 block w-[1px] bg-grey-530'></span>
    <CustomNativeSelect
      parentClass='!border-none'
      defaultValue={amount?.toString()}
      data={dayOptions}
      value={amount?.toString()}
      className='h-full w-full border-none bg-transparent focus:outline-none whitespace-nowrap'
      handleChange={(val) => handleDayChange(val!)}
    />
  </>
)}


      </div>
    </div>
  );
}