import { useCallback, useRef } from 'react';

// Prevents a callback from firing more than once within delayMs
export default function useTimeGuardedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delayMs: number
): T {
  const lastCallTimeRef = useRef(0);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCallTimeRef.current < delayMs) return;
      lastCallTimeRef.current = now;
      callback(...args);
    },
    [callback, delayMs]
  ) as T;
}
