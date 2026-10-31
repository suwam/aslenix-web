import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

interface CinematicVideoShowcaseProps {
  src: string;
  alt?: string;
  isVideo: boolean;
  embedUrl?: string | null;
  isActive: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onVideoEnd?: () => void;
}

export const CinematicVideoShowcase = ({
  src,
  alt = "ASLENIX Cinematic Showcase",
  isVideo,
  embedUrl,
  isActive,
  isPlaying,
  isMuted,
  onTogglePlay,
  onToggleMute,
  onVideoEnd,
}: CinematicVideoShowcaseProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const feedbackTimeout = useRef<number | null>(null);

  // Synchronize playback state with master video
  useEffect(() => {
    if (!videoRef.current || !isVideo || embedUrl) return;

    if (isActive && isPlaying) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay policy: waiting for user interaction
        });
      }
    } else {
      videoRef.current.pause();
    }
  }, [isActive, isPlaying, isVideo, embedUrl]);

  // Synchronize mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Flash central play/pause indicator feedback upon clicking the container
  const handleContainerClick = () => {
    if (!isVideo || embedUrl) return;
    onTogglePlay();

    setShowFeedback(true);
    if (feedbackTimeout.current) window.clearTimeout(feedbackTimeout.current);
    feedbackTimeout.current = window.setTimeout(() => {
      setShowFeedback(false);
    }, 650);
  };

  useEffect(() => {
    return () => {
      if (feedbackTimeout.current) window.clearTimeout(feedbackTimeout.current);
    };
  }, []);

  // Iframe platform embed (e.g. YouTube/Vimeo)
  if (embedUrl) {
    return (
      <div className="relative w-full h-[320px] sm:h-[400px] md:h-[480px] lg:h-[540px] xl:h-[600px] 2xl:h-[640px] rounded-[24px] lg:rounded-[28px] overflow-hidden border border-foreground/[0.08] dark:border-white/10 bg-black/90 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.18),0_0_0_1px_rgba(255,255,255,0.08)] dark:shadow-[0_24px_64px_-16px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.1)]">
        <iframe
          src={embedUrl}
          title={alt}
          className="w-full h-full border-0 pointer-events-auto"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div
      onClick={handleContainerClick}
      className={`group relative w-full h-[320px] sm:h-[400px] md:h-[480px] lg:h-[540px] xl:h-[600px] 2xl:h-[640px] rounded-[24px] lg:rounded-[28px] overflow-hidden border border-foreground/[0.08] dark:border-white/10 bg-card/90 dark:bg-black/90 shadow-[0_20px_50px_-15px_rgba(15,23,42,0.18),0_0_0_1px_rgba(255,255,255,0.08)] dark:shadow-[0_24px_64px_-16px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.1)] transition-all duration-500 ease-out hover:border-foreground/20 dark:hover:border-white/20 hover:shadow-[0_28px_70px_-15px_rgba(15,23,42,0.25)] dark:hover:shadow-[0_32px_80px_-16px_rgba(0,0,0,0.75)] select-none ${
        isVideo ? "cursor-pointer" : ""
      }`}
    >
      {/* Media: Direct Video or Image with true object-fit: cover and natural clear exposure */}
      {isVideo ? (
        <video
          ref={videoRef}
          src={src}
          playsInline
          muted={isMuted}
          autoPlay={isActive}
          loop
          preload="auto"
          crossOrigin="anonymous"
          className="w-full h-full object-cover object-center filter brightness-[1.03] contrast-[1.02] saturate-[1.02] transition-transform duration-700 ease-out group-hover:scale-[1.008]"
          onEnded={onVideoEnd}
        />
      ) : (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover object-center filter brightness-[1.02] contrast-[1.02] transition-transform duration-700 ease-out group-hover:scale-[1.008]"
          loading="eager"
        />
      )}

      {/* Localized soft bottom vignette strictly behind control pills (leaves 90%+ of video completely clear and bright) */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-60" />

      {/* Top inner specular hairline highlight */}
      <div className="pointer-events-none absolute inset-0 rounded-[24px] lg:rounded-[28px] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]" />

      {/* Top Floating Badge: LIVE Indicator + Video Showcase */}
      <div className="pointer-events-none absolute top-3.5 left-3.5 sm:top-5 sm:left-5 z-20 flex items-center">
        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-md shadow-sm">
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isPlaying ? "animate-ping bg-emerald-400" : "bg-white/40"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isPlaying ? "bg-emerald-400" : "bg-white/40"
              }`}
            />
          </span>
          <span className="text-[10px] sm:text-[10.5px] font-bold tracking-widest text-emerald-400">
            LIVE
          </span>
          <div className="h-2.5 w-px bg-white/20" />
          <span className="text-[11px] font-medium tracking-wide text-white/90">
            Video Showcase
          </span>
        </div>
      </div>

      {/* Center Temporary Click Indicator Feedback */}
      {isVideo && showFeedback && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-25 animate-out fade-out zoom-out duration-500">
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-2xl shadow-2xl">
            {isPlaying ? (
              <Play className="h-8 w-8 sm:h-9 sm:w-9 ml-1 text-white" />
            ) : (
              <Pause className="h-8 w-8 sm:h-9 sm:w-9 text-white" />
            )}
          </div>
        </div>
      )}

      {/* Bottom Floating Control HUD: Grouped Play/Pause & Mute/Unmute */}
      {isVideo && (
        <div className="pointer-events-auto absolute bottom-3.5 right-3.5 sm:bottom-5 sm:right-5 z-30 flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-3.5 py-1.5 backdrop-blur-md shadow-[0_8px_24px_-4px_rgba(0,0,0,0.5)] transition-all duration-300">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePlay();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full text-white/90 hover:text-white hover:bg-white/15 transition-all active:scale-95"
            aria-label={isPlaying ? "Pause video" : "Play video"}
            title={isPlaying ? "Pause video" : "Play video"}
          >
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
          </button>

          <div className="h-3 w-px bg-white/20" />

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMute();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full text-white/90 hover:text-white hover:bg-white/15 transition-all active:scale-95"
            aria-label={isMuted ? "Unmute audio" : "Mute audio"}
            title={isMuted ? "Unmute audio" : "Mute audio"}
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
};
