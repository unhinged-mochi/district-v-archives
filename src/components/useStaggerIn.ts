import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface StaggerInOptions {
  selector?: string;
  y?: number;
  duration?: number;
  stagger?: number;
}

export function useStaggerIn(options?: StaggerInOptions) {
  const ref = useRef<HTMLDivElement>(null);
  const { selector = ':scope > *', y = 10, duration = 0.2, stagger = 0.08 } = options ?? {};

  useEffect(() => {
    if (!ref.current) return;
    const frameId = requestAnimationFrame(() => {
      if (!ref.current) return;
      const elements = ref.current.querySelectorAll(selector);
      if (elements.length === 0) return;
      gsap.fromTo(elements, { opacity: 0, y }, { opacity: 1, y: 0, duration, stagger });
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

  return ref;
}
