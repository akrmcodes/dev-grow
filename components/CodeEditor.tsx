"use client";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  isRTL: boolean;
};

export function CodeEditor({ value, onChange, isRTL }: CodeEditorProps) {
  const lineCount = value === "" ? 1 : value.split("\n").length;

  return (
    <div className="flex h-full flex-col gap-2">
      <label
        htmlFor="code-editor"
        className="text-sm font-medium text-foreground"
      >
        {isRTL ? "الكود الخاص بك" : "Your Code"}
      </label>

      <Textarea
        id="code-editor"
        dir="ltr"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={
          isRTL ? "الصق الكود هنا... 🌱" : "Paste your code here... 🌱"
        }
        spellCheck={false}
        className={cn(
          "min-h-[400px] flex-1 resize-y font-mono text-sm leading-relaxed md:min-h-[calc(100dvh-12rem)]",
          "focus-visible:border-emerald-500 focus-visible:ring-emerald-500/20",
        )}
      />

      <p className="text-xs text-muted-foreground" aria-live="polite">
        {isRTL
          ? `${lineCount} ${lineCount === 1 ? "سطر" : "سطر"}`
          : `${lineCount} ${lineCount === 1 ? "line" : "lines"}`}
      </p>
    </div>
  );
}
