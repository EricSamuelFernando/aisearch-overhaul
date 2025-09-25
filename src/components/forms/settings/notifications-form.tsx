'use client';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { SquarePen } from 'lucide-react';

const FormSchema = z.object({
  snaphomz_notifications: z.boolean().default(true),
  emails_notifications: z.boolean(),
  property_notifications: z.boolean(),
  reminders_notifications: z.boolean(),
});

export function NotificationsForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      emails_notifications: true,
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='w-full space-y-6'>
        <div className='flex items-center justify-between border-b border-[#8F8F8F] pb-10'>
          <p className='font-medium text-[#343434]'>
            Get notifications from Snaphomz so you can stay on top of your home
            journey. Turn off anytime you’d like.
          </p>
          <FormField
            control={form.control}
            name='snaphomz_notifications'
            render={({ field }) => (
              <FormItem className='flex items-center justify-center gap-3'>
                <div className='space-y-0.5'>
                  <FormLabel className='text-base text-[#F07639]'>On</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    className='!m-0 '
                    defaultChecked={field.value}
                    // defaultValue={field.value}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className='space-y-10 py-10 font-medium'>
          <div className='grid grid-cols-3 items-start font-medium'>
            <div>
              <h3 className='text-lg'>Saved Searches</h3>
              <p className='text-[#8F8F8F]'>My saved search, for sale</p>
            </div>

            <div className='flex gap-3 text-lg'>
              <SquarePen className='h-8 w-8' />
              Edit
            </div>
          </div>

          <div className='grid grid-cols-3 items-start font-medium'>
            <div>
              <h3 className='text-lg'>Email Notifications</h3>
              <p className='max-w-[50%] text-[#8F8F8F]'>
                Get emails about your activities and recommendations
              </p>
            </div>

            <FormField
              control={form.control}
              name='emails_notifications'
              render={({ field }) => (
                <FormItem className='flex items-start justify-start gap-3'>
                  <FormControl>
                    <Switch
                      className='!m-1'
                      defaultChecked={field.value}
                      // defaultValue={field.value}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className='!mt-0'>
                    <FormLabel className='text-base text-[#F07639]'>
                      Comments
                    </FormLabel>
                    <FormDescription>
                      Comments on your posts, offers and replies to comments
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className='grid grid-cols-3 items-start font-medium'>
            <div>
              {/* <h3 className='text-lg'>Email Notifications</h3>
              <p className='max-w-[50%] text-[#8F8F8F]'>
                Get emails about your activities and recommendations
              </p> */}
            </div>

            <FormField
              control={form.control}
              name='property_notifications'
              render={({ field }) => (
                <FormItem className='flex items-start justify-start gap-3'>
                  <FormControl>
                    <Switch
                      className='!m-1'
                      defaultChecked={field.value}
                      // defaultValue={field.value}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className='!mt-0'>
                    <FormLabel className='text-base text-[#F07639]'>
                      Property Update
                    </FormLabel>
                    <FormDescription>
                      Comments on your posts, offers and replies to comments
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className='grid grid-cols-3 items-start font-medium'>
            <div>
              <h3 className='text-lg'>Push Notifications</h3>
              <p className='max-w-[50%] text-[#8F8F8F]'>
                Get emails about your activities and recommendations
              </p>
            </div>

            <FormField
              control={form.control}
              name='reminders_notifications'
              render={({ field }) => (
                <FormItem className='flex items-start justify-start gap-3'>
                  <FormControl>
                    <Switch
                      className='!m-1'
                      defaultChecked={field.value}
                      // defaultValue={field.value}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className='!mt-0'>
                    <FormLabel className='text-base text-[#F07639]'>
                      Reminders
                    </FormLabel>
                    <FormDescription>
                      Comments on your posts, offers and replies to comments
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
      </form>
    </Form>
  );
}
