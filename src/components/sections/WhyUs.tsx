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
    <section id="why" className="py-24 sm:py-32 relative overflow-hidden bg-background">
      {/* Background Glows */}
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute inset-0 grid-pattern opacity-10" />
        <div className="absolute -left-1/4 top-1/4 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,_rgba(186,230,253,0.3),transparent_70%)] blur-[100px]" />
        <div className="absolute -right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,_rgba(233,213,255,0.3),transparent_70%)] blur-[100px]" />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-foreground/10 bg-foreground/5 text-sm font-medium text-foreground mb-6 shadow-sm backdrop-blur-xl">
            <span className="flex h-2 w-2 rounded-full bg-accent animate-pulse" />
            <span className="tracking-[0.2em] uppercase">Why Aslenix</span>
          </div>
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight">
            Built different. <span className="text-gradient relative inline-block">
              By design.
              <span className="absolute -inset-2 bg-brand-gradient blur-2xl opacity-20 -z-10" />
            </span>
          </h2>
          <p className="text-muted-foreground text-lg sm:text-xl leading-relaxed">
            Six reasons teams choose us — and stay with us.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {reasons.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.1 }}
              className="group relative overflow-hidden rounded-[2rem] border border-foreground/10 bg-background/60 p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-accent/30 backdrop-blur-xl"
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-brand-gradient/0 via-brand-gradient/10 to-brand-gradient/0 opacity-0 transition-all duration-700 group-hover:translate-x-full group-hover:opacity-100" />
              <div className="absolute inset-0 bg-brand-gradient opacity-0 transition-opacity duration-500 group-hover:opacity-[0.03]" />
              
              <div className="relative z-10 flex flex-col gap-5">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground/5 border border-foreground/10 text-foreground shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-brand-gradient group-hover:border-transparent group-hover:text-foreground group-hover:shadow-[0_0_30px_-5px_hsl(var(--accent)/0.6)]">
                  <r.icon className="h-6 w-6 transition-colors duration-500" />
                </div>
                <div className="space-y-3">
                  <h3 className="font-display text-xl font-bold tracking-tight text-foreground">{r.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{r.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
