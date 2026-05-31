import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Calendar, Cpu, ExternalLink, User, X } from "lucide-react";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type Project = {
  id: string; title: string; short_description: string | null;
  full_description: string | null; cover_image: string | null; category: string | null;
  technologies: string[] | null; project_url: string | null; client_name: string | null;
  completion_date: string | null;
};

const tabs = ["All", "Web", "App", "Branding", "AI", "Software"] as const;
type Tab = typeof tabs[number];

export const Projects = () => {
  const [active, setActive] = useState<Tab>("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const projects = useSupabaseRealtime<Project[]>(
    async () => {
      const { data } = await supabase.from("projects").select("id,title,short_description,full_description,cover_image,category,technologies,project_url,client_name,completion_date")
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
              <motion.button key={p.id} type="button" onClick={() => setSelectedProject(p)} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group relative text-left gradient-border glass rounded-2xl overflow-hidden glow-hover cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/70">
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
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <ProjectDetailModal
        project={selectedProject}
        open={Boolean(selectedProject)}
        onOpenChange={(open) => {
          if (!open) setSelectedProject(null);
        }}
      />
    </section>
  );
};

const ProjectDetailModal = ({
  project,
  open,
  onOpenChange,
}: {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const formattedDate = project?.completion_date
    ? new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date(project.completion_date))
    : null;
  const description = project?.full_description || project?.short_description || "More details for this project are coming soon.";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[92vh] overflow-y-auto p-0 bg-card/95 backdrop-blur-2xl border-white/10 [&>button]:hidden">
        <DialogTitle className="sr-only">{project?.title ?? "Project details"}</DialogTitle>
        <DialogDescription className="sr-only">{project?.short_description ?? ""}</DialogDescription>

        {project && (
          <div>
            <div className="relative min-h-[280px] overflow-hidden">
              {project.cover_image ? (
                <img src={project.cover_image} alt={project.title} className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-brand-gradient opacity-40" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-card/10" />
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full glass border border-white/10 transition-colors hover:border-accent/50"
                aria-label="Close project details"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="relative z-10 flex min-h-[280px] flex-col justify-end p-6 sm:p-10">
                <div className="mb-4 inline-flex w-fit rounded-full glass px-3 py-1 text-xs font-medium text-accent">
                  {project.category || "Project"}
                </div>
                <h3 className="font-display text-3xl font-bold leading-tight sm:text-5xl">{project.title}</h3>
                {project.short_description && (
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/80 sm:text-base">
                    {project.short_description}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-8 p-6 sm:p-10">
              <div className="grid gap-3 sm:grid-cols-3">
                {project.client_name && <ProjectFact icon={User} label="Client" value={project.client_name} />}
                {formattedDate && <ProjectFact icon={Calendar} label="Completed" value={formattedDate} />}
                {project.technologies?.length ? <ProjectFact icon={Cpu} label="Stack" value={`${project.technologies.length} technologies`} /> : null}
              </div>

              <section>
                <h4 className="mb-3 font-display text-xl font-semibold">Project Overview</h4>
                <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground sm:text-base">{description}</p>
              </section>

              {project.technologies?.length ? (
                <section>
                  <h4 className="mb-4 font-display text-xl font-semibold">Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span key={tech} className="rounded-full border border-white/10 glass px-4 py-2 text-sm font-medium text-foreground/90">
                        {tech}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}

              <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
                {project.project_url && (
                  <Button asChild variant="hero">
                    <a href={project.project_url} target="_blank" rel="noreferrer">
                      Visit Project <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                <Button
                  variant="glass"
                  onClick={() => {
                    onOpenChange(false);
                    setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 200);
                  }}
                >
                  Start Similar Project <ArrowUpRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const ProjectFact = ({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) => (
  <div className="glass rounded-2xl border border-white/10 p-4">
    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient">
      <Icon className="h-4 w-4 text-white" />
    </div>
    <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
    <div className="mt-1 font-display text-base font-semibold">{value}</div>
  </div>
);
