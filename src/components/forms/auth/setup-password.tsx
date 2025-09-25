'use client';

import { useForm } from '@mantine/form';
import { useRouter, useSearchParams } from 'next/navigation';
import { ButtonLoader } from '@/components/loader';
import { Button } from '@/components/ui/button';
import { PasswordInput2 } from '@/components/password-input-2';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';

export const SetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams()

  const form = useForm({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validate: {
      password: (value) =>
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(value)
          ? null
          : 'Minimum 8 characters, at least 1 letter, 1 number and 1 special character',
      
      confirmPassword: (value, values) =>
        value === values.password ? null : 'Passwords did not match',
    },
  });
  
  const { resetPasswordMutation } = useUserAuthApi();

  const { isSuccess } = resetPasswordMutation

  if (isSuccess) {
    router.push(`/home`);
  }

  console.log(searchParams.get('token'))

  const isValid =
    form.values.confirmPassword.length > 3 &&
    form.values.password.length > 3 &&
    form.isValid();

  return (
    <form
      className='h-max min-w-[400px]'
      onSubmit={form.onSubmit((values) => {
        resetPasswordMutation.mutate({ token:searchParams.get('token')|| '' , newPassword:values?.password });
      })}
    >
      <section>
        <section className=''>
          <h3 className='mb-4 text-xl font-medium'>Set New Password</h3>
        </section>

        <div>
          <label className='mb-2 block font-medium text-gray-700'>
            Password
          </label>
          <PasswordInput2
            placeholder='Password'
            className='w-full py-4'
            {...form.getInputProps('password')}
          />
        </div>

        <div>
          <label className='mb-2 block font-medium text-gray-700'>
            Confirm Password
          </label>
          <PasswordInput2
            placeholder='Confirm Password'
            className='w-full py-4'
            {...form.getInputProps('confirmPassword')}
          />
        </div>

        <Button
          disabled={resetPasswordMutation.isPending || !isValid}
          size='lg'
          className='w-full disabled:bg-primary-main/20'
          roundness='md'
          type='submit'
          variant='ocreal'
        >
          {resetPasswordMutation.isPending ? <ButtonLoader /> : null}
          Change Password
        </Button>
      </section>
    </form>
  );
};
