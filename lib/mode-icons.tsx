import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CircleCheck,
  Feather,
  Flame,
  Lightbulb,
  ScanSearch,
} from "lucide-react";
import type { Mode } from "@/lib/prompts";

export const MODE_ICONS: Record<Mode, LucideIcon> = {
  review: ScanSearch,
  hint: Lightbulb,
  concept: BookOpen,
  solution: CircleCheck,
  analogy: Feather,
  challenge: Flame,
};
