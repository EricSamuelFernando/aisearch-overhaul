import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { error, info, success, warning } from '@/components/alert/notify';

type ToastType = 'success' | 'error' | 'info' | 'warning' | 'default';

type ToastOptions = {
  autoClose?: number;
} & Record<string, unknown>;

export const defaultToastOptions: ToastOptions = {
  autoClose: 4000,
};

// 🚨🚨🚨 THIS IS HOW TO USE THE TOAST
// showToast("success", <p>Your property has been published!</p>);

/**
 * Display toast
 *
 * @param {ToastType} type
 * @param {ReactNode} content
 * @param {ToastOptions} [options=defaultToastOption]
 * @return {Id}
 */
export const showToast = (
  type: ToastType,
  content: ReactNode,
  options: Partial<ToastOptions> = {},
): string | number => {
  const optionsToApply = { ...defaultToastOptions, ...options };
  const duration =
    typeof optionsToApply.autoClose === 'number'
      ? optionsToApply.autoClose
      : undefined;
  const toastId =
    typeof (optionsToApply as Record<string, unknown>).toastId === 'string'
      ? ((optionsToApply as Record<string, unknown>).toastId as string)
      : undefined;
  const id =
    typeof (optionsToApply as Record<string, unknown>).id === 'string'
      ? ((optionsToApply as Record<string, unknown>).id as string)
      : undefined;
  const baseOptions = {
    ...(duration ? { duration } : {}),
    ...(id || toastId ? { id: id || toastId } : {}),
  };
  const message =
    typeof content === 'string' || typeof content === 'number'
      ? String(content)
      : '';

  switch (type) {
    case 'success':
      return success({ message, ...baseOptions });
    case 'error':
      return error({ message, ...baseOptions });
    case 'info':
      return info({ message, ...baseOptions });
    case 'warning':
      return warning({ message, ...baseOptions });
    case 'default':
      return toast.custom(() => content, baseOptions);
    default:
      return toast.custom(() => content, baseOptions);
  }
};
