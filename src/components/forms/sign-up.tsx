'use client';

import Image from 'next/image';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useQueryState } from 'nuqs';
import { ReactNode, useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import CustomInput from '@/components/customs/input';
import { Icons } from '@/components/icons';
import { ButtonLoader } from '@/components/loader';
import { UserTypeSelection } from '@/components/modals/user-type-selection';
import { Button } from '@/components/ui/button';
import { useRegister, useRegisterActions } from '@/hooks/api/auth/useRegister';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import { cn } from '@/lib/utils';
import { useModalContext } from '@/providers/modal-provider';
import { AuthButton } from '../AuthButton';
import { useGoogleAuthMutation } from '@/hooks/api/useGoogleAuthMutation';
import { useRouter } from 'next/navigation';
import { error } from '../alert/notify';
import useCognitoGoogleAuth from '@/hooks/api/auth/useCognitoGoogleAuth';

interface IFormInput {
  email: string;
}

const schema = z.object({
  email: z.string().email(),
});

type Prop = {
  onSetView?: (view: string | null) => void;
  origin?: 'page' | 'modal';
};

export function EmailForm({ origin = 'page', onSetView }: Readonly<Prop>) {
  const router = useRouter();

  const {
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<IFormInput>({
    defaultValues: { email: '' },
    resolver: zodResolver(schema),
  });

  const { selectEmail } = useRegisterActions();
  const payload = useRegister();
  const { sendCodeMutation  } = useUserAuthApi();
  const { openModal, closeModal } = useModalContext();

  const clearView = () => {
    onSetView?.(null);
  };
  
  const { cognitoGoogleLogin } = useCognitoGoogleAuth();

  const handleGoogleLogin = () => {
    cognitoGoogleLogin();
  };

  const onSubmit = (values: { email: string }) => {
    selectEmail(values.email);
    sendCodeMutation.mutate(
      { ...payload, email: values.email },
      {
        onSuccess: (data) => {
          if (data?.status === 200) {
            router.push('/verify-email');
          }
        },
        onError: (err: any) => {
          if (err?.response?.status === 409) {
            router.push('/verify-email');
          } else {
            error({ message: err?.response?.data?.message });
          }
        },
      },
    );
  };

  return (
    <>
      <div
        className={cn(
          'flex items-center',
          origin === 'modal' ? 'justify-between' : 'justify-start',
        )}
      >
        <Button
          onClick={() => onSetView?.('account-selection')}
          variant='secondary'
          size='icon'
          className='cursor-pointer bg-transparent p-0 hover:bg-transparent'
        >
          <Image
            width={20}
            height={20}
            src={`/assets/images/arrow-back.svg`}
            objectFit='contain'
            alt='Agent'
          />
        </Button>
        {origin === 'modal' ? (
          <Button
            onClick={() => closeModal()}
            variant='secondary'
            size='icon'
            className='cursor-pointer bg-transparent hover:bg-transparent'
          >
            <Icons.Close className='h-5 w-5' />
          </Button>
        ) : null}
      </div>
      <h1 className='m-4 text-center text-2xl font-bold'>Register</h1>

      <form
        className='mx-auto my-4 flex w-full flex-col items-center justify-center gap-5'
        onSubmit={handleSubmit(onSubmit)}
      >
        <CustomInput
          placeholder='Enter email address'
          onChange={(e) => {
            setValue('email', e.currentTarget.value);
          }}
          className='h-12 max-w-xl placeholder:text-base'
          containerClass='max-w-xl'
          type='email'
          error={errors.email?.message}
        />
        <div className='flex w-full flex-col gap-2'>
          <Button
            disabled={sendCodeMutation.isPending}
            size='lg'
            className='w-full text-lg font-bold'
            type='submit'
          >
            {sendCodeMutation.isPending ? <ButtonLoader /> : null}
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
        <section className='mt-3 flex w-full items-center justify-center'>
          <p className='text-sm'>
            Already have an account?{' '}
            {origin === 'modal' ? (
              <Button
                variant='ghost'
                className='cursor-pointer text-primary-main'
                onClick={() => {
                  clearView();
                  openModal('login');
                }}
              >
                Login
              </Button>
            ) : (
              <Link className='text-primary-main' href='/login'>
                Login
              </Link>
            )}
          </p>
        </section>
      </form>
    </>
  );
}

function SignupFlow({ origin = 'page' }: { origin?: 'page' | 'modal' }) {
  const [view, setView] = useQueryState('step', {
    defaultValue: 'account-selection',
  });

  const handleSetView = useCallback(
    (view: string | null) => {
      setView(view);
    },
    [setView],
  );

  useEffect(() => {
    return () => handleSetView(null);
  }, [handleSetView]);

  const routes: { [key: string]: ReactNode } = useMemo(
    () => ({
      'account-selection': (
        <UserTypeSelection origin={origin} onSetView={handleSetView} />
      ),
      'send-code': <EmailForm origin={origin} onSetView={handleSetView} />,
    }),
    [origin, handleSetView],
  );

  return (
    <div
      className={cn(
        '',
        origin === 'page' ? 'w-[22rem] md:w-[36rem]' : 'w-full',
      )}
    >
      {routes[view ?? 'account-selection']}
    </div>
  );
}

export default SignupFlow;
