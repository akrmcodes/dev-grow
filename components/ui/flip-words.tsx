"use client";

import React, { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

/** Scripts that require contiguous glyphs for correct shaping (Arabic, etc.). */
const JOINING_SCRIPT =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/u;

function usesJoiningScript(text: string): boolean {
  return JOINING_SCRIPT.test(text);
}

export const FlipWords = ({
  words,
  duration = 3000,
  className,
}: {
  words: string[];
  duration?: number;
  className?: string;
}) => {
  const [currentWord, setCurrentWord] = useState(words[0] ?? "");
  const [isAnimating, setIsAnimating] = useState(false);

  // Reset when the word list changes (e.g. language toggle).
  useEffect(() => {
    setCurrentWord(words[0] ?? "");
    setIsAnimating(false);
  }, [words]);

  const startAnimation = useCallback(() => {
    const word = words[words.indexOf(currentWord) + 1] || words[0] || "";
    setCurrentWord(word);
    setIsAnimating(true);
  }, [currentWord, words]);

  useEffect(() => {
    if (isAnimating || words.length === 0) return;
    const timeout = window.setTimeout(() => {
      startAnimation();
    }, duration);
    return () => window.clearTimeout(timeout);
  }, [isAnimating, duration, startAnimation, words.length]);

  const joining = usesJoiningScript(currentWord);

  return (
    <AnimatePresence
      onExitComplete={() => {
        setIsAnimating(false);
      }}
    >
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 10,
        }}
        exit={{
          opacity: 0,
          y: -40,
          x: joining ? -40 : 40,
          filter: "blur(8px)",
          scale: 2,
          position: "absolute",
        }}
        className={cn(
          "relative z-10 inline-block px-2 text-start text-neutral-900 dark:text-neutral-100",
          className,
        )}
        key={currentWord}
      >
        {currentWord.split(" ").map((word, wordIndex) => {
          // Arabic (and other joining scripts) must stay in one text run —
          // per-letter inline-block spans break contextual glyph shaping.
          if (joining || usesJoiningScript(word)) {
            return (
              <motion.span
                key={`${word}-${wordIndex}`}
                initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  delay: wordIndex * 0.3,
                  duration: 0.3,
                }}
                className="inline whitespace-nowrap"
              >
                {word}
                {wordIndex < currentWord.split(" ").length - 1 ? "\u00A0" : null}
              </motion.span>
            );
          }

          return (
            <motion.span
              key={`${word}-${wordIndex}`}
              initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                delay: wordIndex * 0.3,
                duration: 0.3,
              }}
              className="inline-block whitespace-nowrap"
            >
              {word.split("").map((letter, letterIndex) => (
                <motion.span
                  key={`${word}-${letterIndex}`}
                  initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    delay: wordIndex * 0.3 + letterIndex * 0.05,
                    duration: 0.2,
                  }}
                  className="inline-block"
                >
                  {letter}
                </motion.span>
              ))}
              <span className="inline-block">&nbsp;</span>
            </motion.span>
          );
        })}
      </motion.div>
    </AnimatePresence>
  );
};
