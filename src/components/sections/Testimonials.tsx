import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const sb = supabase as any;

export const Testimonials = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [i, setI] = useState(0);

  useEffect(() => {
    sb.from("testimonials").select("*").eq("active", true).order("display_order")
      .then(({ data, error }: any) => {
        if (!error && data) setData(data);
        setLoading(false);
      });
  }, []);

  if (loading || data.length === 0) return null;

  const testimonials = data;
  const next = () => setI((p) => (p + 1) % testimonials.length);
  const prev = () => setI((p) => (p - 1 + testimonials.length) % testimonials.length);
  const t = testimonials[i];

  return (
    <section id="testimonials" className="py-24 sm:py-32 relative">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-block px-3 py-1 glass rounded-full text-xs font-medium text-accent mb-6">
            TESTIMONIALS
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
            Loved by <span className="text-gradient">founders & teams</span>
          </h2>
        </motion.div>

        <div className="relative gradient-border glass rounded-3xl p-8 sm:p-12">
          <Quote className="absolute top-6 left-6 h-10 w-10 text-accent/30" />
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <div className="flex justify-center gap-1 mb-6">
                {Array(5).fill(0).map((_, n) => (
                  <Star key={n} className={cn("h-4 w-4 transition-colors", n < (t.rating || 5) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted")} />
                ))}
              </div>
              <p className="font-display text-xl sm:text-2xl leading-relaxed mb-8 text-foreground/90">
                "{t.quote}"
              </p>
              <div>
                <div className="font-semibold">{t.name}</div>
                <div className="text-sm text-muted-foreground">{t.role}</div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-center gap-3 mt-8">
            <button
              aria-label="Previous"
              onClick={prev}
              className="w-10 h-10 rounded-full glass border border-foreground/10 flex items-center justify-center hover:bg-foreground/5 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2">
              {testimonials.map((_, n) => (
                <button
                  key={n}
                  onClick={() => setI(n)}
                  aria-label={`Go to ${n + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    n === i ? "w-8 bg-brand-gradient" : "w-1.5 bg-muted"
                  }`}
                />
              ))}
            </div>
            <button
              aria-label="Next"
              onClick={next}
              className="w-10 h-10 rounded-full glass border border-foreground/10 flex items-center justify-center hover:bg-foreground/5 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
