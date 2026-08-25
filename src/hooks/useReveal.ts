import { useEffect, useRef, useState } from 'react';

interface RevealOptions {
  /** Fraction of the element that must be visible. */
  threshold?: number;
  /** Shrinks the viewport so reveals fire slightly before the edge. */
  rootMargin?: string;
  /** Reveal only the first time it enters (default) or every time. */
  once?: boolean;
  /** Skip observation entirely and report visible immediately. */
  skip?: boolean;
}

/**
 * Scroll-triggered reveal via IntersectionObserver.
 *
 * Preferred over scroll listeners: the browser does the work off the main
 * thread, and each observer disconnects as soon as it has fired.
 */
export function useReveal<T extends Element>({
  threshold = 0.25,
  rootMargin = '0px 0px -12% 0px',
  once = true,
  skip = false,
}: RevealOptions = {}) {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(skip);

  useEffect(() => {
    if (skip) {
      setVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            if (once) observer.disconnect();
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once, rootMargin, skip, threshold]);

  return { ref, visible };
}
