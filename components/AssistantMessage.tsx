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

/**
 * Extract plain text for history entrance animation.
 * Unwraps strong/em; bails when code/links need rich Markdown.
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

    if (
      props.href != null ||
      (typeof type === "string" &&
        (type === "code" || type === "a" || type === "pre")) ||
      className.includes("font-mono") ||
      className.includes("language-")
    ) {
      return null;
    }

    return flattenToText(props.children);
  }

  return null;
}

const PROSE_P =
  "mb-4 text-[15px] font-normal leading-7 text-foreground/95 last:mb-0";
const PROSE_H1 =
  "mb-3 mt-6 text-xl font-semibold text-foreground first:mt-0";
const PROSE_H2 =
  "mb-2.5 mt-5 text-lg font-semibold text-foreground first:mt-0";
const PROSE_H3 =
  "mb-2 mt-4 text-base font-semibold text-foreground first:mt-0";
const PROSE_LI = "ps-0.5 leading-7 text-foreground/95";

/** Fast path — no Framer / no word-split. Used for live stream + post-stream. */
const STATIC_COMPONENTS: Components = {
  p: ({ children }) => <p className={PROSE_P}>{children}</p>,
  h1: ({ children }) => <h1 className={PROSE_H1}>{children}</h1>,
  h2: ({ children }) => <h2 className={PROSE_H2}>{children}</h2>,
  h3: ({ children }) => <h3 className={PROSE_H3}>{children}</h3>,
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
  li: ({ children }) => <li className={PROSE_LI}>{children}</li>,
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

function createHistoryComponents(): Components {
  const maybeReveal = (
    as: "p" | "li" | "h1" | "h2" | "h3",
    className: string,
    children: ReactNode,
    duration = 0.28,
  ) => {
    const plain = flattenToText(children);
    if (plain && plain.trim().length > 0) {
      return (
        <TextGenerateEffect
          words={plain}
          as={as}
          className={className}
          duration={duration}
          filter
        />
      );
    }
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  };

  return {
    ...STATIC_COMPONENTS,
    p: ({ children }) => maybeReveal("p", PROSE_P, children),
    h1: ({ children }) => maybeReveal("h1", PROSE_H1, children, 0.32),
    h2: ({ children }) => maybeReveal("h2", PROSE_H2, children, 0.3),
    h3: ({ children }) => maybeReveal("h3", PROSE_H3, children, 0.28),
    li: ({ children }) => maybeReveal("li", PROSE_LI, children, 0.24),
  };
}

const HISTORY_COMPONENTS = createHistoryComponents();
const NO_REHYPE: [] = [];
const SETTLED_REHYPE = [rehypeHighlight];

/**
 * Assistant reply rendering:
 * - Live stream / just-finished → static Markdown only (max throughput, no generate)
 * - History mount (opening a saved chat) → TextGenerateEffect entrance
 */
function AssistantMessageComponent({
  text,
  language,
  isStreaming = false,
}: AssistantMessageProps) {
  const cleanText = useMemo(() => {
    // Skip sanitizer while tokens arrive — O(n) per chunk was a stutter source.
    // Final settle (and history) always sanitize once.
    if (isStreaming) return text;
    return sanitizeAssistantText(text);
  }, [text, isStreaming]);

  // Once streamed in this mount, never play entrance (avoids post-stream replay).
  const sawStreamingRef = useRef(isStreaming);
  if (isStreaming) {
    sawStreamingRef.current = true;
  }

  const playEntrance = !isStreaming && !sawStreamingRef.current;
  const components = playEntrance ? HISTORY_COMPONENTS : STATIC_COMPONENTS;
  const rehypePlugins = isStreaming ? NO_REHYPE : SETTLED_REHYPE;

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

export const AssistantMessage = memo(
  AssistantMessageComponent,
  (prev, next) =>
    prev.text === next.text &&
    prev.language === next.language &&
    prev.isStreaming === next.isStreaming,
);
