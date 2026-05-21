import { ReactNode, useEffect, useRef, useState } from "react";

type DeferredSectionProps = {
  children: ReactNode;
  minHeight?: string;
  rootMargin?: string;
};

export const DeferredSection = ({
  children,
  minHeight = "min-h-[420px]",
  rootMargin = "250px 0px",
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
      {visible ? (
        children
      ) : (
        <div className="container py-10">
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
            <div className="h-4 w-28 rounded-full bg-white/10" />
            <div className="mt-5 h-8 w-3/4 max-w-lg rounded-2xl bg-white/10" />
            <div className="mt-3 h-4 w-full max-w-xl rounded-full bg-white/5" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-28 rounded-2xl border border-white/5 bg-white/[0.035]" />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
