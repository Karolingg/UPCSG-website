interface LogoProps {
  className?: string
  height?: number
}

export default function Logo({ className = '', height }: LogoProps) {
  return (
    <img
      src="/upcsg-logo.png"
      alt="UP Computer Science Guild"
      style={height !== undefined ? { height } : undefined}
      className={`w-auto object-contain rounded ${className}`}
    />
  )
}
