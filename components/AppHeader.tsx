"use client";

import { LanguageToggle } from "@/components/LanguageToggle";
import { ThemeToggle } from "@/components/ThemeToggle";

type AppHeaderProps = {
  language: "en" | "ar";
  onLanguageToggle: () => void;
};

export function AppHeader({ language, onLanguageToggle }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <h1 className="text-lg font-bold tracking-tight">
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

      <div className="flex items-center gap-1">
        <LanguageToggle language={language} onToggle={onLanguageToggle} />
        <ThemeToggle />
      </div>
    </header>
  );
}
