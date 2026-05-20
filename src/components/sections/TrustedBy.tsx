import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/aslenix-logo.png";

type Brand = {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
};

const sb = supabase as any;

export const TrustedBy = () => {
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => {
    sb.from("brands")
      .select("id,name,logo_url,website_url")
      .eq("active", true)
      .order("display_order")
      .then(({ data }: any) => setBrands((data ?? []) as Brand[]));
  }, []);

  // Fallback to ASLENIX logo only when no brands are configured
  const items: Brand[] = brands.length > 0
    ? brands
    : Array.from({ length: 6 }, (_, i) => ({
        id: `aslenix-${i}`, name: "ASLENIX", logo_url: logo, website_url: null,
      }));

  // Repeat enough times that the marquee feels like one continuous belt.
  const row = Array.from({ length: 4 }, () => items).flat();

  return (
    <section className="relative overflow-hidden bg-background py-8 sm:py-10">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,45,146,0.09),rgba(209,59,255,0.07),rgba(59,130,246,0.08))]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18] blur-3xl"
        style={{ background: "var(--gradient-brand)" }}
      />

      <div className="container relative z-10">
        <div className="text-center mb-6">
          <p className="font-mono text-sm sm:text-base tracking-[0.25em] uppercase">
            <span className="text-white font-semibold">UI/UX Best</span>
          </p>
        </div>
      </div>

      <div className="relative group z-10">
        {/* edge fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 sm:w-32 z-20 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 sm:w-32 z-20 bg-gradient-to-l from-background to-transparent" />

        <div className="pointer-events-none absolute left-1/2 top-1/2 h-20 w-[115%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-[linear-gradient(90deg,rgba(255,45,146,0.18),rgba(209,59,255,0.12),rgba(59,130,246,0.16),rgba(255,45,146,0.18))] shadow-[0_20px_90px_-42px_rgba(255,45,146,0.8)] blur-[0.5px]" />

        <div className="flex w-max animate-marquee items-center gap-8 px-8 [animation-duration:30s] group-hover:[animation-play-state:paused]">
          {row.map((b, i) => {
            const inner = b.logo_url ? (
              <img
                src={b.logo_url}
                alt={b.name}
                className="max-h-10 sm:max-h-12 w-auto object-contain
                           opacity-95 saturate-150 contrast-125
                           transition-all duration-500
                           group-hover/logo:scale-105
                           group-hover/logo:drop-shadow-[0_0_18px_hsl(var(--accent)/0.85)]"
                loading="lazy"
              />
            ) : (
              <span
                className="font-display text-sm sm:text-base font-semibold tracking-tight
                           bg-brand-gradient bg-clip-text text-transparent transition-all duration-500"
              >
                {b.name}
              </span>
            );

            return (
              <div
                key={`${b.id}-${i}`}
                className="group/logo relative flex h-16 min-w-40 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/12 bg-[#151120]/75 px-8 shadow-[0_18px_55px_-35px_rgba(255,45,146,0.8)] backdrop-blur-xl transition hover:border-accent/45 hover:bg-white/[0.08] sm:min-w-48 sm:px-10"
                title={b.name}
              >
                <div className="absolute inset-0 bg-brand-gradient opacity-10 transition group-hover/logo:opacity-20" />
                <div className="relative z-10 flex items-center justify-center">
                {b.website_url ? (
                  <a href={b.website_url} target="_blank" rel="noreferrer" aria-label={b.name}>
                    {inner}
                  </a>
                ) : (
                  inner
                )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
