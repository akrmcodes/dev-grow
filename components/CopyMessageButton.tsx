"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { type Language, t } from "@/lib/translations";
import { cn } from "@/lib/utils";

type CopyMessageButtonProps = {
  text: string;
  language: Language;
};

export function CopyMessageButton({ text, language }: CopyMessageButtonProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label={copied ? t("copiedMessage", language) : t("copyMessage", language)}
      onClick={() => void handleCopy()}
      className={cn(
        "absolute top-1.5 end-1.5 z-10 size-6 select-none opacity-100 transition-opacity md:opacity-0",
        "group-hover:opacity-100 focus-visible:opacity-100",
        copied && "text-emerald-500",
      )}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </Button>
  );
}
