import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";

interface NavButtonProps {
  children: ReactNode;
  to?: string;
  icon?: ReactNode;
  collapsed?: boolean;
}

export default function NavButton({
  children,
  to,
  icon,
  collapsed,
}: NavButtonProps) {
  const label =
    typeof children === "string" ? children.toUpperCase() : children;
  const tooltipTitle =
    collapsed && typeof children === "string" ? children : undefined;

  const baseClass = `w-full rounded-xl font-bold text-sm transition-colors flex items-center h-8 px-3 py-6 gap-3`;

  const inner = (
    <>
      {icon && (
        <span className="shrink-0 w-4 h-4 flex items-center justify-center">
          {icon}
        </span>
      )}
      <span className={`whitespace-nowrap${collapsed ? " lg:hidden" : ""}`}>
        {label}
      </span>
    </>
  );

  if (to) {
    return (
      <NavLink
        to={to}
        end
        title={tooltipTitle}
        className={({ isActive }) =>
          `${baseClass} ${
            isActive
              ? "bg-gold/15 text-gold"
              : "text-paper/70 hover:text-paper hover:bg-white/8"
          }`
        }
      >
        {inner}
      </NavLink>
    );
  }

  return (
    <span
      title={collapsed ? tooltipTitle : "Coming Soon"}
      className={`${baseClass} text-paper/35 cursor-default select-none`}
    >
      {inner}
    </span>
  );
}
