import { toast } from 'sonner';

interface NotifProps {
  message?: string;
  subtitle?: string;
  duration?: number;
  id?: string;
}

type ExtraOptions = Record<string, unknown>;

const success = ({ message, subtitle, duration, id, ...rest }: NotifProps & ExtraOptions) =>
  toast.success(message, {
    description: subtitle,
    ...(duration ? { duration } : {}),
    ...(id ? { id } : {}),
    ...rest,
  });

const successNoIcon = ({ message, subtitle, duration, id, ...rest }: NotifProps & ExtraOptions) =>
  toast.success(message, {
    description: subtitle,
    icon: null,
    ...(duration ? { duration } : {}),
    ...(id ? { id } : {}),
    ...rest,
  });

const error = ({ message, subtitle, duration, id, ...rest }: NotifProps & ExtraOptions) =>
  toast.error(message, {
    description: subtitle,
    ...(duration ? { duration } : {}),
    ...(id ? { id } : {}),
    ...rest,
  });

const warning = ({ message, subtitle, duration, id, ...rest }: NotifProps & ExtraOptions) =>
  toast.warning(message, {
    description: subtitle,
    ...(duration ? { duration } : {}),
    ...(id ? { id } : {}),
    ...rest,
  });

const info = ({ message, subtitle, duration, id, ...rest }: NotifProps & ExtraOptions) =>
  toast.info(message, {
    description: subtitle,
    ...(duration ? { duration } : {}),
    ...(id ? { id } : {}),
    ...rest,
  });

const dismissAll = (toastId?: string) =>
  toastId ? toast.dismiss(toastId) : toast.dismiss();

export { success, successNoIcon, error, warning, info, dismissAll };
