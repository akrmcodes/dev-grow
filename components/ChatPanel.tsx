"use client";

import type { UIMessage } from "ai";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { AiThinkingIndicator } from "@/components/AiThinkingIndicator";
import { AssistantMessage } from "@/components/AssistantMessage";
import { useSmartScroll } from "@/lib/hooks/use-smart-scroll";
import { type Language, t } from "@/lib/translations";
import { cn } from "@/lib/utils";

type ChatPanelProps = {
  messages: UIMessage[];
  isLoading: boolean;
  error: Error | undefined;
  language: Language;
  visibilityKey: number;
};

const fadeIn = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
};

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter(
      (part): part is { type: "text"; text: string } => part.type === "text",
    )
    .map((part) => part.text)
    .join("");
}

function getApiErrorCode(error: Error | undefined): string | null {
  if (!error) return null;

  try {
    const parsed = JSON.parse(error.message) as { error?: string };
    return parsed.error ?? null;
  } catch {
    return error.message.includes("RATE_LIMIT") ? "RATE_LIMIT" : null;
  }
}

function getErrorMessage(error: Error | undefined, language: Language): string {
  const code = getApiErrorCode(error);

  if (code === "RATE_LIMIT") {
    return t("errorRateLimit", language);
  }

  return t("errorGeneric", language);
}

/** True while waiting for the first assistant stream token. */
function isAwaitingFirstToken(
  messages: UIMessage[],
  isLoading: boolean,
): boolean {
  if (!isLoading) return false;

  const last = messages[messages.length - 1];
  if (!last || last.role !== "assistant") return true;

  return getMessageText(last).length === 0;
}

export function ChatPanel({
  messages,
  isLoading,
  error,
  language,
  visibilityKey,
}: ChatPanelProps) {
  const isRTL = language === "ar";
  const showThinking = isAwaitingFirstToken(messages, isLoading);

  const { scrollContainerRef, bottomSentinelRef } = useSmartScroll(
    [messages, isLoading, showThinking, visibilityKey],
    // Instant scroll while tokens arrive — smooth stacks and causes stutter.
    { preferInstant: isLoading },
  );

  const visibleMessages = messages.filter((message) => {
    const text = getMessageText(message);
    return text.length > 0 || message.role === "user";
  });

  const streamingAssistantId =
    isLoading &&
    visibleMessages.length > 0 &&
    visibleMessages[visibleMessages.length - 1]?.role === "assistant"
      ? visibleMessages[visibleMessages.length - 1]?.id
      : null;

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col">
      <div
        ref={scrollContainerRef}
        className="chat-scroll flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto will-change-transform"
      >
        <MotionConfig reducedMotion="never">
          <div
            key={visibilityKey}
            className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 pt-2 pb-6"
          >
            <AnimatePresence initial={false}>
              {visibleMessages.map((message) => {
                const text = getMessageText(message);
                const isUser = message.role === "user";
                const isStreamingAssistant =
                  !isUser && message.id === streamingAssistantId;

                return (
                  <motion.div
                    key={message.id}
                    initial={fadeIn.initial}
                    animate={fadeIn.animate}
                    transition={fadeIn.transition}
                    className={cn(
                      "flex w-full",
                      isUser
                        ? isRTL
                          ? "justify-start"
                          : "justify-end"
                        : "justify-start",
                    )}
                  >
                    {isUser ? (
                      <div
                        className={cn(
                          "max-w-[min(92%,36rem)] rounded-2xl px-3.5 py-2.5 text-sm",
                          "bg-foreground/[0.06] text-foreground",
                        )}
                      >
                        <p
                          className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed"
                          dir="ltr"
                        >
                          {text}
                        </p>
                      </div>
                    ) : (
                      <AssistantMessage
                        text={text}
                        language={language}
                        isStreaming={isStreamingAssistant}
                      />
                    )}
                  </motion.div>
                );
              })}

              {showThinking ? (
                <motion.div
                  key="thinking"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4, transition: { duration: 0.18 } }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="flex w-full justify-start"
                >
                  <AiThinkingIndicator language={language} />
                </motion.div>
              ) : null}

              {error ? (
                <motion.div
                  key="error"
                  initial={fadeIn.initial}
                  animate={fadeIn.animate}
                  exit={{ opacity: 0, y: 10 }}
                  transition={fadeIn.transition}
                  className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  role="alert"
                >
                  {getErrorMessage(error, language)}
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div ref={bottomSentinelRef} aria-hidden="true" />
          </div>
        </MotionConfig>
      </div>
    </div>
  );
}
