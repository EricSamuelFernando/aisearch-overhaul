import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Button } from '@/components/ui/button';
import UnlockCalendarModal from './unlock-calendar-modal';

interface SettingsCalendarProps {
  initialDate: Date | null;
  initialTime: { hour: number; minute: number; period: 'AM' | 'PM' }[];
  onExit: () => void;
}

type CalendarValue = Date | [Date, Date] | null;

const SettingsCalendar: React.FC<SettingsCalendarProps> = ({
  initialDate,
  initialTime,
  onExit,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate);
  const [editableDate, setEditableDate] = useState<Date | null>(initialDate);
  const [times, setTimes] = useState(initialTime);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [hasEdited, setHasEdited] = useState(false);

  const handleDateChange = (value: CalendarValue) => {
    if (Array.isArray(value)) {
      if (value.length === 2) {
        const startDate = new Date(value[0]);
        setEditableDate(startDate);
        setHasEdited(true);
      }
    } else if (value instanceof Date) {
      setEditableDate(value);
      setHasEdited(true);
    } else {
      setEditableDate(null);
      setHasEdited(true);
    }
  };

  const addNewTime = () => {
    setTimes([...times, { hour: 7, minute: 0, period: 'AM' }]);
    setHasEdited(true);
  };

  const formatDate = (date: Date | null) => {
    return date
      ? date.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : '';
  };

  const toggleCalendar = () => {
    setShowCalendar((prev) => !prev);
  };

  const handleSetClick = () => {
    if (hasEdited) {
      setShowUnlockModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowUnlockModal(false);
  };

  const handleProceed = () => {
    setShowUnlockModal(false);
  };

  return (
    <div className='max-w-lg p-4'>
      <div className='flex flex-col space-y-4'>
        <div className='flex items-center space-x-2'>
          <input
            type='radio'
            id='date1'
            name='date'
            checked
            className='h-4 w-4 accent-[#D9673A]'
          />
          <input
            type='text'
            value={formatDate(selectedDate)}
            readOnly
            disabled
            className='w-[200px] cursor-not-allowed rounded-lg border-gray-300 bg-gray-200 px-4 py-2 text-gray-500'
          />
          <span className='text-gray-500'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6 cursor-not-allowed'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2z'
              />
            </svg>
          </span>
          <div className='flex items-center space-x-2'>
            {times.map((time, index) => (
              <div key={index} className='flex space-x-2'>
                <select
                  value={time.hour}
                  className='rounded-lg border-gray-300 p-2'
                  onChange={(e) => {
                    const newTimes = [...times];
                    newTimes[index].hour = parseInt(e.target.value, 10);
                    setTimes(newTimes);
                  }}
                  disabled={index === 0}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                    <option key={hour} value={hour}>
                      {hour.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <span>:</span>
                <select
                  value={time.minute}
                  className='rounded-lg border-gray-300 p-2'
                  onChange={(e) => {
                    const newTimes = [...times];
                    newTimes[index].minute = parseInt(e.target.value, 10);
                    setTimes(newTimes);
                  }}
                  disabled={index === 0}
                >
                  <option value={0}>00</option>
                  <option value={30}>30</option>
                </select>
                <select
                  value={time.period}
                  className='rounded-lg border-gray-300 p-2'
                  onChange={(e) => {
                    const newTimes = [...times];
                    newTimes[index].period = e.target.value as 'AM' | 'PM';
                    setTimes(newTimes);
                  }}
                  disabled={index === 0}
                >
                  <option value='AM'>AM</option>
                  <option value='PM'>PM</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          <input
            type='radio'
            id='date2'
            name='date'
            className='h-4 w-4 accent-gray-300'
          />
          <input
            type='text'
            value={formatDate(editableDate)}
            onChange={(e) => {
              const newDate = new Date(e.target.value);
              if (!isNaN(newDate.getTime())) {
                setEditableDate(newDate);
              }
            }}
            className='w-[200px] cursor-text rounded-lg border-gray-300 px-4 py-2 text-gray-800'
          />
          <span className='text-gray-500'>
            <svg
              onClick={toggleCalendar}
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6 cursor-pointer'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2z'
              />
            </svg>
          </span>

          <div className='flex items-center space-x-2'>
            {times.map((time, index) => (
              <div key={index} className='flex space-x-2'>
                <select
                  value={time.hour}
                  className='rounded-lg border-gray-300 p-2'
                  onChange={(e) => {
                    const newTimes = [...times];
                    newTimes[index].hour = parseInt(e.target.value, 10);
                    setTimes(newTimes);
                  }}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                    <option key={hour} value={hour}>
                      {hour.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <span>:</span>
                <select
                  value={time.minute}
                  className='rounded-lg border-gray-300 p-2'
                  onChange={(e) => {
                    const newTimes = [...times];
                    newTimes[index].minute = parseInt(e.target.value, 10);
                    setTimes(newTimes);
                  }}
                >
                  <option value={0}>00</option>
                  <option value={30}>30</option>
                </select>
                <select
                  value={time.period}
                  className='rounded-lg border-gray-300 p-2'
                  onChange={(e) => {
                    const newTimes = [...times];
                    newTimes[index].period = e.target.value as 'AM' | 'PM';
                    setTimes(newTimes);
                  }}
                >
                  <option value='AM'>AM</option>
                  <option value='PM'>PM</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* <Button onClick={addNewTime} className='mt-4'>
          Add new time
        </Button> */}

        {showCalendar && (
          <div id='calendar'>
            <Calendar
              onChange={(value: unknown) =>
                handleDateChange(value as CalendarValue)
              }
              value={editableDate}
              className='mt-4'
            />
          </div>
        )}

        <div className='mt-4 flex justify-end gap-8'>
          <Button
            onClick={onExit}
            className='py-1'
            variant='ghost'
            roundness='full'
          >
            Cancel
          </Button>
          <Button
            onClick={handleSetClick}
            className='px-14 py-1'
            variant='default'
            roundness='full'
          >
            Set
          </Button>
        </div>
      </div>

      {showUnlockModal && (
        <UnlockCalendarModal
          onClose={handleCloseModal}
          onProceed={handleProceed}
        />
      )}
    </div>
  );
};

export default SettingsCalendar;
