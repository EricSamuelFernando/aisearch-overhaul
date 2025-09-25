import { cn } from '@/lib/utils'
import React, { ButtonHTMLAttributes, ReactElement } from 'react'

type ButtonProps = {
  className?: string
  label: string | ReactElement
  onClick?: () => void
  type?: string
  loading?: boolean
  variant: 'primary' | 'secondary' | 'danger'
} & ButtonHTMLAttributes<HTMLButtonElement>

const RoundedButton: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant,
  className,
  type,
  loading,
  ...props
}) => {
  const getButtonClass = (variant: 'primary' | 'secondary' | 'danger') => {
    switch (variant) {
      case 'primary':
        return 'px-7 py-3 font-medium bg-white text-black rounded-full text-sm disabled:opacity-75'
      case 'secondary':
        return 'px-7 py-3 font-medium bg-transparent text-white/[.34] border border-[rgba(255, 255, 255, 0.34)] rounded-full text-sm disabled:opacity-75 '
      case 'danger':
        return 'px-7 py-3 font-medium bg-transparent text-white border border-white rounded-full text-sm disabled:opacity-75 '
      default:
        return ''
    }
  }

  return (
    <button
      className={cn(getButtonClass(variant), className)}
      type={type}
      onClick={onClick}
      {...props}>
      {label}
    </button>
  )
}

export { RoundedButton }
