"use client";

import { useCallback, useEffect, useState } from "react";

export const CUSTOM_CURSOR_STORAGE_KEY = "devgrow-custom-cursor";
export const CUSTOM_CURSOR_CHANGE_EVENT = "devgrow-custom-cursor-change";

const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const COARSE_POINTER = "(pointer: coarse)";

function readStoredPreference(): boolean {
  try {
    const raw = localStorage.getItem(CUSTOM_CURSOR_STORAGE_KEY);
    if (raw === null) return true;
    return raw === "1";
  } catch {
    return true;
  }
}

function writeStoredPreference(enabled: boolean) {
  try {
    localStorage.setItem(CUSTOM_CURSOR_STORAGE_KEY, enabled ? "1" : "0");
  } catch {
    // Ignore quota / private-mode failures.
  }
}

/**
 * User preference for the custom smooth cursor.
 * Defaults to on; syncs across components via a window event + localStorage.
 */
export function useCustomCursorPreference() {
  const [preferred, setPreferred] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    setPreferred(readStoredPreference());
    setHydrated(true);

    const fine = window.matchMedia(FINE_POINTER);
    const coarse = window.matchMedia(COARSE_POINTER);
    const syncAvailability = () => {
      setAvailable(fine.matches && !coarse.matches);
    };
    syncAvailability();
    fine.addEventListener("change", syncAvailability);
    coarse.addEventListener("change", syncAvailability);

    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<boolean>).detail;
      if (typeof detail === "boolean") setPreferred(detail);
    };
    window.addEventListener(CUSTOM_CURSOR_CHANGE_EVENT, onChange);

    return () => {
      fine.removeEventListener("change", syncAvailability);
      coarse.removeEventListener("change", syncAvailability);
      window.removeEventListener(CUSTOM_CURSOR_CHANGE_EVENT, onChange);
    };
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    setPreferred(enabled);
    writeStoredPreference(enabled);
    window.dispatchEvent(
      new CustomEvent<boolean>(CUSTOM_CURSOR_CHANGE_EVENT, { detail: enabled }),
    );
  }, []);

  const toggle = useCallback(() => {
    setEnabled(!preferred);
  }, [preferred, setEnabled]);

  return {
    preferred,
    setEnabled,
    toggle,
    hydrated,
    /** Fine pointer only — toggle is meaningless on touch. */
    available,
  };
}
