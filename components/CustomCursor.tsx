"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

const COARSE_POINTER = "(pointer: coarse)";
const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const REDUCE_MOTION = "(prefers-reduced-motion: reduce)";

/** Text / code surfaces — restore native caret; hide custom cursor. */
const TEXT_SELECTOR = [
  "textarea",
  "input",
  "code",
  "pre",
  ".prose",
  "[contenteditable='true']",
].join(",");

/** Interactive chrome — ring only (no center dot). */
const INTERACTIVE_SELECTOR = [
  "a",
  "button",
  "select",
  "label",
  '[role="button"]',
  '[role="link"]',
  "[data-slot='button']",
].join(",");

const DOT_SPRING = { damping: 28, stiffness: 700, mass: 0.35 };
const RING_SPRING = { damping: 22, stiffness: 180, mass: 0.55 };
const SCALE_SPRING = { damping: 20, stiffness: 320, mass: 0.4 };

type CursorMode = "default" | "interactive" | "text";

/**
 * Minimalist monochrome smooth cursor — sharp dot + trailing ring.
 * Hides over text/code for precise selection; ring-only over buttons.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<CursorMode>("default");

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const dotX = useSpring(mouseX, DOT_SPRING);
  const dotY = useSpring(mouseY, DOT_SPRING);
  const ringX = useSpring(mouseX, RING_SPRING);
  const ringY = useSpring(mouseY, RING_SPRING);

  const ringScale = useSpring(1, SCALE_SPRING);
  const ringOpacity = useSpring(0.9, SCALE_SPRING);
  const dotOpacity = useSpring(1, SCALE_SPRING);

  useEffect(() => {
    const coarse = window.matchMedia(COARSE_POINTER);
    const fine = window.matchMedia(FINE_POINTER);
    const reduce = window.matchMedia(REDUCE_MOTION);

    const sync = () => {
      setEnabled(fine.matches && !coarse.matches && !reduce.matches);
    };

    sync();
    coarse.addEventListener("change", sync);
    fine.addEventListener("change", sync);
    reduce.addEventListener("change", sync);

    return () => {
      coarse.removeEventListener("change", sync);
      fine.removeEventListener("change", sync);
      reduce.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      document.documentElement.classList.remove(
        "custom-cursor-active",
        "custom-cursor-text",
      );
      return;
    }

    document.documentElement.classList.add("custom-cursor-active");

    let raf = 0;
    let currentMode: CursorMode = "default";
    let pressing = false;

    const applyVisual = (next: CursorMode) => {
      currentMode = next;
      setMode(next);

      if (next === "text") {
        document.documentElement.classList.add("custom-cursor-text");
        ringOpacity.set(0);
        dotOpacity.set(0);
        return;
      }

      document.documentElement.classList.remove("custom-cursor-text");

      if (pressing) {
        ringScale.set(0.8);
        ringOpacity.set(0.85);
        dotOpacity.set(next === "interactive" ? 0 : 0.5);
        return;
      }

      if (next === "interactive") {
        ringScale.set(1.5);
        ringOpacity.set(1);
        dotOpacity.set(0);
        return;
      }

      ringScale.set(1);
      ringOpacity.set(0.9);
      dotOpacity.set(1);
    };

    const resolveMode = (target: EventTarget | null): CursorMode => {
      if (!(target instanceof Element)) return "default";
      // Text selection wins over interactive (inputs/textareas).
      if (target.closest(TEXT_SELECTOR)) return "text";
      if (target.closest(INTERACTIVE_SELECTOR)) return "interactive";
      return "default";
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;

      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        mouseX.set(event.clientX);
        mouseY.set(event.clientY);

        const next = resolveMode(event.target);
        setVisible(next !== "text");

        if (next !== currentMode) {
          applyVisual(next);
        } else if (next === "text") {
          // Keep caret mode sticky while moving within text.
          document.documentElement.classList.add("custom-cursor-text");
        }
      });
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      if (currentMode === "text") return;
      pressing = true;
      applyVisual(currentMode);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pressing = false;
      applyVisual(currentMode);
    };

    const onPointerLeave = () => {
      setVisible(false);
      pressing = false;
      applyVisual("default");
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onPointerLeave);

    return () => {
      document.documentElement.classList.remove(
        "custom-cursor-active",
        "custom-cursor-text",
      );
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.documentElement.removeEventListener(
        "mouseleave",
        onPointerLeave,
      );
      if (raf) cancelAnimationFrame(raf);
    };
  }, [dotOpacity, enabled, mouseX, mouseY, ringOpacity, ringScale]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 z-[9999]",
        (!visible || mode === "text") && "opacity-0",
      )}
    >
      {/* Trailing outer ring — crisp, no blur; difference blend keeps UI sharp */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/50 bg-transparent mix-blend-difference will-change-transform"
        style={{
          x: ringX,
          y: ringY,
          scale: ringScale,
          opacity: ringOpacity,
        }}
      />

      {/* Sharp central dot — fades on interactive / text */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground mix-blend-difference will-change-transform"
        style={{
          x: dotX,
          y: dotY,
          opacity: dotOpacity,
        }}
      />
    </div>
  );
}
