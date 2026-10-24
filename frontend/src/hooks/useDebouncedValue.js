import { useEffect, useState } from "react";

/**
 * Returns "value", but only after it has stopped changing
 * for delayMs milliseconds.
 *
 * Used for search boxes so we don't call the backend
 * on every key press.
 */
export function useDebouncedValue(
  value,
  delayMs = 300
) {
  const [debounced, setDebounced] =
    useState(value);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebounced(value),
      delayMs
    );

    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}