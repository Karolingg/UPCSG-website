interface AvatarProps {
  name?: string | null;
  className?: string;
}

export default function Avatar({ name, className = "" }: AvatarProps) {
  const initial = name?.trim().charAt(0).toUpperCase() ?? "?";
  return (
    <div
      className={`w-11 h-11 text-base rounded-full bg-gold/15 border border-gold/30 cursor-pointer 
      text-gold font-bold flex items-center justify-center select-none shrink-0 ${className}`}
    >
      {initial}
    </div>
  );
}
