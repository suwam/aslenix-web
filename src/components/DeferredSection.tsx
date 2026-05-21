import { ReactNode, useEffect, useRef, useState } from "react";

type DeferredSectionProps = {
  children: ReactNode;
  minHeight?: string;
  rootMargin?: string;
};

export const DeferredSection = ({
  children,
  minHeight = "min-h-[420px]",
  rootMargin = "700px 0px",
}: DeferredSectionProps) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const element = ref.current;
    if (!element) return;

    if (!("IntersectionObserver" in window)) {
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
      { rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin, visible]);

  return (
    <div ref={ref} className={visible ? undefined : minHeight} aria-busy={!visible}>
      {visible ? children : null}
    </div>
  );
};
