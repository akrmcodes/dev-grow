"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import type { ChatInputHandle } from "@/components/ChatInput";
import { CustomCursor } from "@/components/CustomCursor";
import { FooterCredit } from "@/components/FooterCredit";
import { HistorySidebar } from "@/components/HistorySidebar";
import { Sidebar } from "@/components/Sidebar";
import {
  clearAllConversations,
  deleteConversation,
  generateConversationTitle,
  listConversations,
  loadConversation,
  saveConversation,
  type ConversationMetadata,
} from "@/lib/chat-db";
import { handleFileUpload } from "@/lib/handle-file-upload";
import { useVisibilitySafe } from "@/lib/hooks/use-visibility-safe";
import type { Mode } from "@/lib/prompts";
import type { ScorecardResult } from "@/lib/schemas";
import { type Language, t } from "@/lib/translations";
import { cn } from "@/lib/utils";

export function AppShell() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState<Language>("en");
  const [mode, setMode] = useState<Mode | null>("review");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [scorecardData, setScorecardData] = useState<ScorecardResult | null>(
    null,
  );
  const [scorecardLoading, setScorecardLoading] = useState(false);
  const [scorecardError, setScorecardError] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [conversationList, setConversationList] = useState<
    ConversationMetadata[]
  >([]);
  const [uploadedFilename, setUploadedFilename] = useState<string | null>(
    null,
  );
  const chatInputRef = useRef<ChatInputHandle>(null);
  const prevStatusRef = useRef<string | null>(null);
  const visibilityKey = useVisibilitySafe();

  const { messages, setMessages, sendMessage, status, error, stop } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";
  const isRTL = language === "ar";
  const canSend = Boolean(mode) && Boolean(code.trim()) && !isLoading;

  const refreshConversationList = useCallback(async () => {
    const list = await listConversations();
    setConversationList(list);
  }, []);

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [isRTL, language]);

  useEffect(() => {
    let cancelled = false;

    void listConversations().then((list) => {
      if (!cancelled) {
        setConversationList(list);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const resetScorecard = useCallback(() => {
    setScorecardData(null);
    setScorecardLoading(false);
    setScorecardError(null);
  }, []);

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

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setCode("");
    setUploadedFilename(null);
    setMode("review");
    setValidationError(null);
    setActiveConversationId(null);
    resetScorecard();
    setIsHistoryOpen(false);
  }, [resetScorecard, setMessages]);

  const persistConversation = useCallback(async () => {
    if (messages.length === 0) {
      return;
    }

    const conversationId = activeConversationId ?? crypto.randomUUID();
    const resolvedMode = mode ?? "review";

    await saveConversation({
      id: conversationId,
      title: generateConversationTitle(messages),
      messages,
      mode: resolvedMode,
      code,
    });

    setActiveConversationId(conversationId);
    await refreshConversationList();
  }, [activeConversationId, code, messages, mode, refreshConversationList]);

  useEffect(() => {
    const prevStatus = prevStatusRef.current;

    if (prevStatus === "streaming" && status === "ready") {
      void persistConversation();
    }

    prevStatusRef.current = status;
  }, [persistConversation, status]);

  const handleFileLoad = useCallback((content: string, filename: string) => {
    setCode(content);
    setUploadedFilename(filename);
    setValidationError(null);
    requestAnimationFrame(() => {
      chatInputRef.current?.focus();
    });
  }, []);

  const handleFileSelect = useCallback(
    (file: File) => {
      void handleFileUpload(file, language, handleFileLoad);
    },
    [handleFileLoad, language],
  );

  const handleLanguageToggle = () => {
    setLanguage((current) => (current === "en" ? "ar" : "en"));
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
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

  const handleSend = () => {
    if (!code.trim()) {
      setValidationError(t("validationPasteCode", language));
      return;
    }

    if (!mode) {
      return;
    }

    setValidationError(null);

    void sendMessage({ text: code }, { body: { mode, code } });

    if (mode === "review") {
      void fetchScorecard();
    }
  };

  const handleStop = () => {
    stop();
  };

  const handleSelectConversation = async (id: string) => {
    const conversation = await loadConversation(id);
    if (!conversation) {
      return;
    }

    setMessages(conversation.messages);
    setCode(conversation.code);
    setUploadedFilename(null);
    setMode(conversation.mode);
    setActiveConversationId(conversation.id);
    setValidationError(null);
    resetScorecard();
    setIsHistoryOpen(false);
  };

  const handleDeleteConversation = async (id: string) => {
    await deleteConversation(id);

    if (id === activeConversationId) {
      handleNewChat();
    }

    await refreshConversationList();
  };

  const handleClearAll = async () => {
    await clearAllConversations();
    handleNewChat();
    await refreshConversationList();
  };

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      lang={language}
      className={cn(
        // Rely on CSS `dir` for sidebar placement — avoid flex-row-reverse
        // which double-flips when document direction is already RTL.
        "flex h-dvh w-full flex-col overflow-hidden md:flex-row",
        isRTL && "font-arabic",
      )}
    >
      <CustomCursor />

      <HistorySidebar
        open={isHistoryOpen}
        setOpen={setIsHistoryOpen}
        language={language}
        conversations={conversationList}
        activeConversationId={activeConversationId}
        onSelect={(id) => void handleSelectConversation(id)}
        onDelete={(id) => void handleDeleteConversation(id)}
        onNewChat={handleNewChat}
        onClearAll={() => void handleClearAll()}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col pb-24 sm:pb-0">
        <AppHeader
          language={language}
          onLanguageToggle={handleLanguageToggle}
          onHistoryToggle={() => setIsHistoryOpen((open) => !open)}
          isHistoryOpen={isHistoryOpen}
        />

        <motion.main
          key={language}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="flex min-h-0 flex-1 flex-col"
        >
          {/* Full-bleed scroll column — content width is constrained inside ChatPanel */}
          <div className="flex min-h-0 w-full flex-1 flex-col py-3">
            <Sidebar
              language={language}
              activeMode={mode}
              onModeChange={handleModeChange}
              isLoading={isLoading}
              messages={messages}
              error={error}
              validationError={validationError}
              code={code}
              onCodeChange={handleCodeChange}
              canSend={canSend}
              onSend={handleSend}
              onStop={handleStop}
              chatInputRef={chatInputRef}
              uploadedFilename={uploadedFilename}
              onFileLoad={handleFileLoad}
              onFileSelect={handleFileSelect}
              visibilityKey={visibilityKey}
              scorecardData={scorecardData}
              scorecardLoading={scorecardLoading}
              scorecardError={scorecardError}
              onFetchScorecard={fetchScorecard}
              onRetryScorecard={fetchScorecard}
            />
          </div>
        </motion.main>

        <footer className="shrink-0 border-t border-border py-3">
          <FooterCredit language={language} />
        </footer>
      </div>
    </div>
  );
}
