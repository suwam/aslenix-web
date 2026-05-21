import { ArrowLeft, ArrowRight, Brain, Code2, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import dashboardOne from "@/assets/project-1.webp";
import dashboardTwo from "@/assets/project-5.webp";
import dashboardThree from "@/assets/project-6.webp";
import dashboardFour from "@/assets/project-2.webp";

const DEFAULTS = {
  title: "UI/UX Best",
  subtitle: "ASLENIX delivers dark-mode SaaS design, AI-first workflows, and enterprise-grade product engineering for modern operators.",
  ctaPrimaryText: "Book a strategy call",
  ctaPrimaryLink: "#contact",
  ctaSecondaryText: "View our services",
  ctaSecondaryLink: "#services",
};

const renderTitle = (raw: string) => {
  if (raw.toUpperCase().includes("ASLENIX")) {
    const idx = raw.toUpperCase().lastIndexOf("ASLENIX");
    const before = raw.slice(0, idx);
    const word = raw.slice(idx, idx + 7);
    const after = raw.slice(idx + 7);
    return (
      <>
        {before}
        <span className="text-gradient relative inline-flex items-center">
          {word}
          <span className="absolute -inset-2 bg-brand-gradient blur-2xl opacity-25 -z-10" />
        </span>
        {after}
      </>
    );
  }
  return raw;
};

const phrases = [
  "AI-powered product experiences",
  "Enterprise SaaS systems",
  "Growth-focused digital platforms",
];

const dashboardSlides = [
  { src: dashboardOne, alt: "Dark analytics dashboard with charts and data tables" },
  { src: dashboardTwo, alt: "AI analytics dashboard with graphs and metrics" },
  { src: dashboardThree, alt: "Ecommerce product dashboard interface" },
  { src: dashboardFour, alt: "Mobile app interface screens" },
];

type HeroSlide = {
  src: string;
  alt: string;
};

const HERO_CACHE_KEY = "aslenix:homepage-content:v1";

const parseHeroSlides = (value: unknown): HeroSlide[] | null => {
  if (!Array.isArray(value)) return null;
  const slides = value
    .map((slide) => {
      if (!slide || typeof slide !== "object") return null;
      const record = slide as Record<string, unknown>;
      const src = typeof record.src === "string" ? record.src.trim() : "";
      const alt = typeof record.alt === "string" ? record.alt.trim() : "";
      return src ? { src, alt: alt || "Dashboard preview" } : null;
    })
    .filter((slide): slide is HeroSlide => Boolean(slide));
  return slides.length > 0 ? slides : null;
};

const readCachedHomepageData = () => {
  if (typeof window === "undefined") return undefined;
  try {
    const cached = window.localStorage.getItem(HERO_CACHE_KEY);
    return cached ? JSON.parse(cached) : undefined;
  } catch {
    return undefined;
  }
};

const cacheHomepageData = (data: unknown) => {
  try {
    window.localStorage.setItem(HERO_CACHE_KEY, JSON.stringify(data));
  } catch {
    // Cache is only a speed boost; the live request still drives correctness.
  }
};

const fetchHomepageData = async () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;

  const response = await fetch(`${url}/rest/v1/homepage_content?select=*&id=eq.1`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/vnd.pgrst.object+json",
    },
  });

  if (!response.ok) return null;
  return response.json();
};

export const Hero = () => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [typedText, setTypedText] = useState(phrases[0]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [enhanced, setEnhanced] = useState(false);
  const [homepageData, setHomepageData] = useState<any>(() => readCachedHomepageData());

  useEffect(() => {
    let mounted = true;

    fetchHomepageData().then((data) => {
      if (!mounted) return;
      setHomepageData(data);
      if (data) cacheHomepageData(data);
    }).catch(() => {
      if (mounted) setHomepageData(null);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const homepageLoaded = homepageData !== undefined;
  const content = {
    title: homepageLoaded ? homepageData?.hero_title ?? DEFAULTS.title : "",
    subtitle: homepageLoaded ? homepageData?.hero_subtitle ?? DEFAULTS.subtitle : "",
    ctaPrimaryText: homepageLoaded ? homepageData?.hero_cta_primary_text ?? DEFAULTS.ctaPrimaryText : "",
    ctaPrimaryLink: homepageLoaded ? homepageData?.hero_cta_primary_link ?? DEFAULTS.ctaPrimaryLink : "#contact",
    ctaSecondaryText: homepageLoaded ? homepageData?.hero_cta_secondary_text ?? DEFAULTS.ctaSecondaryText : "",
    ctaSecondaryLink: homepageLoaded ? homepageData?.hero_cta_secondary_link ?? DEFAULTS.ctaSecondaryLink : "#services",
  };
  const customSlides = parseHeroSlides(homepageData?.hero_slides);
  const slides = homepageLoaded ? customSlides ?? dashboardSlides : [];
  const slideCount = slides.length;

  useEffect(() => {
    const timeout = window.setTimeout(() => setEnhanced(true), 900);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!enhanced) return;
    const currentPhrase = phrases[phraseIndex];
    const timeout = window.setTimeout(() => {
      if (!isDeleting) {
        if (typedText.length < currentPhrase.length) {
          setTypedText(currentPhrase.slice(0, typedText.length + 1));
        } else {
          setIsDeleting(true);
        }
      } else {
        if (typedText.length > 0) {
          setTypedText(currentPhrase.slice(0, typedText.length - 1));
        } else {
          setIsDeleting(false);
          setPhraseIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, typedText.length === currentPhrase.length && !isDeleting ? 1300 : isDeleting ? 45 : 70);

    return () => window.clearTimeout(timeout);
  }, [typedText, isDeleting, phraseIndex, enhanced]);

  useEffect(() => {
    if (!enhanced) return;
    if (window.matchMedia("(max-width: 767px)").matches) return;
    if (slideCount <= 1) return;
    const interval = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slideCount);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [slideCount, enhanced]);

  useEffect(() => {
    if (slideCount > 0 && activeSlide >= slideCount) setActiveSlide(0);
  }, [activeSlide, slideCount]);

  const goToSlide = (index: number) => {
    setActiveSlide((index + slideCount) % slideCount);
  };

  const highlights = [
    { icon: Code2, title: "Web Development" },
    { icon: Brain, title: "AI Solutions" },
    { icon: Database, title: "ERP Systems" },
  ];

  return (
    <section id="home" className="hero relative overflow-hidden bg-background/95 py-24 sm:py-28 lg:py-32">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute left-1/4 top-6 h-[280px] w-[320px] rounded-full bg-[radial-gradient(circle,_rgba(255,79,216,0.22),transparent_68%)] blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[260px] w-[420px] rounded-full bg-[radial-gradient(circle,_rgba(59,132,246,0.18),transparent_68%)] blur-3xl" />
        <div className="absolute left-0 bottom-0 h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,_rgba(255,79,216,0.18),transparent_70%)] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-14 px-6 sm:px-8 lg:px-12 xl:px-16 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="max-w-2xl space-y-8 animate-enter-up">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-muted-foreground backdrop-blur-xl shadow-[0_0_40px_-20px_rgba(255,79,216,0.3)]">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#ffffff0f] text-base">✨</span>
            <span className="font-medium text-white/80">Premium SaaS, AI & growth systems</span>
          </div>

          <div className="space-y-6">
            <h1 className="font-display text-4xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              {homepageLoaded ? renderTitle(content.title) : <span className="block h-[1.1em] w-3/4 rounded-2xl bg-white/10" />}
            </h1>
            <div className="space-y-4">
              <p className="max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                {homepageLoaded ? content.subtitle : <span className="block h-20 rounded-2xl bg-white/10" />}
              </p>
              {homepageLoaded && (
                <p className="max-w-xl text-base leading-8 text-white/80 sm:text-lg">
                  <span className="text-white/70">Delivering</span>{" "}
                  <span className="text-gradient">{typedText}</span>
                  <span className="inline-block h-6 w-1 animate-pulse bg-white rounded-sm align-middle ml-1" />
                </p>
              )}
            </div>
          </div>

          {homepageLoaded && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4">
              <Button asChild variant="hero" size="lg" className="w-full sm:w-auto">
                <a href={content.ctaPrimaryLink}>
                  {content.ctaPrimaryText}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="glass" size="lg" className="w-full sm:w-auto">
                <a href={content.ctaSecondaryLink}>{content.ctaSecondaryText}</a>
              </Button>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            {highlights.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4 shadow-[0_20px_70px_-45px_rgba(0,0,0,0.85)] transition hover:border-accent/35"
                >
                  <div className="absolute inset-0 -translate-x-full bg-brand-gradient opacity-20 transition-transform duration-700 group-hover:translate-x-0" />
                  <div className="absolute inset-y-0 left-0 w-1/2 bg-brand-gradient opacity-10 blur-2xl" />
                  <div className="relative flex min-w-0 items-center gap-2.5">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-[0_0_24px_-8px_hsl(var(--accent)/0.8)]">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 bg-brand-gradient bg-clip-text font-display text-[15px] font-semibold leading-tight text-transparent sm:text-base">
                      {item.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-[680px] items-center justify-center lg:ml-8 xl:ml-14 animate-enter-side md:hidden">
          <div className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d111d]/80 p-5 shadow-[0_24px_80px_-42px_rgba(0,0,0,0.9)]">
            <div className="absolute inset-0 grid-pattern opacity-10" />
            <div className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-gradient opacity-15 blur-3xl" />
            <div className="relative space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-white/45">Live Systems</p>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-white">Fast digital builds</h2>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient shadow-[0_0_28px_-8px_hsl(var(--accent)/0.9)]">
                  <Code2 className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {["SaaS", "AI", "ERP"].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-4 text-center">
                    <div className="text-lg font-semibold text-white">{item}</div>
                    <div className="mt-1 h-1 rounded-full bg-brand-gradient opacity-70" />
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_16px_rgba(74,222,128,0.9)]" />
                  <span className="text-sm text-white/70">Optimized for mobile-first launches</span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-full w-4/5 rounded-full bg-brand-gradient" />
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div className="h-full w-2/3 rounded-full bg-brand-gradient opacity-70" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative mx-auto hidden w-full max-w-[680px] items-center justify-center lg:ml-8 xl:ml-14 md:flex animate-enter-side">
          <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-white/5 via-transparent to-white/0 shadow-[0_0_180px_0_rgba(59,132,246,0.14)]" />
          <div className="absolute inset-0 rounded-[3rem] border border-white/10 bg-white/[0.035] backdrop-blur-[28px]" />

          <div className="relative flex min-h-[360px] w-full items-center justify-center overflow-hidden rounded-[3rem] border border-white/10 bg-[#0d111d]/80 px-5 py-10 shadow-[0_40px_140px_-50px_rgba(0,0,0,0.85)] sm:min-h-[430px] sm:px-7 sm:py-12 lg:min-h-[520px] lg:px-9">
            <div className="absolute inset-0 grid-pattern opacity-10" />
            <div className="absolute left-1/2 top-1/2 h-[340px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(255,79,216,0.2),transparent_68%)] blur-3xl" />
            <div className="absolute left-1/2 top-1/2 h-[360px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,_rgba(59,132,246,0.14),transparent_70%)] blur-3xl" />

            <div className="relative z-10 w-full max-w-[600px] overflow-hidden rounded-[2.25rem] border border-white/10 bg-[#060916] p-3 shadow-[0_26px_90px_-35px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.08)] sm:p-4">
              <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-black">
                {slideCount > 0 ? (
                  <div
                    className="flex transition-transform duration-700 ease-out"
                    style={{ transform: `translate3d(-${activeSlide * 100}%, 0, 0)` }}
                  >
                    {slides.map((slide, index) => (
                      <div key={`${slide.src}-${index}`} className="relative aspect-[16/10.5] min-w-full basis-full shrink-0 overflow-hidden">
                        <img
                          src={slide.src}
                          alt={slide.alt}
                          className="h-full w-full object-cover"
                          loading={index === 0 ? "eager" : "lazy"}
                          decoding="async"
                          fetchPriority={index === 0 ? "high" : "low"}
                          draggable={false}
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,9,22,0.12),rgba(6,9,22,0.36))]" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="aspect-[16/10.5] animate-pulse bg-white/10" />
                )}
              </div>

              {slideCount > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Show previous dashboard image"
                    onClick={() => goToSlide(activeSlide - 1)}
                    className="absolute left-7 top-1/2 z-20 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur-xl transition hover:bg-black/80"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Show next dashboard image"
                    onClick={() => goToSlide(activeSlide + 1)}
                    className="absolute right-7 top-1/2 z-20 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur-xl transition hover:bg-black/80"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              )}

              <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/70 px-3 py-2 backdrop-blur-xl">
                {slides.map((slide, index) => (
                  <button
                    key={`${slide.src}-dot-${index}`}
                    type="button"
                    aria-label={`Show dashboard image ${index + 1}`}
                    aria-current={activeSlide === index}
                    onClick={() => goToSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeSlide === index ? "w-7 bg-white" : "w-2 bg-white/70 hover:bg-white"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
