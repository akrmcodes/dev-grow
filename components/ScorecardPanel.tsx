"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ScorecardResult } from "@/lib/schemas";
import { type Language, type TranslationKey, t } from "@/lib/translations";

type ScorecardPanelProps = {
  data: ScorecardResult | null;
  isLoading: boolean;
  error: string | null;
  language: Language;
  onRetry: () => void;
  onScoreCode: () => void;
};

type ScoreRow = {
  key: keyof Pick<ScorecardResult, "readability" | "logic" | "documentation">;
  labelKey: TranslationKey;
};

const SCORE_ROWS: ScoreRow[] = [
  { key: "readability", labelKey: "readability" },
  { key: "logic", labelKey: "logic" },
  { key: "documentation", labelKey: "documentation" },
];

function getScoreBarColorValue(score: number): string {
  if (score >= 8) return "#10b981";
  if (score >= 5) return "#fbbf24";
  return "#ef4444";
}

function getOverallScore(data: ScorecardResult): number {
  return (data.readability + data.logic + data.documentation) / 3;
}

function getErrorMessage(error: string, language: Language): string {
  if (error === "RATE_LIMIT") {
    return t("errorRateLimit", language);
  }

  return t("scoreError", language);
}

type ScoreBarProps = {
  label: string;
  score: number;
};

function ScoreBar({ label, score }: ScoreBarProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-muted-foreground">
          {score.toFixed(1)}/10
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: "0%", backgroundColor: getScoreBarColorValue(score) }}
          animate={{
            width: `${(score / 10) * 100}%`,
            backgroundColor: getScoreBarColorValue(score),
          }}
          transition={{
            width: { duration: 0.8, ease: "easeOut" },
            backgroundColor: { duration: 0.3 },
          }}
        />
      </div>
    </div>
  );
}

function ScoreSkeleton() {
  return (
    <div className="space-y-4">
      {SCORE_ROWS.map((row) => (
        <div key={row.key} className="space-y-1.5">
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          <div className="h-2 animate-pulse rounded-full bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function ScorecardPanel({
  data,
  isLoading,
  error,
  language,
  onRetry,
  onScoreCode,
}: ScorecardPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const expanded = isOpen || isLoading;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mt-auto shrink-0 rounded-xl border border-border bg-card ring-1 ring-foreground/10"
    >
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center justify-between gap-2 text-start text-sm font-medium"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={expanded}
        >
          <span>{t("scoreTitle", language)}</span>
          <ChevronDown
            className={`size-4 shrink-0 text-muted-foreground transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading}
          onClick={onScoreCode}
          className="shrink-0"
        >
          {t("scoreCode", language)}
        </Button>
      </div>

      <motion.div
        initial={false}
        animate={{ height: expanded ? "auto" : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="space-y-4 border-t border-border px-4 py-3">
          {isLoading && !data && <ScoreSkeleton />}

          {error && !isLoading && (
            <div
              className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-3"
              role="alert"
            >
              <p className="text-sm text-destructive">
                {getErrorMessage(error, language)}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={onRetry}
              >
                {t("retry", language)}
              </Button>
            </div>
          )}

          <AnimatePresence>
            {data && (
              <motion.div
                key="scorecard-data"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t("overallScore", language)}
                  </p>
                  <p className="text-2xl font-bold tabular-nums">
                    {getOverallScore(data).toFixed(1)}
                    <span className="text-base font-normal text-muted-foreground">
                      /10
                    </span>
                  </p>
                </div>

                {SCORE_ROWS.map((row) => (
                  <ScoreBar
                    key={row.key}
                    label={t(row.labelKey, language)}
                    score={data[row.key]}
                  />
                ))}

                <blockquote className="border-s-2 border-primary/40 ps-3 text-sm italic text-muted-foreground">
                  {data.summary}
                </blockquote>
              </motion.div>
            )}
          </AnimatePresence>

          {!isLoading && !error && !data && (
            <p className="text-sm text-muted-foreground">
              {t("scoreEmpty", language)}
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
