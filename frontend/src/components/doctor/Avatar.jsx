// src/components/ui/Avatar.jsx
import React from "react";

export default function Avatar({ name, size = 36 }) {
  const initials = (name || "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className="grid place-items-center rounded-full bg-zinc-900 text-white"
      style={{ width: size, height: size }}
    >
      <span className="text-xs">{initials}</span>
    </div>
  );
}
