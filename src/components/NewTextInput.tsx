import { cn } from "@/lib/utils"

interface InputBoxProps {
  label: string
  placeholder?: string
  type: string
  labelClassName?: string
  inputClassName?: string
}

const NewInputBox: React.FC<InputBoxProps> = ({
  label,
  placeholder,
  type,
  labelClassName,
  inputClassName
}) => {
  return (
    <div className="space-y-1">
      <label
        className={cn('block text-sm font-medium text-black', labelClassName)}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        className={cn(
          'block w-full px-3 py-2 border-transparent border rounded-md shadow-sm focus:outline-none  focus:border-[#FF8700] sm:text-sm',
          inputClassName
        )}
      />
    </div>
  )
}

export default NewInputBox
