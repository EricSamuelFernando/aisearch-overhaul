'use client';

import { useForm } from '@mantine/form';
import Link from 'next/link';
import { Fragment, useMemo } from 'react';
import {
  getCountryCode,
  getPhoneNumber,
  getRawPhoneNumber,
} from '@/lib/helpers';
import { getActiveUserRole } from '@/lib/storage';
import { OnboardingPayload } from '@/types/auth.types';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import CustomTextInput from '@/components/text-input';
import { UserPasswordInput } from '@/components/PasswordInput';
import { PhoneNumberInput } from '@/components/PhoneNumberInput';
import { agentEmailAtom } from '@/hooks/atoms';
import { useAtom } from 'jotai';
import {useRouter,useSearchParams} from 'next/navigation';
export function CompleteOnboardingForm() {
  const account_type = getActiveUserRole();
  const form = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
      zipCode: '',
      password: '',
      confirm_password: '',
      phoneNumber: '',
      licenseNumber: '',
      region: '',
    },
    validateInputOnChange: true,
    validateInputOnBlur: true,
    validate: {
      firstName: (value) => (value.length < 1 ? 'First Name is required' : null),
      lastName: (value) => (value.length < 1 ? 'Last Name is required' : null),
      licenseNumber: (value) =>
        account_type === 'agent' && value.length < 1 ? 'License Number is required' : null,
      region: (value) =>
        account_type === 'agent' && value.length < 1 ? 'Region is required' : null,
      password: (value) =>
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(value)
          ? null
          : 'Minimum 8 characters, at least 1 letter, 1 number and 1 special character',
      confirm_password: (value, values) =>
        value !== values.password ? 'Passwords did not match' : null,
      phoneNumber: (value) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length !== 10) return 'Phone number must be exactly 10 digits';
        return null;
      },
    },
  });

  const searchParams = useSearchParams();
    
 const typeParam = searchParams.get("redirectionUrl") || "null";
  const router = useRouter();

  const { onBoardingMutation, loginMutation } = useUserAuthApi();
  const [agentEmail] = useAtom(agentEmailAtom);

  const onBoardingPayload: OnboardingPayload = useMemo(
    () => ({
      mobile: {
        number_body: getPhoneNumber(form.values.phoneNumber),
        mobile_extension: getCountryCode(form.values.phoneNumber),
        raw_mobile: getRawPhoneNumber(form.values.phoneNumber),
      },
      firstname: form.values.firstName,
      lastname: form.values.lastName,
      account_type: account_type!,
      password: form.values.password,
      licence_number: form.values.licenseNumber || '',
      zipCode: form.values.zipCode || '',
      region: form.values.region,
      avatar: '',
    }),
    [form.values, account_type],
  );

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await onBoardingMutation.mutateAsync(onBoardingPayload, {
        onSuccess: (response: any) => {
          if (response?.data?.data?.completeSignUp?.id) {
            if (typeParam ==='preapproval') {
          router.push(process.env.NEXT_PUBLIC_PREAPPROVAL_URL || "http://localhost:3000");
          return
        }
            // loginMutation.mutateAsync({
            //   email: response?.data?.data?.completeSignUp?.email,
            //   password: values.password,
            //   isHome: true,
            // });
          }
        },
      });
    } catch (error) {
      console.error('Error during onboarding or login:', error);
    }
  };

  return (
    <section>
      <h2 className="mb-4 py-4 text-center text-3xl font-bold">Complete Sign Up</h2>
      <form
        className="mx-auto flex flex-col items-center justify-center md:w-[580px]"
        onSubmit={form.onSubmit(handleSubmit)}
      >
        <div className="grid w-full grid-flow-col grid-cols-1 gap-5 md:grid-cols-2">
          <CustomTextInput
            placeholder="First Name"
            className="w-full"
            {...form.getInputProps('firstName')}
          />
          <CustomTextInput
            placeholder="Last Name"
            className="w-full py-4"
            {...form.getInputProps('lastName')}
          />
        </div>

        {/* {account_type === 'agent' && (
          <Fragment>
            <CustomTextInput
              placeholder="License Number"
              className="w-full py-4"
              {...form.getInputProps('licenseNumber')}
            />
            <CustomTextInput
              placeholder="Region"
              className="w-full py-4"
              {...form.getInputProps('region')}
            />
          </Fragment>
        )} */}

        <div className="flex flex-col w-full">
          <PhoneNumberInput
            className="md:col-span-2"
            {...form.getInputProps('phoneNumber')}
          />
          {form.errors.phoneNumber && (
            <div className="text-red-500 text-sm mt-1">{form.errors.phoneNumber}</div>
          )}
        </div>

        <div className="my-3 grid w-full grid-flow-col grid-cols-1 gap-5 md:grid-cols-2">
          <div className="flex flex-col">
            <UserPasswordInput
              id="password"
              {...form.getInputProps('password')}
              onChange={(event) => {
                form.setFieldValue('password', event.currentTarget.value);
                form.validateField('confirm_password');
              }}
            />
            {form.errors.password && (
              <div className="text-red-500 text-sm mt-1">{form.errors.password}</div>
            )}
          </div>

          <div className="flex flex-col">
            <UserPasswordInput
              placeholder="Confirm Password"
              id="confirm_password"
              {...form.getInputProps('confirm_password')}
            />
            {form.errors.confirm_password && (
              <div className="text-red-500 text-sm mt-1">{form.errors.confirm_password}</div>
            )}
          </div>
        </div>

        <button
          className={`${onBoardingMutation.isPending || loginMutation.isPending
            ? 'bg-black/20'
            : 'bg-black'
            } space-b-8 w-full rounded-md py-3 font-bold text-white`}
          type="submit"
          disabled={onBoardingMutation.isPending || loginMutation.isPending}
        >
          {onBoardingMutation.isPending || loginMutation.isPending
            ? 'Loading...'
            : 'Next'}
        </button>

        <section className="my-4 flex w-full items-center justify-between">
          <div></div>
          <div>
            <p className="text-sm">
              Already have an account?{' '}
              <Link className="text-primary-main" href="/login">
                Login
              </Link>
            </p>
          </div>
        </section>
      </form>
    </section>
  );
}
