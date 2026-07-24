"use client";

import RippleSpinner from "@/components/ui/spinner-09";
import AITextLoading from "@/components/ui/ai-text-loading";
import { AnimatedBadge } from "@/components/ui/animated-badge";
import { type Language, t } from "@/lib/translations";

type AiThinkingIndicatorProps = {
  language: Language;
};

const PROGRESS_KEYS = [
  "thinkingProgressStructure",
  "thinkingProgressLogic",
  "thinkingProgressFlow",
  "thinkingProgressCompose",
] as const;

/**
 * Hybrid pre-stream thinking unit:
 * ripple spinner + cycling status text inside a processor-pulse badge frame.
 */
export function AiThinkingIndicator({ language }: AiThinkingIndicatorProps) {
  const texts = PROGRESS_KEYS.map((key) => t(key, language));

  return (
    <AnimatedBadge aria-label={t("thinking", language)}>
      <RippleSpinner size="sm" className="shrink-0" />
      <AITextLoading
        texts={texts}
        interval={1900}
        className="text-start text-xs sm:text-[13px]"
      />
    </AnimatedBadge>
  );
}
