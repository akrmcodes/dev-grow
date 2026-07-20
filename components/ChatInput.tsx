"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { X } from "lucide-react";
import { SendButton } from "@/components/SendButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MODE_CONFIG } from "@/lib/constants";
import type { Mode } from "@/lib/prompts";
import { type Language, t } from "@/lib/translations";
import { cn } from "@/lib/utils";

const MAX_VISIBLE_LINES = 5;
const VERTICAL_PADDING = 16;

export type ChatInputHandle = {
  focus: () => void;
};

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  activeMode: Mode | null;
  onModeDismiss: () => void;
  isStreaming: boolean;
  canSend: boolean;
  onSend: () => void;
  onStop: () => void;
  language: Language;
};

export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(
  function ChatInput(
    {
      value,
      onChange,
      activeMode,
      onModeDismiss,
      isStreaming,
      canSend,
      onSend,
      onStop,
      language,
    },
    ref,
  ) {
    const isRTL = language === "ar";
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isComposing, setIsComposing] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [lineHeight, setLineHeight] = useState(20);

    const lineCount = value === "" ? 1 : value.split("\n").length;

    useImperativeHandle(ref, () => ({
      focus: () => {
        textareaRef.current?.focus();
      },
    }));

    const getMinHeight = useCallback(
      () => lineHeight + VERTICAL_PADDING,
      [lineHeight],
    );

    const getMaxHeight = useCallback(
      () => lineHeight * MAX_VISIBLE_LINES + VERTICAL_PADDING,
      [lineHeight],
    );

    const resizeTextarea = useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const minHeight = getMinHeight();
      const maxHeight = getMaxHeight();

      textarea.style.height = "auto";
      const nextHeight = Math.min(
        Math.max(textarea.scrollHeight, minHeight),
        maxHeight,
      );
      textarea.style.height = `${nextHeight}px`;
      textarea.style.overflowY =
        textarea.scrollHeight > maxHeight ? "auto" : "hidden";
    }, [getMaxHeight, getMinHeight]);

    useEffect(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const computed = window.getComputedStyle(textarea);
      const parsedLineHeight = Number.parseFloat(computed.lineHeight);
      if (!Number.isNaN(parsedLineHeight) && parsedLineHeight > 0) {
        setLineHeight(parsedLineHeight);
      }
    }, []);

    useEffect(() => {
      resizeTextarea();
    }, [value, lineHeight, resizeTextarea]);

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(event.target.value);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (
        event.key === "Enter" &&
        !event.shiftKey &&
        !isComposing &&
        !isStreaming &&
        canSend
      ) {
        event.preventDefault();
        onSend();
      }
    };

    return (
      <div className="sticky bottom-0 z-10 shrink-0 pt-2">
        <div
          className={cn(
            "flex gap-2 rounded-2xl border bg-surface/60 px-3 py-2 shadow-lg backdrop-blur-xl transition-colors",
            isRTL ? "flex-row-reverse" : "flex-row",
            isFocused
              ? "border-emerald-500/60 ring-1 ring-emerald-500/20"
              : "border-border/50",
          )}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            {activeMode && (
              <Badge variant="secondary" className="w-fit gap-1 pr-1">
                <span aria-hidden="true">{MODE_CONFIG[activeMode].emoji}</span>
                <span>{t(MODE_CONFIG[activeMode].labelKey, language)}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="size-4 rounded-full text-muted-foreground hover:text-foreground"
                  aria-label={t("selectMode", language)}
                  onClick={onModeDismiss}
                >
                  <X className="size-3" />
                </Button>
              </Badge>
            )}

            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleChange}
              onInput={resizeTextarea}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              readOnly={isStreaming}
              rows={1}
              dir="ltr"
              spellCheck={false}
              placeholder={t("codePlaceholder", language)}
              className={cn(
                "w-full resize-none overflow-x-hidden border-0 bg-transparent px-0 py-0 font-mono text-xs leading-relaxed text-foreground outline-none transition-[height] duration-150 ease-out placeholder:text-muted-foreground",
                "focus-visible:ring-0",
                isStreaming && "cursor-not-allowed opacity-70",
              )}
              style={{ minHeight: getMinHeight(), maxHeight: getMaxHeight() }}
            />

            <p className="text-[10px] text-muted-foreground" aria-live="polite">
              {`${lineCount} ${lineCount === 1 ? t("line", language) : t("lines", language)}`}
            </p>
          </div>

          <SendButton
            isStreaming={isStreaming}
            disabled={!canSend}
            onSend={onSend}
            onStop={onStop}
            language={language}
          />
        </div>
      </div>
    );
  },
);
