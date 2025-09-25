import { toast } from 'sonner';
interface NotifProps {
  message?: string;
  subtitle?: string;
}

// Success notifications trigger
const success = ({ message, subtitle, ...options }: NotifProps) =>
  toast.success(message);
const info = ({ message, subtitle, ...options }: NotifProps) =>
  toast.info(message);

// Error notifications trigger
const error = ({ message, subtitle, ...options }: NotifProps) =>
  toast.error(message);

// Dismiss all notifications
const dismissAll = (toastId?: string) =>
  toastId ? toast.dismiss(toastId) : toast.dismiss();

export { success, error, dismissAll, info };
