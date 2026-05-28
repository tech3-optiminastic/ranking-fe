"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  borderWidth?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
  /**
   * Corner radius of the beam's travel path in pixels. Should match the
   * container's border-radius so the beam hugs the visible edge.
   */
  cornerRadius?: number;
}

export function BorderBeam({
  className,
  size = 200,
  duration = 12,
  borderWidth = 1.5,
  colorFrom = "#e04a3d",
  colorTo = "#f4748f",
  delay = 0,
  cornerRadius = 4,
}: BorderBeamProps) {
  return (
    <div
      aria-hidden
      className={cn("border-beam", className)}
      style={
        {
          "--size": size,
          "--duration": duration,
          "--border-width": borderWidth,
          "--color-from": colorFrom,
          "--color-to": colorTo,
          "--delay": `-${delay}s`,
          "--corner-radius": cornerRadius,
        } as React.CSSProperties
      }
    />
  );
}
