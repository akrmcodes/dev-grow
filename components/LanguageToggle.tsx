"use client";

import { Button } from "@/components/ui/button";

type LanguageToggleProps = {
  language: "en" | "ar";
  onToggle: () => void;
};

export function LanguageToggle({ language, onToggle }: LanguageToggleProps) {
  const isArabic = language === "ar";

  return (
    <Button
      variant="ghost"
      size="sm"
      className="min-w-9 font-semibold tracking-wide"
      onClick={onToggle}
      aria-label={
        isArabic ? "Switch to English" : "Switch to Arabic"
      }
    >
      {isArabic ? "EN" : "AR"}
    </Button>
  );
}
