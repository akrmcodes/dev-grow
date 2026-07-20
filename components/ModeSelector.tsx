"use client";

import { Button } from "@/components/ui/button";
import { MODE_CONFIG } from "@/lib/constants";
import type { Mode } from "@/lib/prompts";
import { cn } from "@/lib/utils";

type ModeSelectorProps = {
  activeMode: Mode;
  onModeChange: (mode: Mode) => void;
  onSubmit: (mode: Mode) => void;
  isLoading: boolean;
  isRTL: boolean;
};

const modes = Object.keys(MODE_CONFIG) as Mode[];

export function ModeSelector({
  activeMode,
  onModeChange,
  onSubmit,
  isLoading,
  isRTL,
}: ModeSelectorProps) {
  const handleClick = (mode: Mode) => {
    onModeChange(mode);
    onSubmit(mode);
  };

  return (
    <div className="shrink-0">
      <p className="mb-2 text-sm font-medium text-foreground">
        {isRTL ? "اختر وضعاً" : "Select a mode"}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {modes.map((mode) => {
          const config = MODE_CONFIG[mode];
          const isActive = activeMode === mode;

          return (
            <Button
              key={mode}
              variant={isActive ? "default" : "outline"}
              size="sm"
              disabled={isLoading}
              className={cn("gap-1.5 transition-colors duration-200")}
              onClick={() => handleClick(mode)}
              aria-pressed={isActive}
            >
              <span aria-hidden="true">{config.emoji}</span>
              <span>{isRTL ? config.labelAr : config.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
