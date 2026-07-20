"use client";

import type { UIMessage } from "ai";
import { ChatPanel } from "@/components/ChatPanel";
import { ModeSelector } from "@/components/ModeSelector";
import type { Mode } from "@/lib/prompts";
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

      <details className="mt-auto shrink-0 rounded-xl border border-border bg-card ring-1 ring-foreground/10">
        <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
          <span className="flex items-center justify-between gap-2">
            {isRTL ? "تقييم الكود 📊" : "Code Score 📊"}
            <span className="text-xs text-muted-foreground" aria-hidden="true">
              ▾
            </span>
          </span>
        </summary>
        <div className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
          {isRTL
            ? "سيظهر التقييم هنا بعد المراجعة"
            : "Scores will appear here after review"}
        </div>
      </details>
    </aside>
  );
}
