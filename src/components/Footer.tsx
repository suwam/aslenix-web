import { Logo } from "./Logo";
import { Facebook, Github, Globe, Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { supabase } from "@/integrations/supabase/client";

const cols = [
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Why Us", href: "#why" },
      { label: "Insights", href: "#blog" },
      { label: "Contact", href: "#contact" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Web Development", href: "#services" },
      { label: "Mobile Apps", href: "#services" },
      { label: "AI Solutions", href: "#services" },
      { label: "Branding", href: "#services" },
    ],
  },
];

const socialDefinitions = [
  { icon: Facebook, key: "facebook", label: "Facebook", fallback: "https://www.facebook.com/aslenix.tech" },
  { icon: Linkedin, key: "linkedin", label: "LinkedIn", fallback: "https://www.linkedin.com/company/aslenix" },
  { icon: Github, key: "github", label: "GitHub", fallback: "https://github.com/aslenix" },
  { icon: Instagram, key: "instagram", label: "Instagram", fallback: "https://www.instagram.com/aslenix.tech" },
];

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export const Footer = ({ onOpenPrivacy, onOpenTerms }: FooterProps) => {
  const settings = useSupabaseRealtime<any>(
    async () => {
      const { data } = await supabase.from("site_settings").select("social_links").eq("id", 1).maybeSingle();
      return data ?? null;
    },
    ["site_settings"],
    [],
  );

  const socialLinks =
    settings?.social_links && typeof settings.social_links === "object" && !Array.isArray(settings.social_links)
      ? settings.social_links as Record<string, string>
      : {};
  const normalizeUrl = (url?: string | null) => {
    const trimmed = url?.trim();
    if (!trimmed) return "";
    if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };
  const socials = socialDefinitions
    .map((social) => ({ ...social, href: normalizeUrl(socialLinks[social.key]) || social.fallback }))
    .filter((social) => social.href);

  return (
    <footer className="relative mt-12 pt-16 pb-6 border-t border-foreground/10 overflow-hidden bg-background/95">
      {/* Background Ambience */}
      <div className="absolute inset-x-0 top-0 h-px bg-brand-gradient opacity-40" />
      <div className="absolute inset-x-0 -top-40 h-[300px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/20 via-background to-background opacity-40 blur-[100px] -z-10 pointer-events-none" />
      <div className="absolute right-0 bottom-0 h-[400px] w-[400px] bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background opacity-30 blur-[120px] -z-10 pointer-events-none" />
      
      <div className="container relative z-10">
        <div className="grid lg:grid-cols-12 gap-8 mb-10">
          <div className="lg:col-span-5 xl:col-span-6 space-y-6">
            <div className="space-y-4">
              <Logo />
              <p className="text-base text-muted-foreground leading-relaxed max-w-md">
                ASLENIX is a digital design and development studio in Nepal focusing on web development,
                mobile applications, artificial intelligence products, and brand innovations.
              </p>
              
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-emerald-300 shadow-[0_0_24px_-14px_rgba(52,211,153,0.9)] transition-all hover:bg-emerald-400/15">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
                </span>
                Available for New Projects
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-foreground/10 pt-6">
              <a href="mailto:info.aslenix.np@gmail.com" className="group flex items-start gap-3 p-3 rounded-xl border border-foreground/5 bg-foreground/[0.015] hover:border-accent/30 hover:bg-foreground/[0.04] hover:shadow-[0_8px_30px_-12px_hsl(var(--accent)/0.2)] transition-all duration-300">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground/5 text-muted-foreground group-hover:bg-brand-gradient group-hover:text-foreground transition-all duration-300 shadow-sm">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="flex flex-col pt-0">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground group-hover:text-accent transition-colors">Email</span>
                  <span className="text-xs font-medium text-foreground/90 mt-0.5">info.aslenix.np@gmail.com</span>
                </div>
              </a>
              <a href="tel:+9779709043147" className="group flex items-start gap-3 p-3 rounded-xl border border-foreground/5 bg-foreground/[0.015] hover:border-accent/30 hover:bg-foreground/[0.04] hover:shadow-[0_8px_30px_-12px_hsl(var(--accent)/0.2)] transition-all duration-300">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground/5 text-muted-foreground group-hover:bg-brand-gradient group-hover:text-foreground transition-all duration-300 shadow-sm">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="flex flex-col pt-0">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground group-hover:text-accent transition-colors">Call Us</span>
                  <span className="text-xs font-medium text-foreground/90 mt-0.5">+977 9709043147</span>
                </div>
              </a>
              <div className="group flex items-start gap-3 p-3 rounded-xl border border-foreground/5 bg-foreground/[0.015] hover:border-accent/30 hover:bg-foreground/[0.04] hover:shadow-[0_8px_30px_-12px_hsl(var(--accent)/0.2)] transition-all duration-300">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground/5 text-muted-foreground group-hover:bg-brand-gradient group-hover:text-foreground transition-all duration-300 shadow-sm">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="flex flex-col pt-0">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground group-hover:text-accent transition-colors">Office</span>
                  <span className="text-xs font-medium text-foreground/90 mt-0.5 leading-snug">Buddhanagar-10,<br/>Kathmandu</span>
                </div>
              </div>
              <a href="https://wa.me/message/JIZWD7OFCQVWK1" target="_blank" rel="noopener noreferrer" className="group flex items-start gap-3 p-3 rounded-xl border border-foreground/5 bg-foreground/[0.015] hover:border-[#25D366]/30 hover:bg-[#25D366]/5 hover:shadow-[0_8px_30px_-12px_rgba(37,211,102,0.2)] transition-all duration-300">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground/5 text-muted-foreground group-hover:bg-[#25D366] group-hover:text-white transition-all duration-300 shadow-sm">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div className="flex flex-col pt-0">
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground group-hover:text-[#25D366] transition-colors">WhatsApp</span>
                  <span className="text-xs font-medium text-foreground/90 mt-0.5">Let's Chat</span>
                </div>
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 xl:col-span-6 grid sm:grid-cols-2 gap-8 lg:pl-10 xl:pl-20">
            {cols.map((col) => (
              <div key={col.title}>
                <h4 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-foreground mb-4">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} className="group inline-flex items-center text-base text-muted-foreground transition-all duration-300 hover:text-foreground">
                        <span className="h-px w-0 bg-accent transition-all duration-300 group-hover:w-3 group-hover:mr-3 opacity-0 group-hover:opacity-100"></span>
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            
            <div className="sm:col-span-2 pt-6 sm:pt-0 sm:border-t-0 border-t border-foreground/10">
               <h4 className="font-display text-xs font-bold uppercase tracking-[0.2em] text-foreground mb-4">Connect</h4>
               {settings === null ? (
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-10 w-10 rounded-xl bg-foreground/5 animate-pulse"></div>
                  ))}
                </div>
              ) : socials.length > 0 ? (
                <div className="flex items-center gap-2">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="group flex h-10 w-10 items-center justify-center rounded-xl border border-foreground/10 bg-foreground/[0.02] text-muted-foreground transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:bg-brand-gradient hover:text-foreground hover:shadow-[0_12px_30px_-15px_hsl(var(--accent)/0.8)]"
                    >
                      <s.icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Follow us on our social platforms.</p>
              )}
            </div>
          </div>
        </div>

        <div className="relative pt-6 border-t border-foreground/5 flex flex-col items-center gap-4 text-sm text-muted-foreground sm:min-h-12 sm:justify-center">
          <div className="text-gradient text-center font-semibold">
            © {new Date().getFullYear()} ASLENIX. Crafted with vision in Nepal.
          </div>
          <div className="flex gap-5 sm:absolute sm:right-0 sm:top-6">
            <button type="button" onClick={onOpenPrivacy} className="hover:text-accent transition-colors text-left">
              Privacy
            </button>
            <button type="button" onClick={onOpenTerms} className="hover:text-accent transition-colors text-left">
              Terms
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
