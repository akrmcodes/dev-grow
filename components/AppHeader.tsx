"use client";

import { PanelLeft } from "lucide-react";
import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { type Language, t } from "@/lib/translations";

type AppHeaderProps = {
  language: Language;
  onLanguageToggle: () => void;
  onHistoryToggle: () => void;
  isHistoryOpen: boolean;
};

export function AppHeader({
  language,
  onLanguageToggle,
  onHistoryToggle,
  isHistoryOpen,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex min-w-0 items-center gap-1">
        {/* Mobile: opens Aceternity overlay. Desktop: rail expands on hover. */}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="md:hidden"
          aria-label={t("toggleHistory", language)}
          aria-expanded={isHistoryOpen}
          onClick={onHistoryToggle}
        >
          <PanelLeft className="size-4" />
        </Button>

        <h1 className="min-w-0 text-lg font-bold tracking-tight md:hidden">
          <span
            className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent"
            aria-hidden="true"
          >
            🌱{" "}
          </span>
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            DevGrow
          </span>
        </h1>
      </div>

      <div className="ms-auto flex shrink-0 flex-wrap items-center justify-end gap-1">
        <LanguageToggle language={language} onToggle={onLanguageToggle} />
        <ThemeToggle language={language} />
      </div>
    </header>
  );
}
