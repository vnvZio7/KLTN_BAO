import React from "react";

export default function Empty({ icon: Icon, title, hint }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed p-10 text-center text-zinc-600">
      <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-full bg-zinc-100">
        {Icon && <Icon className="h-6 w-6" />}
      </div>
      <div className="text-sm font-medium">{title}</div>
      {hint && <div className="mt-1 text-xs text-zinc-500">{hint}</div>}
    </div>
  );
}
