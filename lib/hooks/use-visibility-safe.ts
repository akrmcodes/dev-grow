"use client";

import { useEffect, useState } from "react";

export function useVisibilitySafe() {
  const [visibilityKey, setVisibilityKey] = useState(0);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setVisibilityKey((current) => current + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return visibilityKey;
}
