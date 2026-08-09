"use client";

import { Languages, Moon, PanelLeft, PanelRight, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useMemo, useSyncExternalStore } from "react";
import { NavBar, type TubelightNavItem } from "@/components/ui/tubelight-navbar";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/BrandLogo";
import { type Language, t } from "@/lib/translations";

function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

type AppHeaderProps = {
  language: Language;
  onLanguageToggle: () => void;
  onHistoryToggle: () => void;
  isHistoryOpen: boolean;
};

/**
 * DevGrow chrome: Tubelight navbar for language + theme, plus mobile history toggle.
 */
export function AppHeader({
  language,
  onLanguageToggle,
  onHistoryToggle,
  isHistoryOpen,
}: AppHeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const isArabic = language === "ar";
  const isDark = mounted ? resolvedTheme === "dark" : true;
  const HistoryIcon = isArabic ? PanelRight : PanelLeft;

  const items = useMemo<TubelightNavItem[]>(
    () => [
      {
        name: "language",
        label: isArabic ? "EN" : "AR",
        icon: Languages,
        onClick: onLanguageToggle,
        ariaLabel: isArabic
          ? t("switchToEnglish", language)
          : t("switchToArabic", language),
      },
      {
        name: "theme",
        label: isDark ? t("themeLight", language) : t("themeDark", language),
        icon: isDark ? Sun : Moon,
        onClick: () => setTheme(isDark ? "light" : "dark"),
        ariaLabel: isDark
          ? t("switchToLight", language)
          : t("switchToDark", language),
      },
    ],
    [isArabic, isDark, language, onLanguageToggle, setTheme],
  );

  return (
    <>
      {/* Mobile history + brand — clears the floating top area on small screens */}
      <div className="pointer-events-none fixed top-0 inset-x-0 z-[60] flex h-14 items-center px-3 md:hidden">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="pointer-events-auto rounded-full border border-border/60 bg-background/70 shadow-sm backdrop-blur-md"
          aria-label={t("toggleHistory", language)}
          aria-expanded={isHistoryOpen}
          onClick={onHistoryToggle}
        >
          <HistoryIcon className="size-4" />
        </Button>

        <h1 className="pointer-events-none ms-2 flex items-center gap-2 text-base font-bold tracking-tight text-foreground">
          <BrandLogo className="size-5 text-foreground" title="DevGrow" />
          <span>DevGrow</span>
        </h1>
      </div>

      <NavBar items={items} />

      {/* Top clearance: mobile brand row / desktop floating tubelight */}
      <div className="h-14 shrink-0 sm:h-[4.5rem]" aria-hidden="true" />
    </>
  );
}
