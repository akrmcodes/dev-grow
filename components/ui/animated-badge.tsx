"use client";

/**
 * Animated Badge — Eldora UI / 21st.dev
 * Adapted as a monochrome processor-pulse frame that wraps children.
 */

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type AnimatedBadgeProps = {
  children: ReactNode;
  className?: string;
  /** Optional accessible label for the frame. */
  "aria-label"?: string;
};

/**
 * Chip-like frame with a traveling silver highlight along a circuit path.
 */
export function AnimatedBadge({
  children,
  className,
  "aria-label": ariaLabel,
}: AnimatedBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 4, filter: "blur(2px)" }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
      className={cn(
        "group relative inline-flex max-w-full items-center gap-2.5 overflow-hidden rounded-xl",
        "border border-border/80 bg-card px-3 py-2 text-card-foreground",
        "shadow-[inset_0_1px_0_0_color-mix(in_oklch,var(--foreground)_8%,transparent)]",
        className,
      )}
    >
      {/* Circuit light path — travels above the chip edge */}
      <div className="pointer-events-none absolute inset-x-0 bottom-full h-14 w-full max-w-[200px]">
        <svg
          className="h-full w-full"
          width="100%"
          height="100%"
          viewBox="0 0 50 50"
          fill="none"
          aria-hidden="true"
        >
          <g mask="url(#devgrow-ml-mask)">
            <circle
              className="devgrow-ml-light"
              cx="0"
              cy="0"
              r="18"
              fill="url(#devgrow-ml-grad)"
            />
          </g>
          <defs>
            <mask id="devgrow-ml-mask">
              <path
                d="M 69 49.8 h -30 q -3 0 -3 -3 v -13 q 0 -3 -3 -3 h -23 q -3 0 -3 -3 v -13 q 0 -3 -3 -3 h -30"
                strokeWidth="0.65"
                stroke="white"
              />
            </mask>
            <radialGradient id="devgrow-ml-grad" fx="1">
              <stop
                offset="0%"
                stopColor="color-mix(in oklch, var(--foreground) 85%, transparent)"
              />
              <stop
                offset="35%"
                stopColor="color-mix(in oklch, var(--foreground) 35%, transparent)"
              />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-foreground/10"
      />
      <span
        aria-hidden="true"
        className="devgrow-chip-sheen pointer-events-none absolute inset-px rounded-[inherit] opacity-60"
      />

      {children}
    </motion.div>
  );
}

export default AnimatedBadge;
