import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { logActivity } from "@/lib/activity";

type HeroSlide = {
  src: string;
  alt: string;
};

const normalizeSlides = (value: unknown): HeroSlide[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((slide) => {
      if (!slide || typeof slide !== "object") return null;
      const record = slide as Record<string, unknown>;
      const src = typeof record.src === "string" ? record.src : "";
      const alt = typeof record.alt === "string" ? record.alt : "";
      return { src, alt };
    })
    .filter((slide): slide is HeroSlide => Boolean(slide));
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

  const addSlide = () => {
    setRow((r: any) => ({ ...r, hero_slides: [...normalizeSlides(r.hero_slides), { src: "", alt: "" }] }));
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
    toast.success(`Homepage saved with ${slides.length} dashboard image${slides.length === 1 ? "" : "s"}`);
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
              <h3 className="font-display text-lg font-semibold">Hero dashboard images</h3>
              <p className="text-sm text-muted-foreground">
                {normalizeSlides(row.hero_slides).filter((slide) => slide.src.trim()).length} saved image{normalizeSlides(row.hero_slides).filter((slide) => slide.src.trim()).length === 1 ? "" : "s"}.
                {" "}Add, edit, reorder, or delete the public homepage carousel images.
              </p>
            </div>
            <Button type="button" onClick={addSlide} variant="glass" size="sm"><Plus className="w-3.5 h-3.5" /> Add image</Button>
          </div>

          {normalizeSlides(row.hero_slides).length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-muted-foreground">
              No custom dashboard images yet. The homepage will use the default images until you add and save custom ones.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {normalizeSlides(row.hero_slides).map((slide, index) => (
                <div key={`${slide.src}-${index}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-white">Image {index + 1}</div>
                    <div className="flex items-center gap-1">
                      <Button type="button" variant="ghost" size="icon" disabled={index === 0} onClick={() => moveSlide(index, -1)} aria-label="Move image up"><ArrowUp className="h-4 w-4" /></Button>
                      <Button type="button" variant="ghost" size="icon" disabled={index === normalizeSlides(row.hero_slides).length - 1} onClick={() => moveSlide(index, 1)} aria-label="Move image down"><ArrowDown className="h-4 w-4" /></Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => deleteSlide(index)} aria-label="Delete image"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                  <MediaPicker
                    label="Dashboard image"
                    value={slide.src}
                    cropAspect={16 / 10.5}
                    onChange={(src) => updateSlide(index, { src: src ?? "" })}
                  />
                  <div>
                    <Label>Alt text</Label>
                    <Input value={slide.alt} onChange={(e) => updateSlide(index, { alt: e.target.value })} placeholder="Analytics dashboard preview" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="gradient-border glass rounded-2xl p-6">
            <h3 className="font-display text-lg font-semibold mb-3">Featured services</h3>
            <div className="space-y-1 max-h-80 overflow-auto">
              {services.map((s) => (
                <label key={s.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer text-sm">
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
                <label key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer text-sm">
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
