'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CustomButton from '@/components/shared/custom-button';

type Name =
  | 'detailed_analytics'
  | 'buyer_showings'
  | 'assisted_disclosure'
  | 'platform_assisted'
  | 'review_cma'
  | 'closing_services';

type FormField = {
  name: Name;
  title: string;
  subTitle: string;
  price: number;
};

const FormSchema = z.object({
  detailed_analytics: z.boolean().default(false).optional(),
  buyer_showings: z.boolean(),
  assisted_disclosure: z.boolean(),
  platform_assisted: z.boolean(),
  review_cma: z.boolean(),
  closing_services: z.boolean(),
});

const formFields: FormField[] = [
  {
    name: 'detailed_analytics',
    title: 'Review Detailed Analytics on property & obtain CMA',
    subTitle: '(15$ per property)',
    price: 15,
  },
  {
    name: 'buyer_showings',
    title: 'Review Detailed Analytics on property & obtain CMA',
    subTitle: '(150$ per property)',
    price: 150,
  },
  {
    name: 'assisted_disclosure',
    title: 'AI assisted Disclosure Summary',
    subTitle: '(15$ per property)',
    price: 15,
  },
  {
    name: 'platform_assisted',
    title: `Move Forward with a Platform Assisted Offer template 
And send offer to Listing Agent`,
    subTitle: '(250$ per property)',
    price: 250,
  },
  {
    name: 'review_cma',
    title: `Review CMA & Disclosures with an expert for 15 mins `,
    subTitle: '($100 per session)',
    price: 100,
  },
  {
    name: 'closing_services',
    title: `Closing Services`,
    subTitle: '( Flat $2500 per transaction )',
    price: 2500,
  },
];

export function EstimatedCostForm() {
  const [numberOfProperties, setNumberOfProperties] = useState(1);
  const [estimatedCost, setEstimatedCost] = useState(0);
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      detailed_analytics: true,
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);
  }

  useEffect(() => {
    let totalCost = 0;
    formFields.forEach(({ name, price }) => {
      if (form.watch(name)) {
        totalCost += form.watch(name) ? price : 0;
      }
    });
    setEstimatedCost(totalCost * numberOfProperties);
  }, [form.watch(), numberOfProperties]);

  const handleNavigateToAddAgent = () => {
    router.push(`/dashboard/seller/guided-transaction`);
  };

  return (
    <section className='bg-grey-190 py-16'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='my-auto w-full p-10'
        >
          <div className='grid gap-8 md:grid-cols-2'>
            {formFields.map(({ name, title, subTitle }) => (
              <FormField
                control={form.control}
                name={name}
                key={name}
                render={({ field }) => (
                  <FormItem
                    className={cn(
                      'flex flex-row items-center justify-between rounded-3xl border p-5',
                      field.value ? 'bg-white' : 'bg-transparent',
                    )}
                  >
                    <div className='space-y-0.5'>
                      <FormLabel className='text-base'>{title}</FormLabel>
                      <FormDescription>{subTitle}</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
          </div>
          <div className='my-10 flex justify-end gap-x-8'>
            <div className='flex items-start gap-x-2 px-3'>
              <p>No of Property</p>
              <Select
                value={numberOfProperties.toString()}
                onValueChange={(e) => setNumberOfProperties(+e)}
              >
                <SelectTrigger className='w-[120px]'>
                  <SelectValue placeholder='No of Property' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='1'>1</SelectItem>
                  <SelectItem value='2'>2</SelectItem>
                  <SelectItem value='3'>3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className='text-xl text-ocOrange'>Estimated Cost</p>
              <h3 className='text-right text-2xl font-bold'>
                ${estimatedCost}
              </h3>
            </div>
          </div>
          <div className='flex justify-between'>
            <CustomButton
              className='w-max rounded-full border border-black bg-white px-10 py-2 text-md text-black'
              label='Back'
              onClick={handleNavigateToAddAgent}
            />
          </div>
        </form>
      </Form>
    </section>
  );
}
