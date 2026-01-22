'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import useCognitoGoogleAuth from '@/hooks/api/auth/useCognitoGoogleAuth';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleCognitoCallback } = useCognitoGoogleAuth();
  const processedCode = useRef<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      console.error('Cognito OAuth Error:', error, errorDescription);
      router.push('/auth/login?error=cognito_auth_failed');
      return;
    }

    if (code) {
      if (processedCode.current === code) return;
      processedCode.current = code;

      // Handle callback with /auth/callback as redirect_uri (must match what Cognito expects)
      handleCognitoCallback(code, `${window.location.origin}/auth/callback`);
    } else {
      router.push('/auth/login?error=no_code');
    }
  }, [searchParams, handleCognitoCallback, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary-main" />
        <p className="text-lg font-medium">Completing Google login...</p>
      </div>
    </div>
  );
}
