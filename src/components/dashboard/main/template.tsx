import React from 'react';

const Templates = () => {
  return (
    <div className='px-10'>
      <div className='mb-4'>
        <input
          type='text'
          placeholder='Search template...'
          className='w-full rounded-lg border p-2'
        />
      </div>
      <div>
        <div className='mb-4'>
          <h3 className='text-lg font-semibold'>Accept Offer Template</h3>
          <p>
            Dear [Seller Name], Happy to inform you that your offer for
            [Property Address] has been accepted, and I’ll be in touch soon with
            next steps.
          </p>
        </div>
        <div className='relative mb-4 rounded-lg bg-gray-100 p-4'>
          <h3 className='text-lg font-semibold'>Offer Decline Template</h3>
          <p>
            Dear [Seller Name], I am writing to inform you that your offer has
            been declined, thank you for your interest. I hope we can work
            together in the future.
          </p>
          <button className='absolute right-4 top-4'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
              className='h-6 w-6'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>
        <div>
          <h3 className='text-lg font-semibold'>Counter Offer Template</h3>
          <p>
            Dear, [Seller Name] [Property Address] I would like the following
            changes to be made to your offer, however open to further
            negotiations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Templates;
