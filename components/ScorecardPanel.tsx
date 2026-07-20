"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  RATE_LIMIT_MESSAGE,
  RATE_LIMIT_MESSAGE_AR,
} from "@/lib/constants";
import type { ScorecardResult } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type ScorecardPanelProps = {
  data: ScorecardResult | null;
  isLoading: boolean;
  error: string | null;
  isRTL: boolean;
  onRetry: () => void;
  onScoreCode: () => void;
};

type ScoreRow = {
  key: keyof Pick<ScorecardResult, "readability" | "logic" | "documentation">;
  labelEn: string;
  labelAr: string;
};

const SCORE_ROWS: ScoreRow[] = [
  { key: "readability", labelEn: "Readability", labelAr: "القابلية للقراءة" },
  { key: "logic", labelEn: "Logic", labelAr: "المنطق" },
  { key: "documentation", labelEn: "Documentation", labelAr: "التوثيق" },
];

function getScoreBarColor(score: number): string {
  if (score >= 8) return "bg-emerald-500";
  if (score >= 5) return "bg-amber-400";
  return "bg-red-500";
}

function getOverallScore(data: ScorecardResult): number {
  return (data.readability + data.logic + data.documentation) / 3;
}

function getErrorMessage(error: string, isRTL: boolean): string {
  if (error === "RATE_LIMIT") {
    return isRTL ? RATE_LIMIT_MESSAGE_AR : RATE_LIMIT_MESSAGE;
  }

  return isRTL ? "تعذر إنشاء التقييم." : "Unable to generate score.";
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
          className={cn("h-full rounded-full", getScoreBarColor(score))}
          initial={{ width: "0%" }}
          animate={{ width: `${(score / 10) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
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
  isRTL,
  onRetry,
  onScoreCode,
}: ScorecardPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const expanded = isOpen || isLoading;

  return (
    <div className="mt-auto shrink-0 rounded-xl border border-border bg-card ring-1 ring-foreground/10">
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left text-sm font-medium"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={expanded}
        >
          <span>{isRTL ? "تقييم الكود 📊" : "Code Score 📊"}</span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform duration-300",
              expanded && "rotate-180",
            )}
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
          {isRTL ? "قيّم الكود" : "Score Code"}
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
                {getErrorMessage(error, isRTL)}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={onRetry}
              >
                {isRTL ? "إعادة المحاولة" : "Retry"}
              </Button>
            </div>
          )}

          <AnimatePresence>
            {data && (
              <motion.div
                key="scorecard-data"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="text-center">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {isRTL ? "النتيجة الإجمالية" : "Overall Score"}
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
                    label={isRTL ? row.labelAr : row.labelEn}
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
              {isRTL
                ? "اضغط «قيّم الكود» أو اختر وضع المراجعة"
                : "Click Score Code or use Review mode to generate a score"}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
