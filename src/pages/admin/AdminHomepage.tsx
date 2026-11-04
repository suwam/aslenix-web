import { useEffect, useRef, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { ArrowDown, ArrowUp, Film, ImageIcon, Plus, Save, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { logActivity } from "@/lib/activity";
import { getVideoEmbedUrl, isVideoSource, type HeroSlide } from "@/lib/video";

const normalizeSlides = (value: unknown): HeroSlide[] => {
  if (!Array.isArray(value)) return [];
  const slides: HeroSlide[] = [];
  for (const slide of value) {
    if (!slide || typeof slide !== "object") continue;
    const record = slide as Record<string, unknown>;
    const src = typeof record.src === "string" ? record.src : "";
    const alt = typeof record.alt === "string" ? record.alt : "";
    const type: "image" | "video" | undefined =
      record.type === "video" || record.type === "image" ? record.type : undefined;
    slides.push({ src, alt, type });
  }
  return slides;
};

const VideoSlideEditor = ({
  slide,
  onChange,
}: {
  slide: HeroSlide;
  onChange: (patch: Partial<HeroSlide>) => void;
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const embedUrl = getVideoEmbedUrl(slide.src);

  const handleUpload = async (file: File) => {
    if (file.size > 200 * 1024 * 1024) {
      toast.error("Video file is too large (max 200MB). Consider using YouTube/Vimeo or compressing the file.");
      return;
    }
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const path = `${user?.id ?? "anon"}/videos/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error } = await supabase.storage.from("media").upload(path, file, {
        contentType: file.type || "video/mp4",
        upsert: false,
      });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
      await supabase.from("media_library").insert({
        file_name: file.name,
        storage_path: path,
        public_url: pub.publicUrl,
        mime_type: file.type || "video/mp4",
        size_bytes: file.size,
        uploaded_by: user?.id,
      });
      onChange({ src: pub.publicUrl, type: "video" });
      toast.success("Video uploaded successfully!");
    } catch (e: any) {
      toast.error(e.message || "Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <Label>Video Source URL</Label>
        <div className="flex gap-2 mt-1">
          <Input
            value={slide.src}
            onChange={(e) => onChange({ src: e.target.value, type: "video" })}
            placeholder="Paste direct .mp4/.webm URL, or YouTube / Vimeo / Loom link"
          />
          {slide.src && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange({ src: "" })}>
              Clear
            </Button>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          Direct video files (.mp4, .webm), YouTube, Vimeo, and Loom embed links are supported.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="glass"
          size="sm"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="w-3.5 h-3.5 mr-1.5" />
          {uploading ? "Uploading video..." : "Upload Video File"}
        </Button>
        <span className="text-xs text-muted-foreground">MP4, WebM, MOV up to 200MB</span>
        <input
          ref={fileRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/*"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = "";
          }}
        />
      </div>

      <div className="mt-2">
        <Label className="text-xs text-muted-foreground">Video Preview</Label>
        {slide.src ? (
          <div className="mt-1 relative aspect-video rounded-xl overflow-hidden border border-foreground/10 bg-black/90">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title="Video preview"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            ) : (
              <video
                src={slide.src}
                controls
                playsInline
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ) : (
          <div className="mt-1 aspect-video rounded-xl border border-dashed border-foreground/10 flex flex-col items-center justify-center p-6 text-center text-muted-foreground text-sm bg-foreground/[0.01]">
            <Film className="w-8 h-8 mb-2 opacity-35" />
            <div className="font-medium text-xs">No video assigned</div>
            <div className="text-[11px] text-muted-foreground/70 mt-0.5">
              Paste a URL or upload a video file above
            </div>
          </div>
        )}
      </div>

      <div>
        <Label>Video Caption / Alt text</Label>
        <Input
          value={slide.alt || ""}
          onChange={(e) => onChange({ alt: e.target.value })}
          placeholder="e.g. Aslenix Team & Culture Showreel"
        />
      </div>
    </div>
  );
};

const AdminHomepage = () => {
  const [row, setRow] = useState<any>({
    id: 1, hero_title: "", hero_subtitle: "",
    hero_cta_primary_text: "", hero_cta_primary_link: "",
    hero_cta_secondary_text: "", hero_cta_secondary_link: "",
    hero_slides: [],
    featured_service_ids: [], featured_project_ids: [],
  });
  const [services, setServices] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [h, s, p] = await Promise.all([
        supabase.from("homepage_content").select("*").eq("id", 1).maybeSingle(),
        supabase.from("services").select("id,title").eq("active", true).order("display_order"),
        supabase.from("projects").select("id,title").order("display_order"),
      ]);
      if (h.data) setRow((current: any) => ({ ...current, ...h.data, hero_slides: normalizeSlides(h.data.hero_slides) }));
      setServices(s.data ?? []);
      setProjects(p.data ?? []);
    })();
  }, []);

  const toggle = (key: "featured_service_ids" | "featured_project_ids", id: string) => {
    setRow((r: any) => {
      const arr = r[key] ?? [];
      return { ...r, [key]: arr.includes(id) ? arr.filter((x: string) => x !== id) : [...arr, id] };
    });
  };

  const updateSlide = (index: number, slide: Partial<HeroSlide>) => {
    setRow((r: any) => ({
      ...r,
      hero_slides: normalizeSlides(r.hero_slides).map((item, i) => (i === index ? { ...item, ...slide } : item)),
    }));
  };

  const addSlide = (type: "image" | "video" = "image") => {
    setRow((r: any) => ({ ...r, hero_slides: [...normalizeSlides(r.hero_slides), { src: "", alt: "", type }] }));
  };

  const deleteSlide = (index: number) => {
    setRow((r: any) => ({ ...r, hero_slides: normalizeSlides(r.hero_slides).filter((_, i) => i !== index) }));
  };

  const moveSlide = (index: number, direction: -1 | 1) => {
    setRow((r: any) => {
      const slides = normalizeSlides(r.hero_slides);
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= slides.length) return r;
      const next = [...slides];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return { ...r, hero_slides: next };
    });
  };

  const save = async () => {
    const slides = normalizeSlides(row.hero_slides).filter((slide) => slide.src.trim());
    const payload = {
      id: 1,
      hero_title: row.hero_title || null,
      hero_subtitle: row.hero_subtitle || null,
      hero_cta_primary_text: row.hero_cta_primary_text || null,
      hero_cta_primary_link: row.hero_cta_primary_link || null,
      hero_cta_secondary_text: row.hero_cta_secondary_text || null,
      hero_cta_secondary_link: row.hero_cta_secondary_link || null,
      hero_slides: slides,
      featured_service_ids: row.featured_service_ids ?? [],
      featured_project_ids: row.featured_project_ids ?? [],
    };
    const { error } = await supabase.from("homepage_content").upsert(payload);
    if (error) return toast.error(error.message);
    setRow((r: any) => ({ ...r, hero_slides: slides }));
    const videoCount = slides.filter((s) => isVideoSource(s.src, s.type)).length;
    const imageCount = slides.length - videoCount;
    toast.success(`Homepage saved with ${slides.length} slide${slides.length === 1 ? "" : "s"} (${imageCount} image${imageCount === 1 ? "" : "s"}, ${videoCount} video${videoCount === 1 ? "" : "s"})`);
    await logActivity("Updated homepage content", "homepage_content", "1");
  };

  return (
    <AdminShell title="Homepage Builder" actions={
      <Button onClick={save} variant="hero" size="sm"><Save className="w-3.5 h-3.5" /> Save</Button>
    }>
      <div className="space-y-6">
        <div className="gradient-border glass rounded-2xl p-6 space-y-4">
          <h3 className="font-display text-lg font-semibold">Hero section</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Hero title <span className="text-xs text-muted-foreground">(supports plain text — leave blank for default)</span></Label>
              <Input value={row.hero_title ?? ""} onChange={(e) => setRow({ ...row, hero_title: e.target.value })} placeholder="Make It Possible With ASLENIX" />
            </div>
            <div className="md:col-span-2">
              <Label>Hero subtitle</Label>
              <Textarea rows={3} value={row.hero_subtitle ?? ""} onChange={(e) => setRow({ ...row, hero_subtitle: e.target.value })} placeholder="Transforming vision into next-gen digital reality…" />
            </div>
            <div><Label>Primary CTA text</Label><Input value={row.hero_cta_primary_text ?? ""} onChange={(e) => setRow({ ...row, hero_cta_primary_text: e.target.value })} placeholder="Get Started" /></div>
            <div><Label>Primary CTA link</Label><Input value={row.hero_cta_primary_link ?? ""} onChange={(e) => setRow({ ...row, hero_cta_primary_link: e.target.value })} placeholder="#contact" /></div>
            <div><Label>Secondary CTA text</Label><Input value={row.hero_cta_secondary_text ?? ""} onChange={(e) => setRow({ ...row, hero_cta_secondary_text: e.target.value })} placeholder="Our Services" /></div>
            <div><Label>Secondary CTA link</Label><Input value={row.hero_cta_secondary_link ?? ""} onChange={(e) => setRow({ ...row, hero_cta_secondary_link: e.target.value })} placeholder="#services" /></div>
          </div>
        </div>

        <div className="gradient-border glass rounded-2xl p-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">Hero Showcase Media (Images & Videos)</h3>
              <p className="text-sm text-muted-foreground">
                {normalizeSlides(row.hero_slides).filter((slide) => slide.src.trim()).length} saved media item{normalizeSlides(row.hero_slides).filter((slide) => slide.src.trim()).length === 1 ? "" : "s"}.
                {" "}Add, edit, reorder, or delete the public homepage showcase images and videos.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" onClick={() => addSlide("image")} variant="glass" size="sm">
                <ImageIcon className="w-3.5 h-3.5 mr-1" /> Add Image
              </Button>
              <Button type="button" onClick={() => addSlide("video")} variant="hero" size="sm">
                <Film className="w-3.5 h-3.5 mr-1" /> Add Video
              </Button>
            </div>
          </div>

          {normalizeSlides(row.hero_slides).length === 0 ? (
            <div className="rounded-xl border border-dashed border-foreground/10 p-6 text-center text-sm text-muted-foreground">
              No custom slides yet. The homepage will use default showcase items until you add custom ones.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {normalizeSlides(row.hero_slides).map((slide, index) => {
                const isVid = slide.type === "video" || (slide.type === undefined && isVideoSource(slide.src));
                return (
                  <div key={`${slide.src}-${index}`} className="rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-4 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">Slide {index + 1}</span>
                        <div className="inline-flex rounded-lg border border-foreground/10 p-0.5 bg-foreground/[0.04]">
                          <button
                            type="button"
                            onClick={() => updateSlide(index, { type: "image" })}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium transition ${
                              !isVid ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <ImageIcon className="w-3 h-3" /> Image
                          </button>
                          <button
                            type="button"
                            onClick={() => updateSlide(index, { type: "video" })}
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium transition ${
                              isVid ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <Film className="w-3 h-3" /> Video
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button type="button" variant="ghost" size="icon" disabled={index === 0} onClick={() => moveSlide(index, -1)} aria-label="Move slide up"><ArrowUp className="h-4 w-4" /></Button>
                        <Button type="button" variant="ghost" size="icon" disabled={index === normalizeSlides(row.hero_slides).length - 1} onClick={() => moveSlide(index, 1)} aria-label="Move slide down"><ArrowDown className="h-4 w-4" /></Button>
                        <Button type="button" variant="ghost" size="icon" onClick={() => deleteSlide(index)} aria-label="Delete slide"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
                    </div>

                    {isVid ? (
                      <VideoSlideEditor
                        slide={slide}
                        onChange={(patch) => updateSlide(index, patch)}
                      />
                    ) : (
                      <>
                        <MediaPicker
                          label="Dashboard image"
                          value={slide.src}
                          cropAspect={16 / 10.5}
                          onChange={(src) => updateSlide(index, { src: src ?? "", type: "image" })}
                        />
                        <div>
                          <Label>Alt text</Label>
                          <Input value={slide.alt} onChange={(e) => updateSlide(index, { alt: e.target.value })} placeholder="Analytics dashboard preview" />
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="gradient-border glass rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold mb-3">Featured services</h3>
            <div className="space-y-1 max-h-80 overflow-auto">
              {services.map((s) => (
                <label key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-foreground/5 cursor-pointer text-sm">
                  <input type="checkbox" checked={row.featured_service_ids?.includes(s.id)} onChange={() => toggle("featured_service_ids", s.id)} />
                  <span>{s.title}</span>
                </label>
              ))}
              {services.length === 0 && <div className="text-sm text-muted-foreground py-4 text-center">No services yet</div>}
            </div>
          </div>

          <div className="gradient-border glass rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold mb-3">Featured projects</h3>
            <div className="space-y-1 max-h-80 overflow-auto">
              {projects.map((p) => (
                <label key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-foreground/5 cursor-pointer text-sm">
                  <input type="checkbox" checked={row.featured_project_ids?.includes(p.id)} onChange={() => toggle("featured_project_ids", p.id)} />
                  <span>{p.title}</span>
                </label>
              ))}
              {projects.length === 0 && <div className="text-sm text-muted-foreground py-4 text-center">No projects yet</div>}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
};

export default AdminHomepage;
