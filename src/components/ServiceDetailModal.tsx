import { motion, AnimatePresence } from "framer-motion";
import {
  X, Check, ArrowRight, Mail, MessageCircle, Sparkles, Package,
  Workflow, Cpu, Briefcase, HelpCircle, Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { processSteps, type Service, PRICING_DISCLAIMER, PRICING_CTA } from "@/data/services";

type Props = {
  service: Service | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const sectionFade = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const ServiceDetailModal = ({ service, open, onOpenChange }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[92vh] overflow-y-auto p-0 bg-card/95 backdrop-blur-2xl border-foreground/10 [&>button]:hidden">
        <DialogTitle className="sr-only">{service?.title ?? "Service"}</DialogTitle>
        <DialogDescription className="sr-only">{service?.desc ?? ""}</DialogDescription>

        <AnimatePresence mode="wait">
          {service && (
            <motion.div
              key={service.slug}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="relative overflow-hidden p-8 sm:p-10 border-b border-foreground/10">
                <div className="absolute inset-0 bg-brand-gradient opacity-[0.08]" />
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-brand-gradient opacity-30 blur-[120px] rounded-full" />

                <button
                  onClick={() => onOpenChange(false)}
                  className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full glass border border-foreground/10 flex items-center justify-center hover:border-accent/50 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="relative flex items-start gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center shrink-0 shadow-[var(--glow-brand)]">
                    <service.icon className="h-7 w-7 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="inline-block px-3 py-1 glass rounded-full text-xs font-medium text-accent mb-3">
                      ASLENIX SERVICE
                    </div>
                    <h2 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
                      {service.title}
                    </h2>
                    <p className="text-muted-foreground mt-2">{service.desc}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-10 space-y-12">
                {/* 1. Overview */}
                <motion.section {...sectionFade} transition={{ delay: 0.05 }}>
                  <SectionHeader icon={Sparkles} title="Service Overview" />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="glass rounded-2xl p-5">
                      <div className="text-xs font-semibold text-accent mb-2">WHAT IT IS</div>
                      <p className="text-sm text-foreground/90 leading-relaxed">{service.overview.what}</p>
                    </div>
                    <div className="glass rounded-2xl p-5">
                      <div className="text-xs font-semibold text-accent mb-2">WHY IT MATTERS</div>
                      <p className="text-sm text-foreground/90 leading-relaxed">{service.overview.why}</p>
                    </div>
                  </div>
                </motion.section>

                {/* 2. Deliverables */}
                <motion.section {...sectionFade} transition={{ delay: 0.1 }}>
                  <SectionHeader icon={Package} title="What We Deliver" />
                  <div className="grid sm:grid-cols-2 gap-3">
                    {service.deliverables.map((d) => (
                      <div key={d} className="flex items-start gap-3 glass rounded-xl p-4">
                        <div className="w-6 h-6 rounded-full bg-brand-gradient flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="h-3.5 w-3.5 text-foreground" />
                        </div>
                        <span className="text-sm text-foreground/90">{d}</span>
                      </div>
                    ))}
                  </div>
                </motion.section>

                {/* 3. Process */}
                <motion.section {...sectionFade} transition={{ delay: 0.15 }}>
                  <SectionHeader icon={Workflow} title="Our Development Process" />
                  <div className="relative">
                    <div className="hidden md:block absolute top-6 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3">
                      {processSteps.map((s, i) => (
                        <motion.div
                          key={s.step}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + i * 0.05 }}
                          className="relative glass rounded-xl p-3 text-center"
                        >
                          <div className="w-12 h-12 mx-auto rounded-full bg-brand-gradient flex items-center justify-center text-foreground font-display font-bold text-sm shadow-[var(--glow-brand)] mb-3">
                            {s.step}
                          </div>
                          <div className="font-display text-xs font-semibold mb-1 leading-tight">{s.title}</div>
                          <div className="text-[10px] text-muted-foreground leading-snug">{s.desc}</div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.section>

                {/* 4. Tech */}
                <motion.section {...sectionFade} transition={{ delay: 0.2 }}>
                  <SectionHeader icon={Cpu} title="Technologies We Use" />
                  <div className="flex flex-wrap gap-2">
                    {service.technologies.map((t) => (
                      <span
                        key={t}
                        className="px-4 py-2 glass rounded-full text-sm font-medium border border-foreground/10 hover:border-accent/40 hover:text-accent transition-colors"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </motion.section>

                {/* 5. Packages */}
                <motion.section {...sectionFade} transition={{ delay: 0.25 }}>
                  <SectionHeader icon={Package} title="Pricing & Packages" />
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {service.packages.map((p) => {
                      const scrollToContact = () => {
                        onOpenChange(false);
                        setTimeout(() => {
                          document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                        }, 200);
                      };
                      return (
                        <div
                          key={p.name}
                          className={`group relative rounded-[2rem] p-7 flex flex-col transition-all duration-500 overflow-hidden hover:-translate-y-2 ${
                            p.highlighted 
                              ? "bg-card shadow-2xl shadow-accent/20 border-0" 
                              : "glass hover:shadow-xl hover:shadow-accent/5"
                          }`}
                        >
                          {/* Inner glow on hover for non-highlighted */}
                          {!p.highlighted && (
                            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                          )}
                          
                          {/* Highlighted Styling enhancements */}
                          {p.highlighted && (
                            <>
                              {/* Background tint and top border */}
                              <div className="absolute inset-0 bg-brand-gradient opacity-[0.08] pointer-events-none" />
                              <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-gradient" />
                              
                              {/* Glowing orb in the corner */}
                              <div className="absolute -top-12 -right-12 w-40 h-40 bg-brand-gradient blur-[50px] opacity-40 rounded-full pointer-events-none" />
                              
                              <div className="absolute top-5 right-5">
                                <div className="px-4 py-1.5 rounded-full bg-brand-gradient text-foreground text-[10px] font-bold tracking-widest uppercase shadow-[0_4px_10px_rgba(200,180,255,0.4)]">
                                  Popular
                                </div>
                              </div>
                            </>
                          )}
                          
                          <div className="relative z-10 flex-1 flex flex-col">
                            <div className="font-display text-2xl font-bold mb-1 text-foreground">{p.name}</div>
                            {p.startingFrom && (
                              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                                Starting from
                              </div>
                            )}
                            <div className={`text-3xl sm:text-4xl font-display font-bold tracking-tight mb-8 ${p.highlighted ? "text-gradient" : "text-foreground"}`}>
                              {p.price}
                            </div>
                            
                            <ul className="space-y-4 flex-1 mb-8">
                              {p.features.map((f) => (
                                <li key={f} className="flex items-start gap-3 text-sm text-foreground/80 group/item">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors duration-300 ${
                                    p.highlighted 
                                      ? "bg-accent/20 text-accent" 
                                      : "bg-foreground/5 text-foreground/40 group-hover/item:bg-accent/10 group-hover/item:text-accent"
                                  }`}>
                                    <Check className="h-3.5 w-3.5" />
                                  </div>
                                  <span className="leading-relaxed">{f}</span>
                                </li>
                              ))}
                            </ul>

                            <div className="flex flex-col gap-3 mt-auto">
                              <Button 
                                variant={p.highlighted ? "hero" : "outline"} 
                                className={`w-full h-12 rounded-xl transition-all duration-300 ${
                                  p.highlighted 
                                    ? "shadow-[0_8px_20px_-8px_rgba(200,180,255,0.6)] hover:shadow-[0_8px_25px_-5px_rgba(200,180,255,0.8)]" 
                                    : "border-foreground/10 hover:border-accent/40 hover:bg-accent/5 hover:text-accent"
                                }`} 
                                size="lg" 
                                onClick={scrollToContact}
                              >
                                Get Quote
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="w-full h-10 rounded-xl text-muted-foreground hover:text-foreground hover:bg-foreground/5" 
                                onClick={scrollToContact}
                              >
                                Book Consultation
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-5 text-xs text-muted-foreground leading-relaxed">
                    <span className="text-accent font-medium">Disclaimer:</span> {PRICING_DISCLAIMER}
                  </p>
                  <p className="mt-2 text-xs text-foreground/80 leading-relaxed">{PRICING_CTA}</p>
                </motion.section>

                {/* 6. Case Studies */}
                <motion.section {...sectionFade} transition={{ delay: 0.3 }}>
                  <SectionHeader icon={Briefcase} title="Related Case Studies" />
                  <div className="grid sm:grid-cols-2 gap-4">
                    {service.caseStudies.map((c) => (
                      <div key={c.title} className="glass rounded-2xl p-5 glow-hover cursor-pointer">
                        <div className="text-xs text-accent font-medium mb-2">{c.category}</div>
                        <div className="font-display text-base font-semibold mb-1">{c.title}</div>
                        <p className="text-sm text-muted-foreground">{c.description}</p>
                      </div>
                    ))}
                  </div>
                </motion.section>

                {/* 7. FAQ */}
                <motion.section {...sectionFade} transition={{ delay: 0.35 }}>
                  <SectionHeader icon={HelpCircle} title="Frequently Asked Questions" />
                  <div className="space-y-3">
                    {service.faqs.map((f) => (
                      <details
                        key={f.q}
                        className="group glass rounded-xl p-4 cursor-pointer"
                      >
                        <summary className="flex items-center justify-between gap-4 list-none">
                          <span className="font-medium text-sm">{f.q}</span>
                          <ArrowRight className="h-4 w-4 text-accent transition-transform group-open:rotate-90 shrink-0" />
                        </summary>
                        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{f.a}</p>
                      </details>
                    ))}
                  </div>
                </motion.section>

                {/* 8 + 9. CTA + Quick Contact */}
                <motion.section {...sectionFade} transition={{ delay: 0.4 }}>
                  <div className="relative overflow-hidden rounded-2xl p-8 sm:p-10 text-center gradient-border bg-card">
                    <div className="absolute inset-0 bg-brand-gradient opacity-[0.08]" />
                    <div className="relative">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-gradient mb-5 shadow-[var(--glow-brand)]">
                        <Rocket className="h-6 w-6 text-foreground" />
                      </div>
                      <h3 className="font-display text-2xl sm:text-3xl font-bold mb-3">
                        Ready to <span className="text-gradient">make it possible?</span>
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-6">
                        Book a free consultation and we'll map out your project, timeline, and a clear path to launch.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        <Button
                          variant="hero"
                          size="lg"
                          onClick={() => {
                            onOpenChange(false);
                            setTimeout(() => {
                              document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                            }, 200);
                          }}
                        >
                          Start Your Project <ArrowRight className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="glass"
                          size="lg"
                          onClick={() => {
                            onOpenChange(false);
                            setTimeout(() => {
                              document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                            }, 200);
                          }}
                        >
                          Get Free Consultation
                        </Button>
                      </div>

                      <div className="mt-7 pt-6 border-t border-foreground/10">
                        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Quick Contact</div>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                          <a
                            href={`https://wa.me/9779709043147?text=${encodeURIComponent(`Hi ASLENIX, I'm interested in ${service.title}.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border border-foreground/10 hover:border-accent/50 text-sm font-medium transition-colors"
                          >
                            <MessageCircle className="h-4 w-4 text-accent" />
                            WhatsApp
                          </a>
                          <a
                            href={`mailto:info.aslenix.np@gmail.com?subject=${encodeURIComponent(`Inquiry: ${service.title}`)}`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border border-foreground/10 hover:border-accent/50 text-sm font-medium transition-colors"
                          >
                            <Mail className="h-4 w-4 text-accent" />
                            Email Us
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.section>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

const SectionHeader = ({ icon: Icon, title }: { icon: typeof Sparkles; title: string }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-9 h-9 rounded-xl glass border border-foreground/10 flex items-center justify-center">
      <Icon className="h-4 w-4 text-accent" />
    </div>
    <h3 className="font-display text-xl font-semibold">{title}</h3>
  </div>
);
