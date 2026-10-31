import { describe, it, expect } from "vitest";
import { isVideoSource, getVideoEmbedUrl } from "@/lib/video";

describe("Video Utilities & Hero Media Handling", () => {
  it("identifies direct video file extensions correctly", () => {
    expect(isVideoSource("https://example.com/assets/video.mp4")).toBe(true);
    expect(isVideoSource("https://example.com/assets/video.webm?query=123")).toBe(true);
    expect(isVideoSource("https://example.com/assets/video.mov")).toBe(true);
    expect(isVideoSource("https://example.com/assets/image.png")).toBe(false);
    expect(isVideoSource("https://example.com/assets/image.webp")).toBe(false);
  });

  it("identifies video streaming platforms", () => {
    expect(isVideoSource("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(true);
    expect(isVideoSource("https://youtu.be/dQw4w9WgXcQ")).toBe(true);
    expect(isVideoSource("https://vimeo.com/123456789")).toBe(true);
    expect(isVideoSource("https://www.loom.com/share/abc123456")).toBe(true);
  });

  it("respects explicit type overrides", () => {
    expect(isVideoSource("https://example.com/unknown-asset", "video")).toBe(true);
    expect(isVideoSource("https://example.com/clip.mp4", "image")).toBe(false);
  });

  it("generates correct iframe embed URLs", () => {
    const ytUrl = getVideoEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
    expect(ytUrl).toContain("https://www.youtube.com/embed/dQw4w9WgXcQ");
    expect(ytUrl).toContain("autoplay=1");
    expect(ytUrl).toContain("mute=1");

    const vimeoUrl = getVideoEmbedUrl("https://vimeo.com/123456789");
    expect(vimeoUrl).toContain("https://player.vimeo.com/video/123456789");

    const directMp4 = getVideoEmbedUrl("https://example.com/clip.mp4");
    expect(directMp4).toBeNull();
  });
});

