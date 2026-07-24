"use client";

import type { UIMessage } from "ai";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { AiThinkingIndicator } from "@/components/AiThinkingIndicator";
import { CopyMessageButton } from "@/components/CopyMessageButton";
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
  transition: { duration: 0.25, ease: "easeOut" as const },
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

  const { scrollContainerRef, bottomSentinelRef } = useSmartScroll([
    messages,
    isLoading,
    showThinking,
    visibilityKey,
  ]);

  const visibleMessages = messages.filter((message) => {
    const text = getMessageText(message);
    return text.length > 0 || message.role === "user";
  });

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col">
      <div
        ref={scrollContainerRef}
        className="chat-scroll flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto will-change-transform"
      >
        {/* Content stays centered; scrollbar sits on the full-bleed column edge */}
        <MotionConfig reducedMotion="never">
          <div
            key={visibilityKey}
            className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-4 pt-1 pb-4"
          >
            <AnimatePresence initial={false}>
              {visibleMessages.map((message) => {
                const text = getMessageText(message);
                const isUser = message.role === "user";

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
                        : isRTL
                          ? "justify-end"
                          : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[92%] rounded-xl px-3 py-2 text-sm",
                        isUser
                          ? "bg-primary/10 text-foreground"
                          : "group relative border border-border bg-card text-card-foreground",
                      )}
                    >
                      {!isUser && (
                        <CopyMessageButton text={text} language={language} />
                      )}
                      {isUser ? (
                        <p className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed">
                          {text}
                        </p>
                      ) : (
                        <div
                          className={cn(
                            "prose prose-sm dark:prose-invert max-w-none",
                            "prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0",
                            "prose-code:text-foreground/80",
                          )}
                        >
                          <ReactMarkdown
                            rehypePlugins={[rehypeHighlight]}
                            components={{
                              pre: ({ children }) => (
                                <pre
                                  dir="ltr"
                                  className="my-2 overflow-x-auto rounded-lg bg-[#0d1117] p-3 text-xs"
                                >
                                  {children}
                                </pre>
                              ),
                              code: ({ className, children, ...props }) => {
                                const isBlock =
                                  className?.includes("language-");

                                if (isBlock) {
                                  return (
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  );
                                }

                                return (
                                  <code
                                    className="rounded bg-muted px-1 py-0.5 font-mono text-xs"
                                    dir="ltr"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                );
                              },
                            }}
                          >
                            {text}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
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
                  className={cn(
                    "flex w-full",
                    isRTL ? "justify-end" : "justify-start",
                  )}
                >
                  <AiThinkingIndicator language={language} />
                </motion.div>
              ) : null}

              {error && (
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
              )}
            </AnimatePresence>

            <div ref={bottomSentinelRef} aria-hidden="true" />
          </div>
        </MotionConfig>
      </div>
    </div>
  );
}
