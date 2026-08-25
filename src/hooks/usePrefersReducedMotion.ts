import { useMediaQuery } from './useMediaQuery';

/**
 * Honours the OS-level "reduce motion" setting.
 *
 * When true, every scene keeps its content and its buttons but drops
 * long timelines, parallax, particle fields and looping animation.
 * The story still works end to end — it simply stops moving.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
