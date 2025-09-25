'use client';

import CustomModal from '@/components/custom-modal';
import { cn, getNextHours, getNextYearCalendar } from '@/lib/utils';
import { useDisclosure } from '@mantine/hooks';
import { isEmpty } from 'lodash';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { usePropertyApi } from '@/hooks/api/property/usePropertyApi';
import { storeCookie } from '@/lib/storage';
import { USER_ROLE } from '@/shared/constants/env';
import { CalendarDay, CalendarItem, CalendarTime } from '@/types/global.types';
import { Cell } from './cell';

type Month = {
  abbreviation: string;
  fullName: string;
  index?: number;
};

function getCurrentMonthIndex() {
  const today = new Date();
  return today.getMonth(); // 0-indexed month number (Jan = 0)
}

const months: Month[] = [
  { abbreviation: 'Jan', fullName: 'January' },
  { abbreviation: 'Feb', fullName: 'February' },
  { abbreviation: 'Mar', fullName: 'March' },
  { abbreviation: 'Apr', fullName: 'April' },
  { abbreviation: 'May', fullName: 'May' },
  { abbreviation: 'Jun', fullName: 'June' },
  { abbreviation: 'Jul', fullName: 'July' },
  { abbreviation: 'Aug', fullName: 'August' },
  { abbreviation: 'Sep', fullName: 'September' },
  { abbreviation: 'Oct', fullName: 'October' },
  { abbreviation: 'Nov', fullName: 'November' },
  { abbreviation: 'Dec', fullName: 'December' },
];

const currentMonthIndex = getCurrentMonthIndex();

// Slice the months array to start from the current month and wrap around to the beginning
const dynamicMonths = months
  .slice(currentMonthIndex)
  .concat(months.slice(0, currentMonthIndex));
type Props = {
  propertyId: string;
};
export function ScheduleTour({ propertyId }: Props) {
  const [opened, { open, close }] = useDisclosure(false);
  const [selectedMonth, setSelectedMonth] = useState<CalendarItem | null>(null);
  const [selectedDays, setSelectedDays] = useState<CalendarDay[]>([]);
  const [currentDayIndex, setCurrentDayIndex] = useState<number>(0);
  const [disableNext, setDisableNext] = useState(false);
  const [disablePrev, setDisablePrev] = useState(false);
  const [month, setMonth] = useState<Month | null>(null);
  const [chosenDate, setChosenDate] = useState<CalendarDay | null>(null);
  const [chosenTime, setChosenTime] = useState<CalendarTime | null>(null);
  const [screen, setScreens] = useState<'selections' | 'summary' | 'success'>(
    'selections',
  );

  const { createTourMutation } = usePropertyApi();

  const next6Hours = getNextHours(6);
  const nextYearCalendar = getNextYearCalendar();

  const resetModal = () => {
    close();
    setSelectedMonth(null);
    setChosenDate(null);
    setChosenTime(null);
    setScreens('selections');
  };

  const handleNext7Days = () => {
    if (selectedMonth) {
      const numDaysInMonth = selectedMonth.days.length;
      const nextIndex = currentDayIndex + 7;
      const maxIndex = Math.min(nextIndex, numDaysInMonth);
      const remainingDays = selectedMonth.days
        .slice(currentDayIndex, maxIndex)
        .filter((obj) => obj.date !== 0 || obj.day !== '');
      if (!remainingDays.length) {
        setDisableNext(true);
        setDisablePrev(false);
        return;
      }

      setSelectedDays(remainingDays);
      setCurrentDayIndex(maxIndex);
      setDisablePrev(false);
    }
  };

  const handlePrevious7Days = () => {
    if (selectedMonth) {
      const previousIndex = Math.max(currentDayIndex - 7, 0);
      const remainingDays = selectedMonth.days
        .slice(previousIndex, currentDayIndex)
        .filter((obj) => obj.date !== 0 || obj.day !== '');
      if (!remainingDays.length) {
        setDisablePrev(true);
        setDisableNext(false);
        return;
      }
      setSelectedDays(remainingDays);
      setCurrentDayIndex(previousIndex);
      setDisableNext(false); // Ensure next button is enabled
    }
  };

  const handelDateSelection = (date: CalendarDay) => {
    setChosenDate(date);
  };

  const handelTimeSelection = (time: CalendarTime) => {
    setChosenTime(time);
    setScreens('summary');
  };

  const handleSelection = (item: Month) => {
    setMonth(item);
    const selection = nextYearCalendar.find((a) => a.month === item.fullName);
    setSelectedMonth(selection as CalendarItem);
    const index = selection?.days
      ? selection?.days.findIndex((obj) => obj.date !== 0 || obj.day !== '')
      : -1;

    setCurrentDayIndex(index);
    setSelectedDays(
      selection?.days
        .slice(index, index + 7)
        .filter((obj) => obj.date !== 0 || obj.day !== '') as CalendarDay[],
    );
  };

  const generateTourDate = () => {
    const generatedDate = new Date();
    generatedDate.setFullYear(chosenDate?.year!);
    generatedDate.setDate(chosenDate?.date!);
    generatedDate.setMonth(
      [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ].indexOf(month?.abbreviation!),
    );
    generatedDate.setHours(
      (chosenTime?.hour! % 12) + (chosenTime?.ampm === 'pm' ? 12 : 0),
    );
    generatedDate.setMinutes(0);
    const tourDate = generatedDate.toISOString();
    return tourDate;
  };

  const handleTourCreation = async () => {
    storeCookie({ key: USER_ROLE, value: 'buyer' });
    const tourDate = generateTourDate();
    await createTourMutation.mutate({
      property: propertyId,
      tourDate,
    });
  };

  useEffect(() => {
    if (createTourMutation.isSuccess) {
      setScreens('success');
    }
  }, [createTourMutation.isSuccess]);

  return (
    <section>
      <CustomModal isOpen={opened} onClose={resetModal}>
        {screen === 'summary' ? (
          <div className='flex flex-col items-center p-8'>
            <h2 className='text-2xl font-bold text-black'>
              {chosenDate?.dayLong}
            </h2>
            <p className='text-lg text-[#454545]'>{`${month?.abbreviation} ${chosenDate?.date}`}</p>

            <p className='my-4 text-2xl text-[#a2a2a2]'>
              {chosenTime?.formattedTime}
            </p>

            {/* <CustomButton
              onClick={handleTourCreation}
              className={cn(
                'text-white w-full rounded-3xl py-1',
                createTourMutation.isPending ? 'bg-black/30' : 'bg-black '
              )}
              label={
                createTourMutation.isPending ? 'Scheduling..' : 'Schedule Tour'
              }
            /> */}

            <Button
              disabled={createTourMutation.isPending}
              onClick={handleTourCreation}
              roundness='full'
            >
              {createTourMutation.isPending ? 'Scheduling..' : 'Schedule Tour'}
            </Button>
          </div>
        ) : null}

        {screen === 'selections' ? (
          <div>
            {isEmpty(selectedMonth) ? (
              <div>
                <div className='flex p-2'>
                  <ChevronLeft />
                  <div className='flex-auto text-center font-bold'>
                    Select Month
                  </div>
                  <Calendar />
                </div>

                <div className='my-8 grid grid-cols-5 place-content-center items-center justify-center gap-y-6 px-6'>
                  {dynamicMonths.map((item, idx) => (
                    <span
                      key={idx}
                      onClick={() => handleSelection(item)}
                      className='cursor-pointer font-bold'
                    >
                      {item.abbreviation}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className='flex p-2'>
                  <div className='flex'>
                    <ChevronLeft
                      onClick={handlePrevious7Days}
                      className={cn(
                        'text-black',
                        disablePrev
                          ? 'pointer-events-none cursor-not-allowed text-gray-500'
                          : 'cursor-pointer',
                      )}
                    />
                    <ChevronRight
                      onClick={handleNext7Days}
                      className={cn(
                        'text-black',
                        disableNext || currentDayIndex === 0
                          ? 'pointer-events-none cursor-not-allowed text-gray-500'
                          : 'cursor-pointer',
                      )}
                    />
                  </div>
                  <div className='flex-auto text-center font-bold'>
                    {selectedMonth.month ?? ''}
                  </div>

                  <Calendar
                    onClick={() => setSelectedMonth(null)}
                    className='cursor-pointer font-light'
                  />
                </div>

                <div className='grid grid-cols-7 items-center justify-center text-center'>
                  {selectedDays.map((day, i) => (
                    <Cell key={i} className='text-xs font-bold uppercase'>
                      {day.day}
                    </Cell>
                  ))}
                </div>

                <div className='grid grid-cols-7 items-center justify-center text-center'>
                  {selectedDays.map((day, i) => (
                    <Cell
                      key={i}
                      onClick={() => handelDateSelection(day)}
                      className={cn(
                        'mx-1 cursor-pointer rounded-xl p-3 text-base font-bold  uppercase',
                        chosenDate?.date === day.date
                          ? 'bg-black text-white'
                          : 'bg-white text-black',
                      )}
                    >
                      {day.date}
                    </Cell>
                  ))}
                </div>

                <div
                  className={cn(
                    'my-4 grid grid-cols-3 items-center justify-between gap-4  text-center',
                    !chosenDate ? 'pointer-events-none cursor-not-allowed' : '',
                  )}
                >
                  {next6Hours.map((item: CalendarTime, i) => (
                    <Cell
                      key={i}
                      onClick={() => handelTimeSelection(item)}
                      className={cn(
                        'cursor-pointer rounded-lg p-4 text-base font-bold uppercase',
                        chosenTime?.formattedTime === item.formattedTime
                          ? 'bg-black text-white'
                          : 'border-[1px] border-black',
                      )}
                    >
                      {item.formattedTime}
                    </Cell>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}

        {screen === 'success' ? (
          <div className="flex h-[200px] flex-col items-center justify-end bg-[url('/assets/images/success.svg')]  bg-cover bg-center bg-no-repeat">
            <p className='font-semibold text-ocOrange'>Home Tour</p>
            <h3 className='text-xl font-bold'>Scheduled!</h3>
          </div>
        ) : null}
      </CustomModal>

      {/* <CustomButton
        label="Schedule Tour"
        onClick={open}
        className="bg-transparent text-sm flex-1  font-700  text-black outline-black border-black rounded-3xl outline py-1"
      /> */}

      <Button variant='outline' onClick={open} roundness='full'>
        Schedule Tour
      </Button>
    </section>
  );
}
