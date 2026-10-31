import { ArrowLeft, ArrowRight, ArrowUpRight, Brain, Code2, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { getVideoEmbedUrl, isVideoSource, type HeroSlide } from "@/lib/video";
import { CinematicVideoShowcase } from "@/components/sections/CinematicVideoShowcase";
import dashboardOne from "@/assets/project-1.webp";
import dashboardTwo from "@/assets/project-5.webp";
import dashboardThree from "@/assets/project-6.webp";
import dashboardFour from "@/assets/project-2.webp";

const DEFAULTS = {
  title: "UI/UX Best",
  subtitle: "ASLENIX crafts world-class web, mobile, and AI products for ambitious brands.",
  ctaPrimaryText: "Get Started",
  ctaPrimaryLink: "#contact",
  ctaSecondaryText: "View Work",
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

const dashboardSlides: HeroSlide[] = [
  { src: dashboardOne, alt: "Dark analytics dashboard with charts and data tables", type: "image" },
  { src: dashboardTwo, alt: "AI analytics dashboard with graphs and metrics", type: "image" },
  { src: dashboardThree, alt: "Ecommerce product dashboard interface", type: "image" },
  { src: dashboardFour, alt: "Mobile app interface screens", type: "image" },
];

const HERO_CACHE_KEY = "aslenix:homepage-content:v1";

const parseHeroSlides = (value: unknown): HeroSlide[] | null => {
  if (!Array.isArray(value)) return null;
  const slides: HeroSlide[] = [];
  for (const slide of value) {
    if (!slide || typeof slide !== "object") continue;
    const record = slide as Record<string, unknown>;
    const src = typeof record.src === "string" ? record.src.trim() : "";
    if (!src) continue;
    const alt = typeof record.alt === "string" ? record.alt.trim() : "";
    const type: "image" | "video" | undefined =
      record.type === "video" || record.type === "image" ? record.type : undefined;
    slides.push({ src, alt: alt || "Dashboard preview", type });
  }
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
    // Cache is only a speed boost; live request drives correctness.
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
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
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
    subtitle: homepageLoaded ? homepageData?.hero_subtitle ?? DEFAULTS.subtitle : DEFAULTS.subtitle,
    ctaPrimaryText: homepageLoaded ? homepageData?.hero_cta_primary_text ?? DEFAULTS.ctaPrimaryText : DEFAULTS.ctaPrimaryText,
    ctaPrimaryLink: homepageLoaded ? homepageData?.hero_cta_primary_link ?? DEFAULTS.ctaPrimaryLink : DEFAULTS.ctaPrimaryLink,
    ctaSecondaryText: homepageLoaded ? homepageData?.hero_cta_secondary_text ?? DEFAULTS.ctaSecondaryText : DEFAULTS.ctaSecondaryText,
    ctaSecondaryLink: homepageLoaded ? homepageData?.hero_cta_secondary_link ?? DEFAULTS.ctaSecondaryLink : DEFAULTS.ctaSecondaryLink,
  };
  const customSlides = parseHeroSlides(homepageData?.hero_slides);
  const slides = homepageLoaded ? customSlides ?? dashboardSlides : [];
  const slideCount = slides.length;
  const currentSlide = slides[activeSlide];
  const currentIsVideo = currentSlide ? isVideoSource(currentSlide.src, currentSlide.type) : false;
  const currentEmbedUrl = currentIsVideo && currentSlide ? getVideoEmbedUrl(currentSlide.src) : null;

  useEffect(() => {
    const timeout = window.setTimeout(() => setEnhanced(true), 900);
    return () => window.clearTimeout(timeout);
  }, []);

  // Smooth typing effect without layout shifts or awkward clipping
  useEffect(() => {
    if (!enhanced) return;
    const currentPhrase = phrases[phraseIndex];
    const timeout = window.setTimeout(
      () => {
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
      },
      typedText.length === currentPhrase.length && !isDeleting
        ? 1800
        : isDeleting
        ? 35
        : 65,
    );

    return () => window.clearTimeout(timeout);
  }, [typedText, isDeleting, phraseIndex, enhanced]);

  // Auto-advance slides if not hovering and slide is an image
  useEffect(() => {
    if (!enhanced) return;
    if (slideCount <= 1) return;
    if (isHovered) return;
    if (currentIsVideo) return; // Keep video playing smoothly without abrupt slide change

    const interval = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slideCount);
    }, 4500);

    return () => window.clearInterval(interval);
  }, [slideCount, enhanced, isHovered, currentIsVideo, activeSlide]);

  useEffect(() => {
    if (slideCount > 0 && activeSlide >= slideCount) setActiveSlide(0);
  }, [activeSlide, slideCount]);

  const handleVideoEnded = () => {
    if (slideCount > 1) {
      goToSlide(activeSlide + 1);
    }
  };

  const goToSlide = (index: number) => {
    setActiveSlide((index + slideCount) % slideCount);
    setIsPlaying(true);
  };

  const highlights = [
    { icon: Code2, title: "Web Development", href: "#services" },
    { icon: Brain, title: "AI Solutions", href: "#services" },
    { icon: Database, title: "ERP Systems", href: "#services" },
  ];

  return (
    <section id="home" className="hero relative overflow-hidden bg-background/95 py-20 sm:py-24 lg:py-28">
      {/* Ambient background atmosphere */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute left-1/4 top-6 h-[280px] w-[320px] rounded-full bg-[radial-gradient(circle,_rgba(186,230,253,0.35),transparent_68%)] blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[260px] w-[420px] rounded-full bg-[radial-gradient(circle,_rgba(233,213,255,0.35),transparent_68%)] blur-3xl" />
        <div className="absolute left-0 bottom-0 h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,_rgba(186,230,253,0.25),transparent_70%)] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1440px] 2xl:max-w-[1600px] flex-col gap-12 sm:gap-14 px-5 sm:px-8 lg:px-10 xl:px-12 lg:grid lg:grid-cols-[42%_58%] xl:grid-cols-[40%_60%] lg:items-center lg:gap-12 xl:gap-16">
        {/* Left Column: Editorial Headline & Content */}
        <div className="max-w-2xl space-y-7 sm:space-y-8 animate-enter-up">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-3 rounded-full border border-foreground/10 bg-foreground/[0.04] px-4 py-2 text-sm text-muted-foreground backdrop-blur-xl shadow-[0_0_40px_-20px_rgba(186,230,253,0.5)]">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#ffffff0f] text-sm">✨</span>
            <span className="font-medium text-foreground/85 text-xs sm:text-sm">Premium SaaS, AI & growth systems</span>
          </div>

          {/* Headline & Description Block */}
          <div className="space-y-5 sm:space-y-6">
            <h1 className="font-display text-[2.5rem] leading-[1.08] tracking-[-0.035em] text-foreground sm:text-5xl sm:leading-[1.08] lg:text-[3.25rem] lg:leading-[1.06] xl:text-[4rem] xl:leading-[1.05] 2xl:text-[4.5rem] text-balance">
              {homepageLoaded ? renderTitle(content.title) : <span className="block h-[1.1em] w-3/4 rounded-2xl bg-foreground/10" />}
            </h1>

            <div className="space-y-3.5">
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg sm:leading-8 font-normal">
                {homepageLoaded ? content.subtitle : <span className="block h-20 rounded-2xl bg-foreground/10" />}
              </p>

              {homepageLoaded && (
                <div className="min-h-[1.75rem] sm:min-h-[2rem] flex items-center flex-wrap gap-x-1.5 text-base sm:text-lg leading-7 font-normal">
                  <span className="text-foreground/70">Delivering</span>
                  <span className="text-gradient font-medium inline-block">{typedText}</span>
                  <span className="inline-block h-5 w-[2px] sm:h-5.5 bg-gradient-to-b from-sky-400 to-indigo-500 rounded-full animate-pulse ml-0.5 align-middle" />
                </div>
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          {homepageLoaded && (
            <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:gap-4 pt-1">
              <Button
                asChild
                variant="hero"
                size="lg"
                className="group relative inline-flex h-12 sm:h-13 w-full sm:w-auto items-center justify-center rounded-xl bg-brand-gradient px-7 font-display text-sm sm:text-base font-semibold text-white shadow-[0_8px_24px_-6px_hsl(var(--accent)/0.5)] transition-all duration-300 hover:shadow-[0_12px_32px_-4px_hsl(var(--accent)/0.65)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <a href={content.ctaPrimaryLink}>
                  <span>{content.ctaPrimaryText}</span>
                  <ArrowRight className="ml-2.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </Button>
              <Button
                asChild
                variant="glass"
                size="lg"
                className="group inline-flex h-12 sm:h-13 w-full sm:w-auto items-center justify-center rounded-xl border border-foreground/15 bg-foreground/[0.04] px-7 font-display text-sm sm:text-base font-semibold text-foreground backdrop-blur-md transition-all duration-300 hover:bg-foreground/[0.08] hover:border-foreground/25 hover:scale-[1.02] active:scale-[0.98]"
              >
                <a href={content.ctaSecondaryLink}>
                  <span>{content.ctaSecondaryText}</span>
                  <ArrowUpRight className="ml-2 h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </Button>
            </div>
          )}

          {/* Service Cards (3 Columns) */}
          <div className="grid gap-3 sm:grid-cols-3 pt-2">
            {highlights.map((item, index) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.title}
                  href={item.href || "#services"}
                  style={{ animationDelay: `${350 + index * 80}ms` }}
                  className="group relative flex h-[72px] sm:h-[76px] items-center justify-between rounded-xl border border-foreground/10 bg-card/60 dark:bg-foreground/[0.035] px-3.5 sm:px-4 backdrop-blur-sm shadow-[0_8px_20px_-6px_rgba(0,0,0,0.06)] dark:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.4)] transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-[0_14px_30px_-6px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.6)] cursor-pointer"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-brand-gradient/12 text-foreground border border-foreground/10 transition-colors duration-300 group-hover:bg-brand-gradient/20">
                      <Icon className="h-4 w-4 text-foreground/90 transition-transform duration-300 group-hover:scale-110" />
                    </span>
                    <span className="min-w-0 font-display text-[13.5px] sm:text-[14.5px] font-semibold leading-tight text-foreground transition-colors duration-200 group-hover:text-foreground">
                      {item.title}
                    </span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-all duration-300 group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Right Column: Oversized Cinematic Video Showcase with 35–45px top and 30–40px right spacing on desktop */}
        <div
          className="relative w-full animate-enter-side flex flex-col items-center justify-center lg:items-end lg:pt-10 lg:pr-8 xl:pt-11 xl:pr-10"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Ambient subtle backlight behind the cinematic showcase */}
          <div className="pointer-events-none absolute -inset-6 sm:-inset-10 rounded-[3rem] bg-gradient-to-tr from-sky-500/12 via-indigo-500/8 to-transparent blur-3xl opacity-40 transition-opacity duration-700 -z-10" />

          {/* Oversized Cinematic Video Showcase Container */}
          <div className="relative w-full">
            {currentSlide ? (
              <CinematicVideoShowcase
                key={`showcase-${currentSlide.src}-${activeSlide}`}
                src={currentSlide.src}
                alt={currentSlide.alt}
                isVideo={currentIsVideo}
                embedUrl={currentEmbedUrl}
                isActive={true}
                isPlaying={isPlaying}
                isMuted={isMuted}
                onTogglePlay={() => setIsPlaying((p) => !p)}
                onToggleMute={() => setIsMuted((m) => !m)}
                onVideoEnd={handleVideoEnded}
              />
            ) : (
              <div className="h-[320px] sm:h-[400px] md:h-[480px] lg:h-[540px] xl:h-[600px] 2xl:h-[640px] w-full animate-pulse rounded-[24px] lg:rounded-[28px] bg-foreground/10" />
            )}

            {/* Slide Navigation Controls (if multi-slide) */}
            {slideCount > 1 && (
              <div className="mt-3.5 flex items-center justify-between px-1.5">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label="Show previous slide"
                    onClick={() => goToSlide(activeSlide - 1)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/80 backdrop-blur-md shadow-sm transition-all duration-200 hover:bg-black/70 hover:text-white hover:scale-105 active:scale-95"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label="Show next slide"
                    onClick={() => goToSlide(activeSlide + 1)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/80 backdrop-blur-md shadow-sm transition-all duration-200 hover:bg-black/70 hover:text-white hover:scale-105 active:scale-95"
                  >
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {slides.map((slide, index) => (
                    <button
                      key={`${slide.src}-dot-${index}`}
                      type="button"
                      aria-label={`Show slide ${index + 1}`}
                      aria-current={activeSlide === index}
                      onClick={() => goToSlide(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        activeSlide === index
                          ? "w-6 bg-white/90"
                          : "w-1.5 bg-foreground/20 hover:bg-foreground/40"
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
