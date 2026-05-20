import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { toSlug } from "@/lib/utils-slug";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { RichEditor } from "@/components/admin/RichEditor";
import { logActivity } from "@/lib/activity";
import { Sparkles } from "lucide-react";

const empty = {
  title: "", slug: "", featured_image: "", excerpt: "", content: "",
  category: "", tags: "", published: false, seo_title: "", seo_description: "",
};

const BlogEditor = () => {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const nav = useNavigate();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);

  useEffect(() => {
    if (isNew) return;
    supabase.from("blogs").select("*").eq("id", id!).maybeSingle().then(({ data }) => {
      if (!data) return;
      setForm({
        title: data.title, slug: data.slug, featured_image: data.featured_image ?? "",
        excerpt: data.excerpt ?? "", content: data.content ?? "",
        category: data.category ?? "", tags: (data.tags ?? []).join(", "),
        published: data.published, seo_title: data.seo_title ?? "",
        seo_description: data.seo_description ?? "",
      });
    });
  }, [id, isNew]);

  const aiGenerate = async () => {
    if (!form.title) return toast.error("Add a title first");
    setAiBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-content", {
        body: { task: "blog", title: form.title, hint: form.excerpt },
      });
      if (error) throw error;
      setForm((f) => ({ ...f, content: data.content ?? f.content, excerpt: f.excerpt || (data.excerpt ?? "") }));
      toast.success("Draft generated");
    } catch (e: any) {
      toast.error(e.message ?? "AI failed");
    } finally { setAiBusy(false); }
  };

  const save = async () => {
    if (!form.title.trim()) return toast.error("Title required");
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      slug: (form.slug || toSlug(form.title)).trim(),
      featured_image: form.featured_image || null,
      excerpt: form.excerpt || null,
      content: form.content || null,
      category: form.category || null,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      published: form.published,
      published_at: form.published ? new Date().toISOString() : null,
      seo_title: form.seo_title || null,
      seo_description: form.seo_description || null,
    };
    const res = isNew
      ? await supabase.from("blogs").insert(payload).select().maybeSingle()
      : await supabase.from("blogs").update(payload).eq("id", id!).select().maybeSingle();
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    await logActivity(isNew ? "Created blog" : "Updated blog", "blog", res.data?.id, { title: payload.title });
    toast.success("Saved"); nav("/admin/blogs");
  };

  return (
    <AdminShell title={isNew ? "New blog post" : "Edit blog post"} actions={
      <>
        <Button variant="ghost" size="sm" onClick={() => nav("/admin/blogs")}>Cancel</Button>
        <Button variant="glass" size="sm" disabled={aiBusy} onClick={aiGenerate}><Sparkles className="w-3.5 h-3.5" /> {aiBusy ? "Generating…" : "AI Draft"}</Button>
        <Button variant="hero" size="sm" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save"}</Button>
      </>
    }>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="gradient-border glass rounded-2xl p-6 space-y-4">
            <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || toSlug(e.target.value) })} className="text-lg" /></Field>
            <Field label="Slug"><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: toSlug(e.target.value) })} /></Field>
            <Field label="Excerpt"><Textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></Field>
          </div>
          <div className="gradient-border glass rounded-2xl p-2">
            <RichEditor value={form.content} onChange={(v) => setForm({ ...form, content: v })} />
          </div>
        </div>
        <div className="space-y-4">
          <div className="gradient-border glass rounded-2xl p-6">
            <MediaPicker label="Featured image" value={form.featured_image} onChange={(v) => setForm({ ...form, featured_image: v ?? "" })} />
          </div>
          <div className="gradient-border glass rounded-2xl p-6 space-y-4">
            <Field label="Category"><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Field>
            <Field label="Tags (comma-separated)"><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} /></Field>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Published</span>
              <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
            </div>
          </div>
          <div className="gradient-border glass rounded-2xl p-6 space-y-4">
            <h3 className="font-medium text-sm">SEO</h3>
            <Field label="Meta title"><Input value={form.seo_title} onChange={(e) => setForm({ ...form, seo_title: e.target.value })} /></Field>
            <Field label="Meta description"><Textarea rows={3} value={form.seo_description} onChange={(e) => setForm({ ...form, seo_description: e.target.value })} /></Field>
          </div>
        </div>
      </div>
    </AdminShell>
  );
};
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5"><label className="text-sm font-medium">{label}</label>{children}</div>
);
export default BlogEditor;
