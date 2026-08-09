"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { type Language, t } from "@/lib/translations";
import { cn } from "@/lib/utils";

type CopyMessageButtonProps = {
  text: string;
  language: Language;
  /** `corner` keeps the legacy absolute control; `footer` is inline under the reply. */
  placement?: "corner" | "footer";
};

export function CopyMessageButton({
  text,
  language,
  placement = "corner",
}: CopyMessageButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFooter = placement === "footer";

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // Clipboard unavailable — fail silently
    }
  };

  const label = copied
    ? t("copiedMessage", language)
    : t("copyMessage", language);

  return (
    <Button
      type="button"
      variant="ghost"
      size={isFooter ? "sm" : "icon-xs"}
      aria-label={label}
      onClick={() => void handleCopy()}
      className={cn(
        "select-none transition-opacity",
        isFooter
          ? cn(
              "h-8 gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground",
              "opacity-100 md:opacity-0 md:group-hover/assistant:opacity-100",
              "hover:bg-foreground/[0.05] hover:text-foreground",
              "focus-visible:opacity-100",
              copied && "text-foreground opacity-100",
            )
          : cn(
              "absolute top-1.5 end-1.5 z-10 size-6 opacity-100 md:opacity-0",
              "group-hover:opacity-100 focus-visible:opacity-100",
              copied && "text-foreground",
            ),
      )}
    >
      {copied ? (
        <Check className="size-3.5" strokeWidth={2} />
      ) : (
        <Copy className="size-3.5" strokeWidth={1.85} />
      )}
      {isFooter ? <span>{label}</span> : null}
    </Button>
  );
}
