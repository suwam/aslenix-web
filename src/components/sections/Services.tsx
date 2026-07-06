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

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => {
            const colors = [
              { name: "green", bgHover: "hover:shadow-emerald-500/10", gradient: "from-emerald-500/10", iconBox: "border-emerald-500/20", text: "text-emerald-500" },
              { name: "rose", bgHover: "hover:shadow-rose-500/10", gradient: "from-rose-500/10", iconBox: "border-rose-500/20", text: "text-rose-500" },
              { name: "blue", bgHover: "hover:shadow-blue-500/10", gradient: "from-blue-500/10", iconBox: "border-blue-500/20", text: "text-blue-500" },
              { name: "cyan", bgHover: "hover:shadow-cyan-500/10", gradient: "from-cyan-500/10", iconBox: "border-cyan-500/20", text: "text-cyan-500" },
              { name: "amber", bgHover: "hover:shadow-amber-500/10", gradient: "from-amber-500/10", iconBox: "border-amber-500/20", text: "text-amber-500" },
              { name: "purple", bgHover: "hover:shadow-purple-500/10", gradient: "from-purple-500/10", iconBox: "border-purple-500/20", text: "text-purple-500" },
              { name: "indigo", bgHover: "hover:shadow-indigo-500/10", gradient: "from-indigo-500/10", iconBox: "border-indigo-500/20", text: "text-indigo-500" },
              { name: "orange", bgHover: "hover:shadow-orange-500/10", gradient: "from-orange-500/10", iconBox: "border-orange-500/20", text: "text-orange-500" },
            ];
            
            const theme = colors[i % colors.length];

            return (
              <motion.button
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
                onClick={() => handleOpen(s)}
                className={`group relative bg-white rounded-2xl p-7 text-left w-full border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:-translate-y-1 transition-all duration-300 ${theme.bgHover} focus:outline-none overflow-hidden`}
                aria-label={`Open ${s.title} details`}
              >
                {/* Vertical Gradient matching image */}
                <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} to-transparent pointer-events-none opacity-60`} />

                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-5">
                    {/* Icon Container - White with colored border */}
                    <div className={`w-12 h-12 rounded-xl bg-white border ${theme.iconBox} flex items-center justify-center transition-transform group-hover:scale-105 duration-300 shadow-sm`}>
                      <s.icon className={`h-5 w-5 ${theme.text}`} />
                    </div>
                    {/* Top Right Label */}
                    <div className={`text-[10px] font-bold tracking-widest uppercase ${theme.text} opacity-80 mt-1`}>
                      SERVICE
                    </div>
                  </div>

                  <h3 className="text-xl font-bold font-sans text-slate-900 mb-1">{s.title}</h3>
                  <div className={`text-sm font-semibold ${theme.text} mb-3`}>Explore Capabilities</div>
                  <p className="text-[13px] text-slate-500 leading-relaxed mb-1">{s.desc}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <ServiceDetailModal service={selected} open={open} onOpenChange={setOpen} />
    </section>
  );
};
