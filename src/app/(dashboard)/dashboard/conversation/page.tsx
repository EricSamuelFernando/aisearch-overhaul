'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const ConversationPage = () => {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const query = params?.toString();
    router.replace(query ? `/dashboard/chat?${query}` : '/dashboard/chat');
  }, [params, router]);

  return null;
};

export default ConversationPage;
