'use client';

import CustomInput from '@/components/customs/input';
import { Button } from '@/components/ui/button';
import { useForm } from '@mantine/form';
import Image from 'next/image';

export const SearchForm = () => {
  const form = useForm({
    initialValues: {
      location: '',
    },
  });

  let icon = (
    <Image
      src='/assets/images/location.svg'
      alt='logo'
      height={18}
      width={18}
    />
  );

  return (
    <form className='relative' onSubmit={form.onSubmit((values) => {})}>
      <CustomInput
        {...form.getInputProps('location')}
        key='search'
        leftSection={icon}
        className='rounded-md border-0 border-none  bg-white py-3 outline-none outline-0'
        placeholder='Search for city, area, school or ZIP'
      />
      {/* <CustomButton
        type="submit"
        variant="filled"
        className="bg-black py-2 w-max text-white absolute right-2 top-1 px-6 text-center"
        label="Next"
      /> */}

      <Button className='absolute right-2 top-1' type='submit'>
        See a loan Calculator
      </Button>
    </form>
  );
};

export default SearchForm;
