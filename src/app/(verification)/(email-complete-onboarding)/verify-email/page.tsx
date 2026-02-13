'use client';

import CustomInput from '@/components/customs/input';
import { Button } from '@/components/ui/button';
import { cn, maskEmail } from '@/lib/utils';
import { useForm } from '@mantine/form';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRegister } from '@/hooks/api/auth/useRegister';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';

const EmailVerification = () => {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string | null>(null);
  const form = useForm({
    initialValues: { code: '' },
    validate: {
      code: (value) => (value.length < 1 ? 'Please enter a code' : null),
    },
  });

  const { resendVerificationCodeMutation, verifyCodeMutation } = useUserAuthApi();
  const data = useRegister();

  useEffect(() => {
    const queryEmail = searchParams.get('email');
    const stored = localStorage.getItem('pendingVerificationEmail');
    const resolvedEmail = data?.email || queryEmail || stored;
    if (resolvedEmail) {
      setEmail(resolvedEmail);
      localStorage.setItem('pendingVerificationEmail', resolvedEmail);
    }
  }, [data?.email, searchParams]);

  const maskedEmail = useMemo(() => maskEmail(email || ''), [email]);

  return (
    <section className="flex h-full items-center">
      {/* Figma left block width (input ~643px) */}
      <div className="w-full max-w-[660px]">
        {/* Force same wrap as Figma: "Verify your email" / "address." */}
        <h1 className="max-w-[360px] text-2xl font-medium md:text-4xl">
          Verify your email address.
        </h1>

        <p className="mb-10 mt-3 text-base text-grey-800 md:max-w-[430px]">
          {`We’ve sent a one time code to ${maskedEmail || 'your email'}. Please check your inbox and get the actual code to verify. If the email hasn't arrived, use the Resend Code button below`}
        </p>

        <form
          onSubmit={form.onSubmit((values) => {
            verifyCodeMutation.mutate({
              code: values.code,
              email: email || undefined,
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

          <div className="flex w-full items-center justify-center">
            <h4
            onClick={() => {
              if (!email) {
                return;
              }
              resendVerificationCodeMutation.mutate({ email });
            }}
            className="mt-6 inline-flex items-center justify-center rounded-full border border-ocOrange px-4 py-2 text-center text-sm font-medium text-ocOrange transition-colors hover:bg-ocOrange/10"
            style={{ width: '140px' }}
          >
            Resend code
            </h4>
          </div>
        </form>
      </div>
    </section>
  );
};

export default EmailVerification;
