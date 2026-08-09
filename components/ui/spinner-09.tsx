"use client";

import { memo } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

interface RippleSpinnerProps extends HTMLMotionProps<"div"> {
  size?: "sm" | "md" | "lg";
}

const sizeConfig = {
  sm: {
    container: "size-5",
    borderWidth: "border",
  },
  md: {
    container: "size-12",
    borderWidth: "border-2",
  },
  lg: {
    container: "size-24",
    borderWidth: "border-[3px]",
  },
} as const;

/**
 * Ripple Spinner (spinner-09) — concentric expanding circular waves.
 * Adapted from ShadcnSpace / 21st.dev for DevGrow monochrome chrome.
 */
const RippleSpinner = memo(function RippleSpinner({
  size = "md",
  className,
  ...props
}: RippleSpinnerProps) {
  const config = sizeConfig[size] ?? sizeConfig.md;

  return (
    <motion.div
      className={cn(
        "relative flex items-center justify-center text-foreground",
        config.container,
        className,
      )}
      aria-hidden="true"
      {...props}
    >
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={cn(
            "absolute inset-0 rounded-full border-current bg-current/[0.03] opacity-0",
            config.borderWidth,
          )}
          initial={{ scale: 0.1, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: [0, 0.75, 0],
          }}
          transition={{
            duration: 1.8,
            repeat: Infinity,
            delay: index * 0.6,
            ease: "easeOut",
          }}
        />
      ))}
    </motion.div>
  );
});

export default RippleSpinner;
