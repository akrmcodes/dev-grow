"use client";

import { useEffect } from "react";
import { motion, stagger, useAnimate } from "motion/react";
import { cn } from "@/lib/utils";

export type TextGenerateEffectProps = {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
  /** Delay between words in seconds. Auto-scales down for long passages. */
  staggerDelay?: number;
  as?: "div" | "p" | "span";
};

/**
 * Aceternity Text Generate Effect — word-by-word reveal with optional blur.
 * @see https://ui.aceternity.com/components/text-generate-effect
 */
export function TextGenerateEffect({
  words,
  className,
  filter = true,
  duration = 0.32,
  staggerDelay,
  as = "div",
}: TextGenerateEffectProps) {
  const [scope, animate] = useAnimate();
  const wordsArray = words.split(/\s+/).filter(Boolean);
  const Tag = as;
  const resolvedStagger =
    staggerDelay ??
    Math.min(0.02, Math.max(0.008, 1.35 / Math.max(wordsArray.length, 1)));

  useEffect(() => {
    if (wordsArray.length === 0) return;

    void animate(
      "span[data-word]",
      {
        opacity: 1,
        filter: filter ? "blur(0px)" : "none",
      },
      {
        duration,
        delay: stagger(resolvedStagger),
        ease: [0.22, 1, 0.36, 1],
      },
    );
  }, [animate, duration, filter, resolvedStagger, words, wordsArray.length]);

  return (
    <Tag
      className={cn("leading-relaxed tracking-wide text-foreground", className)}
    >
      <motion.span ref={scope} className="inline">
        {wordsArray.map((word, idx) => (
          <motion.span
            data-word
            key={`${word}-${idx}`}
            className="inline text-foreground opacity-0"
            style={{
              filter: filter ? "blur(8px)" : "none",
            }}
          >
            {word}
            {idx < wordsArray.length - 1 ? " " : ""}
          </motion.span>
        ))}
      </motion.span>
    </Tag>
  );
}
