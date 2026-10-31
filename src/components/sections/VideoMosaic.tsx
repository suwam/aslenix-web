import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";

interface MosaicTileConfig {
  id: string;
  className: string;
  delayMs: number;
}

/**
 * Editorial Asymmetric Mosaic Layout (8 Tiles)
 *
 * Desktop & Tablet (12-column × 10-row grid):
 * - Left Flank (Cols 1..3, 3 cols):
 *     Tile 1 (Top-Left Accent): Rows 1..4 (4 rows)
 *     Tile 2 (Bottom-Left Foundation): Rows 5..10 (6 rows)
 *     Total = 10 rows (100% flush).
 * - Center Focal Zone (Cols 4..8, 5 cols):
 *     Tile 3 (Centerpiece Hero): Rows 1..6 (6 rows, 5 cols) — commanding architectural focal point.
 *     Tile 4 (Center-Bottom Left Anchor): Rows 7..10 (4 rows, 3 cols)
 *     Tile 5 (Center-Bottom Right Anchor): Rows 7..10 (4 rows, 2 cols)
 *     Total = 10 rows (100% flush).
 * - Right Flank (Cols 9..12, 4 cols):
 *     Tile 6 (Top-Right Upper): Rows 1..3 (3 rows)
 *     Tile 7 (Middle-Right Center): Rows 4..7 (4 rows)
 *     Tile 8 (Bottom-Right Foundation): Rows 8..10 (3 rows)
 *     Total = 10 rows (100% flush).
 *
 * Mobile (<640px) (6-column × 10-row grid):
 * - Tile 3 (Hero): Cols 1..6, Rows 1..4 (top dominant showcase)
 * - Tile 1: Cols 1..3, Rows 5..7 (middle-left)
 * - Tile 6: Cols 4..6, Rows 5..7 (middle-right)
 * - Tile 2: Cols 1..3, Rows 8..10 (bottom-left)
 * - Tile 4: Cols 4..6, Rows 8..10 (bottom-right)
 * - Tiles 5, 7, 8: hidden on mobile (<640px), cleanly expanding on sm+
 */
const MOSAIC_TILES: MosaicTileConfig[] = [
  // 1. Left Flank — Top Accent
  {
    id: "tile-1",
    className:
      "col-start-1 col-span-3 row-start-5 row-span-3 sm:col-start-1 sm:col-span-3 sm:row-start-1 sm:row-span-4",
    delayMs: 0,
  },
  // 2. Left Flank — Lower Foundation Anchor
  {
    id: "tile-2",
    className:
      "col-start-1 col-span-3 row-start-8 row-span-3 sm:col-start-1 sm:col-span-3 sm:row-start-5 sm:row-span-6",
    delayMs: 60,
  },
  // 3. Centerpiece Hero — Dominant Visual Showcase
  {
    id: "tile-3",
    className:
      "col-start-1 col-span-6 row-start-1 row-span-4 sm:col-start-4 sm:col-span-5 sm:row-start-1 sm:row-span-6",
    delayMs: 120,
  },
  // 4. Center-Bottom Left Anchor
  {
    id: "tile-4",
    className:
      "col-start-4 col-span-3 row-start-8 row-span-3 sm:col-start-4 sm:col-span-3 sm:row-start-7 sm:row-span-4",
    delayMs: 180,
  },
  // 5. Center-Bottom Right Anchor
  {
    id: "tile-5",
    className:
      "hidden sm:block sm:col-start-7 sm:col-span-2 sm:row-start-7 sm:row-span-4",
    delayMs: 240,
  },
  // 6. Right Flank — Top Accent
  {
    id: "tile-6",
    className:
      "col-start-4 col-span-3 row-start-5 row-span-3 sm:col-start-9 sm:col-span-4 sm:row-start-1 sm:row-span-3",
    delayMs: 300,
  },
  // 7. Right Flank — Middle Center
  {
    id: "tile-7",
    className:
      "hidden sm:block sm:col-start-9 sm:col-span-4 sm:row-start-4 sm:row-span-4",
    delayMs: 360,
  },
  // 8. Right Flank — Lower Foundation
  {
    id: "tile-8",
    className:
      "hidden sm:block sm:col-start-9 sm:col-span-4 sm:row-start-8 sm:row-span-3",
    delayMs: 420,
  },
];

interface TileGeometry {
  cWidth: number;
  cHeight: number;
  tiles: {
    relX: number;
    relY: number;
    width: number;
    height: number;
  }[];
}

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
  const geometryRef = useRef<TileGeometry | null>(null);

  const [, setMounted] = useState(false);

  // Manage master video playback state
  useEffect(() => {
    if (!masterVideoRef.current || !isVideo || embedUrl) return;

    if (isActive && isPlaying) {
      const playPromise = masterVideoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay policy fallback: waiting for user gesture
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
      setMounted(true);
      measureGeometry();
    };
  }, [src, isVideo]);

  // Recalculate tile geometry relative to container (zero layout reflows during 60fps render loop)
  const measureGeometry = () => {
    const container = containerRef.current;
    if (!container) return;

    const cRect = container.getBoundingClientRect();
    if (cRect.width === 0 || cRect.height === 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const measuredTiles: TileGeometry["tiles"] = [];

    for (let i = 0; i < MOSAIC_TILES.length; i++) {
      const tileEl = tileRefs.current[i];
      const canvas = canvasRefs.current[i];

      if (!tileEl || !canvas) {
        measuredTiles.push({ relX: 0, relY: 0, width: 0, height: 0 });
        continue;
      }

      const tRect = tileEl.getBoundingClientRect();
      const relX = tRect.left - cRect.left;
      const relY = tRect.top - cRect.top;
      const width = tRect.width;
      const height = tRect.height;

      measuredTiles.push({ relX, relY, width, height });

      // Update canvas buffer dimensions to match pixel density
      if (width > 0 && height > 0) {
        const targetW = Math.round(width * dpr);
        const targetH = Math.round(height * dpr);
        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW;
          canvas.height = targetH;
        }
      }
    }

    geometryRef.current = {
      cWidth: cRect.width,
      cHeight: cRect.height,
      tiles: measuredTiles,
    };
  };

  // Watch container and viewport resize to update cached geometry
  useEffect(() => {
    measureGeometry();

    const container = containerRef.current;
    let observer: ResizeObserver | null = null;

    if (container && typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        measureGeometry();
      });
      observer.observe(container);
    }

    window.addEventListener("resize", measureGeometry);

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener("resize", measureGeometry);
    };
  }, []);

  // Synchronized animation frame rendering loop across all mosaic tiles
  useEffect(() => {
    if (embedUrl) return;

    let animId: number;

    const render = () => {
      const geom = geometryRef.current;
      const video = masterVideoRef.current;
      const img = imageRef.current;

      const media = isVideo ? video : img;
      const hasMedia = isVideo
        ? video && video.readyState >= 1
        : img && img.complete && img.naturalWidth > 0;

      if (geom && geom.cWidth > 0 && geom.cHeight > 0 && hasMedia && media) {
        const mediaW = isVideo ? (video?.videoWidth || 1920) : (img?.naturalWidth || 1920);
        const mediaH = isVideo ? (video?.videoHeight || 1080) : (img?.naturalHeight || 1080);

        // Subject framing bounds:
        // Skips dead headroom / ceilings (top ~8%) and trims empty side margins,
        // prioritizing subjects, human figures, faces, and interaction areas.
        const FOCUS_Y_MIN = 0.08;
        const FOCUS_Y_MAX = 0.98;
        const FOCUS_X_MIN = 0.02;
        const FOCUS_X_MAX = 0.98;

        const focusW = mediaW * (FOCUS_X_MAX - FOCUS_X_MIN);
        const focusH = mediaH * (FOCUS_Y_MAX - FOCUS_Y_MIN);
        const focusCX = mediaW * ((FOCUS_X_MIN + FOCUS_X_MAX) / 2);
        const focusCY = mediaH * ((FOCUS_Y_MIN + FOCUS_Y_MAX) / 2);

        const cW = geom.cWidth;
        const cH = geom.cHeight;
        const cAspect = cW / cH;
        const fAspect = focusW / focusH;

        // Perform object-fit: cover over active focal bounding area
        const scale = cAspect > fAspect ? cW / focusW : cH / focusH;
        const virtualW = mediaW * scale;
        const virtualH = mediaH * scale;

        // Center focal point within container bounds
        let originX = cW / 2 - focusCX * scale;
        let originY = cH / 2 - focusCY * scale;

        // Strict perimeter constraints: prevent media from pulling away from canvas boundaries
        if (originX > 0) originX = 0;
        if (originY > 0) originY = 0;
        if (originX + virtualW < cW) originX = cW - virtualW;
        if (originY + virtualH < cH) originY = cH - virtualH;

        for (let i = 0; i < MOSAIC_TILES.length; i++) {
          const tile = geom.tiles[i];
          const canvas = canvasRefs.current[i];
          if (!tile || tile.width === 0 || tile.height === 0 || !canvas) continue;

          const ctx = canvas.getContext("2d", { alpha: false });
          if (!ctx) continue;

          // Map tile screen coordinates into the single master video frame space
          let sx = (tile.relX - originX) / scale;
          let sy = (tile.relY - originY) / scale;
          let sw = tile.width / scale;
          let sh = tile.height / scale;

          // Clamp source slice strictly inside native video pixel bounds
          if (sx < 0) {
            sw += sx;
            sx = 0;
          }
          if (sy < 0) {
            sh += sy;
            sy = 0;
          }
          if (sx + sw > mediaW) sw = Math.max(1, mediaW - sx);
          if (sy + sh > mediaH) sh = Math.max(1, mediaH - sy);

          try {
            ctx.drawImage(media, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
          } catch {
            // Ignore transient render calls during video track initialization
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isVideo, embedUrl]);

  // Responsive iframe embed for third-party platforms (YouTube/Vimeo)
  if (embedUrl) {
    return (
      <div className="relative w-full h-[380px] sm:h-[460px] md:h-[520px] lg:h-[580px] xl:h-[640px] rounded-[14px] overflow-hidden border border-white/10 bg-black/90 shadow-2xl">
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
    <div className="relative w-full h-[380px] sm:h-[460px] md:h-[520px] lg:h-[580px] xl:h-[640px] 2xl:h-[680px]">
      {/* Hidden Master Video Element (Single source of truth) */}
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
          onLoadedMetadata={() => {
            setMounted(true);
            measureGeometry();
          }}
          onEnded={onVideoEnd}
        />
      )}

      {/* Synchronized Asymmetric Mosaic Grid Container */}
      <div
        ref={containerRef}
        className="relative grid grid-cols-6 grid-rows-10 sm:grid-cols-12 sm:grid-rows-10 gap-2 sm:gap-2.5 lg:gap-3 w-full h-full select-none"
      >
        {MOSAIC_TILES.map((tile, index) => (
          <div
            key={tile.id}
            ref={(el) => {
              tileRefs.current[index] = el;
            }}
            onClick={isVideo ? onTogglePlay : undefined}
            style={{
              animationDelay: `${tile.delayMs}ms`,
            }}
            className={`group/tile relative overflow-hidden rounded-[12px] sm:rounded-[14px] bg-card/90 dark:bg-black/90 border border-white/[0.08] shadow-[0_12px_28px_-8px_rgba(0,0,0,0.45)] transition-all duration-350 ease-out hover:scale-[1.012] hover:z-20 hover:border-white/20 hover:shadow-[0_16px_36px_-6px_rgba(0,0,0,0.6)] animate-mosaic-tile cursor-pointer ${tile.className}`}
          >
            {/* The synchronized video/image slice canvas */}
            <canvas
              ref={(el) => {
                canvasRefs.current[index] = el;
              }}
              className="w-full h-full block object-cover"
            />

            {/* Subtle inner top specular hairline */}
            <div className="pointer-events-none absolute inset-0 rounded-[12px] sm:rounded-[14px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" />

            {/* Gentle hover illumination */}
            <div className="pointer-events-none absolute inset-0 rounded-[12px] sm:rounded-[14px] bg-white/[0.03] opacity-0 transition-opacity duration-300 group-hover/tile:opacity-100" />
          </div>
        ))}
      </div>

      {/* Refined Integrated Floating Control HUD */}
      {isVideo && (
        <div className="pointer-events-auto absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-30 flex items-center gap-2 rounded-full border border-white/15 bg-black/65 px-3 py-1.5 backdrop-blur-xl shadow-[0_8px_24px_-4px_rgba(0,0,0,0.6)] transition-all duration-300">
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
            <span className="text-[10px] sm:text-[11px] font-medium tracking-wider uppercase text-white/80">
              Cinematic
            </span>
          </div>

          <div className="h-3 w-px bg-white/15 mx-0.5" />

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePlay();
              }}
              className="flex h-6 w-6 items-center justify-center rounded-full text-white/85 hover:text-white hover:bg-white/15 transition-all active:scale-95"
              aria-label={isPlaying ? "Pause video" : "Play video"}
              title={isPlaying ? "Pause video" : "Play video"}
            >
              {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleMute();
              }}
              className="flex h-6 w-6 items-center justify-center rounded-full text-white/85 hover:text-white hover:bg-white/15 transition-all active:scale-95"
              aria-label={isMuted ? "Unmute audio" : "Mute audio"}
              title={isMuted ? "Unmute audio" : "Mute audio"}
            >
              {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
