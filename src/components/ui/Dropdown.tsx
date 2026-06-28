import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: "left" | "right";
}

export default function Dropdown({
  trigger,
  children,
  align = "right",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handlePointer(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen((o) => !o)} className="cursor-pointer">
        {trigger}
      </div>

      <div
        className={`absolute top-full mt-2 z-50 min-w-[200px] bg-ink-soft border border-white/10 rounded-xl shadow-2xl overflow-hidden transition-all duration-150 origin-top-right ${
          align === "right" ? "right-0" : "left-0"
        } ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}
      >
        {children}
      </div>
    </div>
  );
}
