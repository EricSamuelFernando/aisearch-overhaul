'use client';

import { useForm } from '@mantine/form';
import Link from 'next/link';
import { Fragment, useMemo, useState } from 'react';
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

export function CompleteOnboardingForm() {
  const account_type = getActiveUserRole();
  const [showPasswordRules, setShowPasswordRules] = useState(false);
  const nameAllowedPattern = /^[A-Za-z\s\-']*$/;
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
      firstName: (value) => {
        const trimmed = value.trim();
        if (trimmed.length < 1) return 'First Name is required';
        if (!/^[A-Za-z\s\-']+$/.test(trimmed)) {
          return 'Invalid name format. Only letters are allowed.';
        }
        return null;
      },
      lastName: (value) => {
        const trimmed = value.trim();
        if (trimmed.length < 1) return 'Last Name is required';
        if (!/^[A-Za-z\s\-']+$/.test(trimmed)) {
          return 'Invalid name format. Only letters are allowed.';
        }
        return null;
      },
      licenseNumber: (value) =>
        account_type === 'agent' && value.length < 1 ? 'License Number is required' : null,
      region: (value) =>
        account_type === 'agent' && value.length < 1 ? 'Region is required' : null,
      password: (value) =>
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/.test(value)
          ? null
          : 'Minimum 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character',
      confirm_password: (value, values) =>
        value !== values.password ? 'Passwords did not match' : null,
      phoneNumber: (value) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length !== 10) return 'Phone number must be exactly 10 digits';
        return null;
      },
    },
  });

  const { onBoardingMutation, loginMutation } = useUserAuthApi();
  const [agentEmail] = useAtom(agentEmailAtom);

  const passwordValue = form.values.password || '';
  const passwordChecks = {
    length: passwordValue.length >= 8,
    upper: /[A-Z]/.test(passwordValue),
    lower: /[a-z]/.test(passwordValue),
    number: /\d/.test(passwordValue),
    special: /[@$!%*#?&]/.test(passwordValue),
  };

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
            loginMutation.mutateAsync({
              email: response?.data?.data?.completeSignUp?.email,
              password: values.password,
              isHome: true,
              isFirstLogin: true,
            });
          }
        },
      });
    } catch (error) {
      console.error('Error during onboarding or login:', error);
    }
  };

  return (
    <section className="w-full">
      <h2 className="mb-4 text-left text-3xl font-bold md:h-[76px] md:w-[463px] md:leading-[76px]">
        Complete Sign Up
      </h2>
      <form
        className="mx-auto flex flex-col items-center justify-center md:w-[699px]"
        onSubmit={form.onSubmit(handleSubmit)}
      >
        <div className="grid w-full grid-flow-col grid-cols-1 gap-5 md:grid-cols-2 md:gap-x-[39px]">
          <CustomTextInput
            placeholder="First Name"
            className="w-full !h-[72px] text-[16px] leading-[32px] placeholder:text-[16px] placeholder:leading-[32px] md:w-[330px]"
            error={!!form.errors.firstName}
            errorMessage={form.errors.firstName}
            {...form.getInputProps('firstName')}
            onChange={(event) => {
              const nextValue = event.currentTarget.value;
              if (nextValue === '' || nameAllowedPattern.test(nextValue)) {
                form.setFieldValue('firstName', nextValue);
                form.setFieldError('firstName', null);
              } else {
                form.setFieldError('firstName', 'Invalid name format. Only letters are allowed.');
              }
            }}
          />
          <CustomTextInput
            placeholder="Last Name"
            className="w-full !h-[72px] text-[16px] leading-[32px] placeholder:text-[16px] placeholder:leading-[32px] md:w-[330px]"
            error={!!form.errors.lastName}
            errorMessage={form.errors.lastName}
            {...form.getInputProps('lastName')}
            onChange={(event) => {
              const nextValue = event.currentTarget.value;
              if (nextValue === '' || nameAllowedPattern.test(nextValue)) {
                form.setFieldValue('lastName', nextValue);
                form.setFieldError('lastName', null);
              } else {
                form.setFieldError('lastName', 'Invalid name format. Only letters are allowed.');
              }
            }}
          />
        </div>

        {account_type === 'agent' && (
          <Fragment>
            <CustomTextInput
              placeholder="License Number"
              className="w-full !h-11 md:w-[330px]"
              {...form.getInputProps('licenseNumber')}
            />
            <CustomTextInput
              placeholder="Region"
              className="w-full !h-11 md:w-[330px]"
              {...form.getInputProps('region')}
            />
          </Fragment>
        )}

        <div className="flex w-full flex-col">
          <PhoneNumberInput
            className="md:col-span-2"
            {...form.getInputProps('phoneNumber')}
          />
          {form.errors.phoneNumber && (
            <div className="text-red-500 text-sm mt-1">{form.errors.phoneNumber}</div>
          )}
        </div>

        <div
          className="my-4 grid w-full grid-flow-col grid-cols-1 gap-5 md:grid-cols-2 md:gap-x-[39px]"
          onFocusCapture={() => setShowPasswordRules(true)}
          onBlurCapture={(event) => {
            const nextTarget = event.relatedTarget as Node | null;
            if (!nextTarget || !event.currentTarget.contains(nextTarget)) {
              setShowPasswordRules(false);
            }
          }}
        >
          <div className="flex flex-col md:w-[330px]">
            <UserPasswordInput
              id="password"
              {...form.getInputProps('password')}
              onChange={(event) => {
                form.setFieldValue('password', event.currentTarget.value);
                form.validateField('confirm_password');
              }}
              onInput={(event) => {
                form.setFieldValue('password', event.currentTarget.value);
                form.validateField('confirm_password');
              }}
            />
            {showPasswordRules && (
              <div className="mt-3 space-y-1 text-sm">
                <p className="text-gray-600">Password must contain:</p>
                <div
                  className={`flex items-center gap-2 ${passwordChecks.length
                      ? 'text-green-700'
                      : passwordValue.length > 0
                        ? 'text-red-500'
                        : 'text-gray-500'
                    }`}
                >
                  <span>{passwordChecks.length ? '✓' : '○'}</span>
                  <span>At least 8 characters</span>
                </div>
                <div
                  className={`flex items-center gap-2 ${passwordChecks.upper
                      ? 'text-green-700'
                      : passwordValue.length > 0
                        ? 'text-red-500'
                        : 'text-gray-500'
                    }`}
                >
                  <span>{passwordChecks.upper ? '✓' : '○'}</span>
                  <span>1 uppercase letter (A-Z)</span>
                </div>
                <div
                  className={`flex items-center gap-2 ${passwordChecks.lower
                      ? 'text-green-700'
                      : passwordValue.length > 0
                        ? 'text-red-500'
                        : 'text-gray-500'
                    }`}
                >
                  <span>{passwordChecks.lower ? '✓' : '○'}</span>
                  <span>1 lowercase letter (a-z)</span>
                </div>
                <div
                  className={`flex items-center gap-2 ${passwordChecks.number
                      ? 'text-green-700'
                      : passwordValue.length > 0
                        ? 'text-red-500'
                        : 'text-gray-500'
                    }`}
                >
                  <span>{passwordChecks.number ? '✓' : '○'}</span>
                  <span>1 number (0-9)</span>
                </div>
                <div
                  className={`flex items-center gap-2 ${passwordChecks.special
                      ? 'text-green-700'
                      : passwordValue.length > 0
                        ? 'text-red-500'
                        : 'text-gray-500'
                    }`}
                >
                  <span>{passwordChecks.special ? '✓' : '○'}</span>
                  <span>1 special character (e.g., !@#$)</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col md:w-[330px]">
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
