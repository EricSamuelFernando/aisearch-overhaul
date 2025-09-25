import { cn } from '@/lib/utils';

type InputFieldProps = {
  label: string;
  type?: string;
  name: string;
  placeholder: string;
  value: string;
  className?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const InputField: React.FC<InputFieldProps> = ({
  label,
  type = 'text',
  name,
  placeholder,
  onChange,
  value,
  className,
}) => (
  <label className={(cn('mr-4 block'), className)}>
    <span className='mb-3 block text-xl font-medium text-[#020202]'>
      {label}
    </span>
    <input
      type={type}
      name={name}
      className='mb-5 mt-1 block h-[3.75rem] w-[26rem] rounded-md border-[.5px] border-[#707070] bg-white px-3 py-2 text-[1.25rem] text-[#020202] placeholder-[#020202] focus:border-[#707070] focus:outline-none focus:ring-0 focus:ring-[#707070] sm:text-md'
      placeholder={placeholder}
      onChange={onChange}
    />
  </label>
);
