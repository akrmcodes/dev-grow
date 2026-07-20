"use client";

import type { UIMessage } from "ai";
import { ChatPanel } from "@/components/ChatPanel";
import { ModeSelector } from "@/components/ModeSelector";
import { ScorecardPanel } from "@/components/ScorecardPanel";
import type { Mode } from "@/lib/prompts";
import type { ScorecardResult } from "@/lib/schemas";
import { cn } from "@/lib/utils";

type SidebarProps = {
  isRTL: boolean;
  activeMode: Mode;
  onModeChange: (mode: Mode) => void;
  onModeSubmit: (mode: Mode) => void;
  isLoading: boolean;
  messages: UIMessage[];
  error: Error | undefined;
  validationError: string | null;
  scorecardData: ScorecardResult | null;
  scorecardLoading: boolean;
  scorecardError: string | null;
  onFetchScorecard: () => void;
  onRetryScorecard: () => void;
};

export function Sidebar({
  isRTL,
  activeMode,
  onModeChange,
  onModeSubmit,
  isLoading,
  messages,
  error,
  validationError,
  scorecardData,
  scorecardLoading,
  scorecardError,
  onFetchScorecard,
  onRetryScorecard,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full min-h-[320px] flex-col gap-3 px-4 py-3 md:border-l md:border-border",
      )}
    >
      <ModeSelector
        activeMode={activeMode}
        onModeChange={onModeChange}
        onSubmit={onModeSubmit}
        isLoading={isLoading}
        isRTL={isRTL}
      />

      {validationError && (
        <p className="text-sm text-destructive" role="alert">
          {validationError}
        </p>
      )}

      <ChatPanel
        messages={messages}
        isLoading={isLoading}
        error={error}
        isRTL={isRTL}
      />

      <ScorecardPanel
        data={scorecardData}
        isLoading={scorecardLoading}
        error={scorecardError}
        isRTL={isRTL}
        onRetry={onRetryScorecard}
        onScoreCode={onFetchScorecard}
      />
    </aside>
  );
}
