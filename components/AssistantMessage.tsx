"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion } from "motion/react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { CopyMessageButton } from "@/components/CopyMessageButton";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
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

function BlockReveal({
  children,
  delay = 0,
  enabled = true,
}: {
  children: ReactNode;
  delay?: number;
  enabled?: boolean;
}) {
  if (!enabled) return <>{children}</>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        duration: 0.45,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Borderless, page-blended assistant reply with generate-style typography
 * and a footer copy action.
 */
export function AssistantMessage({
  text,
  language,
  isStreaming = false,
}: AssistantMessageProps) {
  // Word generate for history mounts. Live streams render continuously,
  // then settle with a soft clarity pass (no remount flash).
  const sawStreamingRef = useRef(isStreaming);
  useEffect(() => {
    if (isStreaming) sawStreamingRef.current = true;
  }, [isStreaming]);

  const useWordGenerate = !isStreaming && !sawStreamingRef.current;
  const settledLive = !isStreaming && sawStreamingRef.current;

  const components: Components = {
    p: ({ children }) => {
      const plain = flattenToText(children);
      if (useWordGenerate && plain && plain.trim().length > 0) {
        return (
          <TextGenerateEffect
            words={plain}
            as="p"
            className="mb-4 text-[15px] font-normal leading-7 last:mb-0"
            duration={0.3}
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
      <BlockReveal enabled={useWordGenerate}>
        <h1 className="mb-3 mt-6 text-xl font-semibold tracking-tight text-foreground first:mt-0">
          {children}
        </h1>
      </BlockReveal>
    ),
    h2: ({ children }) => (
      <BlockReveal enabled={useWordGenerate}>
        <h2 className="mb-2.5 mt-5 text-lg font-semibold tracking-tight text-foreground first:mt-0">
          {children}
        </h2>
      </BlockReveal>
    ),
    h3: ({ children }) => (
      <BlockReveal enabled={useWordGenerate}>
        <h3 className="mb-2 mt-4 text-base font-semibold tracking-tight text-foreground first:mt-0">
          {children}
        </h3>
      </BlockReveal>
    ),
    ul: ({ children }) => (
      <BlockReveal enabled={useWordGenerate}>
        <ul className="mb-4 list-disc space-y-1.5 ps-5 text-[15px] leading-7 marker:text-foreground/40">
          {children}
        </ul>
      </BlockReveal>
    ),
    ol: ({ children }) => (
      <BlockReveal enabled={useWordGenerate}>
        <ol className="mb-4 list-decimal space-y-1.5 ps-5 text-[15px] leading-7 marker:text-foreground/40">
          {children}
        </ol>
      </BlockReveal>
    ),
    li: ({ children }) => (
      <li className="ps-0.5 text-foreground/95">{children}</li>
    ),
    blockquote: ({ children }) => (
      <BlockReveal enabled={useWordGenerate}>
        <blockquote className="mb-4 border-s-2 border-foreground/20 ps-4 text-[15px] leading-7 text-muted-foreground italic">
          {children}
        </blockquote>
      </BlockReveal>
    ),
    pre: ({ children }) => (
      <BlockReveal enabled={useWordGenerate || settledLive} delay={0.04}>
        <pre
          dir="ltr"
          className="my-4 overflow-x-auto rounded-xl border border-border/50 bg-[#0d1117] p-3.5 text-xs leading-relaxed shadow-[inset_0_1px_0_0_color-mix(in_oklch,var(--foreground)_6%,transparent)]"
        >
          {children}
        </pre>
      </BlockReveal>
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
  };

  return (
    <motion.article
      className={cn(
        "group/assistant relative w-full max-w-3xl bg-transparent",
        "text-foreground",
      )}
      initial={false}
      animate={
        settledLive
          ? { opacity: 1, filter: "blur(0px)" }
          : { opacity: 1, filter: "blur(0px)" }
      }
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={cn("max-w-none", "[&>*:first-child]:mt-0")}>
        <ReactMarkdown rehypePlugins={[rehypeHighlight]} components={components}>
          {text}
        </ReactMarkdown>
        {isStreaming ? (
          <span
            className="ms-0.5 inline-block h-4 w-[2px] translate-y-0.5 animate-pulse rounded-full bg-foreground/70 align-middle"
            aria-hidden="true"
          />
        ) : null}
      </div>

      {!isStreaming && text.trim().length > 0 ? (
        <footer className="mt-5 flex items-center gap-1 border-t border-border/40 pt-3">
          <CopyMessageButton
            text={text}
            language={language}
            placement="footer"
          />
        </footer>
      ) : null}
    </motion.article>
  );
}
