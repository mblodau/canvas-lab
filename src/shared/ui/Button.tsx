import { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', children, ...props }, ref) => {
    const baseStyles = 'px-4 py-2 rounded font-medium transition-colors'
    const variantStyles =
      variant === 'primary'
        ? 'bg-blue-600 text-white hover:bg-blue-700'
        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'

    return (
      <button ref={ref} className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
