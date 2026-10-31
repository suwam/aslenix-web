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

  // Flash central play/pause indicator feedback upon click
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
      <div className="relative w-full h-[320px] sm:h-[400px] md:h-[480px] lg:h-[540px] xl:h-[600px] 2xl:h-[640px] rounded-[20px] sm:rounded-[24px] lg:rounded-[28px] overflow-hidden border border-white/10 bg-black/90 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.08)]">
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
      className={`group relative w-full h-[320px] sm:h-[400px] md:h-[480px] lg:h-[540px] xl:h-[600px] 2xl:h-[640px] rounded-[20px] sm:rounded-[24px] lg:rounded-[28px] overflow-hidden border border-white/10 dark:border-white/10 bg-card/90 dark:bg-black/90 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.08)] transition-all duration-500 ease-out hover:border-white/20 hover:shadow-[0_32px_80px_-16px_rgba(0,0,0,0.65)] select-none ${
        isVideo ? "cursor-pointer" : ""
      }`}
    >
      {/* Media: Direct Video or Image with true object-fit: cover */}
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
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.01]"
          onEnded={onVideoEnd}
        />
      ) : (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.01]"
          loading="eager"
        />
      )}

      {/* Subtle cinematic gradient vignette to protect legibility of controls & badges */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-black/30 opacity-70 group-hover:opacity-50 transition-opacity duration-300" />

      {/* Top inner specular hairline highlight */}
      <div className="pointer-events-none absolute inset-0 rounded-[20px] sm:rounded-[24px] lg:rounded-[28px] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]" />

      {/* Top Floating Badge */}
      <div className="pointer-events-none absolute top-3.5 left-3.5 sm:top-5 sm:left-5 z-20 flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-xl shadow-lg">
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isPlaying ? "animate-ping bg-cyan-400" : "bg-white/40"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isPlaying ? "bg-cyan-400" : "bg-white/40"
              }`}
            />
          </span>
          <span className="tracking-wider uppercase text-[10.5px] font-semibold text-white/90">
            {isVideo ? "Cinematic Video" : "Visual Showcase"}
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

      {/* Bottom Floating Control HUD */}
      {isVideo && (
        <div className="pointer-events-auto absolute bottom-3.5 right-3.5 sm:bottom-5 sm:right-5 z-30 flex items-center gap-2.5 rounded-full border border-white/15 bg-black/65 px-3.5 py-1.5 backdrop-blur-xl shadow-[0_8px_24px_-4px_rgba(0,0,0,0.6)] transition-all duration-300">
          {/* Status Label with Live Dot */}
          <div className="flex items-center gap-1.5 select-none pl-0.5">
            <span className="relative flex h-1.5 w-1.5">
              {isPlaying && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                  isPlaying ? "bg-emerald-400" : "bg-white/40"
                }`}
              />
            </span>
            <span className="text-[10.5px] sm:text-[11px] font-medium tracking-wider uppercase text-white/80">
              {isPlaying ? "Live" : "Paused"}
            </span>
          </div>

          <div className="h-3 w-px bg-white/15" />

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePlay();
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/85 hover:text-white hover:bg-white/15 transition-all active:scale-95"
              aria-label={isPlaying ? "Pause video" : "Play video"}
              title={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleMute();
              }}
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/85 hover:text-white hover:bg-white/15 transition-all active:scale-95"
              aria-label={isMuted ? "Unmute audio" : "Mute audio"}
              title={isMuted ? "Unmute audio" : "Mute audio"}
            >
              {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

