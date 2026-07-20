"use client";

import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { MODE_CONFIG } from "@/lib/constants";
import type { Mode } from "@/lib/prompts";
import { type Language, t } from "@/lib/translations";
import { cn } from "@/lib/utils";

type ModeSelectorProps = {
  activeMode: Mode | null;
  onModeChange: (mode: Mode) => void;
  isLoading: boolean;
  language: Language;
};

const modes = Object.keys(MODE_CONFIG) as Mode[];

export function ModeSelector({
  activeMode,
  onModeChange,
  isLoading,
  language,
}: ModeSelectorProps) {
  return (
    <div className="shrink-0">
      <p className="mb-2 text-sm font-medium text-foreground">
        {t("selectMode", language)}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {modes.map((mode) => {
          const config = MODE_CONFIG[mode];
          const isActive = activeMode === mode;

          return (
            <motion.button
              key={mode}
              type="button"
              disabled={isLoading}
              whileHover={isLoading ? undefined : { scale: 1.03 }}
              whileTap={isLoading ? undefined : { scale: 0.97 }}
              className={cn(
                buttonVariants({
                  variant: isActive ? "default" : "outline",
                  size: "sm",
                }),
                "gap-1.5 transition-colors duration-200",
              )}
              onClick={() => onModeChange(mode)}
              aria-pressed={isActive}
            >
              <span aria-hidden="true">{config.emoji}</span>
              <span>{t(config.labelKey, language)}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
