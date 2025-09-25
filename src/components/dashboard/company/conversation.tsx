import React from 'react';

type Props = {};

function Conversation({}: Props) {
  return (
    <div className='mb-4 min-h-[150px] rounded-xl bg-white p-6'>
      <div className='flex items-center justify-between font-semibold'>
        <h4 className='text-ocGreen-100'>Listing Agent</h4>
        <h4 className='text-sm text-grey-860'>2:30pm</h4>
      </div>

      <div className='py-4 text-black'>
        What do you think about this offer? <br /> I like fact the price is up
        and the loan access makes sense.
      </div>
    </div>
  );
}

export default Conversation;
