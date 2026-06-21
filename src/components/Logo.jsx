export default function Logo({ className = '', height = 44 }) {
  return (
    <img
      src="/upcsg-logo.png"
      alt="UP Computer Science Guild"
      style={{ height }}
      className={`w-auto object-contain rounded ${className}`}
    />
  )
}
