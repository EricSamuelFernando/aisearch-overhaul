'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

function useClearQueryParam() {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const deleteQuery = (query: string) => {
    const params = new URLSearchParams(searchParams!);
    params.delete(query);
    replace(`${pathname}?${params.toString()}`);
  };

  return { deleteQuery };
}

export default useClearQueryParam;
