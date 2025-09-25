import { useDeleteTours, useFetchTours } from '@/hooks/api/agent/useGetTours';
import React from 'react';
import Calendar from './calendar';
import PropertyImage from './property-image';
import AddressTime from './address-time';
import { ITour } from '@/interfaces/tours.interface';
import Image from 'next/image';
import SettingsCalendar from './settings-calendar';
import CustomButton from '@/components/custom-button';
import { useSearchParams } from 'next/navigation';

const SettingsTours = () => {
  const tours = useFetchTours('past');
  const toursData = tours?.data?.data.data.tours;
  const propertyId = useSearchParams().get('id') || '';

  const [isOpen, setIsOpen] = React.useState<number | null>(null);
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  const { mutate: deleteTour } = useDeleteTours();

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const parseTimeString = (
    timeString: string,
  ): { hour: number; minute: number; period: 'AM' | 'PM' } => {
    const regex = /(\d{1,2}):?(\d{0,2})?\s*(AM|PM)?/i;
    const match = timeString.match(regex);

    if (!match) {
      throw new Error(`Invalid time string format: "${timeString}"`);
    }

    const hour = Number(match[1]);
    const minute = match[2] ? Number(match[2]) : 0;
    const period = match[3] ? (match[3].toUpperCase() as 'AM' | 'PM') : 'AM';

    let parsedHour = hour;

    if (period === 'PM' && parsedHour < 12) {
      parsedHour += 12;
    } else if (period === 'AM' && parsedHour === 12) {
      parsedHour = 0;
    }

    if (parsedHour < 0 || parsedHour > 23) {
      throw new Error(`Hour out of range: "${hour}"`);
    }

    return { hour: parsedHour, minute, period };
  };

  const toggleMenu = (index: number) => {
    setIsOpen(isOpen === index ? null : index);
  };

  const handleEditClick = (index: number) => {
    setEditingIndex(index);
    setIsOpen(null);
  };

  const handleExitEditMode = () => {
    setEditingIndex(null);
  };

  const handleDeleteClick = (tourId: string) => {
    deleteTour(tourId, {
      onSuccess: () => {
        console.log(`Tour with ID ${tourId} deleted successfully.`);
        setIsOpen(null);
      },
      onError: (error) => {
        console.error(`Failed to delete tour with ID ${tourId}:`, error);
      },
    });
  };

  const initialTime =
    editingIndex !== null && toursData
      ? toursData[editingIndex].eventDate.map((date: { tourTime: string }) =>
          parseTimeString(date.tourTime),
        )
      : [];

  console.log('Initial Time:', initialTime);

  if (editingIndex !== null) {
    return (
      <div className='overflow-visible'>
        {editingIndex !== null && toursData && (
          <SettingsCalendar
            initialDate={
              new Date(toursData[editingIndex].eventDate[0].eventDate)
            }
            // initialTime={toursData[editingIndex].eventDate.map((date) =>
            //   parseTimeString(date.tourTime),
            // )}
            initialTime={initialTime}
            onExit={handleExitEditMode}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <div className='mb-4 flex items-center justify-end'>
        <CustomButton
          className='w-max rounded-full bg-black px-8 py-2 text-white'
          label='Add Schedule'
        ></CustomButton>
      </div>
      <div className='overflow-visible rounded-xl border'>
        <div className='overflow-visible'>
          {toursData && toursData.length > 0 ? (
            toursData.map((tour: ITour, index: number) => (
              <div key={index} className='relative flex space-x-8 border-b'>
                <>
                  {/* <Calendar
                  date={tour.eventDate[0].eventDate}
                  className='bg-grey-50'
                /> */}
                  <Calendar
                    date={new Date(tour.eventDate[0].eventDate)}
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
                  <button
                    onClick={() => toggleMenu(index)}
                    className='focus:outline-none'
                  >
                    <Image
                      src={'/assets/icons/ellipsis.svg'}
                      alt='More Actions'
                      width={6}
                      height={15}
                      className='mr-10'
                    />
                  </button>
                  {isOpen === index && (
                    <div
                      ref={menuRef}
                      className='absolute right-0 z-50 w-36 rounded-md bg-white shadow-lg'
                      style={{ top: '60%', zIndex: 1000 }}
                    >
                      <button
                        className='block w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-[#E8804C] hover:text-white'
                        onClick={() => handleEditClick(index)}
                      >
                        Edit
                      </button>
                      <button
                        className='block w-full px-4 py-2 text-left text-sm font-medium text-gray-700 hover:bg-[#E8804C] hover:text-white'
                        onClick={() => handleDeleteClick(tour._id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </>
              </div>
            ))
          ) : (
            <p>No tours available.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default SettingsTours;
