import { type Language, t } from "@/lib/translations";

export function formatTimeAgo(isoDate: string, language: Language): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return t("timeJustNow", language);
  }

  if (diffMinutes < 60) {
    return t("timeMinutesAgo", language).replace("{n}", String(diffMinutes));
  }

  if (diffHours < 24) {
    return t("timeHoursAgo", language).replace("{n}", String(diffHours));
  }

  if (diffDays === 1) {
    return t("timeYesterday", language);
  }

  if (diffDays < 7) {
    return t("timeDaysAgo", language).replace("{n}", String(diffDays));
  }

  return date.toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}
