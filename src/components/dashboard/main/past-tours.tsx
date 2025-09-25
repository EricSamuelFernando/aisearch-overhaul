import { useFetchTours } from '@/hooks/api/agent/useGetTours';
import React from 'react';
import Calendar from './calendar';
import PropertyImage from './property-image';
import AddressTime from './address-time';
import { ITour } from '@/interfaces/tours.interface';

const PastTours = () => {
  const tours = useFetchTours('past');
  const toursData = tours?.data?.data.data.tours;

  return (
    <div className='overflow-hidden rounded-2xl border'>
      <div className='overflow-hidden rounded-2xl border'>
        {toursData && toursData.length > 0 ? (
          toursData.map((tour: ITour, index: number) => (
            <div key={index} className='flex space-x-8 border-b'>
              <Calendar
                date={tour.eventDate[0].eventDate}
                // day={tour.day}
                // isToday={tour.isToday}
                className='bg-grey-50'
              />
              <div className='flex flex-grow items-center space-x-4 py-4'>
                <PropertyImage alt='Property Image' />
                <AddressTime
                  address={
                    tour.property.propertyAddressDetails.formattedAddress
                  }
                  time={tour.eventDate[0].tourTime}
                />
              </div>
            </div>
          ))
        ) : (
          <p>No tours available.</p>
        )}
      </div>
    </div>
  );
};

export default PastTours;
