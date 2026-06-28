import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  children: ReactNode
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-gold text-ink hover:bg-gold-soft',
  secondary: 'border border-gold text-gold hover:bg-gold/10',
  ghost: 'text-paper hover:text-gold',
}

export default function Button({
  variant = 'primary',
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 cursor-pointer ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
