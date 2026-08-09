"use client";

import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { encode } from "qss";
import React from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "motion/react";
import { cn } from "@/lib/utils";

type LinkPreviewProps = {
  children: React.ReactNode;
  url: string;
  className?: string;
  width?: number;
  height?: number;
} & (
  | { isStatic: true; imageSrc: string }
  | { isStatic?: false; imageSrc?: never }
);

/**
 * Aceternity Link Preview — hover card with Microlink screenshot.
 * @see https://ui.aceternity.com/components/link-preview
 */
export function LinkPreview({
  children,
  url,
  className,
  width = 200,
  height = 125,
  isStatic = false,
  imageSrc = "",
}: LinkPreviewProps) {
  const src = React.useMemo(() => {
    if (isStatic) return imageSrc;

    const params = encode({
      url,
      screenshot: true,
      meta: false,
      embed: "screenshot.url",
      colorScheme: "dark",
      "viewport.isMobile": true,
      "viewport.deviceScaleFactor": 1,
      "viewport.width": width * 3,
      "viewport.height": height * 3,
    });

    return `https://api.microlink.io/?${params}`;
  }, [height, imageSrc, isStatic, url, width]);

  const [isOpen, setOpen] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const springConfig = { stiffness: 100, damping: 15 };
  const x = useMotionValue(0);
  const translateX = useSpring(x, springConfig);

  const handleMouseMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const targetRect = event.currentTarget.getBoundingClientRect();
    const eventOffsetX = event.clientX - targetRect.left;
    const offsetFromCenter = (eventOffsetX - targetRect.width / 2) / 2;
    x.set(offsetFromCenter);
  };

  return (
    <span className="inline">
      {isMounted ? (
        <span className="hidden" aria-hidden="true">
          {/* Prefetch preview image so hover feels instant */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} width={width} height={height} alt="" />
        </span>
      ) : null}

      <HoverCardPrimitive.Root
        openDelay={60}
        closeDelay={120}
        onOpenChange={setOpen}
      >
        <HoverCardPrimitive.Trigger asChild>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onMouseMove={handleMouseMove}
            className={cn(
              "inline underline-offset-4 transition-colors hover:underline",
              "text-foreground/80 hover:text-foreground",
              className,
            )}
          >
            {children}
          </a>
        </HoverCardPrimitive.Trigger>

        <HoverCardPrimitive.Portal>
          <HoverCardPrimitive.Content
            className="z-50 [transform-origin:var(--radix-hover-card-content-transform-origin)]"
            side="top"
            align="center"
            sideOffset={10}
          >
            <AnimatePresence>
              {isOpen ? (
                <motion.div
                  initial={{ opacity: 0, y: 16, scale: 0.92 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 260,
                      damping: 22,
                    },
                  }}
                  exit={{ opacity: 0, y: 12, scale: 0.94 }}
                  className="rounded-xl shadow-xl"
                  style={{ x: translateX }}
                >
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl border border-border bg-card p-1 shadow-sm transition-colors hover:border-foreground/25"
                    style={{ fontSize: 0 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={isStatic ? imageSrc : src}
                      width={width}
                      height={height}
                      className="rounded-lg"
                      alt=""
                    />
                  </a>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </HoverCardPrimitive.Content>
        </HoverCardPrimitive.Portal>
      </HoverCardPrimitive.Root>
    </span>
  );
}
