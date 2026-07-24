"use client";

import type { UIMessage } from "ai";
import { ChatInput, type ChatInputHandle } from "@/components/ChatInput";
import { ChatPanel } from "@/components/ChatPanel";
import { EmptyHero } from "@/components/EmptyHero";
import { FileDropZone } from "@/components/FileDropZone";
import { ScorecardPanel } from "@/components/ScorecardPanel";
import type { Mode } from "@/lib/prompts";
import type { ScorecardResult } from "@/lib/schemas";
import type { Language } from "@/lib/translations";
import { cn } from "@/lib/utils";

type SidebarProps = {
  language: Language;
  activeMode: Mode | null;
  onModeChange: (mode: Mode) => void;
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
  uploadedFilename: string | null;
  onFileLoad: (content: string, filename: string) => void;
  onFileSelect: (file: File) => void;
  visibilityKey: number;
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
  uploadedFilename,
  onFileLoad,
  onFileSelect,
  visibilityKey,
  scorecardData,
  scorecardLoading,
  scorecardError,
  onFetchScorecard,
  onRetryScorecard,
}: SidebarProps) {
  const isEmpty = messages.length === 0 && !isLoading && !error;

  return (
    <aside className={cn("flex min-h-0 flex-1 flex-col gap-2")}>
      {validationError && (
        <p
          className="mx-auto w-full max-w-4xl px-4 text-sm text-destructive"
          role="alert"
        >
          {validationError}
        </p>
      )}

      <FileDropZone
        language={language}
        onFileLoad={onFileLoad}
        disabled={isLoading}
      >
        <div className="relative flex min-h-0 flex-1 flex-col">
          {/* Reserved canvas — hero absolute; messages fill same slot (zero CLS) */}
          <div className="relative min-h-0 flex-1">
            <EmptyHero visible={isEmpty} />
            <ChatPanel
              messages={messages}
              isLoading={isLoading}
              error={error}
              language={language}
              visibilityKey={visibilityKey}
            />
          </div>

          {/* Composer + scorecard dock under the hero */}
          <div className="relative z-10 mx-auto flex w-full max-w-xl shrink-0 flex-col gap-2.5 px-4 pb-1">
            <ChatInput
              ref={chatInputRef}
              value={code}
              onChange={onCodeChange}
              activeMode={activeMode}
              onModeChange={onModeChange}
              isStreaming={isLoading}
              canSend={canSend}
              onSend={onSend}
              onStop={onStop}
              language={language}
              uploadedFilename={uploadedFilename}
              onFileSelect={onFileSelect}
            />
            <ScorecardPanel
              data={scorecardData}
              isLoading={scorecardLoading}
              error={scorecardError}
              language={language}
              onRetry={onRetryScorecard}
              onScoreCode={onFetchScorecard}
            />
          </div>
        </div>
      </FileDropZone>
    </aside>
  );
}
