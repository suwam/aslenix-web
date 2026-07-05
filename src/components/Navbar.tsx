import { useState, useEffect, memo } from "react";
import { Menu, X, PhoneCall, ArrowRight } from "lucide-react";
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

export const Navbar = memo(() => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Optional: add a subtle scale/shadow change on scroll if desired, 
  // though the requirements mostly ask for a fixed floating pill.
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 30);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full h-[80px] flex items-center justify-between px-6 lg:px-12 bg-white transition-all duration-300 ${
          scrolled ? "shadow-sm" : "border-b border-gray-100"
        }`}
      >
        {/* Left: Logo */}
        <Logo textClassName="text-foreground font-serif font-bold tracking-tight" className="w-14 h-14 lg:w-16 lg:h-16" />

        {/* Center: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-slate-600 hover:text-[#7B2FF7] transition-colors duration-300 relative group"
            >
              {l.label}
              {/* Colorful gradient underline hover effect */}
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-[#FF007F] via-[#7B2FF7] to-[#2563EB] rounded-full transition-all duration-300" />
            </a>
          ))}
        </nav>

        {/* Right: Phone & Button */}
        <div className="hidden lg:flex items-center gap-5">
          <a href="tel:+9779709043147" className="group flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-50/80 border border-indigo-50 hover:bg-indigo-50/50 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all duration-300 font-medium text-sm text-slate-700 hover:text-indigo-900">
            <div className="bg-gradient-to-br from-[#7B2FF7]/10 to-[#2563EB]/10 p-1.5 rounded-full group-hover:from-[#7B2FF7]/20 group-hover:to-[#2563EB]/20 transition-all duration-300">
              <PhoneCall className="w-3.5 h-3.5 text-[#7B2FF7]" />
            </div>
            <span>9709043147</span>
          </a>
          <Button 
            asChild 
            className="bg-gradient-to-r from-[#7B2FF7] to-[#2563EB] text-white hover:opacity-90 rounded-full px-7 py-5 font-medium transition-all duration-300 shadow-[0_8px_20px_-6px_rgba(123,47,247,0.4)] hover:shadow-[0_12px_25px_-8px_rgba(123,47,247,0.6)] hover:-translate-y-0.5 border-0 group relative overflow-hidden"
          >
            <a href="#contact" className="flex items-center">
              {/* Shine effect overlay */}
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
              <span className="relative z-10 flex items-center">
                Let's Talk
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </a>
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <button
          aria-label="Toggle menu"
          className="lg:hidden p-2 text-slate-900 hover:bg-slate-50 transition-colors"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile menu popup */}
      <div
        className={`fixed z-40 left-0 right-0 w-full bg-white border-b border-gray-100 overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "top-[80px] opacity-100 max-h-[600px] shadow-sm" : "top-[60px] opacity-0 max-h-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col p-6 space-y-2">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="px-4 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50 transition-colors"
            >
              {l.label}
            </a>
          ))}
          <div className="h-px w-full bg-slate-100 my-2" />
          <a href="tel:+9779709043147" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-900 hover:text-primary transition-colors">
            <PhoneCall className="w-4 h-4" />
            <span>9709043147</span>
          </a>
          <div className="pt-4">
            <Button 
              asChild 
              className="w-full bg-slate-900 text-white rounded-none py-6 font-serif tracking-wide border-0"
            >
              <a href="#contact" onClick={() => setOpen(false)}>Let's Talk</a>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
});
