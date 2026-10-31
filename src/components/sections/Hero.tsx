import { ArrowLeft, ArrowRight, Brain, Code2, Database, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { getVideoEmbedUrl, isVideoSource, type HeroSlide } from "@/lib/video";
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

const dashboardSlides: HeroSlide[] = [
  { src: dashboardOne, alt: "Dark analytics dashboard with charts and data tables", type: "image" },
  { src: dashboardTwo, alt: "AI analytics dashboard with graphs and metrics", type: "image" },
  { src: dashboardThree, alt: "Ecommerce product dashboard interface", type: "image" },
  { src: dashboardFour, alt: "Mobile app interface screens", type: "image" },
];

const HERO_CACHE_KEY = "aslenix:homepage-content:v1";

const parseHeroSlides = (value: unknown): HeroSlide[] | null => {
  if (!Array.isArray(value)) return null;
  const slides = value
    .map((slide) => {
      if (!slide || typeof slide !== "object") return null;
      const record = slide as Record<string, unknown>;
      const src = typeof record.src === "string" ? record.src.trim() : "";
      const alt = typeof record.alt === "string" ? record.alt.trim() : "";
      const type = record.type === "video" || record.type === "image" ? record.type : undefined;
      return src ? { src, alt: alt || "Dashboard preview", type } : null;
    })
    .filter((slide): slide is HeroSlide => Boolean(slide));
  return slides.length > 0 ? slides : null;
};

const HeroSlideMedia = ({
  slide,
  isActive,
  index,
  slideCount,
  isMuted,
  isPlaying,
  onVideoEnd,
}: {
  slide: HeroSlide;
  isActive: boolean;
  index: number;
  slideCount: number;
  isMuted: boolean;
  isPlaying: boolean;
  onVideoEnd?: () => void;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideo = isVideoSource(slide.src, slide.type);
  const embedUrl = isVideo ? getVideoEmbedUrl(slide.src) : null;

  useEffect(() => {
    if (!videoRef.current || !isVideo || embedUrl) return;

    if (isActive) {
      if (isPlaying) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // Autoplay may be restricted by browser until user interacts
          });
        }
      } else {
        videoRef.current.pause();
      }
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isActive, isPlaying, isVideo, embedUrl]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  if (isVideo) {
    if (embedUrl) {
      return (
        <div className="relative h-full w-full min-w-full basis-full shrink-0 overflow-hidden bg-black">
          {isActive ? (
            <iframe
              src={embedUrl}
              title={slide.alt || "Video preview"}
              className="h-full w-full border-0 pointer-events-auto"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : (
            <div className="h-full w-full bg-black/40" />
          )}
        </div>
      );
    }

    return (
      <div className="relative h-full w-full min-w-full basis-full shrink-0 overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={slide.src}
          className="h-full w-full object-cover"
          playsInline
          muted={isMuted}
          autoPlay={isActive}
          loop={slideCount === 1}
          preload="metadata"
          onEnded={onVideoEnd}
        />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full min-w-full basis-full shrink-0 overflow-hidden bg-black/20">
      <img
        src={slide.src}
        alt={slide.alt || "Dashboard preview"}
        className="h-full w-full object-cover"
        loading={index === 0 ? "eager" : "lazy"}
        decoding="async"
        fetchpriority={index === 0 ? "high" : "low"}
        draggable={false}
      />
    </div>
  );
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
    subtitle: homepageLoaded ? homepageData?.hero_subtitle ?? DEFAULTS.subtitle : "",
    ctaPrimaryText: homepageLoaded ? homepageData?.hero_cta_primary_text ?? DEFAULTS.ctaPrimaryText : "",
    ctaPrimaryLink: homepageLoaded ? homepageData?.hero_cta_primary_link ?? DEFAULTS.ctaPrimaryLink : "#contact",
    ctaSecondaryText: homepageLoaded ? homepageData?.hero_cta_secondary_text ?? DEFAULTS.ctaSecondaryText : "",
    ctaSecondaryLink: homepageLoaded ? homepageData?.hero_cta_secondary_link ?? DEFAULTS.ctaSecondaryLink : "#services",
  };
  const customSlides = parseHeroSlides(homepageData?.hero_slides);
  const slides = homepageLoaded ? customSlides ?? dashboardSlides : [];
  const slideCount = slides.length;
  const currentSlide = slides[activeSlide];
  const currentIsVideo = currentSlide ? isVideoSource(currentSlide.src, currentSlide.type) : false;

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
    if (slideCount <= 1) return;
    if (isHovered) return;
    if (currentIsVideo) return; // Allow visitors to watch the video without abrupt auto-advance

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
    { icon: Code2, title: "Web Development" },
    { icon: Brain, title: "AI Solutions" },
    { icon: Database, title: "ERP Systems" },
  ];

  return (
    <section id="home" className="hero relative overflow-hidden bg-background/95 py-24 sm:py-28 lg:py-32">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute inset-0 grid-pattern opacity-20" />
        <div className="absolute left-1/4 top-6 h-[280px] w-[320px] rounded-full bg-[radial-gradient(circle,_rgba(186,230,253,0.4),transparent_68%)] blur-3xl" />
        <div className="absolute right-0 top-1/3 h-[260px] w-[420px] rounded-full bg-[radial-gradient(circle,_rgba(233,213,255,0.4),transparent_68%)] blur-3xl" />
        <div className="absolute left-0 bottom-0 h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,_rgba(186,230,253,0.3),transparent_70%)] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] xl:max-w-[1480px] 2xl:max-w-[1560px] flex-col gap-12 sm:gap-14 px-5 sm:px-8 lg:px-10 xl:px-14 lg:grid lg:grid-cols-[42%_58%] xl:grid-cols-[40%_60%] lg:items-center lg:gap-10 xl:gap-14">
        <div className="max-w-2xl space-y-8 animate-enter-up">
          <div className="inline-flex items-center gap-3 rounded-full border border-foreground/10 bg-foreground/5 px-4 py-2 text-sm text-muted-foreground backdrop-blur-xl shadow-[0_0_40px_-20px_rgba(186,230,253,0.5)]">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#ffffff0f] text-base">✨</span>
            <span className="font-medium text-foreground/80">Premium SaaS, AI & growth systems</span>
          </div>

          <div className="space-y-6">
            <h1 className="font-display text-4xl font-semibold leading-tight tracking-[-0.04em] text-foreground sm:text-5xl lg:text-6xl xl:text-7xl">
              {homepageLoaded ? renderTitle(content.title) : <span className="block h-[1.1em] w-3/4 rounded-2xl bg-foreground/10" />}
            </h1>
            <div className="space-y-4">
              <p className="max-w-xl text-base leading-8 text-muted-foreground sm:text-lg">
                {homepageLoaded ? content.subtitle : <span className="block h-20 rounded-2xl bg-foreground/10" />}
              </p>
              {homepageLoaded && (
                <p className="max-w-xl text-base leading-8 text-foreground/80 sm:text-lg">
                  <span className="text-foreground/70">Delivering</span>{" "}
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
                  className="group relative overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.035] px-4 py-4 shadow-[0_20px_70px_-45px_rgba(0,0,0,0.85)] transition hover:border-accent/35"
                >
                  <div className="absolute inset-0 -translate-x-full bg-brand-gradient opacity-20 transition-transform duration-700 group-hover:translate-x-0" />
                  <div className="absolute inset-y-0 left-0 w-1/2 bg-brand-gradient opacity-10 blur-2xl" />
                  <div className="relative flex min-w-0 items-center gap-2.5">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-foreground shadow-[0_0_24px_-8px_hsl(var(--accent)/0.8)]">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="min-w-0 font-display text-[15px] font-semibold leading-tight text-foreground sm:text-base">
                      {item.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative w-full animate-enter-side flex items-center justify-center lg:justify-end">
          {/* Ambient soft glow aura behind the showcase */}
          <div className="pointer-events-none absolute -inset-3 sm:-inset-6 rounded-[3rem] bg-gradient-to-tr from-cyan-500/20 via-sky-500/10 to-indigo-500/20 blur-3xl opacity-60 transition-opacity duration-700 group-hover:opacity-90 -z-10" />

          {/* Clean, premium rounded video container */}
          <div
            className="group relative w-full overflow-hidden rounded-[1.75rem] sm:rounded-[2.25rem] lg:rounded-[2.5rem] border border-white/10 dark:border-white/[0.08] bg-card/60 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7),0_0_90px_-20px_rgba(56,189,248,0.2),inset_0_1px_1px_rgba(255,255,255,0.18)] ring-1 ring-white/10 backdrop-blur-md transition-all duration-500 ease-out hover:scale-[1.01] hover:shadow-[0_35px_80px_-20px_rgba(0,0,0,0.8),0_0_110px_-15px_rgba(56,189,248,0.28)] aspect-[16/10.5] sm:aspect-[16/10] lg:aspect-[16/9.8] xl:aspect-[16/9.6] min-h-[300px] sm:min-h-[400px] lg:min-h-[480px] xl:min-h-[530px]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Top & bottom subtle contrast scrims for controls & pagination */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/60 via-black/15 to-transparent z-10 transition-opacity duration-300" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10 transition-opacity duration-300" />

            {/* Slides track */}
            {slideCount > 0 ? (
              <div
                className="flex h-full w-full transition-transform duration-700 ease-out"
                style={{ transform: `translate3d(-${activeSlide * 100}%, 0, 0)` }}
              >
                {slides.map((slide, index) => (
                  <HeroSlideMedia
                    key={`${slide.src}-${index}`}
                    slide={slide}
                    isActive={activeSlide === index}
                    index={index}
                    slideCount={slideCount}
                    isMuted={isMuted}
                    isPlaying={isPlaying}
                    onVideoEnd={handleVideoEnded}
                  />
                ))}
              </div>
            ) : (
              <div className="h-full w-full animate-pulse bg-foreground/10" />
            )}

            {/* Subtle video badge indicator */}
            {currentIsVideo && (
              <div className="pointer-events-none absolute top-4 left-4 sm:top-5 sm:left-5 z-20 flex items-center gap-2 rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-xs font-medium text-white/95 backdrop-blur-xl shadow-lg transition-transform duration-300 group-hover:scale-105">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="tracking-wider uppercase text-[10.5px] font-semibold text-white/90">Cinematic Showcase</span>
              </div>
            )}

            {/* Video controls overlay (for direct HTML5 videos) */}
            {currentIsVideo && !getVideoEmbedUrl(currentSlide?.src) && (
              <div className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-xl shadow-lg transition-all duration-300 hover:bg-black/75 hover:scale-105 active:scale-95"
                  aria-label={isPlaying ? "Pause video" : "Play video"}
                  title={isPlaying ? "Pause video" : "Play video"}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsMuted((m) => !m)}
                  className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-xl shadow-lg transition-all duration-300 hover:bg-black/75 hover:scale-105 active:scale-95"
                  aria-label={isMuted ? "Unmute audio" : "Mute audio"}
                  title={isMuted ? "Unmute audio" : "Mute audio"}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
              </div>
            )}

            {/* Slide Navigation Arrows */}
            {slideCount > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Show previous slide"
                  onClick={() => goToSlide(activeSlide - 1)}
                  className="absolute left-3 sm:left-5 top-1/2 z-20 inline-flex h-9 w-9 sm:h-11 sm:w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-xl shadow-lg transition-all duration-300 hover:bg-black/75 hover:scale-110 active:scale-95 opacity-80 group-hover:opacity-100"
                >
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Show next slide"
                  onClick={() => goToSlide(activeSlide + 1)}
                  className="absolute right-3 sm:right-5 top-1/2 z-20 inline-flex h-9 w-9 sm:h-11 sm:w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur-xl shadow-lg transition-all duration-300 hover:bg-black/75 hover:scale-110 active:scale-95 opacity-80 group-hover:opacity-100"
                >
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </>
            )}

            {/* Slide Pagination Dots */}
            {slideCount > 1 && (
              <div className="absolute bottom-4 sm:bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/45 px-3.5 py-1.5 backdrop-blur-xl shadow-lg">
                {slides.map((slide, index) => (
                  <button
                    key={`${slide.src}-dot-${index}`}
                    type="button"
                    aria-label={`Show slide ${index + 1}`}
                    aria-current={activeSlide === index}
                    onClick={() => goToSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeSlide === index
                        ? "w-7 bg-white shadow-[0_0_12px_rgba(255,255,255,0.7)]"
                        : "w-2 bg-white/40 hover:bg-white/80"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
