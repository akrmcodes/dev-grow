"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FlipWords } from "@/components/ui/flip-words";
import { Ripple } from "@/components/ui/ripple";
import { cn } from "@/lib/utils";

export const EMPTY_HERO_WORDS = [
  "clarity",
  "velocity",
  "precision",
  "craft",
  "mastery",
];

const EASE = [0.22, 1, 0.36, 1] as const;

type EmptyHeroProps = {
  visible: boolean;
  className?: string;
};

/**
 * Empty-state hero: Magic UI Ripple + Aceternity Flip Words.
 * Dissolves when the first message arrives; returns on New Chat.
 */
export function EmptyHero({ visible, className }: EmptyHeroProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="empty-hero"
          role="status"
          aria-live="polite"
          className={cn(
            "pointer-events-none absolute inset-0 z-[1] flex items-center justify-center overflow-hidden",
            className,
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 0.98,
            filter: "blur(6px)",
          }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <Ripple />

          <div
            dir="ltr"
            lang="en"
            className="relative z-10 flex items-center justify-center px-6"
          >
            <div className="min-h-[1.35em] text-center text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
              <FlipWords words={EMPTY_HERO_WORDS} duration={3000} />
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
