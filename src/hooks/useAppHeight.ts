import { useEffect } from 'react';

/**
 * Mobile browsers resize the viewport as their URL bar collapses, which makes
 * `100vh` jump mid-animation. We publish a stable `--app-height` instead and
 * only update it on genuine resizes (orientation change, keyboard, rotate).
 */
export function useAppHeight(): void {
  useEffect(() => {
    const root = document.documentElement;
    const supportsDvh =
      typeof CSS !== 'undefined' && CSS.supports?.('height', '100dvh');

    if (supportsDvh) {
      root.style.setProperty('--app-height', '100dvh');
      return;
    }

    let frame = 0;
    const apply = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        root.style.setProperty('--app-height', `${window.innerHeight}px`);
      });
    };

    apply();
    window.addEventListener('resize', apply);
    window.addEventListener('orientationchange', apply);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', apply);
      window.removeEventListener('orientationchange', apply);
    };
  }, []);
}
