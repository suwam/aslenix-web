import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "ASLENIX rebuilt our entire platform in 8 weeks. The design is breathtaking and our conversions doubled within a month.",
    name: "Aarav Sharma",
    role: "CEO, Lumora SaaS",
  },
  {
    quote:
      "Working with ASLENIX feels like having a senior in-house team. They care about the details and ship on time, every time.",
    name: "Priya Khadka",
    role: "Founder, Bloom Co.",
  },
  {
    quote:
      "The AI assistant they built handles 70% of our support queries. ROI was clear within the first quarter.",
    name: "Daniel Wright",
    role: "Head of Ops, Northwind",
  },
];

export const Testimonials = () => {
  const [i, setI] = useState(0);
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
                  <Star key={n} className="h-4 w-4 fill-accent text-accent" />
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
              className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors"
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
              className="w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/5 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
