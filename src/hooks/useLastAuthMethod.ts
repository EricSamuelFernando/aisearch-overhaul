'use client';

import * as React from 'react';

export type AuthMethod = 'email' | 'google';

export function useLastAuthMethod() {
  const [lastMethod, setLastMethodState] = React.useState<AuthMethod | null>(null);

  React.useEffect(() => {
    const stored = localStorage.getItem('lastAuthMethod') as AuthMethod | null;
    setLastMethodState(stored);
  }, []);

  const setLastMethod = (method: AuthMethod) => {
    localStorage.setItem('lastAuthMethod', method);
    setLastMethodState(method);
  };

  return { lastMethod, setLastMethod };
}
