import type { CSSProperties, ReactNode } from 'react';
import { toast } from 'sonner';

interface NotifProps {
  message?: string;
  subtitle?: string;
}

type ToastOptions = {
  style?: CSSProperties;
  className?: string;
} & Record<string, unknown>;

const TITLE_STYLE: CSSProperties = {
  fontSize: '15px',
  fontWeight: 600,
  lineHeight: 1.3,
  color: '#f2f2f2',
};

const DESC_STYLE: CSSProperties = {
  marginTop: '2px',
  fontSize: '13px',
  lineHeight: 1.45,
  color: '#b3b3b3',
};

const SuccessIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    height="20"
    width="20"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
      clipRule="evenodd"
    />
  </svg>
);

const ErrorIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    height="20"
    width="20"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm2.828-10.828a.75.75 0 00-1.06-1.06L10 7.879 8.232 6.111a.75.75 0 10-1.06 1.06L8.94 8.94 7.172 10.707a.75.75 0 101.06 1.06L10 10.001l1.768 1.768a.75.75 0 001.06-1.06L11.06 8.94l1.768-1.768z"
      clipRule="evenodd"
    />
  </svg>
);

const WarningIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    height="20"
    width="20"
  >
    <path
      fillRule="evenodd"
      d="M8.257 3.099c.765-1.36 2.721-1.36 3.486 0l6.857 12.195c.75 1.334-.214 2.993-1.743 2.993H3.143c-1.53 0-2.493-1.659-1.743-2.993L8.257 3.1zM11 14a1 1 0 10-2 0 1 1 0 002 0zm-1-7a1 1 0 00-1 1v3a1 1 0 002 0V8a1 1 0 00-1-1z"
      clipRule="evenodd"
    />
  </svg>
);

const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    height="20"
    width="20"
  >
    <path
      fillRule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-10a1 1 0 100-2 1 1 0 000 2zm1 6a1 1 0 10-2 0V9a1 1 0 102 0v5z"
      clipRule="evenodd"
    />
  </svg>
);

const formatToastTitle = (value?: string) => {
  if (!value) return value;
  return value.replace(/\S+/g, (word) => {
    if (word.length > 1 && word.toUpperCase() === word) {
      return word;
    }
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
};

const renderToastContent = ({
  message,
  subtitle,
  icon,
  showIcon = true,
}: {
  message?: string;
  subtitle?: string;
  icon: ReactNode;
  showIcon?: boolean;
}) => (
  <>
    {showIcon ? (
      <div className="snaphomz-toast__icon">{icon}</div>
    ) : null}
    <div
      className="snaphomz-toast__content"
      style={{ gridColumn: showIcon ? '2' : '1' }}
    >
      {message ? (
        <div style={TITLE_STYLE}>{formatToastTitle(message)}</div>
      ) : null}
      {subtitle ? <div style={DESC_STYLE}>{subtitle}</div> : null}
    </div>
  </>
);

const mergeClassName = (base?: string, extra?: string) =>
  [base, extra].filter(Boolean).join(' ');

const mergeOptions = (
  base: ToastOptions,
  extra: ToastOptions
): ToastOptions => {
  const baseStyle = base.style || {};
  const extraStyle = extra.style || {};
  return {
    ...base,
    ...extra,
    className: mergeClassName(base.className, extra.className),
    style: { ...baseStyle, ...extraStyle },
  };
};

// Success notifications trigger (custom JSX)
const success = ({ message, subtitle, ...options }: NotifProps & ToastOptions) =>
  toast.custom(
    () =>
      renderToastContent({
        message,
        subtitle,
        icon: <SuccessIcon />,
      }),
    mergeOptions(
      { type: 'success', ...options },
      { className: 'snaphomz-toast--success custom-toast-success' }
    )
  );

// Success without icon (custom JSX)
const successNoIcon = ({
  message,
  subtitle,
  ...options
}: NotifProps & ToastOptions) =>
  toast.custom(
    () =>
      renderToastContent({
        message,
        subtitle,
        icon: <SuccessIcon />,
        showIcon: false,
      }),
    mergeOptions(
      { type: 'success', ...options },
      {
        className: 'snaphomz-toast--success custom-toast-success',
        style: { gridTemplateColumns: '1fr' },
      }
    )
  );

const info = ({ message, subtitle, ...options }: NotifProps & ToastOptions) =>
  toast.custom(
    () =>
      renderToastContent({
        message,
        subtitle,
        icon: <InfoIcon />,
      }),
    mergeOptions(
      { type: 'info', ...options },
      { className: 'snaphomz-toast--info custom-toast-info' }
    )
  );

// Error notifications trigger (custom JSX)
const error = ({ message, subtitle, ...options }: NotifProps & ToastOptions) =>
  toast.custom(
    () =>
      renderToastContent({
        message,
        subtitle,
        icon: <ErrorIcon />,
      }),
    mergeOptions(
      { type: 'error', ...options },
      { className: 'snaphomz-toast--error custom-toast-error' }
    )
  );

const warning = ({
  message,
  subtitle,
  ...options
}: NotifProps & ToastOptions) =>
  toast.custom(
    () =>
      renderToastContent({
        message,
        subtitle,
        icon: <WarningIcon />,
      }),
    mergeOptions(
      { type: 'warning', ...options },
      { className: 'snaphomz-toast--warning custom-toast-warning' }
    )
  );

// Dismiss all notifications
const dismissAll = (toastId?: string) =>
  toastId ? toast.dismiss(toastId) : toast.dismiss();

export { success, successNoIcon, error, warning, dismissAll, info };
