"use client";

import type { UIMessage } from "ai";
import { ChatPanel } from "@/components/ChatPanel";
import { ModeSelector } from "@/components/ModeSelector";
import { ScorecardPanel } from "@/components/ScorecardPanel";
import type { Mode } from "@/lib/prompts";
import type { ScorecardResult } from "@/lib/schemas";
import type { Language } from "@/lib/translations";
import { cn } from "@/lib/utils";

type SidebarProps = {
  language: Language;
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
  language,
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
        "flex h-full min-h-[320px] flex-col gap-3 px-4 py-3 md:border-s md:border-border",
      )}
    >
      <ModeSelector
        activeMode={activeMode}
        onModeChange={onModeChange}
        onSubmit={onModeSubmit}
        isLoading={isLoading}
        language={language}
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
        language={language}
      />

      <ScorecardPanel
        data={scorecardData}
        isLoading={scorecardLoading}
        error={scorecardError}
        language={language}
        onRetry={onRetryScorecard}
        onScoreCode={onFetchScorecard}
      />
    </aside>
  );
}
