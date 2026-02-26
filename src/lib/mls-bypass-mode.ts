const MLS_BYPASS_STORAGE_KEY = 'snaphomz_search_bypass_mls';

export const getMlsBypassStorageKey = () => MLS_BYPASS_STORAGE_KEY;

export const isMlsBypassModeEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(MLS_BYPASS_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

export const setMlsBypassModeEnabled = (enabled: boolean) => {
  if (typeof window === 'undefined') return;
  try {
    if (enabled) localStorage.setItem(MLS_BYPASS_STORAGE_KEY, '1');
    else localStorage.removeItem(MLS_BYPASS_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('snaphomz:mls-bypass-changed', { detail: enabled }));
  } catch {
    // no-op
  }
};

