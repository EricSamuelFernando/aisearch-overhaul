'use client';

import CustomInput from '@/components/customs/input';
import { Button } from '@/components/ui/button';
import { cn, maskEmail } from '@/lib/utils';
import { useForm } from '@mantine/form';
import { useRegister } from '@/hooks/api/auth/useRegister';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import { Navigate } from '@/lib/Navigate';
import { useAppSelector } from '@/lib/hook';
import { savedUserType } from '@/slices/onboarding/onboarding-selectors';
import Image from 'next/image';

const EmailVerification = () => {
  const form = useForm({
    initialValues: {
      code: '',
    },
    validate: {
      code: (value) => (value.length < 1 ? 'Please enter a code' : null),
    },
  });
  const { resendVerificationCodeMutation, verifyCodeMutation } =
    useUserAuthApi();

  const userType = useAppSelector(savedUserType);

  // const link =
  //   userType === 'buyer' ? '/property-preference' : '/complete-onboarding';

  // const { isSuccess } = verifyCodeMutation;
  const data = useRegister();

  // if (isSuccess) return <Navigate to={link} />;

  return (
    <section className='place-contents-center grid h-full'>
      <div className='h-max'>
        <h1 className='w-full text-2xl font-medium md:w-4/6 md:text-4xl'>
          Verify your email address.
        </h1>
        <p className='mb-[2.5rem] mt-3 text-base md:w-4/6'>
          {`We sent an email to ${maskEmail(data?.email)}. Please Check your inbox and get
            the actual code to verify. Please resend email if you are yet to get
            one.`}
        </p>
        <form
          onSubmit={form.onSubmit((values) => {
            verifyCodeMutation.mutate({
              code: values?.code,
              email: data?.email,
            });
          })}
          className='jusitfy-center flex flex-col items-center md:w-5/6'
        >
          <CustomInput
            {...form.getInputProps('code')}
            placeholder='Your verification code'
            className='h-14 border-[#aaa] placeholder:text-grey-300'
          />
          <Button
            type='submit'
            disabled={!form.values.code || verifyCodeMutation.isPending}
            className={cn(
              'font-satoshi h-12 w-full',
              !form.values.code
                ? 'cursor-not-allowed'
                : 'pointer-events-auto cursor-pointer',
            )}
          >
            Verify
          </Button>

          <h4
            onClick={() =>
              resendVerificationCodeMutation.mutate({ email: data?.email })
            }
            className='mt-8 cursor-pointer text-sm font-medium text-ocOrange'
          >
            Resend email
          </h4>
        </form>
      </div>
    </section>
  );
};

export default EmailVerification;
