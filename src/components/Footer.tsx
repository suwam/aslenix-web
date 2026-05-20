import { Logo } from "./Logo";
import { Mail, Phone, Globe, MessageCircle } from "lucide-react";

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

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenTerms: () => void;
}

export const Footer = ({ onOpenPrivacy, onOpenTerms }: FooterProps) => {
  return (
    <footer className="relative pt-20 pb-8 border-t border-white/5">
      <div className="absolute inset-x-0 top-0 h-px bg-brand-gradient opacity-50" />
      <div className="absolute inset-x-0 -top-40 h-[300px] bg-brand-gradient opacity-[0.06] blur-[120px] -z-10" />

      <div className="container">
        <div className="grid lg:grid-cols-4 gap-10 mb-12">
          <div className="lg:col-span-2 space-y-4">
            <Logo />
            <p className="text-base text-muted-foreground leading-relaxed max-w-md">
              ASLENIX is a next-gen digital studio from Nepal — engineering websites,
              apps, AI products, and brands that move the world forward.
            </p>
            <div className="space-y-2.5 text-base">
              <a href="mailto:info.aslenix.np@gmail.com" className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors">
                <Mail className="h-4 w-4" /> info.aslenix.np@gmail.com
              </a>
              <a href="tel:+9779709043147" className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors">
                <Phone className="h-4 w-4" /> +977 9709043147
              </a>
              <a href="https://www.aslenix.tech" className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors">
                <Globe className="h-4 w-4" /> www.aslenix.tech
              </a>
              <a href="https://wa.me/message/JIZWD7OFCQVWK1" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-lg font-semibold mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-base text-muted-foreground hover:text-accent transition-colors">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="relative pt-8 border-t border-white/5 flex flex-col items-center gap-4 text-sm text-muted-foreground sm:min-h-12 sm:justify-center">
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
