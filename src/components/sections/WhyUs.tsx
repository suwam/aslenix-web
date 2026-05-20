import { motion } from "framer-motion";
import { Lightbulb, Gem, Layers, Rocket, Users, Cpu } from "lucide-react";

const reasons = [
  { icon: Lightbulb, title: "Innovative Approach", desc: "We push past convention to deliver ideas that move markets." },
  { icon: Gem, title: "Premium Design", desc: "Every pixel is intentional — refined, distinctive, on-brand." },
  { icon: Layers, title: "Scalable Solutions", desc: "Architectures that grow gracefully from MVP to millions." },
  { icon: Rocket, title: "Fast Delivery", desc: "Agile sprints, transparent timelines, rapid iterations." },
  { icon: Users, title: "Client-Focused", desc: "Your goals lead. We listen, advise, and over-deliver." },
  { icon: Cpu, title: "Modern Tech Stack", desc: "React, Node, AI, Cloud — battle-tested and future-ready." },
];

export const WhyUs = () => {
  return (
    <section id="why" className="py-24 sm:py-32 relative">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-block px-4 py-2 glass rounded-full text-sm font-semibold text-accent mb-6 tracking-[0.28em]">
            WHY ASLENIX
          </div>
          <h2 className="font-display text-5xl sm:text-6xl xl:text-7xl font-bold leading-tight mb-6">
            Built different. <span className="text-gradient">By design.</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Six reasons teams choose us — and stay with us.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reasons.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              className="group relative gradient-border glass rounded-2xl p-7 glow-hover"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-brand-gradient flex items-center justify-center shadow-[0_0_20px_hsl(var(--accent)/0.35)]">
                  <r.icon className="h-4.5 w-4.5 text-white" />
                </div>
                <h3 className="font-display text-lg font-semibold">{r.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{r.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
