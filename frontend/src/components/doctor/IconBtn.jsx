import React from "react";

export default function IconBtn({
  icon: Icon,
  className = "",
  children,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50 active:bg-zinc-100 ${className}`}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}
