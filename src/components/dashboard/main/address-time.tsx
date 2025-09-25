import React from 'react';

interface AddressTimeProps {
  address: string;
  time: string;
}

const AddressTime: React.FC<AddressTimeProps> = ({ address, time }) => {
  return (
    <div className='flex flex-col'>
      <span className='text-base font-medium'>{address}</span>
      <span className='mt-[1.375rem] text-sm font-bold text-ocOrange'>
        {time}
      </span>
    </div>
  );
};

export default AddressTime;
