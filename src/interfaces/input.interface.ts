export interface BaseInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  description?: React.ReactNode;
  descriptionProps?: Record<string, any>;
  disabled?: boolean;
  error?: React.ReactNode;
  errorProps?: Record<string, any>;
  inputContainer?: (children: React.ReactNode) => React.ReactNode;
  inputWrapperOrder?: ('input' | 'label' | 'description' | 'error')[];
  label?: React.ReactNode;
  labelProps?: Record<string, any>;
  leftSection?: React.ReactNode;
  leftSectionPointerEvents?: React.CSSProperties['pointerEvents'];
  leftSectionProps?: React.ComponentPropsWithoutRef<'div'>;
  leftSectionWidth?: React.CSSProperties['width'];
  required?: boolean;
  rightSection?: React.ReactNode;
  rightSectionPointerEvents?: React.CSSProperties['pointerEvents'];
  rightSectionProps?: React.ComponentPropsWithoutRef<'div'>;
  rightSectionWidth?: React.CSSProperties['width'];
  withAsterisk?: boolean;
  withErrorStyles?: boolean;
  wrapperProps?: Record<string, any>;
  rightClassName?: string;
  labelClass?: string;
  containerClass?: string;
}
