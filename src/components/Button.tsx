import { cn } from '@/lib/utils'
import React, { forwardRef } from 'react'

interface ButtonOptions {
  loading?: boolean
}

type Ref = HTMLButtonElement

export type ButtonProps = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
> &
  ButtonOptions

const Button = forwardRef<Ref, ButtonProps>((props, ref) => {
  const { className, children, loading, ...rest } = props

  const merged = cn(
    'h-14 items-center justify-center bg-black rounded-md text-white w-full text-base flex disabled:opacity-75',
    className
  )

  return (
    <button ref={ref} className={merged} disabled={loading} {...rest}>
      {loading ? (
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      ) : (
        children
      )}
    </button>
  )
})

Button.displayName = 'Button'

export { Button }
