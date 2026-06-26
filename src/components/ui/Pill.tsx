import type { ReactNode } from 'react'

interface PillProps {
  children: ReactNode
  className?: string
}

export default function Pill({ children, className = '' }: PillProps) {
  return (
    <span className={`bg-gold/15 text-gold text-xs font-semibold px-2.5 py-1 rounded-full ${className}`}>
      {children}
    </span>
  )
}
