'use client';

import * as React from 'react';
import { useForm } from '@mantine/form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import CustomInput from '@/components/customs/input';
import { Icons } from '@/components/icons';
import { ButtonLoader } from '@/components/loader';
import { PasswordInput2 } from '@/components/password-input-2';
import { Button } from '@/components/ui/button';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import { cn } from '@/lib/utils';
import { useModalContext } from '@/providers/modal-provider';
import { AuthButton } from '@/components/AuthButton';
import useCognitoGoogleAuth from '@/hooks/api/auth/useCognitoGoogleAuth';

export const LoginForm = ({
  handleSuccess,
  origin = 'page',
}: {
  handleSuccess?: () => void;
  showBack?: boolean;
  origin?: 'page' | 'modal';
}) => {
  const router = useRouter();

  const { closeModal, openModal, updateCloseDisabled } = useModalContext();

  const { cognitoGoogleLogin } = useCognitoGoogleAuth();
  
  const handleGoogleLogin = () => {
    cognitoGoogleLogin();
  };

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('code');

    if (token) {
      localStorage.setItem('jwt', token);

      window.location.href = 'http://localhost:3000/home';
    }
  }, []);

  const handleForceClose = React.useCallback(() => {
    closeModal();
    updateCloseDisabled(false);
  }, [closeModal, updateCloseDisabled]);

  const loginSuccessCallback = React.useCallback(() => {
    handleSuccess?.();
    handleForceClose();
  }, [handleForceClose, handleSuccess]);

  const { loginMutation } = useUserAuthApi(loginSuccessCallback);
  const form = useForm({
    initialValues: {
      password: '',
      email: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : '🌟 Hmm, that email needs a little tweak! Make sure it includes @ and a domain'),
      password: (value) =>
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(
          value,
        )
          ? null
          : 'Minimum 8 characters, at least 1 letter, 1 number and 1 special character',
    },
  });

  const handleClose = React.useCallback(() => {
    closeModal();
  }, [closeModal]);

  return (
    <section
      className={cn(
        'w-max items-center justify-center',
        origin === 'modal' ? 'w-full' : 'w-[22rem] md:w-[36rem]',
      )}
    >
      {origin === 'modal' ? (
        <div className='flex items-center justify-end'>
          <Button
            onClick={handleClose}
            variant='secondary'
            size='icon'
            className='cursor-pointer bg-transparent hover:bg-transparent'
          >
            <Icons.Close className='h-5 w-5' />
          </Button>
        </div>
      ) : null}
      <h2 className='m-5 text-center text-2xl font-bold'>Login</h2>

      <form
        className='mx-auto flex flex-col items-center justify-center space-y-5 pb-5'
        onSubmit={form.onSubmit((values) => {
          loginMutation.mutate(values);
        })}
      >
        <div className='flex w-full flex-col'>
          <CustomInput
            placeholder='Email'
            className='h-12 max-w-xl placeholder:text-base'
            containerClass='max-w-xl'
            autoComplete='email'
            {...form.getInputProps('email')}
          />

          <PasswordInput2
            placeholder='Password'
            className='h-12 max-w-xl placeholder:text-base focus-visible:border focus-visible:border-black  focus-visible:ring-0'
            autoComplete='current-password'
            {...form.getInputProps('password')}
          />
        </div>

        <div className='flex w-full flex-col gap-3'>
          <Button
            disabled={loginMutation.isPending || !form.isValid}
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
        <section className='flex w-full items-center justify-between'>
          <div>
            <p className='text-sm'>
              <span
                onClick={() => {
                  router.push('/password-reset');
                  handleForceClose();
                }}
                className='cursor-pointer font-medium text-primary-main'
              >
                Forgot Password
              </span>
            </p>
          </div>
          {/* <div>
            <p className='text-sm font-medium'>
              Dont have an account?{' '}
              {origin == 'modal' ? (
                <span
                  className='cursor-pointer font-medium text-primary-main'
                  onClick={() => {
                    openModal('signup');
                  }}
                >
                  Register
                </span>
              ) : (
                <Link
                  className='cursor-pointer font-medium text-primary-main'
                  href='/register'
                  onClick={handleForceClose}
                >
                  Register
                </Link>
              )}
            </p>
          </div> */}
        </section>
      </form>
    </section>
  );
};
