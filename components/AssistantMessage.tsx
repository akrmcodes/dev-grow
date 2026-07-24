"use client";

import { memo, useMemo, useRef, type ReactNode } from "react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { CopyMessageButton } from "@/components/CopyMessageButton";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { sanitizeAssistantText } from "@/lib/sanitize-assistant-text";
import { type Language } from "@/lib/translations";
import { cn } from "@/lib/utils";

type AssistantMessageProps = {
  text: string;
  language: Language;
  /** True while this message is the live streaming reply. */
  isStreaming?: boolean;
};

function flattenToText(node: ReactNode): string | null {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) {
    const parts = node.map(flattenToText);
    if (parts.some((part) => part === null)) return null;
    return parts.join("");
  }
  return null;
}

function createMarkdownComponents(options: {
  useWordGenerate: boolean;
}): Components {
  const { useWordGenerate } = options;

  return {
    p: ({ children }) => {
      const plain = flattenToText(children);
      if (useWordGenerate && plain && plain.trim().length > 0) {
        return (
          <TextGenerateEffect
            words={plain}
            as="p"
            className="mb-4 text-[15px] font-normal leading-7 last:mb-0"
            duration={0.28}
          />
        );
      }

      return (
        <p className="mb-4 text-[15px] leading-7 text-foreground/95 last:mb-0">
          {children}
        </p>
      );
    },
    h1: ({ children }) => (
      <h1 className="mb-3 mt-6 text-xl font-semibold tracking-tight text-foreground first:mt-0">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mb-2.5 mt-5 text-lg font-semibold tracking-tight text-foreground first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-2 mt-4 text-base font-semibold tracking-tight text-foreground first:mt-0">
        {children}
      </h3>
    ),
    ul: ({ children }) => (
      <ul className="mb-4 list-disc space-y-1.5 ps-5 text-[15px] leading-7 marker:text-foreground/40">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-4 list-decimal space-y-1.5 ps-5 text-[15px] leading-7 marker:text-foreground/40">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="ps-0.5 text-foreground/95">{children}</li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="mb-4 border-s-2 border-foreground/20 ps-4 text-[15px] leading-7 text-muted-foreground italic">
        {children}
      </blockquote>
    ),
    pre: ({ children }) => (
      <pre
        dir="ltr"
        className="my-4 overflow-x-auto rounded-xl border border-border/50 bg-[#0d1117] p-3.5 text-xs leading-relaxed shadow-[inset_0_1px_0_0_color-mix(in_oklch,var(--foreground)_6%,transparent)]"
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
          className="rounded-md bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[0.85em] text-foreground/85"
          dir="ltr"
          {...props}
        >
          {children}
        </code>
      );
    },
    a: ({ href, children }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-foreground underline decoration-foreground/25 underline-offset-4 transition-colors hover:decoration-foreground/60"
      >
        {children}
      </a>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-foreground">{children}</strong>
    ),
    hr: () => <hr className="my-6 border-border/60" />,
    table: ({ children }) => (
      <div className="my-4 w-full overflow-x-auto rounded-lg border border-border/50">
        <table className="w-full min-w-[16rem] border-collapse text-start text-[14px] leading-6">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="border-b border-border/60 bg-muted/40">{children}</thead>
    ),
    th: ({ children }) => (
      <th className="px-3 py-2 text-start text-xs font-semibold tracking-wide text-foreground">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border-t border-border/40 px-3 py-2 align-top text-foreground/90">
        {children}
      </td>
    ),
  };
}

/**
 * Borderless assistant reply.
 * Streaming stays lightweight (no highlight / no word-generate) so tokens paint continuously.
 * History may use TextGenerateEffect once; live streams never remount into it after settle.
 */
function AssistantMessageComponent({
  text,
  language,
  isStreaming = false,
}: AssistantMessageProps) {
  const cleanText = useMemo(() => sanitizeAssistantText(text), [text]);

  // Once this instance has streamed live, never switch into TextGenerateEffect
  // on settle — that remount caused freeze-then-pop after the response finished.
  const sawStreamingRef = useRef(isStreaming);
  if (isStreaming) {
    sawStreamingRef.current = true;
  }

  const wordCount = cleanText.split(/\s+/).filter(Boolean).length;
  const enableGenerate =
    !isStreaming &&
    !sawStreamingRef.current &&
    wordCount > 0 &&
    wordCount <= 120;

  const components = useMemo(
    () => createMarkdownComponents({ useWordGenerate: enableGenerate }),
    [enableGenerate],
  );

  const rehypePlugins = useMemo(
    () => (isStreaming ? [] : [rehypeHighlight]),
    [isStreaming],
  );

  return (
    <article
      className={cn(
        "group/assistant relative w-full max-w-3xl bg-transparent",
        "text-foreground",
      )}
    >
      <div className={cn("max-w-none", "[&>*:first-child]:mt-0")}>
        <ReactMarkdown rehypePlugins={rehypePlugins} components={components}>
          {cleanText}
        </ReactMarkdown>
        {isStreaming ? (
          <span
            className="ms-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse rounded-full bg-foreground/70 align-middle"
            aria-hidden="true"
          />
        ) : null}
      </div>

      {!isStreaming && cleanText.trim().length > 0 ? (
        <footer className="mt-5 flex items-center gap-1 border-t border-border/40 pt-3">
          <CopyMessageButton
            text={cleanText}
            language={language}
            placement="footer"
          />
        </footer>
      ) : null}
    </article>
  );
}

export const AssistantMessage = memo(AssistantMessageComponent);
