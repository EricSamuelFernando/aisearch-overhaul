'use client';
import * as React from 'react';
import { useForm } from '@mantine/form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import CustomInput from '@/components/customs/input';
import { ButtonLoader } from '@/components/loader';
import { PasswordInput2 } from '@/components/password-input-2';
import { Button } from '@/components/ui/button';
import { AuthButton } from '@/components/AuthButton';
import useCognitoGoogleAuth from '@/hooks/api/auth/useCognitoGoogleAuth';

export const LoginPageForm = () => {
  const router = useRouter();
  const { cognitoGoogleLogin } = useCognitoGoogleAuth();

  const handleGoogleLogin = () => {
    cognitoGoogleLogin();
  };
  const { loginMutation  } = useUserAuthApi();
  const form = useForm({
    initialValues: {
      password: '',
      email: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : '🎯 Almost there! Please enter a valid email address'),
      password: (value) =>
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(
          value,
        )
          ? null
          : 'Minimum 8 characters, at least 1 letter, 1 number and 1 special character',
    },
    
  });

  return (
    <section
      className={cn(
        'w-max items-center justify-center',
        origin === 'modal' ? 'w-full' : 'w-[22rem] md:w-[36rem]',
      )}
    >
      <h2 className='m-5 text-center text-2xl font-bold'>Login</h2>

      <form
        className='mx-auto flex flex-col items-center justify-center space-y-5 pb-5'
        onSubmit={form.onSubmit((values) => {
          loginMutation.mutate({
            ...values,
            isBack:true
          });
        })}
      >
        <div className='flex w-full flex-col'>
          <CustomInput
            placeholder='Email'
            className='h-12 max-w-xl placeholder:text-base'
            containerClass='max-w-xl'
            {...form.getInputProps('email')}
          />

          <PasswordInput2
            placeholder='Password'
            className='h-12 max-w-xl placeholder:text-base focus-visible:border focus-visible:border-black  focus-visible:ring-0'
            {...form.getInputProps('password')}
          />
        </div>

        <div className='flex w-full flex-col gap-3'>
          <Button
            // disabled={loginMutation.isPending || !form.isValid}
            size='lg'
            className='h-12 w-full max-w-xl text-lg font-bold'
            type='submit'
          >
            {loginMutation.isPending ? <ButtonLoader /> : null}
            Continue
          </Button>
          <AuthButton
            className='justify-center gap-x-4'
            imageSrc='/assets/images/google.svg'
            imageAlt='Google Logo'
            text='Continue with Google'
            onClick={handleGoogleLogin}
          />
          
        </div>
        <section className='flex w-full flex-col items-center gap-1 sm:flex-row sm:items-center sm:justify-between'>
          <div className='order-2 sm:order-1'>
            <p className='text-sm'>
              <span
                onClick={() => {
                  router.push('/password-reset');
                }}
                className='cursor-pointer font-medium text-primary-main'
              >
                Forgot Password
              </span>
            </p>
          </div>
          <div className='order-1 sm:order-2'>
            <p className='text-center text-sm font-medium sm:text-left'>
              Dont have an account?{' '}
              <Link
                className='cursor-pointer font-medium text-primary-main'
                href='/register'
              >
                Register
              </Link>
            </p>
          </div>
        </section>
      </form>
    </section>
  );
};
