'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  location: z.object({
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
  }),
  propertyType: z.string().min(1, 'Property type is required'),
  priceRange: z.enum([
    '$1M or less',
    '$1M - $1.2M',
    '$1.2M - $1.5M',
    '$1.5M - $2M',
    '$2M +',
  ]),
  financeType: z.enum([
    'Single Family home',
    'Condomium',
    'Mobile Home',
    'Land',
  ]),
});

type FormValues = z.infer<typeof formSchema>;

interface PropertyPreferenceFormProps {
  defaultValues?: Partial<FormValues>;
}

export function PropertyPreferenceForm({
  defaultValues = {},
}: PropertyPreferenceFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: {
        city: defaultValues.location?.city || 'San Jose',
        state: defaultValues.location?.state || 'CA',
        country: defaultValues.location?.country || 'USA',
      },
      propertyType: defaultValues.propertyType || '',
      priceRange: defaultValues.priceRange || '$1M or less',
      financeType: defaultValues.financeType || 'Single Family home',
    },
  });

  function onSubmit(values: FormValues) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <div className='border-b border-[#8F8F8F] py-10'>
          <div className='flex w-[90%] items-center justify-between font-medium'>
            <div>
              <h3 className='text-lg'>{form.watch('location.city')}</h3>
              <p className='text-[#8F8F8F]'>{`${form.watch('location.city')}, ${form.watch('location.state')}, ${form.watch('location.country')}`}</p>
            </div>
            <Button
              type='button'
              variant='outline'
              className='rounded-full px-16'
            >
              Edit
            </Button>
          </div>
        </div>

        <div className='flex w-[90%] items-start justify-between gap-x-10 py-10 font-medium'>
          <FormField
            control={form.control}
            name='propertyType'
            render={({ field }) => (
              <FormItem className='flex w-full flex-col justify-start gap-4'>
                <FormLabel>Property Type</FormLabel>
                <FormControl>
                  <Input
                    placeholder='Property Type'
                    {...field}
                    className='w-[75%] rounded-md border border-black p-4'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='priceRange'
            render={({ field }) => (
              <FormItem className='flex w-full flex-col justify-start gap-4'>
                <FormLabel>Price Range</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className='w-[75%] rounded-md border border-black p-4'>
                      <SelectValue placeholder='Select price range' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='$1M or less'>$1M or less</SelectItem>
                    <SelectItem value='$1M - $1.2M'>$1M - $1.2M</SelectItem>
                    <SelectItem value='$1.2M - $1.5M'>$1.2M - $1.5M</SelectItem>
                    <SelectItem value='$1.5M - $2M'>$1.5M - $2M</SelectItem>
                    <SelectItem value='$2M +'>$2M +</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='financeType'
            render={({ field }) => (
              <FormItem className='flex w-full flex-col justify-start gap-4'>
                <FormLabel>Finance Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className='w-[75%] rounded-md border border-black p-4'>
                      <SelectValue placeholder='Select finance type' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='Single Family home'>
                      Single Family home
                    </SelectItem>
                    <SelectItem value='Condomium'>Condomium</SelectItem>
                    <SelectItem value='Mobile Home'>Mobile Home</SelectItem>
                    <SelectItem value='Land'>Land</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type='submit'
          className='rounded-full bg-black px-12 py-2 font-medium text-white'
        >
          Update
        </Button>
      </form>
    </Form>
  );
}
