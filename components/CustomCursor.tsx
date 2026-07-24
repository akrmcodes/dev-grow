"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { cn } from "@/lib/utils";

const COARSE_POINTER = "(pointer: coarse)";
const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const REDUCE_MOTION = "(prefers-reduced-motion: reduce)";

const INTERACTIVE_SELECTOR = [
  "a",
  "button",
  "textarea",
  "input",
  "select",
  "label",
  '[role="button"]',
  '[role="link"]',
  "[data-slot='button']",
  "[contenteditable='true']",
].join(",");

const DOT_SPRING = { damping: 28, stiffness: 700, mass: 0.35 };
const RING_SPRING = { damping: 22, stiffness: 180, mass: 0.55 };
const SCALE_SPRING = { damping: 20, stiffness: 320, mass: 0.4 };

/**
 * Minimalist monochrome smooth cursor — sharp dot + trailing ring.
 * Desktop / fine-pointer only; disabled on touch and reduced-motion.
 */
export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const dotX = useSpring(mouseX, DOT_SPRING);
  const dotY = useSpring(mouseY, DOT_SPRING);
  const ringX = useSpring(mouseX, RING_SPRING);
  const ringY = useSpring(mouseY, RING_SPRING);

  const ringScale = useSpring(1, SCALE_SPRING);
  const ringOpacity = useSpring(0.9, SCALE_SPRING);
  const glow = useSpring(0, SCALE_SPRING);

  const ringShadow = useMotionTemplate`0 0 ${glow}px color-mix(in oklch, var(--foreground) 35%, transparent)`;

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
      document.documentElement.classList.remove("custom-cursor-active");
      return;
    }

    document.documentElement.classList.add("custom-cursor-active");

    let raf = 0;
    let hovering = false;
    let pressing = false;

    const applyScale = () => {
      if (pressing) {
        ringScale.set(0.8);
        ringOpacity.set(0.75);
        glow.set(4);
        return;
      }
      if (hovering) {
        ringScale.set(1.5);
        ringOpacity.set(1);
        glow.set(14);
        return;
      }
      ringScale.set(1);
      ringOpacity.set(0.9);
      glow.set(0);
    };

    const isInteractive = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false;
      return Boolean(target.closest(INTERACTIVE_SELECTOR));
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;

      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setVisible(true);
        mouseX.set(event.clientX);
        mouseY.set(event.clientY);

        const nextHover = isInteractive(event.target);
        if (nextHover !== hovering) {
          hovering = nextHover;
          applyScale();
        }
      });
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pressing = true;
      applyScale();
    };

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      pressing = false;
      applyScale();
    };

    const onPointerLeave = () => {
      setVisible(false);
      pressing = false;
      hovering = false;
      applyScale();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onPointerLeave);

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.documentElement.removeEventListener(
        "mouseleave",
        onPointerLeave,
      );
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled, glow, mouseX, mouseY, ringOpacity, ringScale]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none fixed inset-0 z-[9999]",
        !visible && "opacity-0",
      )}
    >
      {/* Trailing outer ring */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/20 bg-foreground/5 backdrop-blur-[1px] will-change-transform"
        style={{
          x: ringX,
          y: ringY,
          scale: ringScale,
          opacity: ringOpacity,
          boxShadow: ringShadow,
        }}
      />

      {/* Sharp central dot */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground will-change-transform"
        style={{
          x: dotX,
          y: dotY,
        }}
      />
    </div>
  );
}
