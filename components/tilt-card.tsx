"use client";

import { useRef } from "react";

/**
 * A card that tilts in 3D toward the mouse pointer, with a soft light glare.
 * Styles live in globals.css (.tilt, .tilt-glare). Touch devices just see a normal card.
 */
export function TiltCard({
  children,
  className = "",
  max = 8,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  max?: number; // maximum tilt in degrees
  as?: "div" | "article" | "li";
}) {
  const ref = useRef<HTMLElement>(null);

  function onMove(e: React.PointerEvent) {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width; // 0..1
    const y = (e.clientY - r.top) / r.height;
    const el = ref.current;
    el.dataset.active = "";
    el.style.setProperty("--ry", `${(x - 0.5) * 2 * max}deg`);
    el.style.setProperty("--rx", `${(0.5 - y) * 2 * max}deg`);
    el.style.setProperty("--gx", `${x * 100}%`);
    el.style.setProperty("--gy", `${y * 100}%`);
  }

  function onLeave() {
    const el = ref.current;
    if (!el) return;
    delete el.dataset.active;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  }

  return (
    <Tag
      ref={ref as never}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`tilt relative ${className}`}
    >
      {children}
      <span aria-hidden className="tilt-glare" />
    </Tag>
  );
}
