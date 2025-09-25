'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useDeepCompareEffect } from 'react-use';

const useRouteQueryUpdate = (queryHash: Record<string, string | number>) => {
  const router = useRouter();
  const pathname = usePathname();

  useDeepCompareEffect(() => {
    const params = new URLSearchParams();
    Object.entries(queryHash).forEach(([query, value]) => {
      if (Boolean(value)) {
        params.set(query, String(value));
      } else {
        params.delete(query);
      }
    });

    router.replace(pathname + '?' + params.toString());
  }, [queryHash]);
};

export { useRouteQueryUpdate };
