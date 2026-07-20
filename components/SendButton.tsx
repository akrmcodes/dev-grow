"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Language, t } from "@/lib/translations";
import { cn } from "@/lib/utils";

type SendButtonProps = {
  isStreaming: boolean;
  disabled: boolean;
  onSend: () => void;
  onStop: () => void;
  language: Language;
};

const iconTransition = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
  transition: { duration: 0.15, ease: "easeOut" as const },
};

export function SendButton({
  isStreaming,
  disabled,
  onSend,
  onStop,
  language,
}: SendButtonProps) {
  const handleClick = () => {
    if (isStreaming) {
      onStop();
      return;
    }

    if (!disabled) {
      onSend();
    }
  };

  return (
    <div className="relative shrink-0 self-center">
      {isStreaming && (
        <span
          aria-hidden="true"
          className="absolute inset-0 animate-pulse rounded-full bg-destructive/30 ring-2 ring-destructive/50"
        />
      )}
      <Button
        type="button"
        size="icon-sm"
        aria-label={isStreaming ? t("stop", language) : t("send", language)}
        disabled={!isStreaming && disabled}
        onClick={handleClick}
        className={cn(
          "relative size-8 rounded-full",
          isStreaming
            ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            : "bg-primary text-primary-foreground hover:bg-primary/90",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isStreaming ? (
            <motion.span
              key="stop"
              className="flex items-center justify-center"
              {...iconTransition}
            >
              <Square className="size-3.5 fill-current" />
            </motion.span>
          ) : (
            <motion.span
              key="send"
              className="flex items-center justify-center"
              {...iconTransition}
            >
              <ArrowUp className="size-4" />
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    </div>
  );
}
