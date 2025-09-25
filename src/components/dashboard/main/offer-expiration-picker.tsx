// components/OfferExpirationPicker.tsx
'use client';

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export const OfferExpirationPicker = ({
  onChange,
}: {
  onChange?: (datetime: Date) => void;
}) => {
  const [date, setDate] = useState<Date | null>(null);
  const [hour, setHour] = useState('00');
  const [minute, setMinute] = useState('00');
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');

  const handleDateChange = (selected: Date | null) => {
    setDate(selected);
    updateDateTime(selected, hour, minute, ampm);
  };

  const handleTimeChange = (h: string, m: string, ap: 'AM' | 'PM') => {
    setHour(h);
    setMinute(m);
    setAmpm(ap);
    updateDateTime(date, h, m, ap);
  };

  const updateDateTime = (
    d: Date | null,
    h: string,
    m: string,
    ap: 'AM' | 'PM'
  ) => {
    if (!d) return;
    const newDate = new Date(d);
    let hours = parseInt(h, 10);
    if (ap === 'PM' && hours !== 12) hours += 12;
    if (ap === 'AM' && hours === 12) hours = 0;
    newDate.setHours(hours);
    newDate.setMinutes(parseInt(m, 10));
    newDate.setSeconds(0);
    if (onChange) onChange(newDate);
  };

  const hours = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, '0')
  );
  const minutes = ['00', '15', '30', '45'];

  return (
    <div className='flex items-center '>
      {/* Date Picker */}
      <DatePicker
        selected={date}
        onChange={handleDateChange}
        placeholderText='Set Offer expiry' 
        className='rounded-md bg-gray-100 px-4 py-2 mr-4'
        dateFormat='MMM d, yyyy'
      />

      {/* Time Picker */}
      <select
        value={hour}
        onChange={(e) => handleTimeChange(e.target.value, minute, ampm)}
        className='rounded-l-md bg-gray-100 px-2 py-2'
      >
        {hours.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>

      <select
        value={minute}
        onChange={(e) => handleTimeChange(hour, e.target.value, ampm)}
        className=' bg-gray-100 px-2 py-2'
      >
        {minutes.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <select
        value={ampm}
        onChange={(e) => handleTimeChange(hour, minute, e.target.value as 'AM' | 'PM')}
        className='rounded-r-md bg-gray-100 px-2 py-2'
      >
        <option value='AM'>AM</option>
        <option value='PM'>PM</option>
      </select>
    </div>
  );
};
