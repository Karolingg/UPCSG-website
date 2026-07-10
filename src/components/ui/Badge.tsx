import type { ReactNode } from 'react'

type BadgeTone = 'gold' | 'neutral' | 'success' | 'info'

const toneClasses: Record<BadgeTone, string> = {
  gold: 'bg-gold/15 text-gold ring-1 ring-gold/25',
  neutral: 'bg-white/8 text-paper/60 ring-1 ring-white/10',
  success: 'bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/25',
  info: 'bg-sky-400/15 text-sky-300 ring-1 ring-sky-400/25',
}

interface BadgeProps {
  children: ReactNode
  tone?: BadgeTone
  className?: string
}

export default function Badge({ children, tone = 'neutral', className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-display text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  )
}
