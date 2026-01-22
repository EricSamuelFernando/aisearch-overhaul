'use client';

import { useForm } from '@mantine/form';
import Link from 'next/link';
import { ButtonLoader } from '@/components/loader';
import { Button } from '@/components/ui/button';
import { useRegister, useRegisterActions } from '@/hooks/api/auth/useRegister';
import { useAuthModal, useAuthModalActions } from '@/shared/hooks/useAuthModal';
import CustomTextInput from '@/components/text-input';
import { AuthHeader } from './auth-header';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import { error } from '@/components/alert/notify';
import { useRouter } from 'next/navigation';

export function SubmitEmail() {
  const router = useRouter();
  const form = useForm({
    initialValues: {
      email: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : '✨ Oops! That email looks a bit off. Double-check and try again!'),
    },
  });

  const { selectEmail } = useRegisterActions();
  const payload = useRegister();
  const modals = useAuthModal();
  const { mode } = modals;

  const { sendCodeMutation } = useUserAuthApi();
  const { setScreen } = useAuthModalActions();

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
    <section className='w-[47.8rem] items-center justify-center py-2 pb-16'>
      <AuthHeader />
      <form
        className='mx-auto flex w-[350px] flex-col items-center justify-center'
        onSubmit={form.onSubmit((values) => {
          selectEmail(values?.email);
          sendCodeMutation.mutate({ ...payload, email: values?.email });
        })}
      >
        <CustomTextInput
          placeholder='Enter email address'
          className='w-full py-4'
          {...form.getInputProps('email')}
          type='email'
        />

        <Button
          disabled={sendCodeMutation.isPending}
          size='lg'
          className='w-full font-bold'
          type='submit'
          roundness='md'
        >
          {sendCodeMutation.isPending ? <ButtonLoader /> : null}
          Continue
        </Button>

        <section className='my-4 flex w-full items-center justify-between'>
          <div></div>
          <div>
            <p className='text-sm'>
              Already have an account?{' '}
              {mode === 'modal' ? (
                <span
                  className='cursor-pointer text-primary-main'
                  onClick={() => setScreen('login')}
                >
                  Login
                </span>
              ) : (
                <Link className='text-primary-main' href='/login'>
                  Login
                </Link>
              )}
            </p>
          </div>
        </section>
      </form>
    </section>
  );
}
