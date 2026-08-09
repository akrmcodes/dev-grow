"use client";

import { useEffect } from "react";
import { motion, stagger, useAnimate } from "motion/react";
import { cn } from "@/lib/utils";

export type TextGenerateEffectProps = {
  words: string;
  className?: string;
  filter?: boolean;
  duration?: number;
  /** Delay between words in seconds. Auto-scales for long passages. */
  staggerDelay?: number;
  as?: "div" | "p" | "span" | "li" | "h1" | "h2" | "h3";
};

const ARABIC =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/u;

function splitWords(text: string): string[] {
  return text.split(/\s+/).filter(Boolean);
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Aceternity Text Generate Effect — history-entrance word reveal only.
 * Not used during live streaming (see AssistantMessage static path).
 * @see https://ui.aceternity.com/components/text-generate-effect
 */
export function TextGenerateEffect({
  words,
  className,
  filter = true,
  duration = 0.28,
  staggerDelay,
  as = "div",
}: TextGenerateEffectProps) {
  const [scope, animate] = useAnimate();
  const wordsArray = splitWords(words);
  const Tag = as;
  const hasArabic = ARABIC.test(words);

  const resolvedStagger =
    staggerDelay ??
    Math.min(0.032, Math.max(0.01, 0.95 / Math.max(wordsArray.length, 1)));

  useEffect(() => {
    if (wordsArray.length === 0) return;

    if (prefersReducedMotion()) {
      void animate(
        "span[data-word]",
        { opacity: 1, filter: "none" },
        { duration: 0 },
      );
      return;
    }

    void animate(
      "span[data-word]",
      {
        opacity: 1,
        filter: filter && !hasArabic ? "blur(0px)" : "none",
      },
      {
        duration: filter && !hasArabic ? duration : Math.min(duration, 0.22),
        delay: stagger(resolvedStagger),
        ease: [0.22, 1, 0.36, 1],
      },
    );
  }, [
    animate,
    duration,
    filter,
    hasArabic,
    resolvedStagger,
    words,
    wordsArray.length,
  ]);

  return (
    <Tag
      className={cn(
        "leading-relaxed text-foreground",
        className,
        hasArabic ? "tracking-normal" : "tracking-wide",
      )}
    >
      <motion.span ref={scope} className="inline">
        {wordsArray.map((word, idx) => (
          <motion.span
            data-word
            key={`${idx}-${word}`}
            className="inline text-foreground opacity-0"
            style={{
              filter: filter && !hasArabic ? "blur(8px)" : "none",
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
