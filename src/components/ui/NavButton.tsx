import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";

interface NavButtonProps {
  children: ReactNode;
  to?: string;
}

export default function NavButton({ children, to }: NavButtonProps) {
  if (to) {
    return (
      <NavLink
        to={to}
        end
        className={({ isActive }) =>
          `w-full px-4 py-3 rounded-md font-bold tracking-wide transition-colors block ${
            isActive ? "bg-gold text-ink" : "text-paper hover:bg-white/5"
          }`
        }
      >
        {children}
      </NavLink>
    );
  }

  return (
    <span
      title="Coming in a later phase"
      className="w-full px-4 py-3 rounded-md font-bold tracking-wide text-paper/35 cursor-default select-none block"
    >
      {children}
    </span>
  );
}
