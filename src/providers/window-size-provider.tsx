import * as React from 'react';

import { useWindowSize } from '@/hooks/utils/useWindowSize';

const WindowSizeProvider: React.FC = () => {
  useWindowSize();

  return null;
};

export { WindowSizeProvider };
