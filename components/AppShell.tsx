"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import type { ChatInputHandle } from "@/components/ChatInput";
import { CodeEditor } from "@/components/CodeEditor";
import { Sidebar } from "@/components/Sidebar";
import type { Mode } from "@/lib/prompts";
import type { ScorecardResult } from "@/lib/schemas";
import { type Language, t } from "@/lib/translations";
import { cn } from "@/lib/utils";

export function AppShell() {
  const [code, setCode] = useState("");
  const [instruction, setInstruction] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [mode, setMode] = useState<Mode | null>("review");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [scorecardData, setScorecardData] = useState<ScorecardResult | null>(
    null,
  );
  const [scorecardLoading, setScorecardLoading] = useState(false);
  const [scorecardError, setScorecardError] = useState<string | null>(null);
  const chatInputRef = useRef<ChatInputHandle>(null);

  const { messages, sendMessage, status, error, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";
  const isRTL = language === "ar";
  const canSend =
    Boolean(mode) &&
    Boolean(code.trim() || instruction.trim()) &&
    !isLoading;

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [isRTL, language]);

  const fetchScorecard = useCallback(async () => {
    if (!code.trim()) {
      setValidationError(t("validationPasteCode", language));
      return;
    }

    setScorecardLoading(true);
    setScorecardError(null);

    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const body = (await res.json()) as ScorecardResult | { error?: string };

      if (!res.ok) {
        setScorecardError(
          "error" in body && body.error ? body.error : "SCORE_UNAVAILABLE",
        );
        setScorecardData(null);
        return;
      }

      setScorecardData(body as ScorecardResult);
    } catch {
      setScorecardError("SCORE_UNAVAILABLE");
      setScorecardData(null);
    } finally {
      setScorecardLoading(false);
    }
  }, [code, language]);

  const handleLanguageToggle = () => {
    setLanguage((current) => (current === "en" ? "ar" : "en"));
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleInstructionChange = (value: string) => {
    setInstruction(value);
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleModeChange = (selectedMode: Mode) => {
    setMode(selectedMode);
    requestAnimationFrame(() => {
      chatInputRef.current?.focus();
    });
  };

  const handleModeDismiss = () => {
    setMode(null);
  };

  const handleSend = () => {
    if (!code.trim() && !instruction.trim()) {
      setValidationError(t("validationEmpty", language));
      return;
    }

    if (!code.trim()) {
      setValidationError(t("validationPasteCode", language));
      return;
    }

    if (!mode) {
      return;
    }

    setValidationError(null);

    const text = instruction.trim() || t("defaultInstruction", language);
    void sendMessage({ text }, { body: { mode, code } });
    setInstruction("");

    if (mode === "review") {
      void fetchScorecard();
    }
  };

  const handleStop = () => {
    stop();
  };

  return (
    <div
      className={cn(
        "flex min-h-dvh flex-col",
        isRTL && "font-arabic",
      )}
    >
      <AppHeader language={language} onLanguageToggle={handleLanguageToggle} />

      <motion.main
        key={language}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2"
      >
        <section className="flex min-h-[400px] flex-col bg-surface/50 p-4 md:min-h-0 md:p-6">
          <CodeEditor
            value={code}
            onChange={handleCodeChange}
            language={language}
          />
        </section>

        <section className="flex min-h-[320px] flex-col md:min-h-0">
          <Sidebar
            language={language}
            activeMode={mode}
            onModeChange={handleModeChange}
            onModeDismiss={handleModeDismiss}
            isLoading={isLoading}
            messages={messages}
            error={error}
            validationError={validationError}
            instruction={instruction}
            onInstructionChange={handleInstructionChange}
            canSend={canSend}
            onSend={handleSend}
            onStop={handleStop}
            chatInputRef={chatInputRef}
            scorecardData={scorecardData}
            scorecardLoading={scorecardLoading}
            scorecardError={scorecardError}
            onFetchScorecard={fetchScorecard}
            onRetryScorecard={fetchScorecard}
          />
        </section>
      </motion.main>

      <footer className="shrink-0 border-t border-border py-3 text-center text-xs text-muted-foreground">
        {t("footerCredit", language)}
      </footer>
    </div>
  );
}
