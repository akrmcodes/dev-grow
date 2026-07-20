"use client";

import type { UIMessage } from "ai";
import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { Badge } from "@/components/ui/badge";
import {
  RATE_LIMIT_MESSAGE,
  RATE_LIMIT_MESSAGE_AR,
} from "@/lib/constants";
import { cn } from "@/lib/utils";

type ChatPanelProps = {
  messages: UIMessage[];
  isLoading: boolean;
  error: Error | undefined;
  isRTL: boolean;
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

function getErrorMessage(error: Error | undefined, isRTL: boolean): string {
  const code = getApiErrorCode(error);

  if (code === "RATE_LIMIT") {
    return isRTL ? RATE_LIMIT_MESSAGE_AR : RATE_LIMIT_MESSAGE;
  }

  return isRTL
    ? "حدث خطأ. يرجى المحاولة مرة أخرى."
    : "Something went wrong. Please try again.";
}

export function ChatPanel({
  messages,
  isLoading,
  error,
  isRTL,
}: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const visibleMessages = messages.filter((message) => {
    const text = getMessageText(message);
    return text.length > 0 || message.role === "user";
  });

  const showEmptyState = visibleMessages.length === 0 && !isLoading && !error;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {showEmptyState && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-8 text-center">
            <p className="max-w-[220px] text-sm text-muted-foreground">
              {isRTL
                ? "ستظهر الردود هنا"
                : "Responses will appear here"}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 p-1">
          {visibleMessages.map((message) => {
            const text = getMessageText(message);
            const isUser = message.role === "user";

            return (
              <div
                key={message.id}
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
                      : "border border-border bg-card text-card-foreground",
                  )}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed">
                      {text}
                    </p>
                  ) : (
                    <div
                      className={cn(
                        "prose prose-sm dark:prose-invert max-w-none",
                        "prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0",
                        "prose-code:text-emerald-300",
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
                            const isBlock = className?.includes("language-");

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
              </div>
            );
          })}

          {isLoading && (
            <div
              className={cn(
                "flex w-full",
                isRTL ? "justify-end" : "justify-start",
              )}
            >
              <Badge
                variant="secondary"
                className="animate-thinking-pulse gap-1.5 px-3 py-1"
              >
                {isRTL ? "يفكر…" : "Thinking…"}
              </Badge>
            </div>
          )}

          {error && (
            <div
              className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {getErrorMessage(error, isRTL)}
            </div>
          )}

          <div ref={bottomRef} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
