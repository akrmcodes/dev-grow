"use client";

import { useEffect, useRef } from "react";
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
  /**
   * Streaming mode: already-shown words stay visible; only newly appended
   * words animate in. Prevents remount flicker on every token.
   */
  incremental?: boolean;
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
 * Aceternity-style word reveal — supports full entrance and incremental stream.
 * @see https://ui.aceternity.com/components/text-generate-effect
 */
export function TextGenerateEffect({
  words,
  className,
  filter = true,
  duration = 0.28,
  staggerDelay,
  as = "div",
  incremental = false,
}: TextGenerateEffectProps) {
  const [scope, animate] = useAnimate();
  const wordsArray = splitWords(words);
  const Tag = as;
  const hasArabic = ARABIC.test(words);
  const revealedCountRef = useRef(0);
  const prevWordsRef = useRef("");
  /** Words already solid on this paint (incremental only). */
  const paintedRevealedRef = useRef(0);

  // Compute how many words should paint as already-visible this frame.
  let solidCount = 0;
  if (incremental) {
    const prev = prevWordsRef.current;
    if (prev && words.startsWith(prev)) {
      solidCount = revealedCountRef.current;
    } else if (prev && !words.startsWith(prev)) {
      // Regenerated / non-prefix edit — restart.
      solidCount = 0;
      revealedCountRef.current = 0;
    } else {
      solidCount = revealedCountRef.current;
    }
  }
  paintedRevealedRef.current = solidCount;
  prevWordsRef.current = words;

  const resolvedStagger =
    staggerDelay ??
    (() => {
      const windowSec = incremental ? 0.65 : 0.95;
      return Math.min(
        0.032,
        Math.max(0.008, windowSec / Math.max(wordsArray.length, 1)),
      );
    })();

  useEffect(() => {
    if (wordsArray.length === 0) return;

    if (prefersReducedMotion()) {
      void animate(
        "span[data-word]",
        { opacity: 1, filter: "none" },
        { duration: 0 },
      );
      revealedCountRef.current = wordsArray.length;
      return;
    }

    if (incremental) {
      const from = paintedRevealedRef.current;
      if (from >= wordsArray.length) {
        revealedCountRef.current = wordsArray.length;
        return;
      }

      if (from > 0) {
        void animate(
          "span[data-word][data-revealed='1']",
          { opacity: 1, filter: "none" },
          { duration: 0 },
        );
      }

      void animate(
        "span[data-word][data-revealed='0']",
        {
          opacity: 1,
          filter: filter && !hasArabic ? "blur(0px)" : "none",
        },
        {
          duration: filter && !hasArabic ? duration : Math.min(duration, 0.2),
          delay: stagger(resolvedStagger),
          ease: [0.22, 1, 0.36, 1],
        },
      );

      revealedCountRef.current = wordsArray.length;
      return;
    }

    // Full entrance (history / first paint of a settled block).
    revealedCountRef.current = 0;
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
    incremental,
    resolvedStagger,
    words,
    wordsArray.length,
  ]);

  return (
    <Tag
      className={cn(
        "leading-relaxed text-foreground",
        className,
        // letter-spacing disconnects Arabic glyphs — force normal tracking.
        hasArabic ? "tracking-normal" : "tracking-wide",
      )}
    >
      <motion.span ref={scope} className="inline">
        {wordsArray.map((word, idx) => {
          const alreadyShown = incremental && idx < solidCount;
          return (
            <motion.span
              data-word
              data-revealed={alreadyShown ? "1" : "0"}
              key={`${idx}-${word}`}
              className="inline text-foreground"
              style={{
                opacity: alreadyShown ? 1 : 0,
                filter:
                  alreadyShown || !filter || hasArabic ? "none" : "blur(8px)",
              }}
            >
              {word}
              {idx < wordsArray.length - 1 ? " " : ""}
            </motion.span>
          );
        })}
      </motion.span>
    </Tag>
  );
}
