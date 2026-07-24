"use client";

import { AnimatePresence, motion, useMotionValue, useTransform, animate } from "framer-motion";
import {
  BookOpenText,
  Brain,
  ChevronDown,
  Sparkles,
  Type,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { ScorecardResult } from "@/lib/schemas";
import { type Language, type TranslationKey, t } from "@/lib/translations";
import { cn } from "@/lib/utils";

type ScorecardPanelProps = {
  data: ScorecardResult | null;
  isLoading: boolean;
  error: string | null;
  language: Language;
  onRetry: () => void;
  onScoreCode: () => void;
};

type MetricKey = keyof Pick<
  ScorecardResult,
  "readability" | "logic" | "documentation"
>;

type MetricDef = {
  key: MetricKey;
  labelKey: TranslationKey;
  Icon: typeof Type;
};

const METRICS: MetricDef[] = [
  { key: "readability", labelKey: "readability", Icon: Type },
  { key: "logic", labelKey: "logic", Icon: Brain },
  { key: "documentation", labelKey: "documentation", Icon: BookOpenText },
];

const RING_SIZE = 56;
const RING_STROKE = 4.5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function getOverallScore(data: ScorecardResult): number {
  return (data.readability + data.logic + data.documentation) / 3;
}

function getTone(score: number): {
  stroke: string;
  glow: string;
  label: string;
} {
  if (score >= 8) {
    return {
      stroke: "var(--foreground)",
      glow: "color-mix(in oklch, var(--foreground) 30%, transparent)",
      label: "excellent",
    };
  }
  if (score >= 5) {
    return {
      stroke: "var(--muted-foreground)",
      glow: "color-mix(in oklch, var(--muted-foreground) 28%, transparent)",
      label: "fair",
    };
  }
  return {
    stroke: "color-mix(in oklch, var(--foreground) 45%, transparent)",
    glow: "color-mix(in oklch, var(--foreground) 18%, transparent)",
    label: "needs-work",
  };
}

function getErrorMessage(error: string, language: Language): string {
  if (error === "RATE_LIMIT") {
    return t("errorRateLimit", language);
  }
  return t("scoreError", language);
}

function AnimatedNumber({ value }: { value: number }) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (v) => v.toFixed(1));
  const [display, setDisplay] = useState("0.0");

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
    });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [motionValue, rounded, value]);

  return (
    <span className="tabular-nums tracking-tight">{display}</span>
  );
}

function ScoreRing({
  score,
  isLoading,
}: {
  score: number | null;
  isLoading: boolean;
}) {
  const safeScore = score ?? 0;
  const tone = getTone(safeScore);
  const progress = Math.max(0, Math.min(1, safeScore / 10));
  const offset = RING_CIRCUMFERENCE * (1 - progress);
  const showScore = score !== null && !isLoading;

  return (
    <div className="relative size-14 shrink-0">
      <motion.svg
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        className="-rotate-90"
        aria-hidden="true"
        animate={isLoading && score === null ? { rotate: 360 } : { rotate: -90 }}
        transition={
          isLoading && score === null
            ? { duration: 1.1, repeat: Infinity, ease: "linear" }
            : { duration: 0.2 }
        }
        style={{ originX: "50%", originY: "50%" }}
      >
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={RING_STROKE}
          className="text-muted/50"
        />
        <motion.circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke={
            isLoading && score === null ? "var(--foreground)" : tone.stroke
          }
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={RING_CIRCUMFERENCE}
          initial={{ strokeDashoffset: RING_CIRCUMFERENCE }}
          animate={{
            strokeDashoffset:
              isLoading && score === null
                ? RING_CIRCUMFERENCE * 0.72
                : offset,
          }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            filter: `drop-shadow(0 0 6px ${
              isLoading && score === null
                ? "color-mix(in oklch, var(--foreground) 30%, transparent)"
                : tone.glow
            })`,
          }}
        />
      </motion.svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {isLoading && score === null ? (
          <Sparkles className="size-3.5 animate-pulse text-primary" />
        ) : (
          <span className="text-[15px] font-semibold leading-none text-foreground">
            {showScore || score !== null ? (
              <AnimatedNumber value={safeScore} />
            ) : (
              "—"
            )}
          </span>
        )}
      </div>
    </div>
  );
}

function MetricChip({
  label,
  score,
  Icon,
  delay,
}: {
  label: string;
  score: number;
  Icon: typeof Type;
  delay: number;
}) {
  const tone = getTone(score);

  return (
    <div className="min-w-0 flex-1 space-y-1.5">
      <div className="flex items-center justify-between gap-1.5">
        <span className="flex min-w-0 items-center gap-1 text-[11px] font-medium text-muted-foreground">
          <Icon className="size-3 shrink-0 opacity-70" aria-hidden="true" />
          <span className="truncate">{label}</span>
        </span>
        <span className="shrink-0 text-[11px] font-semibold tabular-nums text-foreground/90">
          {score.toFixed(1)}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-muted/80">
        <motion.div
          className="h-full w-full origin-left rounded-full rtl:origin-right"
          style={{ backgroundColor: tone.stroke }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: Math.max(0, Math.min(1, score / 10)) }}
          transition={{
            duration: 0.75,
            delay,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      </div>
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
  const hasPayload = Boolean(data) || Boolean(error) || isLoading;
  const [collapsed, setCollapsed] = useState(false);
  const overall = data ? getOverallScore(data) : null;

  const expanded = hasPayload && !collapsed;

  const handleScore = () => {
    setCollapsed(false);
    onScoreCode();
  };

  return (
    <motion.section
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      aria-label={t("scoreTitle", language)}
      className={cn(
        "shrink-0 overflow-hidden rounded-2xl border border-border/60",
        "bg-card/70 shadow-sm backdrop-blur-xl",
        "ring-1 ring-foreground/[0.04]",
      )}
    >
      {/* Compact header strip — always visible */}
      <div className="flex items-center gap-3 px-3.5 py-2.5">
        <ScoreRing score={overall} isLoading={isLoading} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              {t("scoreTitle", language)}
            </h2>
            {data && !isLoading && (
              <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                {t("overallScore", language)}
              </span>
            )}
          </div>

          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {isLoading
              ? t("thinking", language)
              : data
                ? data.summary
                : error
                  ? getErrorMessage(error, language)
                  : t("scoreEmpty", language)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button
            variant={data ? "ghost" : "default"}
            size="sm"
            disabled={isLoading}
            onClick={handleScore}
            className={cn(
              "h-7 gap-1 rounded-full px-2.5 text-xs",
              !data && "shadow-[0_0_0_1px] shadow-primary/20",
            )}
          >
            <Sparkles className="size-3" aria-hidden="true" />
            {t("scoreCode", language)}
          </Button>

          {hasPayload && (
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="size-7 rounded-full text-muted-foreground"
              aria-expanded={expanded}
              aria-label={t("scoreTitle", language)}
              onClick={() => setCollapsed((c) => !c)}
            >
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform duration-300",
                  expanded && "rotate-180",
                )}
              />
            </Button>
          )}
        </div>
      </div>

      {/* Expandable metrics — only when there is something to show */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="score-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/50 px-3.5 pt-2.5 pb-3">
              {error && !isLoading && !data && (
                <div
                  className="flex items-center justify-between gap-3 rounded-xl bg-destructive/8 px-3 py-2"
                  role="alert"
                >
                  <p className="text-xs text-destructive">
                    {getErrorMessage(error, language)}
                  </p>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={onRetry}
                    className="shrink-0 rounded-full"
                  >
                    {t("retry", language)}
                  </Button>
                </div>
              )}

              {isLoading && !data && (
                <div className="flex gap-3">
                  {METRICS.map((metric) => (
                    <div key={metric.key} className="min-w-0 flex-1 space-y-1.5">
                      <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                      <div className="h-1 animate-pulse rounded-full bg-muted" />
                    </div>
                  ))}
                </div>
              )}

              {data && (
                <div className="flex gap-3 sm:gap-4">
                  {METRICS.map((metric, index) => (
                    <MetricChip
                      key={metric.key}
                      label={t(metric.labelKey, language)}
                      score={data[metric.key]}
                      Icon={metric.Icon}
                      delay={0.08 + index * 0.08}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
