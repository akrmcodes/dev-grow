"use client";

import {
  isValidElement,
  memo,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
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

/** How prose blocks should reveal. */
type RevealMode = "incremental" | "enter" | "static";

/**
 * Extract plain text for generate animation.
 * Unwraps strong/em/span; bails (null) when code or links are present
 * so those blocks keep rich Markdown rendering.
 */
function flattenToText(node: ReactNode): string | null {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);

  if (Array.isArray(node)) {
    const parts = node.map(flattenToText);
    if (parts.some((part) => part === null)) return null;
    return parts.join("");
  }

  if (isValidElement(node)) {
    const props = node.props as {
      children?: ReactNode;
      className?: string;
      href?: string;
    };
    const type = node.type;
    const className = props.className ?? "";

    // Keep rich rendering for code / links.
    if (
      props.href != null ||
      (typeof type === "string" && (type === "code" || type === "a" || type === "pre")) ||
      className.includes("font-mono") ||
      className.includes("language-")
    ) {
      return null;
    }

    return flattenToText(props.children);
  }

  return null;
}

function RevealText({
  text,
  mode,
  as,
  className,
  duration = 0.28,
}: {
  text: string;
  mode: RevealMode;
  as: "p" | "li" | "h1" | "h2" | "h3";
  className: string;
  duration?: number;
}) {
  if (mode === "static") {
    const Tag = as;
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <TextGenerateEffect
      words={text}
      as={as}
      className={className}
      duration={duration}
      incremental={mode === "incremental"}
      // Blur on full entrance only — streaming stays snappy.
      filter={mode === "enter"}
    />
  );
}

function createMarkdownComponents(options: {
  revealMode: RevealMode;
}): Components {
  const { revealMode } = options;
  const canReveal = revealMode !== "static";

  const maybeReveal = (
    as: "p" | "li" | "h1" | "h2" | "h3",
    className: string,
    children: ReactNode,
    duration?: number,
  ) => {
    const plain = flattenToText(children);
    if (canReveal && plain && plain.trim().length > 0) {
      return (
        <RevealText
          text={plain}
          mode={revealMode}
          as={as}
          className={className}
          duration={duration}
        />
      );
    }
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  };

  return {
    p: ({ children }) =>
      maybeReveal(
        "p",
        "mb-4 text-[15px] font-normal leading-7 text-foreground/95 last:mb-0",
        children,
      ),
    h1: ({ children }) =>
      maybeReveal(
        "h1",
        "mb-3 mt-6 text-xl font-semibold text-foreground first:mt-0",
        children,
        0.32,
      ),
    h2: ({ children }) =>
      maybeReveal(
        "h2",
        "mb-2.5 mt-5 text-lg font-semibold text-foreground first:mt-0",
        children,
        0.3,
      ),
    h3: ({ children }) =>
      maybeReveal(
        "h3",
        "mb-2 mt-4 text-base font-semibold text-foreground first:mt-0",
        children,
        0.28,
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
    li: ({ children }) =>
      maybeReveal("li", "ps-0.5 leading-7 text-foreground/95", children, 0.24),
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
 * Borderless assistant reply with reliable text-generate:
 * - Live stream → incremental word reveal (no remount flicker)
 * - History mount → full entrance animation (any length)
 * - Just-finished stream → static (already revealed; no second play)
 */
function AssistantMessageComponent({
  text,
  language,
  isStreaming = false,
}: AssistantMessageProps) {
  const cleanText = useMemo(() => sanitizeAssistantText(text), [text]);

  const sawStreamingRef = useRef(isStreaming);
  if (isStreaming) {
    sawStreamingRef.current = true;
  }

  const revealMode: RevealMode = isStreaming
    ? "incremental"
    : sawStreamingRef.current
      ? "static"
      : "enter";

  const components = useMemo(
    () => createMarkdownComponents({ revealMode }),
    [revealMode],
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
