import { useLayoutEffect, type RefObject } from 'react';
import { gsap } from 'gsap';

/* House style for every timeline in the project. */
gsap.defaults({ ease: 'power3.out', duration: 0.8 });
gsap.config({ nullTargetWarn: false, force3D: true });

/**
 * Scoped GSAP with guaranteed cleanup.
 *
 * `gsap.context` scopes every selector string to `scopeRef`, and `revert()`
 * kills the tweens *and* restores the original inline styles when the
 * component unmounts — which is what keeps scene changes leak-free.
 */
export function useGsap(
  scopeRef: RefObject<HTMLElement | null>,
  setup: (context: gsap.Context) => void,
  deps: unknown[] = [],
): void {
  useLayoutEffect(() => {
    if (!scopeRef.current) return;

    const context = gsap.context(setup, scopeRef);
    return () => context.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export { gsap };
