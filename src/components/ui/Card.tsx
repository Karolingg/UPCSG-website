import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  to?: string
}

export default function Card({ children, className = '', hover = false, to }: CardProps) {
  const base = `w-full bg-surface rounded-xl p-6 border border-white/10 ${
    hover ? 'hover:border-gold/50 transition-colors cursor-pointer' : ''
  } ${className}`

  if (to) {
    return <Link to={to} className={base}>{children}</Link>
  }
  return <div className={base}>{children}</div>
}
