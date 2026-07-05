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
    <footer className="relative pt-20 pb-8 border-t border-foreground/5">
      <div className="absolute inset-x-0 top-0 h-px bg-brand-gradient opacity-50" />
      <div className="absolute inset-x-0 -top-40 h-[300px] bg-brand-gradient opacity-[0.06] blur-[120px] -z-10" />

      <div className="container">
        <div className="grid lg:grid-cols-4 gap-10 mb-12">
          <div className="lg:col-span-2 space-y-4">
            <Logo />
            <p className="text-base text-muted-foreground leading-relaxed max-w-md">
              ASLENIX is a digital design and development studio in Nepal focusing on web development,
              mobile applications, artificial intelligence products, and brand innovations.
            </p>
            <div className="space-y-2.5 text-base border-y border-foreground/5 py-4 sm:border-b-0 sm:pb-0">
              <a href="mailto:info.aslenix.np@gmail.com" className="group flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors">
                <Mail className="h-4 w-4" /> info.aslenix.np@gmail.com
              </a>
              <a href="tel:+9779709043147" className="group flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors">
                <Phone className="h-4 w-4" /> +977 9709043147
              </a>
              <a href="https://www.aslenix.tech" className="group flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors">
                <Globe className="h-4 w-4" /> www.aslenix.tech
              </a>
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-1 h-4 w-4 shrink-0" /> New Baneshwor, Buddhanagar-10, Kathmandu
              </div>
              <a href="https://wa.me/message/JIZWD7OFCQVWK1" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300 shadow-[0_0_24px_-14px_rgba(52,211,153,0.9)]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300" />
                </span>
                Available for New Projects
              </div>

              {socials.length > 0 && (
                <div className="flex items-center gap-2">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="group flex h-9 w-9 items-center justify-center rounded-full border border-foreground/10 bg-foreground/[0.03] text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:bg-brand-gradient hover:text-foreground hover:shadow-[0_10px_28px_-16px_hsl(var(--accent)/0.9)]"
                    >
                      <s.icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-lg font-semibold mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="inline-flex text-base text-muted-foreground transition-all duration-300 hover:translate-x-1 hover:text-accent">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="relative pt-8 border-t border-foreground/5 flex flex-col items-center gap-4 text-sm text-muted-foreground sm:min-h-12 sm:justify-center">
          <div className="text-gradient text-center font-semibold">
            © {new Date().getFullYear()} ASLENIX. Crafted with vision in Nepal.
          </div>
          <div className="flex gap-5 sm:absolute sm:right-0 sm:top-8">
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
