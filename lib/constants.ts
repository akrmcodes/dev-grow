import type { Mode } from "@/lib/prompts";

export type ModeConfigEntry = {
  label: string;
  labelAr: string;
  emoji: string;
};

export const MODE_CONFIG: Record<Mode, ModeConfigEntry> = {
  review: { label: "Review", labelAr: "مراجعة", emoji: "📝" },
  hint: { label: "Hint", labelAr: "تلميح", emoji: "💡" },
  concept: { label: "Concept", labelAr: "المفهوم", emoji: "📖" },
  solution: { label: "Solution", labelAr: "الحل", emoji: "✅" },
  analogy: { label: "Analogy", labelAr: "تشبيه", emoji: "🦆" },
  challenge: { label: "Challenge", labelAr: "تحدي", emoji: "🔥" },
};

export const MAX_DURATION = 30;

export const RATE_LIMIT_MESSAGE =
  "You've reached the request limit. Please wait a moment and try again.";

export const RATE_LIMIT_MESSAGE_AR =
  "لقد وصلت إلى حد الطلبات. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.";
