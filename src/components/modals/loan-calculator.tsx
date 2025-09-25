import React from 'react';
import { cn } from '@/lib/utils';
import { DonutChart } from '@mantine/charts';
import CustomInput from '@/components/customs/input';
import { data } from '@/components/buy/buy-tab';
import { Icons } from '@/components/icons';
import { useModalContext } from '@/providers/modal-provider';
import { Button } from '../ui/button';

type Props = {};

export function LoanCalculator({}: Props) {
  const { closeModal } = useModalContext();

  return (
    <section className='grid max-w-2xl grid-cols-2 '>
      <div className='col-span-2 flex items-center justify-end'>
        <Button
          onClick={() => closeModal()}
          size='icon'
          className='col-span-2 flex items-center justify-end bg-transparent hover:bg-transparent'
        >
          <Icons.Close className='h-6 w-6 cursor-pointer' />
        </Button>
      </div>

      <div className='col-span-1'>
        <h2 className='mb-5 text-xl font-bold'>Price Calculator</h2>
        <div>
          <div className='flex-1'>
            <CustomInput
              leftSectionPointerEvents='none'
              leftSection={'$'}
              label='Home Price'
              labelClass='text-black !mb-2 !font-bold'
            />

            <CustomInput
              leftSectionPointerEvents='none'
              rightSectionPointerEvents='none'
              leftSection={'$'}
              rightSection={'%'}
              label='Down Payment'
              labelClass='text-black !mb-2 !font-bold'
            />

            <CustomInput
              rightSectionPointerEvents='none'
              rightSection={'%'}
              label='Interest Rate'
              labelClass='text-black !mb-2 !font-bold'
            />

            <CustomInput
              label='Loan Period ( Years )'
              labelClass='text-black !mb-2 !font-bold'
              value='30-year fixed'
            />
          </div>
        </div>
      </div>
      <div className='col-span-1 grid place-content-center'>
        <div className='h-52 w-52'>
          <DonutChart
            data={[
              { name: 'USA', value: 400, color: 'blue' },
              { name: 'Other', value: 200, color: 'gray.6' },
            ]}
          />
        </div>
        {/* <DonutChart
            data={data}
            tooltipDataSource="segment"
            mx="auto"
            size={200}
            strokeWidth={0}
            thickness={30}
          /> */}

        <div className='mt-4 text-center'>
          <h4 className='text-2xl font-bold'>$12,600</h4>
          <span className='text-base'>Est. Payment /month</span>
        </div>
      </div>
      <div className='col-span-2 mt-4 flex grid-cols-2 items-center justify-center gap-x-2'>
        {data.map((item) => (
          <span className='flex items-center gap-x-2' key={item?.name}>
            <span
              style={{
                backgroundColor: item?.color,
              }}
              className={cn('block h-4 w-4 rounded-full bg-cyan-500')}
            />
            <span>{item.name}</span>
          </span>
        ))}
      </div>
    </section>
  );
}
