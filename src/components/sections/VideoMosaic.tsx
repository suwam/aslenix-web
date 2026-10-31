import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

interface MosaicTileConfig {
  id: string;
  className: string;
}

const MOSAIC_TILES: MosaicTileConfig[] = [
  // Tile 1: Top-left accent (starts at row 2, leaving row 1 empty above)
  {
    id: "tile-1",
    className: "col-span-4 sm:col-span-3 row-span-4 sm:row-span-4 col-start-1 row-start-2",
  },
  // Tile 2: Bottom-left foundation (spans rows 6 to 11)
  {
    id: "tile-2",
    className: "col-span-4 sm:col-span-3 row-span-6 sm:row-span-6 col-start-1 row-start-6",
  },
  // Tile 3: Top-center hero centerpiece (starts at row 1, widest and tall dominant focal point)
  {
    id: "tile-3",
    className: "col-span-8 sm:col-span-5 row-span-5 sm:row-span-7 col-start-5 sm:col-start-4 row-start-1",
  },
  // Tile 4: Bottom-center wide anchor (sits directly beneath the hero centerpiece)
  {
    id: "tile-4",
    className: "col-span-8 sm:col-span-5 row-span-4 sm:row-span-4 col-start-5 sm:col-start-4 row-start-6 sm:row-start-8",
  },
  // Tile 5: Upper-right floating tile (starts at row 2, leaving row 1 empty above)
  {
    id: "tile-5",
    className: "hidden sm:block sm:col-span-4 sm:row-span-4 sm:col-start-9 sm:row-start-2",
  },
  // Tile 6: Lower-right column pillar (spans rows 6 to 11, leaving row 12 empty below)
  {
    id: "tile-6",
    className: "hidden sm:block sm:col-span-4 sm:row-span-6 sm:col-start-9 sm:row-start-6",
  },
];

interface VideoMosaicProps {
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

export const VideoMosaic = ({
  src,
  alt = "ASLENIX Showcase",
  isVideo,
  embedUrl,
  isActive,
  isPlaying,
  isMuted,
  onTogglePlay,
  onToggleMute,
  onVideoEnd,
}: VideoMosaicProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const masterVideoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  const [isLoaded, setIsLoaded] = useState(false);

  // Manage master video playback state
  useEffect(() => {
    if (!masterVideoRef.current || !isVideo || embedUrl) return;

    if (isActive && isPlaying) {
      const playPromise = masterVideoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay restricted until user interaction
        });
      }
    } else {
      masterVideoRef.current.pause();
    }
  }, [isActive, isPlaying, isVideo, embedUrl]);

  // Sync mute state to master video
  useEffect(() => {
    if (masterVideoRef.current) {
      masterVideoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Load image if slide is not a video
  useEffect(() => {
    if (isVideo) {
      imageRef.current = null;
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      imageRef.current = img;
      setIsLoaded(true);
    };
  }, [src, isVideo]);

  // Handle master video loaded metadata
  const handleVideoLoadedMetadata = () => {
    setIsLoaded(true);
  };

  // Synchronized animation frame rendering loop across all mosaic tiles
  useEffect(() => {
    if (embedUrl) return;

    let animId: number;

    const render = () => {
      const container = containerRef.current;
      const video = masterVideoRef.current;
      const img = imageRef.current;

      if (container) {
        const cRect = container.getBoundingClientRect();
        if (cRect.width > 0 && cRect.height > 0) {
          const media = isVideo ? video : img;
          const hasMedia = isVideo
            ? video && video.readyState >= 1
            : img && img.complete && img.naturalWidth > 0;

          if (hasMedia && media) {
            const mediaW = isVideo ? (video?.videoWidth || 1920) : (img?.naturalWidth || 1920);
            const mediaH = isVideo ? (video?.videoHeight || 1080) : (img?.naturalHeight || 1080);

            const cAspect = cRect.width / cRect.height;
            const mAspect = mediaW / mediaH;

            let renderW = 0;
            let renderH = 0;
            let offsetX = 0;
            let offsetY = 0;

            if (cAspect > mAspect) {
              renderW = cRect.width;
              renderH = cRect.width / mAspect;
              offsetX = 0;
              offsetY = (cRect.height - renderH) / 2;
            } else {
              renderH = cRect.height;
              renderW = cRect.height * mAspect;
              offsetY = 0;
              offsetX = (cRect.width - renderW) / 2;
            }

            const dpr = Math.min(window.devicePixelRatio || 1, 2);

            for (let i = 0; i < MOSAIC_TILES.length; i++) {
              const tileEl = tileRefs.current[i];
              const canvas = canvasRefs.current[i];
              if (!tileEl || !canvas) continue;

              const tRect = tileEl.getBoundingClientRect();
              if (tRect.width === 0 || tRect.height === 0) continue;

              const targetW = Math.round(tRect.width * dpr);
              const targetH = Math.round(tRect.height * dpr);

              if (canvas.width !== targetW || canvas.height !== targetH) {
                canvas.width = targetW;
                canvas.height = targetH;
              }

              const ctx = canvas.getContext("2d");
              if (!ctx) continue;

              // Calculate source crop rectangle mapped to this tile's exact position
              const relX = tRect.left - cRect.left - offsetX;
              const relY = tRect.top - cRect.top - offsetY;

              const sx = (relX / renderW) * mediaW;
              const sy = (relY / renderH) * mediaH;
              const sw = (tRect.width / renderW) * mediaW;
              const sh = (tRect.height / renderH) * mediaH;

              try {
                ctx.drawImage(media, sx, sy, sw, sh, 0, 0, targetW, targetH);
              } catch {
                // Ignore transient draw calls during video loading/buffering
              }
            }
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isVideo, embedUrl]);

  // If slide is an iframe embed (e.g. YouTube/Vimeo), provide a responsive embed container
  if (embedUrl) {
    return (
      <div className="relative w-full h-[400px] sm:h-[480px] lg:h-[560px] rounded-[24px] overflow-hidden border border-white/10 bg-black/80 shadow-2xl">
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
    <div className="relative w-full h-[380px] sm:h-[460px] md:h-[520px] lg:h-[580px] xl:h-[640px]">
      {/* Off-screen master video element (Single source of truth) */}
      {isVideo && (
        <video
          ref={masterVideoRef}
          src={src}
          playsInline
          muted={isMuted}
          autoPlay={isActive}
          loop
          preload="auto"
          crossOrigin="anonymous"
          className="absolute -top-[9999px] -left-[9999px] w-1 h-1 opacity-0 pointer-events-none"
          onLoadedMetadata={handleVideoLoadedMetadata}
          onEnded={onVideoEnd}
        />
      )}

      {/* Floating Header Badges & Controls */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between p-3 sm:p-5">
        {/* Cinematic badge */}
        <div className="flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-3.5 py-1.5 text-xs font-medium text-white/95 backdrop-blur-xl shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
          <span className="tracking-wider uppercase text-[10.5px] font-semibold text-white/90">
            {isVideo ? "Cinematic Video Mosaic" : "Visual Showcase"}
          </span>
        </div>

        {/* Minimalist Glass Controls */}
        {isVideo && (
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onTogglePlay}
              className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-xl shadow-lg transition-all duration-300 hover:bg-black/80 hover:scale-105 active:scale-95"
              aria-label={isPlaying ? "Pause video" : "Play video"}
              title={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
            </button>
            <button
              type="button"
              onClick={onToggleMute}
              className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur-xl shadow-lg transition-all duration-300 hover:bg-black/80 hover:scale-105 active:scale-95"
              aria-label={isMuted ? "Unmute audio" : "Mute audio"}
              title={isMuted ? "Unmute audio" : "Mute audio"}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        )}
      </div>

      {/* Synchronized Asymmetric Mosaic Grid Container */}
      <div
        ref={containerRef}
        className="relative grid grid-cols-12 grid-rows-12 gap-2.5 sm:gap-3 w-full h-full"
      >
        {MOSAIC_TILES.map((tile, index) => (
          <div
            key={tile.id}
            ref={(el) => {
              tileRefs.current[index] = el;
            }}
            onClick={isVideo ? onTogglePlay : undefined}
            className={`group/tile relative overflow-hidden rounded-[12px] sm:rounded-[14px] bg-card/60 border border-white/10 ring-1 ring-white/10 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.7)] backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.025] hover:z-20 hover:border-cyan-400/40 hover:ring-cyan-400/30 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.85),0_0_25px_rgba(56,189,248,0.3)] ${tile.className} cursor-pointer`}
          >
            {/* The synchronized video/image slice canvas */}
            <canvas
              ref={(el) => {
                canvasRefs.current[index] = el;
              }}
              className="w-full h-full block object-cover"
            />

            {/* Specular curved glass highlight on top & inner shadow */}
            <div className="pointer-events-none absolute inset-0 rounded-[12px] sm:rounded-[14px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),inset_0_-1px_1px_rgba(0,0,0,0.4)]" />

            {/* Interactive hover gloss shimmer */}
            <div className="pointer-events-none absolute inset-0 rounded-[12px] sm:rounded-[14px] bg-gradient-to-tr from-cyan-500/0 via-transparent to-white/10 opacity-0 transition-opacity duration-300 group-hover/tile:opacity-100" />
          </div>
        ))}
      </div>
    </div>
  );
};

