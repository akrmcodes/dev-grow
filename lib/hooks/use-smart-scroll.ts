"use client";

import { useCallback, useEffect, useRef } from "react";

const NEAR_BOTTOM_MARGIN_PX = 100;

export function useSmartScroll(deps: unknown[]) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);
  const isNearBottomRef = useRef(true);
  const scrollRafRef = useRef<number | null>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
    isNearBottomRef.current = true;
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    const sentinel = bottomSentinelRef.current;
    if (!container || !sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isNearBottomRef.current = entry?.isIntersecting ?? false;
      },
      {
        root: container,
        rootMargin: `0px 0px ${NEAR_BOTTOM_MARGIN_PX}px 0px`,
        threshold: 0,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !isNearBottomRef.current) return;

    if (scrollRafRef.current !== null) {
      cancelAnimationFrame(scrollRafRef.current);
    }

    scrollRafRef.current = requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
      scrollRafRef.current = null;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps array is intentional trigger list
  }, deps);

  useEffect(() => {
    return () => {
      if (scrollRafRef.current !== null) {
        cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, []);

  return {
    scrollContainerRef,
    bottomSentinelRef,
    scrollToBottom,
  };
}
