import { useEffect, useState } from "react";
import logo from "@/assets/aslenix-logo.webp";

export const Loader = () => {
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [done, setDone] = useState(false);

  // Wait for both: logo loaded AND minimum display time, then fade out.
  useEffect(() => {
    if (!logoLoaded) return;
    const t = setTimeout(() => setDone(true), 350);
    return () => clearTimeout(t);
  }, [logoLoaded]);

  // Hard fallback: never block the page longer than 1.5s, even if image fails.
  useEffect(() => {
    const t = setTimeout(() => {
      setLogoLoaded(true);
      setDone(true);
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-background flex items-center justify-center transition-opacity duration-700 ${
        done ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden={done}
    >
      <div className="absolute inset-0 grid-pattern opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-brand-gradient blur-[100px] opacity-30 animate-pulse-glow" />

      <div className="relative flex flex-col items-center gap-6">
        <div className="relative">
          {/* Red gradient glow halo behind logo */}
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-70 animate-pulse-glow"
            style={{
              background:
                "radial-gradient(circle, hsl(var(--accent) / 0.9), hsl(var(--accent) / 0.3) 60%, transparent 80%)",
            }}
          />
          <img
            src={logo}
            alt="ASLENIX"
            width={96}
            height={96}
            decoding="sync"
            loading="eager"
            fetchPriority="high"
            onLoad={() => setLogoLoaded(true)}
            onError={() => setLogoLoaded(true)}
            className="relative w-24 h-24 object-contain drop-shadow-[0_0_30px_hsl(var(--accent)/0.7)]"
            style={{ opacity: 1 }}
          />
        </div>
        <div className="font-display text-2xl font-bold text-gradient tracking-widest">ASLENIX</div>
        <div className="w-32 h-0.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-gradient"
            style={{ animation: "loaderBar 1.2s ease-in-out infinite" }}
          />
        </div>
      </div>

      <style>{`
        @keyframes loaderBar {
          0% { transform: translateX(-100%); width: 30%; }
          50% { width: 80%; }
          100% { transform: translateX(400%); width: 30%; }
        }
      `}</style>
    </div>
  );
};
