import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { supabase } from "@/integrations/supabase/client";

type Project = {
  id: string; title: string; short_description: string | null;
  cover_image: string | null; category: string | null;
};

const tabs = ["All", "Web", "App", "Branding", "AI", "Software"] as const;
type Tab = typeof tabs[number];

export const Projects = () => {
  const [active, setActive] = useState<Tab>("All");
  const projects = useSupabaseRealtime<Project[]>(
    async () => {
      const { data } = await supabase.from("projects").select("id,title,short_description,cover_image,category")
        .order("display_order").order("created_at", { ascending: false });
      return (data ?? []) as Project[];
    },
    ["projects"],
    [],
  ) ?? [];

  const filtered = active === "All" ? projects : projects.filter((p) => (p.category ?? "").toLowerCase() === active.toLowerCase());

  return (
    <section id="projects" className="py-24 sm:py-32 relative">
      <div className="container">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-block px-3 py-1 glass rounded-full text-xs font-medium text-accent mb-6">SELECTED WORK</div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
              Crafted for <span className="text-gradient">visionary brands</span>
            </h2>
          </motion.div>
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button key={t} onClick={() => setActive(t)}
                className={`px-4 py-2 text-sm font-medium rounded-full border transition-all duration-300 ${
                  active === t ? "bg-brand-gradient text-white border-transparent shadow-[0_0_30px_hsl(var(--accent)/0.4)]" : "glass text-muted-foreground hover:text-foreground border-white/5"
                }`}>{t}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">No projects to show yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p, i) => (
              <motion.article key={p.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group relative gradient-border glass rounded-2xl overflow-hidden glow-hover cursor-pointer">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {p.cover_image ? (
                    <img src={p.cover_image} alt={p.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-brand-gradient opacity-30" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <ArrowUpRight className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-xs font-medium text-accent mb-2">{p.category ?? ""}</div>
                  <h3 className="font-display text-xl font-semibold mb-2">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.short_description}</p>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
