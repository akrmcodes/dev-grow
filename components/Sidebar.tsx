"use client";

import type { UIMessage } from "ai";
import { ChatInput, type ChatInputHandle } from "@/components/ChatInput";
import { ChatPanel } from "@/components/ChatPanel";
import { ModeSelector } from "@/components/ModeSelector";
import { ScorecardPanel } from "@/components/ScorecardPanel";
import type { Mode } from "@/lib/prompts";
import type { ScorecardResult } from "@/lib/schemas";
import type { Language } from "@/lib/translations";
import { cn } from "@/lib/utils";

type SidebarProps = {
  language: Language;
  activeMode: Mode | null;
  onModeChange: (mode: Mode) => void;
  onModeDismiss: () => void;
  isLoading: boolean;
  messages: UIMessage[];
  error: Error | undefined;
  validationError: string | null;
  code: string;
  onCodeChange: (value: string) => void;
  canSend: boolean;
  onSend: () => void;
  onStop: () => void;
  chatInputRef: React.RefObject<ChatInputHandle | null>;
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
  onModeDismiss,
  isLoading,
  messages,
  error,
  validationError,
  code,
  onCodeChange,
  canSend,
  onSend,
  onStop,
  chatInputRef,
  scorecardData,
  scorecardLoading,
  scorecardError,
  onFetchScorecard,
  onRetryScorecard,
}: SidebarProps) {
  return (
    <aside className={cn("flex h-full min-h-[320px] flex-col gap-3")}>
      <ModeSelector
        activeMode={activeMode}
        onModeChange={onModeChange}
        isLoading={isLoading}
        language={language}
      />

      {validationError && (
        <p className="text-sm text-destructive" role="alert">
          {validationError}
        </p>
      )}

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-16 bg-gradient-to-t from-background/80 to-transparent"
        />
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          error={error}
          language={language}
        />
        <ChatInput
          ref={chatInputRef}
          value={code}
          onChange={onCodeChange}
          activeMode={activeMode}
          onModeDismiss={onModeDismiss}
          isStreaming={isLoading}
          canSend={canSend}
          onSend={onSend}
          onStop={onStop}
          language={language}
        />
      </div>

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
