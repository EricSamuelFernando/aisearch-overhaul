'use client';

import CustomInput from '@/components/customs/input';
import { Button } from '@/components/ui/button';
import { cn, maskEmail } from '@/lib/utils';
import { useForm } from '@mantine/form';
import { useRegister } from '@/hooks/api/auth/useRegister';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';

const EmailVerification = () => {
  const form = useForm({
    initialValues: { code: '' },
    validate: {
      code: (value) => (value.length < 1 ? 'Please enter a code' : null),
    },
  });

  const { resendVerificationCodeMutation, verifyCodeMutation } = useUserAuthApi();
  const data = useRegister();

  return (
    <section className="flex h-full items-center">
      {/* Figma left block width (input ~643px) */}
      <div className="w-full max-w-[660px]">
        {/* Force same wrap as Figma: "Verify your email" / "address." */}
        <h1 className="max-w-[360px] text-2xl font-medium md:text-4xl">
          Verify your email address.
        </h1>

        <p className="mb-10 mt-3 text-base text-grey-400 md:max-w-[430px]">
          {`We sent an email to ${maskEmail(
            data?.email,
          )}. Please check your inbox and get the actual code to verify. Please resend the email if you are yet to get one.`}
        </p>

        <form
          onSubmit={form.onSubmit((values) => {
            verifyCodeMutation.mutate({
              code: values.code,
              email: data?.email,
            });
          })}
          className="flex w-full flex-col gap-4"
        >
          <CustomInput
            {...form.getInputProps('code')}
            placeholder="Your verification code"
            className="h-14 w-full border-[#aaa] placeholder:text-grey-300"
          />

          <Button
            type="submit"
            disabled={!form.values.code || verifyCodeMutation.isPending}
            className={cn(
              'font-satoshi h-12 w-full',
              !form.values.code ? 'cursor-not-allowed' : 'cursor-pointer',
            )}
          >
            Verify
          </Button>

          <h4
            onClick={() =>
              resendVerificationCodeMutation.mutate({ email: data?.email })
            }
            className="mt-6 cursor-pointer text-center text-sm font-medium text-ocOrange"
          >
            Resend email
          </h4>
        </form>
      </div>
    </section>
  );
};

export default EmailVerification;
