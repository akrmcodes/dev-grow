"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { CodeEditor } from "@/components/CodeEditor";
import { Sidebar } from "@/components/Sidebar";
import type { Mode } from "@/lib/prompts";
import { cn } from "@/lib/utils";

type Language = "en" | "ar";

export function AppShell() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [mode, setMode] = useState<Mode>("review");
  const [validationError, setValidationError] = useState<string | null>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";
  const isRTL = language === "ar";

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [isRTL, language]);

  const handleLanguageToggle = () => {
    setLanguage((current) => (current === "en" ? "ar" : "en"));
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleModeSubmit = (selectedMode: Mode) => {
    setMode(selectedMode);

    if (!code.trim()) {
      setValidationError(
        isRTL ? "الصق الكود أولاً! 🌱" : "Paste some code first! 🌱",
      );
      return;
    }

    setValidationError(null);
    void sendMessage({ text: code }, { body: { mode: selectedMode, code } });
  };

  return (
    <div
      className={cn(
        "flex min-h-dvh flex-col",
        isRTL && "font-arabic",
      )}
    >
      <AppHeader language={language} onLanguageToggle={handleLanguageToggle} />

      <main className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2">
        <section className="flex min-h-[400px] flex-col bg-surface/50 p-4 md:min-h-0 md:p-6">
          <CodeEditor value={code} onChange={handleCodeChange} isRTL={isRTL} />
        </section>

        <section className="flex min-h-[320px] flex-col md:min-h-0">
          <Sidebar
            isRTL={isRTL}
            activeMode={mode}
            onModeChange={setMode}
            onModeSubmit={handleModeSubmit}
            isLoading={isLoading}
            messages={messages}
            error={error}
            validationError={validationError}
          />
        </section>
      </main>

      <footer className="shrink-0 border-t border-border py-3 text-center text-xs text-muted-foreground">
        Powered by OpenRouter · google/gemma-4-31b-it:free
      </footer>
    </div>
  );
}
