interface AvatarProps {
  name?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
}

export default function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  const initial = name?.trim().charAt(0).toUpperCase() ?? '?'
  return (
    <div
      className={`${sizes[size]} rounded-full bg-gold/15 border border-gold/30 text-gold font-bold flex items-center justify-center select-none shrink-0 ${className}`}
    >
      {initial}
    </div>
  )
}
