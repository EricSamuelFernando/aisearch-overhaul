'use client';

import { error, info, success } from '@/components/alert/notify';
import { getActiveUserRole, getAuthToken, storeCookie } from '@/lib/storage';

import { AUTH_TOKEN, REFRESH_TOKEN, USER_ROLE } from '@/shared/constants/env';
import { useAuthActions } from '@/shared/hooks/useAuth';
import {
  AGENT_LOGIN,
  AGENT_ONBOARDING,
  AGENT_PROFILE_UPDATE,
  AGENT_SEND_VERIFICATION,
  AGENT_UPDATE_PASSWORD,
  AGENT_VERIFY_CODE,
  GOOGLE_LOGIN_ENDPOINT,
  USER_LOGIN,
  USER_ONBOARDING,
  USER_PASSWORD_RESET_CODE,
  USER_RESEND_CODE,
  USER_SEND_VERIFICATION,
  USER_UPDATE_PASSWORD,
  USER_UPDATE_PROFILE,
  USER_VERIFY_CODE,
} from '@/utils/apis';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';

import { useRegisterActions } from '@/hooks/api/auth/useRegister';
import {
  SendVerificationCode,
  SignInFormValues,
  UpdatePassword,
  VerifyCode,
  VerifyEmail,
} from '@/intferfaces/form';
import { handleAsync } from '@/lib/api/handleApiResponse';
import { resetAuthExpired } from '@/lib/api/axios';
import client from '@/lib/client';
import { useAuth } from '@/shared/hooks/useAuth';
import { useAuthModalActions } from '@/shared/hooks/useAuthModal';
import { OnboardingPayload } from '@/types/auth.types';
import {
  IAuthUser,
  IPasswordReset,
  IUploadUserPayload,
} from '@/types/user.types';
import { AxiosResponse } from '@/types/axios.types';
import { useAppDispatch, useAppSelector } from '@/lib/hook';
import { savedSearchQuery, savedUserType } from '@/slices/onboarding/onboarding-selectors';
import { resetOnboardingSlice, updateSavedSearchQuery } from '@/slices/onboarding/onboarding-slice';
import axios from 'axios';
import { update } from 'lodash';
import { useCallback, useState } from 'react';
import useCognitoGoogleAuth from './useCognitoGoogleAuth';

interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export const useUserAuthApi = (handleCb?: () => void) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { close } = useAuthModalActions();
  const { user } = useAuth();
  const { cognitoLogout } = useCognitoGoogleAuth();
  const currentUser = user?.account_type;
  const searchTerm = useAppSelector(savedSearchQuery);
  const dispatch = useAppDispatch();
  const { logout } = useAuthActions();
  const { setAuthToken } = useRegisterActions();
  const {
    login,
    manageConversationUnread,
    manageMessageUnread
  } = useAuthActions();

  const GRAPHQL_URI = process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || "http://localhost:4000/graphql"

  const MORTGAGE_FILE_UPLOAD = process.env.NEXT_PUBLIC_MORTGAGE_SERIVCE_URL || "http://localhost:4001"

  const loginMutation = useMutation({
    mutationKey: ['user-login-mutation'],
    mutationFn: async (loginData: SignInFormValues) => {
      const response = await axios.post(GRAPHQL_URI, {
        query: `
          query {
            userLogin(authLoginDto: {
              email: "${loginData.email}",
              password: "${loginData.password}"
            }) {
              id,
              firstName,
              lastName,
              email,
              profile,
              accountType,
              access_token,
              refresh_token,
              status,
              messageUnreadCount,
              conversationUnreadCount
            }
          }
        `,
      });
      return {
        ...response.data,
        isBack: loginData.isBack,
        isHome: loginData.isHome,
        isFirstLogin: loginData.isFirstLogin,
      };
    },

    onSuccess: (data, variables) => {
      if (!data?.data) {
        const apiMessage = data?.errors?.[0]?.message || '';
        // Friendly handling for empty password submissions
        if (!variables?.password) {
          error({
            message: 'Please Enter Your Password',
            subtitle: 'Password is required to sign in.',
          });
          return;
        }
        const normalized = apiMessage.toLowerCase();
        if (normalized.includes('too many') || normalized.includes('rate limit') || normalized.includes('rate-limit') || normalized.includes('try again later') || normalized.includes('attempt')) {
          error({
            message: 'Too Many Attempts',
            subtitle: 'Your keystrokes are faster than our limit. Try again in a bit.',
          });
          return;
        }
        if (normalized.includes('password')) {
          error({
            message: 'Wrong Password',
            subtitle:
              'That password does not match this account. Try again or reset your password.',
          });
          return;
        }
        error({ message: apiMessage });
        return;
      }
      const {
        id,
        firstName,
        lastName,
        status,
        email,
        accountType,
        access_token,
        messageUnreadCount,
        conversationUnreadCount, profile
      } = data?.data?.userLogin
      const user: any = {
        id,
        status,
        firstname: firstName,
        lastname: lastName,
        email,
        account_type: accountType,
        access_token,
        profile
      }

      // Save user details and access token in localStorage
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userAccessToken', access_token); // Store access token in localStorage
      if (data?.data?.userLogin?.refresh_token) {
        localStorage.setItem('userRefreshToken', data.data.userLogin.refresh_token);
        storeCookie({ key: REFRESH_TOKEN, value: data.data.userLogin.refresh_token });
      }
      localStorage.setItem('userDetails', JSON.stringify(user)); // Optionally store entire user details

      if (conversationUnreadCount) {
        manageConversationUnread(conversationUnreadCount)
      }
      if (messageUnreadCount) {
        manageConversationUnread(messageUnreadCount)
      }
      success({ message: "You have logged in successfully" });
      // Reset the auth expired flag so API calls work again after re-login
      resetAuthExpired();
      setAuthToken(access_token);
      login(user);
      setAuthToken(access_token);
      storeCookie({
        key: AUTH_TOKEN,
        value: access_token,
      });
      storeCookie({ key: USER_ROLE, value: accountType });
      dispatch(updateSavedSearchQuery({ query: '' }));
      const redirect = searchParams.get('redirect');
      if (redirect) {
        router.push(redirect)
        return;
      }
      if (data?.isBack) {
        router.back()
      }
      if (user.account_type === "seller") {
        router.push('/sell')
      }
      if (data?.isHome) {
        if (user.account_type === "seller") {
          router.push('/sell')
        } else
          router.push(`/home`)
      }
      // if (searchTerm) {
      //   router.push(`/buy/browse?q=${encodeURIComponent(searchTerm)}`);
      // } else {
      //   router.push(`/home`);
      // }
      handleCb?.();

    },
    onError: (err: any, variables) => {
      console.log(err, 'line');
      // Friendly handling for missing password
      if (!variables?.password) {
        error({
          message: 'Please Enter Your Password',
          subtitle: 'Password is required to sign in.',
        });
        return;
      }
      const apiMessage = err?.response?.data?.message || err?.message || '';
      const normalized = apiMessage.toLowerCase();
      if (normalized.includes('too many') || normalized.includes('rate limit') || normalized.includes('rate-limit') || normalized.includes('try again later') || normalized.includes('attempt')) {
        error({
          message: 'Too Many Attempts',
          subtitle: 'Your keystrokes are faster than our limit. Try again in a bit.',
        });
        return;
      }
      if (normalized.includes('password')) {
        error({
          message: 'Wrong Password',
          subtitle:
            'That password does not match this account. Try again or reset your password.',
        });
        return;
      }
      error({ message: apiMessage });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationKey: ['forgot-password'],
    mutationFn: async (email: string) => {
      const response = await axios.post(GRAPHQL_URI, {
        query: `
            mutation ForgotPassword($email: String!) {
              forgotPassword(email: $email)
            }
          `,
        variables: { email },
      });

      if (response.data?.errors) {
        throw new Error(response.data.errors[0]?.message || 'Failed to send password reset code');
      }

      return { message: response.data?.data?.forgotPassword, email };
    },
    onSuccess: (data) => {
      success({
        message: 'Reset password email sent',
        subtitle: 'Reset email sent. Go catch it before it buries itself.',
      });
      // Store email in localStorage for the next step
      if (data?.email) {
        localStorage.setItem('forgotPasswordEmail', data.email);
      }
      router.push(`/password-reset?step=verify-code`);
    },
    onError: (err: any) => {
      error({ message: err?.response?.data?.errors?.[0]?.message || err?.message || 'Something went wrong' });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationKey: ['reset-password'],
    mutationFn: async ({ token, newPassword }: ResetPasswordInput) => {
      const response = await axios.post(GRAPHQL_URI, {
        query: `
              mutation ResetPassword($token: String!, $newPassword: String!) {
                resetPassword(token: $token, newPassword: $newPassword)
              }
            `,
        variables: { token, newPassword },
      });

      return response.data?.data?.resetPassword;
    },
    onSuccess: () => {
      success({ message: 'Password has been reset successfully.' });
    },
    onError: (err: any) => {
      error({ message: err?.response?.data?.errors?.[0]?.message || 'Reset failed' });
    },
  });

  const confirmForgotPasswordMutation = useMutation({
    mutationKey: ['confirm-forgot-password'],
    mutationFn: async ({ email, code, newPassword }: { email: string; code: string; newPassword: string }) => {
      const response = await axios.post(GRAPHQL_URI, {
        query: `
              mutation ConfirmForgotPassword($email: String!, $code: String!, $newPassword: String!) {
                confirmForgotPassword(email: $email, code: $code, newPassword: $newPassword)
              }
            `,
        variables: { email, code, newPassword },
      });

      if (response.data?.errors) {
        throw new Error(response.data.errors[0]?.message || 'Failed to reset password');
      }

      return response.data?.data?.confirmForgotPassword;
    },
    onSuccess: () => {
      success({ message: 'Password has been reset successfully.' });
      router.push('/home');
    },
    onError: (err: any) => {
      const apiMessage = err?.response?.data?.errors?.[0]?.message || err?.message || '';
      const normalized = apiMessage.toLowerCase();
      if (
        normalized.includes('code') &&
        (normalized.includes('invalid') ||
          normalized.includes('mismatch') ||
          normalized.includes('verification') ||
          normalized.includes('otp'))
      ) {
        error({
          message: 'Invalid code',
          subtitle: 'Enter the latest code and try again.',
        });
        return;
      }
      error({ message: apiMessage || 'Failed to reset password' });
    },
  });

  const onBoardingMutation = useMutation({
    mutationKey: ['onboarding-mutation'],
    mutationFn: async (data: OnboardingPayload) => {
      console.log(data)
      const token =
        getAuthToken() ||
        (typeof window !== 'undefined'
          ? localStorage.getItem('userAccessToken')
          : undefined);
      //console.log(Role)
      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `mutation {
            completeSignUp(completeSignUpInput: {
                  firstName: "${data.firstname}",
                  lastName:"${data.lastname}",
                  phone: "${data.mobile.raw_mobile}",
                  password: "${data.password}",
                  zipCode: "${data?.zipCode}",
                  licenseNumber:"${data?.licence_number}"
            }) {
              firstName
              id
              email
            }
          }`
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (response.data?.errors?.length) {
        throw new Error(response.data.errors[0]?.message || 'Failed to complete signup');
      }
      return response;
    },
    onSuccess: (data) => {
      if ((data as any)?.data?.data?.completeSignUp?.id) {
        success({
          message: 'Registration completed successfully',
          subtitle: 'You’re all set! Let’s get started',
        });
      }
    },
    onError: (err: any) => {
      error({ message: err?.message || err?.response?.data?.errors?.[0]?.message || 'An error occurred' });
    },
  });

  const agentLoginMutation = useMutation({
    mutationKey: ['agent-login-mutation'],
    mutationFn: async (loginData: SignInFormValues) => {
      return await handleAsync<AxiosResponse<IAuthUser>>(
        client.post,
        AGENT_LOGIN,
        {
          email: loginData.email,
          password: loginData.password,
        },
      );
    },
    onSuccess: (data: AxiosResponse<IAuthUser>) => {
      if (data.status === 200) {
        const { user, token } = data?.data?.data;
        success({ message: data?.data?.message });
        resetAuthExpired();
        setAuthToken(token);
        login(user);
        storeCookie({ key: AUTH_TOKEN, value: token });
        if (user?.id) {
          close();
          return router.push('/dashboard/agent');
        }
      }
    },
    onError: (err: any) => {
      const apiMessage = err?.response?.data?.message || err?.message || '';
      const normalized = apiMessage.toLowerCase();
      if (
        normalized.includes('code') &&
        (normalized.includes('invalid') ||
          normalized.includes('mismatch') ||
          normalized.includes('verification') ||
          normalized.includes('otp'))
      ) {
        error({
          message: 'Invalid code',
          subtitle: 'Enter the latest code and try again.',
        });
        return;
      }
      error({ message: apiMessage });
    },
  });

  const sendCodeMutation = useMutation({
    mutationKey: ['send-verification-code'],
    mutationFn: async (data: SendVerificationCode) => {
      return await handleAsync<AxiosResponse<any>>(
        client.post,
        data?.account_type === 'agent'
          ? AGENT_SEND_VERIFICATION
          : USER_SEND_VERIFICATION,
        {
          email: data.email,
          account_type: data?.account_type,
        },
      );
    },
  });

  const verifyCodeMutation = useMutation({
    mutationKey: ['verify-verification-code'],
    mutationFn: async (data: VerifyCode) => {
      return await axios.post(GRAPHQL_URI, {
        query: `mutation {
          verifyOtp(verifyOtpInput: {
            otp: "${data?.code}"
            email: "${data?.email}"
          }){
            access_token
            accountType
          }
        }`
      });
    },
    onSuccess: (data: any) => {
      if (data?.data?.errors?.length) {
        const apiMessage = data?.data?.errors?.[0]?.message || '';
        const normalized = apiMessage.toLowerCase();
        if (normalized.includes('too many') || normalized.includes('rate limit') || normalized.includes('rate-limit') || normalized.includes('try again later') || normalized.includes('attempt')) {
          error({
            message: 'Too Many Attempts',
            subtitle: 'Your keystrokes are faster than our limit. Try again in a bit.',
          });
          return;
        }
        if (normalized.includes('expired')) {
          info({
            message: 'Otp Expired',
            subtitle: 'This OTP has expired. Tap Resend to get a new one.',
          });
          return;
        }
        if (normalized.includes('otp') || normalized.includes('verification code') || normalized.includes('invalid')) {
          error({
            message: 'Invalid OTP',
            subtitle:
              'The code you entered is not correct. Try again or request a new code.',
          });
          return;
        }
        error({ message: apiMessage });
        return;
      }
      if (data?.data?.data?.verifyOtp?.access_token) {
        success({
          message: 'Verification completed successfully',
          subtitle: 'Getting started with your journey',
        });
        localStorage.setItem('userAccessToken', data?.data?.data?.verifyOtp?.access_token);
        setAuthToken((data as any)?.data?.data?.verifyOtp?.access_token);
        storeCookie({
          key: AUTH_TOKEN,
          value: (data as any)?.data?.data?.verifyOtp?.access_token,
        });
        if (data?.data?.data?.verifyOtp?.accountType === "buyer") {
          dispatch(resetOnboardingSlice());
          router.push("/property-preference");
        } else {
          router.push("/complete-onboarding");
        }
      }
    },
    onError: (err: any) => {
      const apiMessage = err?.response?.data?.message || '';
      const normalized = apiMessage.toLowerCase();
      if (normalized.includes('too many') || normalized.includes('rate limit') || normalized.includes('rate-limit') || normalized.includes('try again later') || normalized.includes('attempt')) {
        error({
          message: 'Too Many Attempts',
          subtitle: 'Your keystrokes are faster than our limit. Try again in a bit.',
        });
        return;
      }
      if (normalized.includes('expired')) {
        info({
          message: 'Otp Expired',
          subtitle: 'This OTP has expired. Tap Resend to get a new one.',
        });
        return;
      }
      if (normalized.includes('otp') || normalized.includes('verification code') || normalized.includes('invalid')) {
        error({
          message: 'Invalid OTP',
          subtitle:
            'The code you entered is not correct. Try again or request a new code.',
        });
        return;
      }
      error({ message: apiMessage });
    },
  });

  const resendVerificationCodeMutation = useMutation({
    mutationKey: ['resend-verification-mutation'],
    mutationFn: async (data: VerifyEmail) => {
      if (!data?.email) {
        throw new Error('Email is required to resend code');
      }
      return await axios.post(GRAPHQL_URI, {
        query: `mutation { resendOtp(email: "${data.email}") }`,
      });
    },
    onSuccess: (data) => {
      const apiStatus = (data as any)?.status;
      const message = (data as any)?.data?.data?.resendOtp;
      if ((apiStatus === 200 || apiStatus === undefined) && message) {
        success({
          message: 'OTP sent successfully',
          subtitle: `Sent to ${message}`,
        });
      } else {
        error({ message: message || 'Failed to send code. Please try again.' });
      }
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.errors?.[0]?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to send code. Please try again.';
      error({ message: msg });
    },
  });

  const uploadprofile = async (
    file: File,
  ) => {
    try {

      if (!file) {
        throw new Error('File, userId, and propertyId are required.')
      }
      const formData = new FormData()
      formData.append('file', file)
      // Make API call to upload file
      const response = await axios.post(`${MORTGAGE_FILE_UPLOAD}/file-upload/profile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      // success({ message: "File Uploaded successfully" })
      return response.data.data
    } catch (error: any) {
      console.error('Error uploading file:', error.message)
      // Handle HTTP errors gracefully
      if (error.response) {
        console.error('Server responded with status:', error.response.status)
        console.error('Response data:', error.response.data)
      } else if (error.request) {
        console.error('No response received:', error.request)
      } else {
        console.error('Request setup error:', error.message)
      }
      console.log("Error : ", error);

      // throw new Error('File upload failed. Please try again.')
    }
  }

  const updatePasswordMutation = useMutation({
    mutationKey: ['update-password-mutation'],
    mutationFn: async (data: UpdatePassword) => {
      return await handleAsync<AxiosResponse<IAuthUser>>(
        client.put,
        currentUser === 'agent' ? AGENT_UPDATE_PASSWORD : USER_UPDATE_PASSWORD,
        {
          password: data.password,
        },
      );
    },
    onSuccess: (data: AxiosResponse<any>) => {
      success({ message: data?.data?.message });
    },
    onError: (err: any) => {
      error({ message: err?.response?.data?.message });
    },
  });

  const updateUserMutation = useMutation({
    mutationKey: ['update-user-mutation'],
    mutationFn: async (input: any) => {
      const token = getAuthToken() || localStorage.getItem('userAccessToken') || '';
      const fallbackEmail =
        typeof window !== 'undefined'
          ? localStorage.getItem('userEmail') ||
          (() => {
            try {
              const stored = localStorage.getItem('userDetails');
              return stored ? JSON.parse(stored)?.email : null;
            } catch {
              return null;
            }
          })()
          : null;
      const finalInput = !input?.email && fallbackEmail
        ? { ...input, email: fallbackEmail }
        : input;
      const response = await axios.post(GRAPHQL_URI, {
        query: `
          mutation UpdateUser($input: UpdateUserInput!) {
            updateUser(input: $input) {
              id
              firstName
              lastName
              email
            }
          }
        `,
        variables: { input: finalInput },
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.errors) {
        error({ message: response.data.errors[0].message })
        throw new Error(response.data.errors[0].message);
      }

      return response.data.data.updateUser;
    }
  }

  );


  const updateUserProfileMutation = useMutation({
    mutationKey: ['update-password-mutation'],
    mutationFn: async (data: Partial<IUploadUserPayload>) => {
      return await handleAsync<AxiosResponse<IAuthUser>>(
        client.put,
        currentUser === 'agent' ? AGENT_PROFILE_UPDATE : USER_UPDATE_PROFILE,
        {
          ...data,
        },
      );
    },
    onSuccess: (data: AxiosResponse<any>) => {
      success({ message: data?.data?.message });
      router.refresh()
    },
    onError: (err: any) => {
      error({ message: err?.response?.data?.message });
      router.refresh()
    },
  });

  const sendPasswordResetCodeMutation = useMutation({
    mutationKey: ['send-forgot-password-mutation'],
    mutationFn: async (data: VerifyEmail) => {
      return await handleAsync<AxiosResponse<IPasswordReset>>(
        client.put,
        USER_PASSWORD_RESET_CODE,
        {
          email: data.email,
        },
      );
    },
    onSuccess: (data: AxiosResponse<any>) => {
      if (data.status === 200) {
        success({ message: data?.data?.message });
        router.push(`/password-reset?step=verify-code`);
      }
    },
    onError: (err: any) => {
      error({ message: err?.response?.data?.message });
    },
  });

  const verifyPasswordResetCodeMutation = useMutation({
    mutationKey: ['send-verification-code'],
    mutationFn: async (data: VerifyCode) => {
      return await handleAsync<AxiosResponse<IAuthUser>>(
        client.post,
        USER_VERIFY_CODE,
        {
          code: data?.code,
        },
      );
    },

    onSuccess: (data: AxiosResponse<any>) => {
      if ((data as any).status === 200) {
        success({ message: data?.data?.message });
        setAuthToken(data?.data?.data?.token);
        storeCookie({ key: AUTH_TOKEN, value: data?.data?.data?.token });
        storeCookie({ key: USER_ROLE, value: 'seller' });
        router.push(`/set-password`);
      }
    },
    onError: (err: any) => {
      error({ message: err?.response?.data?.message });
    },
  });

  const googleLoginMutation = useMutation({
    mutationKey: ['google-login-mutation'],
    mutationFn: async (googleData: { token: string }) => {
      const urlWithToken = `${GOOGLE_LOGIN_ENDPOINT}?token=${googleData.token}`;
      console.log('Google Login Endpoint URL:', urlWithToken);
      try {
        const response = await handleAsync<AxiosResponse<IAuthUser>>(
          client.get,
          urlWithToken,
        );

        console.log('Google Login Response:', response);

        return response;
      } catch (error) {
        console.error('Google Login Error:', error);
        throw error;
      }
    },
    onSuccess: (data: AxiosResponse<IAuthUser>) => {
      if (data.status === 200) {
        const { user, token } = data?.data?.data;
        console.log('Login Success:', data?.data);

        success({ message: data?.data?.message });
        resetAuthExpired();
        setAuthToken(token);
        login(user);
        storeCookie({ key: AUTH_TOKEN, value: token });
        storeCookie({ key: USER_ROLE, value: user?.account_type });
        router.push(`/dashboard`);
      }
    },
    onError: (err: any) => {
      console.error('Login Error:', err);
      error({ message: err?.response?.data?.message });
    },
  });

  const getAllAgentsQuery = useMutation({
    mutationKey: ['user-agents'],
    mutationFn: async (data: any) => {
      const token = getAuthToken()
      return await axios.post(
        GRAPHQL_URI,
        {
          query: `query {
            get_all_agents {
              id
              accountType
              is_accepted
              user {
                id
                firstName
                lastName
                email
              }
            }
          }`,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Send the JWT token in the Authorization header
          },
        }
      );
    },
    onSuccess: (data) => {
      return data?.data;
    },
    onError: (err) => {
      error({ message: 'An error occurred' });
    },
  });

  const searchAgentMutation = useMutation({
    mutationKey: ['get-agents'],
    mutationFn: async (search: string) => {
      const token = getAuthToken()

      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            mutation get_agents($search: String!) {
              get_agents(search: $search) {
                email,
                id
              }
            }
          `,
          variables: {
            search,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    },
    onSuccess: (data) => {
      console.log("Data received: ", data);
      if (data?.status === 200) {
        success({ message: 'Data has been successfully fetched' });
        return data;
      }
    },
    onError: (err: any) => {
      console.log('Error: ', err);
      error({ message: err?.response?.data?.message || 'An error occurred' });
    },
  });

  const sendInviteMutation = useMutation({
    mutationKey: ['invite-agent'],
    mutationFn: async (agentId: string) => {
      const token = getAuthToken()

      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            mutation inivte_agents($agentId: String!) {
              inivte_agents(agentId: $agentId) {
                message,
                success,
                agentId
              }
            }
          `,
          variables: {
            agentId,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    },
    onSuccess: (data) => {
      return data?.data
    },
    onError: (err: any) => {
      console.log('Error: ', err);
    },
  });

  const getAgentsMutation = useMutation({
    mutationKey: ['search-agent'],
    mutationFn: async (search: string) => {
      const token = getAuthToken()

      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            mutation searchAgents($search: String!) {
              searchAgents(search: $search) {
                id
                firstName
                phone
                lastName
                email
                profile
                zipCode
              }
            }
          `,
          variables: {
            search,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    },
    onSuccess: (data) => {
      return data?.data
    },
    onError: (err: any) => {
      console.log('Error: ', err);
    },
  });

  const getAllAgents = useMutation({
    mutationKey: ['get_all_agents'],
    mutationFn: async (data: any) => {
      const token = getAuthToken();

      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
        query GetAllUserAgent {
        getAllUserAgent {
             id
                firstName,
                phone,
                lastName,
                email,
                zipCode
  }
}
         
      `,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
      return response.data.data.getAllUserAgent;
    },
    onSuccess: (data) => {
      console.log("Get All Agents:", data);
    },
    onError: (err: any) => {
      console.error("Error getting agents: ", err);
    },
  })

  const agentIvitationMutation = useMutation({
    mutationKey: ["invite_an_agent"],
    mutationFn: async (agentData: any) => {
      const token = getAuthToken();

      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            mutation CreateParticipant($input: CreatePropertyEngagementParticipantInput!) {
              createParticipant(input: $input) {
                id
                agentId
                engagementId
                agentType
                userId
                is_accepted
                createdAt
              }
            }
          `,
          variables: { input: agentData }, // Ensure agentData follows the correct input structure
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data
    },
    onSuccess: (data) => {
      console.log("Agent invited:", data);
    },
    onError: (err: any) => {
      console.error("Error inviting agent: ", err);
    },
  });

  const externalAgentIvitationMutation = useMutation({
    mutationKey: ["invite_an_agent"],
    mutationFn: async (agentData: any) => {
      const token = getAuthToken();
      const requestConfig = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const enhancedQuery = `
        mutation createExternalParticipant($input: InviteExternalAgentInput!) {
          createExternalParticipant(input: $input) {
            success
            message
            participantId
            agentId
            code
            field
            correlationId
            emailDeliveryStatus
            emailFailureReason
            emailProviderMessageId
            email_delivery_status
            email_failure_reason
          }
        }
      `;

      const legacyQuery = `
        mutation createExternalParticipant($input: InviteExternalAgentInput!) {
          createExternalParticipant(input: $input) {
            success
            message
            participantId
            agentId
          }
        }
      `;

      const isSchemaCompatibilityError = (errors: any[] | undefined) =>
        Array.isArray(errors) &&
        errors.some((err) => {
          const message = String(err?.message || "").toLowerCase();
          return message.includes("cannot query field") || message.includes("unknown argument");
        });

      try {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: enhancedQuery,
            variables: { input: agentData },
          },
          requestConfig
        );

        if (response.status === 200 && !response?.data?.errors) {
          return response.data?.data?.createExternalParticipant;
        }

        if (isSchemaCompatibilityError(response?.data?.errors)) {
          const fallbackResponse = await axios.post(
            GRAPHQL_URI,
            {
              query: legacyQuery,
              variables: { input: agentData },
            },
            requestConfig
          );

          if (fallbackResponse.status !== 200 || fallbackResponse?.data?.errors) {
            const fallbackGraphQLError =
              fallbackResponse?.data?.errors?.[0]?.message;
            throw new Error(fallbackGraphQLError || "Failed to send invitation");
          }

          return fallbackResponse.data?.data?.createExternalParticipant;
        }

        const graphQLError = response?.data?.errors?.[0]?.message;
        throw new Error(graphQLError || "Failed to send invitation");
      } catch (err: any) {
        if (isSchemaCompatibilityError(err?.response?.data?.errors)) {
          try {
            const fallbackResponse = await axios.post(
              GRAPHQL_URI,
              {
                query: legacyQuery,
                variables: { input: agentData },
              },
              requestConfig
            );
            if (fallbackResponse.status !== 200 || fallbackResponse?.data?.errors) {
              const fallbackGraphQLError =
                fallbackResponse?.data?.errors?.[0]?.message;
              throw new Error(fallbackGraphQLError || "Failed to send invitation");
            }
            return fallbackResponse.data?.data?.createExternalParticipant;
          } catch (fallbackErr: any) {
            const fallbackMessage =
              fallbackErr?.response?.data?.errors?.[0]?.message ||
              fallbackErr?.message ||
              "Failed to send invitation";
            throw new Error(fallbackMessage);
          }
        }

        const message =
          err?.response?.data?.errors?.[0]?.message ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to send invitation";
        throw new Error(message);
      }
    },
    onSuccess: (data) => {
      console.log("Agent invited:", data);
    },
    onError: (err: any) => {
      console.error("Error inviting agent: ", err);
    },
  });



  const addPropertyCoBuyer = useMutation({
    mutationKey: ['addCoBuyer'],
    mutationFn: async (coBuyerData: any) => {
      const token = getAuthToken() || localStorage.getItem('userAccessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      try {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
          mutation createCoBuyer($input: CreateCoBuyerInput!) {
            createCoBuyer(input: $input) {
              id
            }
          }`,
            variables: {
              input: coBuyerData
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status !== 200) {
          throw new Error(response?.data?.errors?.[0]?.message || 'Failed to fetch threads');
        }
        return response;
      } catch (error) {
        console.error('Error fetching threads:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Fetched threads:', data);
    },
    onError: (error: any) => {
      console.error('Error fetching threads:', error);
      const errorMessage = error?.response?.data?.errors?.[0]?.message || error.message || 'An error occurred';
      // error({ message: errorMessage });
    },
  });

  const getAllAgentsMutation = useMutation({
    mutationKey: ['Get_all_agents'],
    mutationFn: async ({ limit, offset }: { limit: number; offset: number }) => {
      const token = getAuthToken();

      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
            mutation FindAllAgents($limit: Float!, $offset: Float!) {
              findAllAgents(limit: $limit, offset: $offset) {
                  users{
                    id
                    firstName
                    lastName
                    email
                    phone
                    profile
                    address
                    bio
                  }
              }
            }
          `,
          variables: {
            limit,
            offset,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data?.data?.findAllAgents?.users;
    },
    onSuccess: (data) => {
      console.log('Fetched agents:', data);
    },
    onError: (err: any) => {
      console.error('Error fetching agents:', err);
    },
  });

  const uploadBuyerDocument = useMutation({
    mutationKey: ['upload_documents'],
    mutationFn: async (inputData: any) => {
      try {
        const response = await axios.post(GRAPHQL_URI, {
          query: `
            mutation createBuyerDocument($input: CreateBuyerDocumentInput!) {
              createBuyerDocument(input: $input) {
                id
                name
                propertyId
                listingId
              }
            }
          `,
          variables: {
            input: {
              ...inputData
            }
          },
        });

        if (response.status !== 200 || response.data.errors) {
          throw new Error(
            response?.data?.errors?.[0]?.message || 'Failed to upload seller document'
          );
        }

        return response.data.data.createBuyerDocument;
      } catch (error: any) {
        console.error('Error uploading seller document:', error);
        throw error;
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message || error.message || 'An error occurred';
      console.error('GraphQL Error:', errorMessage);
      // You can optionally show a toast here
    },
  });

  const updateBuyerDocument = useMutation({
    mutationKey: ['update_documents'],
    mutationFn: async ({
      id,
      name,
      fileKey,
      propertyId,
      listingId,
    }: {
      id: string;
      name?: string;
      fileKey?: string;
      propertyId: string;
      listingId: string;
    }) => {
      try {
        const response = await axios.post(GRAPHQL_URI, {
          query: `
            mutation updateBuyerDocument($input: UpdateBuyerDocumentInput!) {
              updateBuyerDocument(input: $input) {
                id
                name
                propertyId
                listingId
                fileKey
              }
            }
          `,
          variables: {
            input: { id, name, fileKey, propertyId, listingId },
          },
        });

        if (response.status !== 200 || response.data.errors) {
          throw new Error(
            response?.data?.errors?.[0]?.message || 'Failed to update seller document'
          );
        }

        return response.data.data.updateBuyerDocument;
      } catch (error: any) {
        console.error('Error updating seller document:', error);
        throw error;
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message || error.message || 'An error occurred';
      console.error('GraphQL Error:', errorMessage);
      // Optional: Add a toast here
    },
  });

  const deleteBuyerDocument = useMutation({
    mutationKey: ['delete_documents'],
    mutationFn: async (id: string) => {
      try {
        const response = await axios.post(GRAPHQL_URI, {
          query: `
            mutation deleteBuyerDocument($id: String!) {
              deleteBuyerDocument(id: $id)
            }
          `,
          variables: {
            id,
          },
        });

        if (response.status !== 200 || response.data.errors) {
          throw new Error(
            response?.data?.errors?.[0]?.message || 'Failed to delete seller document'
          );
        }

        return response.data.data.deleteBuyerDocument;
      } catch (error: any) {
        console.error('Error deleting seller document:', error);
        throw error;
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message || error.message || 'An error occurred';
      console.error('GraphQL Error:', errorMessage);
      // Optional: Add toast/notification here
    },
  });

  const getBuyPropertyDocuments = useMutation({
    mutationKey: ['get_documents'],
    mutationFn: async ({ listingId, propertyId }: { listingId: string; propertyId: string }) => {
      try {
        const response = await axios.post(GRAPHQL_URI, {
          query: `
            query getBuyerDocuments($propertyId: String!, $listingId: String!) {
              getBuyerDocuments(propertyId: $propertyId, listingId: $listingId) {
                id
                name
                type
                url
                user {
                  id
                  email
                  firstName
                  lastName
                  phone
                }
                listingId
                propertyId
              }
            }
          `,
          variables: { propertyId, listingId },
        });

        if (response.status !== 200 || response.data.errors) {
          throw new Error(
            response?.data?.errors?.[0]?.message || 'Failed to fetch seller documents'
          );
        }

        return response.data.data.getBuyerDocuments;
      } catch (error: any) {
        console.error('Error fetching seller documents:', error);
        throw error;
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message || error.message || 'An error occurred';
      console.error('GraphQL Error:', errorMessage);
      // Optional: replace `error` below with your toast/notification function
      // e.g., toast.error(errorMessage)
    },
  });

  const createUserByEmailMutation = useMutation({
    mutationKey: ['create-user'],
    mutationFn: async (data: any) => {
      const token = getAuthToken() || localStorage.getItem('userAccessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
          mutation createUserByEmail($email: String!,$accountType: String!) {
            createUserByEmail(email: $email,accountType: $accountType) {
              id
              email
              lastName
              firstName
            }
          }
        `,
          variables: { ...data },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status !== 200 || response.data.errors) {
        throw new Error(response.data?.errors?.[0]?.message || 'Failed to create user');
      }

      return response.data.data.createUserByEmail;
    },
    onSuccess: (data) => {
      if (handleCb) handleCb();
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.errors?.[0]?.message || error.message;
      error({ message: errorMessage });
    },
  });

  const searchAllAgents = useMutation({
    mutationKey: ["getAllAgents"],
    mutationFn: async ({ limit, offset, search }: { limit: number; offset: number, search: string }) => {

      try {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
              mutation searchAllAgents($limit: Float!, $offset: Float!,$search: String!) {
                searchAllAgents(limit: $limit, offset: $offset,search: $search) {
                  id
                  firstName
                  lastName
                  email
                  profile
                  phone
                  zipCode
                  bio
                  address
                  status
                }
              }
            `,
            variables: {
              limit,
              offset,
              search
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              // Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status !== 200 || response.data.errors) {
          throw new Error(
            response?.data?.errors?.[0]?.message || "Failed to fetch agents"
          );
        }

        return response.data;
      } catch (error) {
        console.error("Error fetching agents:", error);
        throw error;
      }
    },
    onSuccess: (data: any) => {
      if (handleCb) handleCb();
    },
    onError: (error: any) => {
      console.error("Error fetching agents:", error);
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message ||
        error.message ||
        "An error occurred";
      // Optional: show toast notification
    },
  });

  const userLogout = useMutation({
    mutationKey: ['user-logout'],
    mutationFn: async () => {
      const token = getAuthToken() || localStorage.getItem('userAccessToken');

      // If there's no token (session already expired / storage was wiped),
      // skip the backend call — just return null so onSuccess handles local cleanup.
      if (!token) {
        return null;
      }

      try {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
            mutation {
              userLogout {
                id
              }
            }
          `,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status !== 200 || response.data.errors) {
          // Backend rejected (e.g. token expired) — that's OK, we still want local logout.
          console.warn('Backend logout returned errors:', response.data?.errors);
          return null;
        }

        return response.data.data.userLogout;
      } catch (err) {
        // Network error or backend unreachable — still proceed with local logout.
        console.warn('Backend logout call failed, proceeding with local cleanup:', err);
        return null;
      }
    },
    onSuccess: (data) => {
      if (handleCb) handleCb();

      success({
        message: 'Logged out successfully',
        subtitle: "Don't be a stranger",
      });

      // Always perform local logout and redirect, regardless of backend response
      logout();
      router.push('/home');
    },
    onError: (err: any) => {
      // Even on unexpected errors, always perform local cleanup so the user isn't stuck
      console.error('Logout error:', err);
      const errorMessage =
        err?.response?.data?.errors?.[0]?.message || err?.message || 'Logout failed';
      error({ message: errorMessage });

      // Still clear local state and redirect
      logout();
      router.push('/home');
    },
  });


  return {
    loginMutation,
    sendCodeMutation,
    onBoardingMutation,
    updatePasswordMutation,
    resendVerificationCodeMutation,
    sendPasswordResetCodeMutation,
    verifyCodeMutation,
    verifyPasswordResetCodeMutation,
    updateUserProfileMutation,
    agentLoginMutation,
    googleLoginMutation,
    getAllAgentsQuery,
    searchAgentMutation,
    sendInviteMutation,
    getAgentsMutation,
    agentIvitationMutation,
    addPropertyCoBuyer,
    externalAgentIvitationMutation,
    getAllAgents,
    getAllAgentsMutation,
    uploadBuyerDocument,
    updateBuyerDocument,
    deleteBuyerDocument,
    getBuyPropertyDocuments,
    forgotPasswordMutation,
    resetPasswordMutation,
    confirmForgotPasswordMutation,
    updateUserMutation,
    uploadprofile,
    createUserByEmailMutation,
    searchAllAgents,
    userLogout
  };
};


export const useTokenLoginMutation = (handleCb?: () => void) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const GRAPHQL_URI = process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || "http://localhost:4000/graphql"


  const { setAuthToken } = useRegisterActions();
  const {
    login,
    manageConversationUnread,
    manageMessageUnread
  } = useAuthActions();

  return useMutation({
    mutationKey: ['token-login-mutation'],
    mutationFn: async () => {
      const token = searchParams.get('token'); // get token from URL
      if (!token) {
        throw new Error('Token not found in URL');
      }

      const response = await axios.post(GRAPHQL_URI, {
        query: `
          query {
            getUserDetails {
              id,
              firstName,
              lastName,
              email,
              accountType,
              status,
              profile,
              propertyPreference {
                propertyType,
                preferredPropertyAddress,
                spendAmount {
                  min,
                  max
                }
              }
            }
          }
        `,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return {
        ...response.data,
        access_token: token, // pass token forward since it's from URL
      };
    },

    onSuccess: (data) => {
      const {
        id,
        firstName,
        lastName,
        status,
        email,
        accountType,
        profile,
        propertyPreference,
        messageUnreadCount,
        conversationUnreadCount
      } = data?.data?.getUserDetails;

      const user: any = {
        id,
        status,
        firstname: firstName,
        lastname: lastName,
        email,
        profile,
        account_type: accountType,
        access_token: data.access_token,
        propertyPreference: propertyPreference || null
      };

      localStorage.setItem('userEmail', email);
      localStorage.setItem('userAccessToken', data.access_token);
      localStorage.setItem('userDetails', JSON.stringify(user));

      if (conversationUnreadCount) {
        manageConversationUnread(conversationUnreadCount);
      }
      if (messageUnreadCount) {
        manageConversationUnread(messageUnreadCount);
      }

      success({ message: 'You have logged in successfully' });
      // Reset the auth expired flag so API calls work again after re-login
      resetAuthExpired();
      setAuthToken(data.access_token);
      login(user);
      storeCookie({ key: AUTH_TOKEN, value: data.access_token });
      storeCookie({ key: USER_ROLE, value: user?.account_type?.toLowerCase() });

      const redirect = searchParams.get('redirect');
      if (redirect) {
        router.push(redirect);
        return;
      }
      router.push(`/home`);
      handleCb?.();
    },

    onError: (err: any) => {
      console.error(err);
      error({ message: err?.response?.data?.message || err.message });
    },
  });
};

export function useUploadprofile() {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const MORTGAGE_FILE_UPLOAD = process.env.NEXT_PUBLIC_MORTGAGE_SERIVCE_URL || "http://localhost:4001"

  const uploadprofileFile = useCallback(async (file: File) => {
    if (!file) {
      setError('No file provided');
      return null;
    }
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${MORTGAGE_FILE_UPLOAD}/file-upload/profile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setData(response.data.data);
      return response.data.data;
    } catch (err: any) {
      console.error('Error uploading file:', err.message);
      if (err.response) {
        console.error('Server responded with status:', err.response.status);
        console.error('Response data:', err.response.data);
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Request setup error:', err.message);
      }
      setError(err.message || 'Upload failed');
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { isUploading, error, data, uploadprofileFile };
}
