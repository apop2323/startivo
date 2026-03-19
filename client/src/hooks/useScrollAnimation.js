import { useEffect, useRef } from 'react';

/**
 * Attach to a container ref. All children with class "fade-in-up"
 * get the "visible" class when scrolled into view.
 */
export function useScrollAnimation(threshold = 0.12) {
  const containerRef = useRef(null);

  useEffect(() => {
    const elements = containerRef.current
      ? containerRef.current.querySelectorAll('.fade-in-up')
      : [];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [threshold]);

  return containerRef;
}

/**
 * Single element scroll animation ref.
 */
export function useFadeIn(threshold = 0.12) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.classList.add('fade-in-up');

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
