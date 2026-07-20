import type { Mode } from "@/lib/prompts";
import type { TranslationKey } from "@/lib/translations";

export type ModeConfigEntry = {
  emoji: string;
  labelKey: TranslationKey;
};

export const MODE_CONFIG: Record<Mode, ModeConfigEntry> = {
  review: { emoji: "📝", labelKey: "modeReview" },
  hint: { emoji: "💡", labelKey: "modeHint" },
  concept: { emoji: "📖", labelKey: "modeConcept" },
  solution: { emoji: "✅", labelKey: "modeSolution" },
  analogy: { emoji: "🦆", labelKey: "modeAnalogy" },
  challenge: { emoji: "🔥", labelKey: "modeChallenge" },
};

export const MAX_DURATION = 30;
