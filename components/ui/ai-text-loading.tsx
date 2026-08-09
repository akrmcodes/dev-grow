"use client";

/**
 * @author: @kokonutui
 * @description: AI Text Loading
 * @license: MIT
 * @website: https://kokonutui.com
 * Adapted for DevGrow monochrome chat thinking states.
 */

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AITextLoadingProps {
  texts?: string[];
  className?: string;
  interval?: number;
}

export default function AITextLoading({
  texts = [
    "Thinking...",
    "Processing...",
    "Analyzing...",
    "Computing...",
    "Almost...",
  ],
  className,
  interval = 1800,
}: AITextLoadingProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    if (texts.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, interval);

    return () => clearInterval(timer);
  }, [interval, texts.length]);

  return (
    <div className="relative flex min-w-0 items-center overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={texts[currentTextIndex] ?? currentTextIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{
            opacity: 1,
            y: 0,
            backgroundPosition: ["200% center", "-200% center"],
          }}
          exit={{ opacity: 0, y: -8 }}
          transition={{
            opacity: { duration: 0.28 },
            y: { duration: 0.28 },
            backgroundPosition: {
              duration: 2.4,
              ease: "linear",
              repeat: Number.POSITIVE_INFINITY,
            },
          }}
          className={cn(
            "block truncate bg-[length:200%_100%] bg-clip-text font-medium text-transparent",
            "bg-gradient-to-r from-foreground/35 via-foreground to-foreground/35",
            className,
          )}
        >
          {texts[currentTextIndex]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
