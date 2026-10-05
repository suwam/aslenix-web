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
        <div className="relative mx-auto mb-16 max-w-5xl overflow-hidden rounded-3xl border border-sky-200/60 bg-gradient-to-br from-sky-100/80 via-white/90 to-violet-100/80 p-7 text-slate-800 shadow-[0_20px_70px_-45px_rgba(59,130,246,0.35)] sm:p-10 lg:mb-20 lg:p-12 dark:border-white/10 dark:from-sky-950/35 dark:via-background/90 dark:to-violet-950/35 dark:text-foreground">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-400/10" />
          <div className="pointer-events-none absolute -bottom-24 -left-12 h-64 w-64 rounded-full bg-violet-300/20 blur-3xl dark:bg-violet-400/10" />

          <div className="relative space-y-5">
            <p className="max-w-4xl text-base leading-8 sm:text-lg">
              ASLENIX is a digital agency based in Nepal helping businesses launch high-impact web
              platforms, mobile products, AI systems, and growth strategies.
            </p>

            <p className="max-w-4xl text-base leading-8 text-slate-700 sm:text-lg dark:text-foreground/80">
              We design and build modern websites, SaaS products, ERP systems, AI solutions, and
              brand experiences that help startups and businesses scale with clarity and speed.
            </p>

            <ul className="flex flex-wrap gap-2.5 pt-2 text-sm font-medium sm:gap-3">
              {[
                "Web Development",
                "Mobile App Development",
                "AI Solutions",
                "ERP Systems",
                "Branding & Digital Strategy",
              ].map((service) => (
                <li
                  key={service}
                  className="rounded-full border border-sky-200/70 bg-white/70 px-4 py-2 text-slate-700 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-foreground/90"
                >
                  {service}
                </li>
              ))}
            </ul>
          </div>
        </div>

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
