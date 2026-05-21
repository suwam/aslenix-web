import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { Button } from "./ui/button";

const links = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Projects", href: "#projects" },
  { label: "Insights", href: "#blog" },
  { label: "Contact", href: "#contact" },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setScrolled((current) => {
          const next = window.scrollY > 30;
          return current === next ? current : next;
        });
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3 glass border-b border-white/5" : "py-5 bg-transparent"
      }`}
    >
      <div className="container flex items-center justify-between">
        <Logo />

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group"
            >
              {l.label}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-1/2 h-px bg-brand-gradient transition-all duration-300" />
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Button asChild variant="hero" size="sm">
            <a href="#contact">Let's Talk</a>
          </Button>
        </div>

        <button
          aria-label="Toggle menu"
          className="lg:hidden p-2 text-foreground"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-500 ${
          open ? "max-h-[500px] mt-4" : "max-h-0"
        }`}
      >
        <div className="container flex flex-col gap-1 glass rounded-2xl p-4">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="px-4 py-3 text-sm font-medium rounded-lg hover:bg-white/5 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <div className="mt-4 flex flex-col gap-3">
            <Button asChild variant="hero" className="mt-2">
              <a href="#contact" onClick={() => setOpen(false)}>Let's Talk</a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
