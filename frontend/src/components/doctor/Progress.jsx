// src/components/ui/Progress.jsx
import React from "react";

export default function Progress({ value = 0, max = 100, label }) {
  return (
    <div>
      <div className="mb-1 flex items-end justify-between text-xs text-zinc-600">
        <span>{label}</span>
        <span>{value}/{max}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100">
        <div className="h-full rounded-full bg-zinc-900" style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );
}
