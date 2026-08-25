import { useEffect, useState } from 'react';

/**
 * SSR-safe, listener-cleaned media query hook.
 * Reads synchronously on first render so there is no visual flip-flop.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const list = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);

    setMatches(list.matches);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** True when the device has no real hover (phones, tablets). */
export function useIsTouch(): boolean {
  return useMediaQuery('(hover: none), (pointer: coarse)');
}

/** True on phone-sized viewports. Drives particle budgets and effect tiers. */
export function useIsCompact(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

/** True when a precise pointer is available — enables cursor-follow effects. */
export function useHasFinePointer(): boolean {
  return useMediaQuery('(hover: hover) and (pointer: fine)');
}
