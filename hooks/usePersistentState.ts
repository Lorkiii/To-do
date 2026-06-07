"use client";

import { useCallback, useSyncExternalStore } from "react";

type CacheEntry = {
  raw: string | null;
  parsed: unknown;
  hasValue: boolean;
};

// Module-level cache keeps snapshot references stable so useSyncExternalStore
// does not loop, and lets same-tab writes update every subscriber.
const cache = new Map<string, CacheEntry>();

function getEntry(key: string): CacheEntry {
  let entry = cache.get(key);

  if (!entry) {
    entry = { raw: null, parsed: undefined, hasValue: false };
    cache.set(key, entry);
  }

  return entry;
}

function readSnapshot<T>(key: string, fallback: T): T {
  const entry = getEntry(key);
  const raw =
    typeof window === "undefined" ? null : window.localStorage.getItem(key);

  if (raw !== entry.raw || !entry.hasValue) {
    entry.raw = raw;
    entry.hasValue = true;

    if (raw === null) {
      entry.parsed = fallback;
    } else {
      try {
        entry.parsed = JSON.parse(raw) as T;
      } catch {
        entry.parsed = fallback;
      }
    }
  }

  return entry.parsed as T;
}

function writeSnapshot<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  const serialized = JSON.stringify(value);
  window.localStorage.setItem(key, serialized);

  const entry = getEntry(key);
  entry.raw = serialized;
  entry.parsed = value;
  entry.hasValue = true;

  window.dispatchEvent(new Event(`persist:${key}`));
}

export function usePersistentState<T>(key: string, fallback: T) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      function handleStorage(event: StorageEvent) {
        if (event.key === key) {
          onStoreChange();
        }
      }

      window.addEventListener("storage", handleStorage);
      window.addEventListener(`persist:${key}`, onStoreChange);

      return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener(`persist:${key}`, onStoreChange);
      };
    },
    [key],
  );

  const value = useSyncExternalStore(
    subscribe,
    () => readSnapshot(key, fallback),
    () => fallback,
  );

  const setValue = useCallback(
    (updater: T | ((previous: T) => T)) => {
      const previous = readSnapshot(key, fallback);
      const next =
        typeof updater === "function"
          ? (updater as (previous: T) => T)(previous)
          : updater;
      writeSnapshot(key, next);
    },
    [key, fallback],
  );

  return [value, setValue] as const;
}
