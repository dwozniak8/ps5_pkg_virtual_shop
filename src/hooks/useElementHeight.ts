"use client";

import { useEffect, useRef, useState } from "react";

interface UseElementHeightResult<T extends HTMLElement> {
  elementRef: React.RefObject<T | null>;
  height: number;
}

export function useElementHeight<T extends HTMLElement>(
  initialHeight = 0,
): UseElementHeightResult<T> {
  const elementRef = useRef<T | null>(null);
  const [height, setHeight] = useState(initialHeight);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const updateHeight = () => {
      setHeight(element.getBoundingClientRect().height);
    };

    updateHeight();

    const resizeObserver = new ResizeObserver(updateHeight);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return { elementRef, height };
}
