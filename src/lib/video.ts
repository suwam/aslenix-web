export type HeroSlide = {
  src: string;
  alt?: string;
  type?: "image" | "video";
};

/**
 * Checks whether a given source URL or slide should be treated as a video.
 */
export const isVideoSource = (src?: string | null, explicitType?: "image" | "video"): boolean => {
  if (explicitType === "video") return true;
  if (explicitType === "image") return false;
  if (!src) return false;

  const cleanSrc = src.trim().toLowerCase();

  // Common direct video extensions (ignoring query strings or hashes)
  if (/\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(cleanSrc)) return true;

  // Video streaming / hosting platforms
  if (/youtube\.com|youtu\.be|vimeo\.com|loom\.com/i.test(cleanSrc)) return true;

  return false;
};

/**
 * Parses supported video platforms into an embeddable iframe URL with autoplay and muted params.
 * Returns null if the source is not a recognized platform embed (e.g. for direct mp4/webm files).
 */
export const getVideoEmbedUrl = (src?: string | null): string | null => {
  if (!src) return null;
  const cleanSrc = src.trim();

  // YouTube: watch?v=ID, youtu.be/ID, embed/ID, shorts/ID
  const ytMatch = cleanSrc.match(
    /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i,
  );
  if (ytMatch && ytMatch[1]) {
    const id = ytMatch[1];
    return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=1&modestbranding=1&rel=0&playsinline=1`;
  }

  // Vimeo: vimeo.com/ID or player.vimeo.com/video/ID
  const vimeoMatch = cleanSrc.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    const id = vimeoMatch[1];
    return `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&loop=1&autopause=0&background=1`;
  }

  // Loom: loom.com/share/ID or loom.com/embed/ID
  const loomMatch = cleanSrc.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/i);
  if (loomMatch && loomMatch[1]) {
    const id = loomMatch[1];
    return `https://www.loom.com/embed/${id}?autoplay=1&muted=1&hide_owner=true&hide_share=true&hide_title=true&hideEmbedTopBar=true`;
  }

  return null;
};

