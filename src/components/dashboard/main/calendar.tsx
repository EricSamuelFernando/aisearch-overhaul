// import React from 'react';
// import { getDayInfo } from '@/lib/utils';

// interface CalendarProps {
//   date: string;
//   className?: string;
// }

// export const formatDate = (dateString: string) => {
//   return new Date(dateString).toLocaleDateString('en-US', {
//     year: 'numeric',
//     month: 'long',
//     day: 'numeric',
//   });
// };

// const Calendar: React.FC<CalendarProps> = ({ date, className }) => {
//   const { day, formattedTime, isToday } = getDayInfo(date);
//   const formattedDate = formatDate(date);

//   return (
//     <div
//       className={`flex w-max flex-col px-8 ${
//         isToday ? 'font-bold' : ''
//       } ${className} `}
//     >
//       <div className='my-4 flex flex-col items-center'>
//         <span>{formattedDate}</span>
//         {/* <span className='text-lg'>{formattedTime}</span> */}
//         {isToday && <span>Today</span>}
//       </div>
//     </div>
//   );
// };

// export default Calendar;

import React from 'react';
import { getDayInfo } from '@/lib/utils';

interface CalendarProps {
  date: Date | string;
  className?: string;
}

export const formatDate = (dateString: string | Date) => {
  const date =
    typeof dateString === 'string' ? new Date(dateString) : dateString;
  const month = date.toLocaleString('en-US', { month: 'long' }).slice(0, 4);
  return {
    month,
    day: date.getDate(),
    year: date.getFullYear(),
  };
};

const Calendar: React.FC<CalendarProps> = ({ date, className }) => {
  const dateString = typeof date === 'string' ? date : date.toISOString();
  const { isToday } = getDayInfo(dateString);
  const { month, day: formattedDay, year } = formatDate(date);

  return (
    <div
      className={`flex w-max flex-col px-8 ${
        isToday ? 'font-bold' : ''
      } ${className}`}
    >
      <div className='my-4 flex flex-col items-center'>
        <span className='font-semibold'>{month}</span>
        <span className='text-xl font-bold'>{formattedDay}</span>
        <span className='font-semibold text-[#707070]'>{year}</span>
        {isToday && <span>Today</span>}
      </div>
    </div>
  );
};

export default Calendar;
