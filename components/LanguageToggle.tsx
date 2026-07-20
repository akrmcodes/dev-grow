"use client";

import { Button } from "@/components/ui/button";
import { type Language, t } from "@/lib/translations";

type LanguageToggleProps = {
  language: Language;
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
        isArabic ? t("switchToEnglish", language) : t("switchToArabic", language)
      }
    >
      {isArabic ? "EN" : "AR"}
    </Button>
  );
}
