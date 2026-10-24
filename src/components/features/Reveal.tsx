import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Stagger in milliseconds, applied as a CSS transition-delay. */
  delay?: number;
  /** Fraction of the element that must be visible before it animates in. */
  threshold?: number;
  /** Render as a different element — useful inside grids and lists. */
  as?: ElementType;
  className?: string;
}

/**
 * Fades and lifts its children into place the first time they scroll into
 * view. Uses IntersectionObserver plus two CSS classes, so it adds no
 * dependencies and costs nothing on the main thread once it has fired.
 * Motion is suppressed by the prefers-reduced-motion rule in index.css.
 */
export default function Reveal({
  children,
  delay = 0,
  threshold = 0.15,
  as: Tag = "div",
  className = "",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
