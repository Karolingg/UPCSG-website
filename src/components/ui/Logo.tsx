interface LogoProps {
  className?: string
  height?: number
}

export default function Logo({ className = '', height = 44 }: LogoProps) {
  return (
    <img
      src="/upcsg-logo.png"
      alt="UP Computer Science Guild"
      style={{ height }}
      className={`w-auto object-contain rounded ${className}`}
    />
  )
}
