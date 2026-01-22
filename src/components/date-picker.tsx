// import {
//   addDays,
//   endOfMonth,
//   format,
//   isLastDayOfMonth,
//   startOfMonth,
//   subDays,
// } from 'date-fns';
// import React, { useState } from 'react';
// import ReactDatePicker from 'react-datepicker';
// import { Icons } from './icons';
// import { cn } from '../lib/utils';

// interface DatePickerProps {
//   onDateTimeSelect: (dateTime: string) => void;
//   onTimeChange: (time: string) => void;
//   initialDate?: Date;
//   initialTime?: any;
// }

// interface TimePickerProps {
//   onTimeChange: (time: string) => void;
//   initialTime?: any;
// }

// const TimePicker: React.FC<TimePickerProps> = ({ onTimeChange , initialTime }) => {
//   const [startDate, setStartDate] = useState(initialTime || new Date());

//   const handleTimeChange = (date: Date) => {
//     const currTime = format(date, 'HH:mm:ss');
//     onTimeChange(currTime);
//     setStartDate(date);
//   };

//   return (
//     <ReactDatePicker
//       selected={startDate}
//      // onChange={handleTimeChange}
//       showTimeSelect
//       showTimeSelectOnly
//       timeIntervals={15}
//       timeCaption='Time'
//       dateFormat='h:mm aa'
//       className='h-12 !w-full min-w-full rounded-lg border border-[#000000] px-4'
//     />
//   );
// };

// const DatePicker: React.FC<DatePickerProps> = ({
//   initialDate,
//   onDateTimeSelect,
//   onTimeChange,
//   initialTime
// }) => {
//   const [currentDate, setCurrentDate] = useState<Date>(initialDate || new Date());
//   const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate || null);



//   const handleNext = () => {
//     setCurrentDate((prevDate) => addDays(prevDate, 3));
//   };

//   const handlePrev = () => {
//     setCurrentDate((prevDate) => subDays(prevDate, 3));
//   };

//   const isBackDisabled = () => {
//     const today = new Date();
//     return currentDate.getTime() <= today.getTime();
//   };

//   const getDates = () => {
//     const dates = [];
//     let current = currentDate;

//     // Check if current date is the last day of the month
//     const isLastDay = isLastDayOfMonth(currentDate);

//     // Loop to get three days from the current month
//     while (dates.length < 3 && current <= endOfMonth(currentDate)) {
//       dates.push(current);
//       current = addDays(current, 1);
//     }

//     // If current date is the last day of the month and less than 3 days are displayed, start the next month
//     if (isLastDay && dates.length < 3) {
//       current = startOfMonth(addDays(currentDate, 1));
//       // Loop to get days from the next month to fill the remaining slots
//       while (dates.length < 3) {
//         dates.push(current);
//         current = addDays(current, 1);
//       }
//     }

//     // Pad with null values if needed
//     while (dates.length < 3) {
//       dates.push(null);
//     }

//     return dates;
//   };

//   const renderHeader = () => {
//     return (
//       <div className='mb-2 flex w-full items-center font-medium text-[#989898]'>
//         <div className='h-[2px] w-[50%] flex-1 bg-[#989898]' />
//         <div className='mx-2'>{format(currentDate, 'MMMM yyyy')}</div>
//         <div className='h-[2px] w-[50%] flex-1 bg-[#989898]' />
//       </div>
//     );
//   };

//   const renderDate = (date: Date | null) => {
//     const handleClick = () => {
//       setSelectedDate(date);
//       if (date) {
//         const dateTime = new Date(date.getTime());
//         const isoDateTime = dateTime.toISOString();
//         onDateTimeSelect(isoDateTime);
//       }
//     };

//     const isSelected = date && selectedDate && date?.getTime() === selectedDate?.getTime();
   


//     if (date) {
//       return (
//         <div
//           onClick={handleClick}
//           className={cn(
//             '-gap-2 my-3 flex h-28 w-28 cursor-pointer flex-col items-center justify-center p-6 text-center text-[#818080]',
//             isSelected ? 'rounded-2xl border border-[#707070] bg-white' : '',
//           )}
//         >
//           <div className='text-2xl text-[#454545]'>{format(date, 'EEE')}</div>
//           <div className='text-5xl font-bold'>{format(date, 'd')}</div>
//         </div>
//       );
//     } else {
//       return <div className='h-20 w-20 p-4 text-center'></div>;
//     }
//   };
  

//   return (
//     <div className='flex w-full flex-col'>
//       <div className='flex w-full flex-col'>
//         {renderHeader()}
//         <div className='mb-4 flex w-full items-center justify-between gap-x-8'>
//           <button onClick={handlePrev} disabled={isBackDisabled()}>
//             <Icons.LeftChevron
//               fill={isBackDisabled() ? '#B1B1B1' : 'black'}
//               className='h-8 w-8'
//             />
//           </button>
//           <div className='grid grid-cols-3 gap-x-4'>
//             {getDates().map((date, index) => (
//               <div className='col-span-1' key={index}>
//                 {renderDate(date)}
//               </div>
//             ))}
//           </div>

//           <button onClick={handleNext}>
//             <Icons.RightChevron className='h-8 w-8' />
//           </button>
//         </div>
//       </div>
//       <TimePicker onTimeChange={onTimeChange} initialTime={initialTime} />
//     </div>
//   );
// };

// export default DatePicker;
import {
  addDays,
  endOfMonth,
  format,
  isLastDayOfMonth,
  startOfMonth,
  subDays,
} from 'date-fns';
import React, { useState, useEffect } from 'react';
import ReactDatePicker from 'react-datepicker';
import { Icons } from './icons';
import { cn } from '../lib/utils';

interface DatePickerProps {
  onDateTimeSelect: (dateTime: string) => void;
  onTimeChange: (time: string) => void;
  initialDate?: Date;
  initialTime?: Date;
}

interface TimePickerProps {
  onTimeChange: (time: string) => void;
  initialTime?: Date | string;
}

const TimePicker: React.FC<TimePickerProps> = ({ onTimeChange, initialTime }) => {
  // Parse initialTime - can be Date object or time string (HH:mm:ss)
  const getInitialTime = (): Date => {
    if (!initialTime) return new Date();
    
    if (initialTime instanceof Date) {
      return initialTime;
    }
    
    // If it's a string (HH:mm:ss format), parse it
    if (typeof initialTime === 'string') {
      const [hours, minutes, seconds] = initialTime.split(':').map(Number);
      const date = new Date();
      date.setHours(hours || 0, minutes || 0, seconds || 0, 0);
      return date;
    }
    
    return new Date();
  };

  const [startDate, setStartDate] = useState<Date>(getInitialTime());

  // Update when initialTime changes (for editing mode)
  useEffect(() => {
    if (initialTime) {
      const parsedTime = getInitialTime();
      setStartDate(parsedTime);
    }
  }, [initialTime]);

  const handleTimeChange = (date: Date | null) => {
    if (!date) return; // null guard
    const currTime = format(date, 'HH:mm:ss');
    onTimeChange(currTime);
    setStartDate(date);
  };

  return (
    <ReactDatePicker
      selected={startDate}
      onChange={handleTimeChange}
      showTimeSelect
      showTimeSelectOnly
      timeIntervals={15}
      timeCaption="Time"
      dateFormat="h:mm aa"
      className="h-12 !w-full min-w-full rounded-lg border border-[#000000] px-4"
    />
  );
};

const DatePicker: React.FC<DatePickerProps> = ({
  initialDate,
  onDateTimeSelect,
  onTimeChange,
  initialTime,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate || new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate || null);

  // Update selected date when initialDate changes (for editing mode)
  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
      // Set currentDate to show the month of the initial date
      setCurrentDate(initialDate);
    }
  }, [initialDate]);

  // Update selected date when initialDate changes (for editing mode)
  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
      // Set currentDate to show the month of the initial date
      setCurrentDate(initialDate);
    }
  }, [initialDate]);

  const handleNext = () => {
    setCurrentDate((prevDate) => addDays(prevDate, 3));
  };

  const handlePrev = () => {
    setCurrentDate((prevDate) => subDays(prevDate, 3));
  };

  const isBackDisabled = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to midnight
    return currentDate.getTime() <= today.getTime();
  };

  const getDates = () => {
    const dates: (Date | null)[] = [];
    let current = currentDate;

    const isLastDay = isLastDayOfMonth(currentDate);

    while (dates.length < 3 && current <= endOfMonth(currentDate)) {
      dates.push(current);
      current = addDays(current, 1);
    }

    if (isLastDay && dates.length < 3) {
      current = startOfMonth(addDays(currentDate, 1));
      while (dates.length < 3) {
        dates.push(current);
        current = addDays(current, 1);
      }
    }

    while (dates.length < 3) {
      dates.push(null);
    }

    return dates;
  };

  const renderHeader = () => (
    <div className="mb-2 flex w-full items-center font-medium text-[#989898]">
      <div className="h-[2px] w-[50%] flex-1 bg-[#989898]" />
      <div className="mx-2">{format(currentDate, 'MMMM yyyy')}</div>
      <div className="h-[2px] w-[50%] flex-1 bg-[#989898]" />
    </div>
  );

  const renderDate = (date: Date | null) => {
    const handleClick = () => {
      setSelectedDate(date);
      if (date) {
        const isoDateTime = date.toISOString();
        onDateTimeSelect(isoDateTime);
      }
    };

    const isSelected =
      date && selectedDate && date.getTime() === selectedDate.getTime();

    if (date) {
      return (
        <div
          onClick={handleClick}
          className={cn(
            '-gap-2 my-3 flex h-28 w-28 cursor-pointer flex-col items-center justify-center p-6 text-center text-[#818080]',
            isSelected ? 'rounded-2xl border border-[#707070] bg-white' : ''
          )}
        >
          <div className="text-2xl text-[#454545]">{format(date, 'EEE')}</div>
          <div className="text-5xl font-bold">{format(date, 'd')}</div>
        </div>
      );
    } else {
      return <div className="h-20 w-20 p-4 text-center"></div>;
    }
  };

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full flex-col">
        {renderHeader()}
        <div className="mb-4 flex w-full items-center justify-between gap-x-8">
          <button onClick={handlePrev} disabled={isBackDisabled()}>
            <Icons.LeftChevron
              fill={isBackDisabled() ? '#B1B1B1' : 'black'}
              className="h-8 w-8"
            />
          </button>
          <div className="grid grid-cols-3 gap-x-4">
            {getDates().map((date, index) => (
              <div className="col-span-1" key={index}>
                {renderDate(date)}
              </div>
            ))}
          </div>
          <button onClick={handleNext}>
            <Icons.RightChevron className="h-8 w-8" />
          </button>
        </div>
      </div>
      <TimePicker onTimeChange={onTimeChange} initialTime={initialTime} />
    </div>
  );
};

export default DatePicker;
