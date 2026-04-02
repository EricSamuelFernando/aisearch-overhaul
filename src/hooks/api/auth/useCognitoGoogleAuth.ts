import { error, success } from '@/components/alert/notify';
import { storeCookie } from '@/lib/storage';
import { AUTH_TOKEN, USER_ROLE } from '@/shared/constants/env';
import { useAuthActions } from '@/shared/hooks/useAuth';
import { resetAuthExpired } from '@/lib/api/axios';
import { setAuthToken } from '@/slices/auth/register.slices';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React from 'react';

function useCognitoGoogleAuth(handleCb?: () => void) {
  const router = useRouter();
  const GRAPHQL_URI =
    process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || 'http://localhost:4000/graphql';
  const { login } = useAuthActions();

  const handleAuthSuccess = React.useCallback(async (cognitoIdToken: string, profileHint?: string) => {
    try {
      console.log('handleAuthSuccess started. Querying backend with token...');
      const response = await axios.post(GRAPHQL_URI, {
        query: `
          mutation CognitoGoogleLogin($cognitoIdToken: String!) {
            cognitoGoogleLogin(cognitoIdToken: $cognitoIdToken) {
              id,
              firstName,
              lastName,
              email,
              accountType,
              access_token,
              profile
            }
          }
        `,
        variables: {
          cognitoIdToken,
        },
      });

      console.log('Backend Login Response:', response.data);

      const data = response.data?.data?.cognitoGoogleLogin;
      if (data) {
        console.log('User data received, saving to storage...', data);
        const { firstName, lastName, email, accountType, access_token, id, profile } = data;

        const decodeJwtPayload = (token: string) => {
          try {
            const payload = token.split('.')[1];
            const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
            const padded = normalized.padEnd(
              normalized.length + ((4 - (normalized.length % 4)) % 4),
              '='
            );
            const decoded = atob(padded);
            return JSON.parse(decoded);
          } catch {
            return null;
          }
        };

        const tokenPayload = decodeJwtPayload(cognitoIdToken);
        const googlePicture = tokenPayload?.picture;
        const profileUrl = profile || profileHint || googlePicture || '';
        const user: any = {
          firstname: firstName,
          lastname: lastName,
          email,
          account_type: accountType,
          id,
          profile: profileUrl,
        };

        localStorage.setItem('userEmail', email);
        localStorage.setItem('userAccessToken', access_token);
        localStorage.setItem('userDetails', JSON.stringify(user));

        success({
          message: 'Success! Welcome back via Google.',
          subtitle: 'Welcome back to Snaphomz',
        });
        resetAuthExpired();
        setAuthToken(access_token);
        login(user);
        storeCookie({ key: AUTH_TOKEN, value: access_token });
        storeCookie({ key: USER_ROLE, value: accountType });
        console.log('Cookies and Redux updated. Redirecting...');
        if (profileUrl && access_token) {
          await axios.post(
            GRAPHQL_URI,
            {
              query: `
                mutation UpdateUser($input: UpdateUserInput!) {
                  updateUser(input: $input) {
                    id
                  }
                }
              `,
              variables: { input: { profile: profileUrl } },
            },
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
              },
            }
          );
        }

        // Retrieve the redirect URL before the OAuth flow or default to '/'
        const pendingRedirect = sessionStorage.getItem('postLoginRedirect');
        if (pendingRedirect) {
          sessionStorage.removeItem('postLoginRedirect');
          router.push(pendingRedirect);
        } else {
          router.push(`/`);
        }

        handleCb?.();
      } else {
        console.error('No data in backend response:', response.data);
        if (response.data.errors) {
          console.error('Backend Errors:', response.data.errors);
        }
      }
    } catch (err) {
      console.error('Cognito Google Authentication Error:', err);
      error({ message: 'Google authentication failed' });
    }
  }, [GRAPHQL_URI, login, router, handleCb]);

  const cognitoGoogleLogin = () => {
    try {
      // Use COGNITO_CLIENT_ID (not Google OAuth client ID)
      const cognitoClientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ||
        process.env.NEXT_PUBLIC_GOOGLE_COGNITO_CLIENT_ID;
      const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
      const redirectUri = `${window.location.origin}/auth/callback`;

      if (!cognitoClientId || !cognitoDomain) {
        console.error('Missing Cognito config:', {
          hasClientId: !!cognitoClientId,
          hasDomain: !!cognitoDomain,
          clientId: cognitoClientId?.substring(0, 20) + '...',
        });
        error({
          message: 'Cognito configuration is missing. Please set NEXT_PUBLIC_COGNITO_CLIENT_ID and NEXT_PUBLIC_COGNITO_DOMAIN in your environment variables.'
        });
        return;
      }

      // Validate that client_id is NOT a Google OAuth client ID
      if (cognitoClientId.includes('googleusercontent.com')) {
        error({
          message: 'Configuration Error: NEXT_PUBLIC_COGNITO_CLIENT_ID should be your Cognito App Client ID, not the Google OAuth Client ID. Please check your environment variables.'
        });
        return;
      }

      // Ensure cognitoDomain is properly formatted (should be like https://your-domain.auth.region.amazoncognito.com)
      let formattedDomain = cognitoDomain.trim();

      // Validate domain format - should NOT be the API endpoint
      // if (formattedDomain.includes('cognito-idp.') && formattedDomain.includes('.amazonaws.com')) {
      //   error({
      //     message: 'Configuration Error: NEXT_PUBLIC_COGNITO_DOMAIN should be your Cognito Hosted UI domain (e.g., your-domain.auth.us-east-1.amazoncognito.com), not the API endpoint (cognito-idp.us-east-1.amazonaws.com). Please check your Cognito User Pool → App integration → Domain section.'
      //   });
      //   return;
      // }

      // // Validate domain doesn't contain "cognito-idp.auth" (common mistake)
      // if (formattedDomain.includes('cognito-idp.auth')) {
      //   error({
      //     message: 'Configuration Error: Domain contains "cognito-idp.auth" which is incorrect. The correct format is: your-domain.auth.region.amazoncognito.com (without "cognito-idp"). Please check your Cognito User Pool → App integration → Domain section for the correct Hosted UI domain.'
      //   });
      //   return;
      // }

      // // Validate it's a Hosted UI domain format
      // if (!formattedDomain.includes('.auth.') || !formattedDomain.includes('.amazoncognito.com')) {
      //   error({
      //     message: 'Configuration Error: NEXT_PUBLIC_COGNITO_DOMAIN should be in format: your-domain.auth.region.amazoncognito.com. Please check your Cognito User Pool → App integration → Domain section.'
      //   });
      //   return;
      // }

      if (!formattedDomain.startsWith('http://') && !formattedDomain.startsWith('https://')) {
        formattedDomain = `https://${formattedDomain}`;
      }
      // Remove trailing slash if present
      formattedDomain = formattedDomain.replace(/\/$/, '');

      // Build Cognito Hosted UI URL with Google as identity provider
      // Add prompt=select_account to force Google to show account selection
      const cognitoUrl = `${formattedDomain}/oauth2/authorize?` +
        `client_id=${encodeURIComponent(cognitoClientId)}&` +
        `response_type=code&` +
        `scope=openid+email+profile&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `identity_provider=Google&` +
        `prompt=select_account`;

      console.log('Redirecting to Cognito:', cognitoUrl.replace(cognitoClientId, 'CLIENT_ID_HIDDEN'));

      // Save the current URL to return to it after the OAuth flow
      sessionStorage.setItem('postLoginRedirect', window.location.pathname + window.location.search);

      // Redirect to Cognito Hosted UI
      window.location.href = cognitoUrl;
    } catch (err) {
      console.error('Cognito Google Login Error:', err);
      error({ message: 'Failed to initiate Google login' });
    }
  };

  // Handle callback from Cognito (called from callback page)
  const handleCognitoCallback = React.useCallback(async (code: string, redirectUriOverride?: string) => {
    try {
      const cognitoClientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ||
        process.env.NEXT_PUBLIC_GOOGLE_COGNITO_CLIENT_ID;
      const cognitoClientSecret = process.env.NEXT_PUBLIC_GOOGLE_SECRET_COGNITO_SECRECT_ID;
      const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;

      // Determine the actual redirect URI that was used
      // Use the override if provided, otherwise determine from current path
      let redirectUri: string;
      if (redirectUriOverride) {
        redirectUri = redirectUriOverride;
      } else {
        const currentPath = window.location.pathname;
        redirectUri = currentPath.includes('/auth/callback') && !currentPath.includes('/cognito/')
          ? `${window.location.origin}/auth/callback`
          : `${window.location.origin}/auth/cognito/callback`;
      }

      if (!cognitoClientId || !cognitoDomain) {
        throw new Error('Cognito configuration is missing');
      }

      // Format domain properly
      let formattedDomain = cognitoDomain.trim();
      if (!formattedDomain.startsWith('http://') && !formattedDomain.startsWith('https://')) {
        formattedDomain = `https://${formattedDomain}`;
      }
      formattedDomain = formattedDomain.replace(/\/$/, '');

      console.log('Exchanging code for tokens with redirect_uri:', redirectUri);

      // Prepare token request parameters
      const tokenParams = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: cognitoClientId,
        code: code,
        redirect_uri: redirectUri,
      });

      // If client secret is provided, use it (for confidential clients)
      // For public clients (SPA), we don't need the secret
      const headers: Record<string, string> = {
        'Content-Type': 'application/x-www-form-urlencoded',
      };

      // Exchange authorization code for tokens
      const tokenResponse = await axios.post(
        `${formattedDomain}/oauth2/token`,
        tokenParams,
        { headers }
      );

      console.log('Cognito Token Response Status:', tokenResponse.status);
      const idToken = tokenResponse.data.id_token;

      if (idToken) {
        console.log('ID Token received, calling handleAuthSuccess...');
        let profileHint: string | undefined;
        const accessToken = tokenResponse.data.access_token;
        if (accessToken) {
          try {
            const userInfoResponse = await axios.get(
              `${formattedDomain}/oauth2/userInfo`,
              {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );
            profileHint = userInfoResponse.data?.picture;
          } catch (error) {
            console.warn('Unable to fetch Cognito userInfo:', error);
          }
        }
        await handleAuthSuccess(idToken, profileHint);
      } else {
        console.error('No ID token in response:', tokenResponse.data);
        throw new Error('No ID token received from Cognito');
      }

    } catch (err: any) {
      console.error('Cognito Callback Error Full:', err);
      if (err.response) {
        console.error('Cognito Error Response Data:', err.response.data);
      }
      error({ message: err?.response?.data?.error_description || 'Failed to complete Google login' });
    }
  }, [handleAuthSuccess]);

  // Logout from Cognito (for OAuth users)
  const cognitoLogout = React.useCallback(() => {
    try {
      const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
      const cognitoClientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ||
        process.env.NEXT_PUBLIC_GOOGLE_COGNITO_CLIENT_ID;
      const redirectUri = `${window.location.origin}/home`;

      if (!cognitoDomain || !cognitoClientId) {
        console.warn('Cognito config missing, skipping global logout');
        return;
      }

      // Format domain properly
      let formattedDomain = cognitoDomain.trim();
      if (!formattedDomain.startsWith('http://') && !formattedDomain.startsWith('https://')) {
        formattedDomain = `https://${formattedDomain}`;
      }
      formattedDomain = formattedDomain.replace(/\/$/, '');

      // Build Cognito logout URL
      const logoutUrl = `${formattedDomain}/logout?` +
        `client_id=${encodeURIComponent(cognitoClientId)}&` +
        `logout_uri=${encodeURIComponent(redirectUri)}`;

      // Redirect to Cognito logout endpoint (this will clear the Cognito session)
      window.location.href = logoutUrl;
    } catch (err) {
      console.error('Cognito Logout Error:', err);
      // If logout fails, just continue (local logout already happened)
    }
  }, []);

  return { cognitoGoogleLogin, handleCognitoCallback, cognitoLogout };
}

export default useCognitoGoogleAuth;


