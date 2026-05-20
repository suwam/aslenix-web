import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { services, type Service } from "@/data/services";
import { ServiceDetailModal } from "@/components/ServiceDetailModal";

export const Services = () => {
  const [selected, setSelected] = useState<Service | null>(null);
  const [open, setOpen] = useState(false);

  const handleOpen = (service: Service) => {
    setSelected(service);
    setOpen(true);
  };

  return (
    <section id="services" className="py-24 sm:py-32 relative">
      <div className="absolute inset-x-0 top-1/4 h-[400px] bg-brand-gradient opacity-[0.07] blur-[150px] -z-10" />

      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-block px-3 py-1 glass rounded-full text-xs font-medium text-accent mb-6">
            WHAT WE DO
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight mb-6">
            Services that ship{" "}
            <span className="text-gradient">real results</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            End-to-end digital capabilities under one roof — from strategy to launch and beyond.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((s, i) => (
            <motion.button
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
              onClick={() => handleOpen(s)}
              className="group relative gradient-border glass rounded-2xl p-6 glow-hover cursor-pointer text-left w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={`Open ${s.title} details`}
            >
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full glass border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:bg-brand-gradient group-hover:border-transparent">
                <ArrowUpRight className="h-4 w-4 text-foreground group-hover:text-white transition-colors" />
              </div>
              <div className="w-12 h-12 rounded-xl bg-muted/50 border border-white/5 flex items-center justify-center mb-5 group-hover:bg-brand-gradient transition-all duration-500">
                <s.icon className="h-5 w-5 text-foreground group-hover:text-white transition-colors" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{s.desc}</p>
              <div className="text-xs font-medium text-accent inline-flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                Learn more
                <ArrowUpRight className="h-3 w-3" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <ServiceDetailModal service={selected} open={open} onOpenChange={setOpen} />
    </section>
  );
};
