import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  Cpu,
  ExternalLink,
  Gauge,
  Globe,
  Layers,
  LayoutDashboard,
  MonitorSmartphone,
  Sparkles,
  type LucideIcon,
  X,
} from "lucide-react";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

type Project = {
  id: string; title: string; short_description: string | null;
  full_description: string | null; cover_image: string | null; category: string | null;
  gallery: unknown;
  technologies: string[] | null; project_url: string | null; client_name: string | null;
  completion_date: string | null;
};

const tabs = ["All", "Web", "App", "Branding", "AI", "Software"] as const;
type Tab = typeof tabs[number];

const parseGallery = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        return [record.url, record.src, record.public_url, record.image].find((v) => typeof v === "string") as string | undefined;
      }
      return undefined;
    })
    .filter((url): url is string => Boolean(url?.trim()));
};

export const Projects = () => {
  const [active, setActive] = useState<Tab>("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const projects = useSupabaseRealtime<Project[]>(
    async () => {
      const { data } = await supabase.from("projects").select("id,title,short_description,full_description,cover_image,gallery,category,technologies,project_url,client_name,completion_date")
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
  const technologies = project?.technologies?.filter(Boolean) ?? [];
  const galleryImages = parseGallery(project?.gallery);
  const featureCards = [
    {
      icon: MonitorSmartphone,
      title: "Responsive Experience",
      text: "Designed to feel polished across desktop, tablet, and mobile screens.",
    },
    {
      icon: LayoutDashboard,
      title: "Admin Dashboard",
      text: "Structured management tools for content, operations, and future growth.",
    },
    {
      icon: Cpu,
      title: "Modern Stack",
      text: technologies.length ? `${technologies.slice(0, 3).join(", ")}${technologies.length > 3 ? " and more." : "."}` : "Built with a scalable, performance-focused technology stack.",
    },
    {
      icon: Sparkles,
      title: "Brand-Led UI",
      text: "A visual system shaped around clarity, trust, and conversion.",
    },
  ];
  const stats = [
    { icon: MonitorSmartphone, label: "Responsive", value: "Yes" },
    { icon: LayoutDashboard, label: "Admin Dashboard", value: "Included" },
    { icon: Cpu, label: "Technologies Used", value: technologies.length ? `${technologies.length}` : "Custom" },
    { icon: CheckCircle2, label: "Completion Status", value: formattedDate ? "Completed" : "Showcase" },
  ];
  const gallery = galleryImages.length ? galleryImages : project?.cover_image ? [project.cover_image] : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[1180px] w-[95vw] max-h-[92vh] overflow-y-auto p-0 bg-card/95 backdrop-blur-2xl border-white/10 shadow-[0_30px_120px_-45px_hsl(var(--accent)/0.45)] [&>button]:hidden">
        <DialogTitle className="sr-only">{project?.title ?? "Project details"}</DialogTitle>
        <DialogDescription className="sr-only">{project?.short_description ?? ""}</DialogDescription>

        {project && (
          <div className="relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-72 bg-brand-gradient opacity-[0.08] blur-[90px]" />

            <header className="relative z-10 flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-8">
              <div className="min-w-0">
                <div className="text-xs font-medium uppercase tracking-[0.24em] text-accent">Project Showcase</div>
                <div className="mt-1 truncate font-display text-lg font-semibold text-foreground">{project.title}</div>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:bg-white/[0.06] hover:text-foreground"
                aria-label="Close project details"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="relative z-10 space-y-8 p-5 sm:p-8 lg:p-10">
              <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
                <div className="space-y-6">
                  <div className="inline-flex w-fit rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                    {project.category || "Featured Project"}
                  </div>
                  <div>
                    <h3 className="font-display text-3xl font-bold leading-tight sm:text-5xl">{project.title}</h3>
                    {project.short_description && (
                      <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                        {project.short_description}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <ProjectMeta icon={Globe} label="Project Type" value={project.category || "Digital Product"} />
                    <ProjectMeta icon={Gauge} label="Status" value={formattedDate ? `Completed ${formattedDate}` : "Portfolio Ready"} />
                  </div>

                  <div className="flex flex-wrap gap-3 pt-1">
                    {project.project_url && (
                      <>
                        <Button asChild variant="hero">
                          <a href={project.project_url} target="_blank" rel="noreferrer">
                            Live Demo <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        <Button asChild variant="glass">
                          <a href={project.project_url} target="_blank" rel="noreferrer">
                            Visit Website <Globe className="h-4 w-4" />
                          </a>
                        </Button>
                      </>
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

                <div className="relative">
                  <div className="absolute -inset-4 rounded-[2rem] bg-brand-gradient opacity-20 blur-2xl" />
                  <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-3 shadow-[0_30px_100px_-50px_rgba(0,0,0,0.9)]">
                    <div className="mb-3 flex items-center gap-2 px-1">
                      <span className="h-2.5 w-2.5 rounded-full bg-secondary" />
                      <span className="h-2.5 w-2.5 rounded-full bg-accent" />
                      <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                    </div>
                    <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-muted">
                      {project.cover_image ? (
                        <img src={project.cover_image} alt={`${project.title} screenshot`} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-brand-gradient opacity-30">
                          <Layers className="h-12 w-12 text-accent" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                  <ProjectStat key={stat.label} {...stat} />
                ))}
              </section>

              <section>
                <div className="mb-5 flex items-end justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Overview</div>
                    <h4 className="mt-2 font-display text-2xl font-semibold">Built for clarity, speed, and trust</h4>
                  </div>
                </div>
                <p className="max-w-4xl whitespace-pre-line text-sm leading-7 text-muted-foreground sm:text-base">{description}</p>
              </section>

              <section>
                <div className="mb-5">
                  <div className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Highlights</div>
                  <h4 className="mt-2 font-display text-2xl font-semibold">Key capabilities</h4>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {featureCards.map((feature) => (
                    <FeatureCard key={feature.title} {...feature} />
                  ))}
                </div>
              </section>

              {technologies.length ? (
                <section>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient">
                      <Cpu className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="font-display text-2xl font-semibold">Technology Stack</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {technologies.map((tech, index) => (
                      <span
                        key={tech}
                        className={`rounded-full border px-4 py-2 text-sm font-medium shadow-[0_12px_30px_-22px_hsl(var(--accent)/0.8)] ${
                          index % 3 === 0
                            ? "border-accent/25 bg-accent/10 text-accent"
                            : index % 3 === 1
                              ? "border-primary/25 bg-primary/10 text-blue-300"
                              : "border-secondary/25 bg-secondary/10 text-pink-300"
                        }`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}

              <section>
                <div className="mb-5">
                  <div className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Gallery</div>
                  <h4 className="mt-2 font-display text-2xl font-semibold">Screenshots</h4>
                </div>
                {gallery.length ? (
                  <div className="grid gap-4 md:grid-cols-3">
                    {gallery.map((src, index) => (
                      <div key={`${src}-${index}`} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-2">
                        <div className="aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                          <img
                            src={src}
                            alt={`${project.title} gallery screenshot ${index + 1}`}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-muted-foreground">
                    Screenshots will be added soon.
                  </div>
                )}
              </section>

              <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-xs font-medium uppercase tracking-[0.2em] text-accent">Next Project</div>
                    <h4 className="mt-2 font-display text-2xl font-semibold">Want a result like this?</h4>
                    <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                      Tell us what you are building and we will map the right design, stack, and launch path.
                    </p>
                  </div>
                  <Button
                    variant="hero"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      onOpenChange(false);
                      setTimeout(() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" }), 200);
                    }}
                  >
                    Start Similar Project <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              </section>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const ProjectMeta = ({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
    <div className="mb-1 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
      <Icon className="h-3.5 w-3.5 text-accent" />
      {label}
    </div>
    <div className="font-display text-sm font-semibold text-foreground">{value}</div>
  </div>
);

const ProjectStat = ({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) => (
  <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:bg-white/[0.05]">
    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient shadow-[0_0_24px_hsl(var(--accent)/0.22)]">
      <Icon className="h-4 w-4 text-white" />
    </div>
    <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
    <div className="mt-1 font-display text-lg font-semibold">{value}</div>
  </div>
);

const FeatureCard = ({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) => (
  <div className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent/40">
    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient shadow-[0_0_28px_hsl(var(--accent)/0.24)]">
      <Icon className="h-5 w-5 text-white" />
    </div>
    <h5 className="font-display text-base font-semibold">{title}</h5>
    <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
  </div>
);
