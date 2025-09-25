import React from 'react';

interface CardItemProps {
  title: string;
  updatedDate: string;
}

const CardItem: React.FC<CardItemProps> = ({ title, updatedDate }) => {
  return (
    <div className='flex items-center rounded-lg border bg-white p-4 shadow-sm'>
      <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100'>
        <svg
          width='36'
          height='36'
          viewBox='0 0 36 36'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <mask
            id='mask0_1911_2096'
            maskUnits='userSpaceOnUse'
            x='0'
            y='0'
            width='36'
            height='36'
          >
            <rect width='36' height='36' fill='#D9D9D9' />
          </mask>
          <g mask='url(#mask0_1911_2096)'>
            <path
              d='M7.5 31.5C6.675 31.5 5.96875 31.2063 5.38125 30.6188C4.79375 30.0312 4.5 29.325 4.5 28.5V7.5C4.5 6.675 4.79375 5.96875 5.38125 5.38125C5.96875 4.79375 6.675 4.5 7.5 4.5H24L31.5 12V28.5C31.5 29.325 31.2063 30.0312 30.6188 30.6188C30.0312 31.2063 29.325 31.5 28.5 31.5H7.5ZM7.5 28.5H28.5V13.5H22.5V7.5H7.5V28.5ZM10.5 25.5H25.5V22.5H10.5V25.5ZM10.5 13.5H18V10.5H10.5V13.5ZM10.5 19.5H25.5V16.5H10.5V19.5Z'
              fill='#1C1B1F'
            />
          </g>
        </svg>
      </div>
      <div className='ml-4'>
        <p className='text-sm font-semibold text-black'>{title}</p>
        <p className='text-xs text-gray-500'>Updated {updatedDate}</p>
      </div>
    </div>
  );
};

export { CardItem };
