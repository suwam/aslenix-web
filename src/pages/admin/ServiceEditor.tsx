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
import { logActivity } from "@/lib/activity";

const empty = {
  title: "", slug: "", icon: "Sparkles", short_description: "", full_description: "",
  deliverables: "", technologies: "", cta_text: "Get Started", cta_link: "#contact", active: true,
};

const ServiceEditor = () => {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const nav = useNavigate();
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isNew) return;
    supabase.from("services").select("*").eq("id", id!).maybeSingle().then(({ data }) => {
      if (!data) return;
      setForm({
        title: data.title, slug: data.slug, icon: data.icon ?? "Sparkles",
        short_description: data.short_description ?? "",
        full_description: data.full_description ?? "",
        deliverables: ((data.deliverables as string[]) ?? []).join("\n"),
        technologies: (data.technologies ?? []).join(", "),
        cta_text: data.cta_text ?? "", cta_link: data.cta_link ?? "",
        active: data.active,
      });
    });
  }, [id, isNew]);

  const save = async () => {
    if (!form.title.trim()) return toast.error("Title required");
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      slug: (form.slug || toSlug(form.title)).trim(),
      icon: form.icon || null,
      short_description: form.short_description || null,
      full_description: form.full_description || null,
      deliverables: form.deliverables.split("\n").map((s) => s.trim()).filter(Boolean),
      technologies: form.technologies.split(",").map((s) => s.trim()).filter(Boolean),
      cta_text: form.cta_text || null,
      cta_link: form.cta_link || null,
      active: form.active,
    };
    const res = isNew
      ? await supabase.from("services").insert(payload).select().maybeSingle()
      : await supabase.from("services").update(payload).eq("id", id!).select().maybeSingle();
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    await logActivity(isNew ? "Created service" : "Updated service", "service", res.data?.id, { title: payload.title });
    toast.success("Saved"); nav("/admin/services");
  };

  return (
    <AdminShell title={isNew ? "New service" : "Edit service"} actions={
      <>
        <Button variant="ghost" size="sm" onClick={() => nav("/admin/services")}>Cancel</Button>
        <Button variant="hero" size="sm" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save"}</Button>
      </>
    }>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 gradient-border glass rounded-2xl p-6 space-y-4">
          <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || toSlug(e.target.value) })} /></Field>
          <Field label="Slug"><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: toSlug(e.target.value) })} /></Field>
          <Field label="Short description"><Textarea rows={2} value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} /></Field>
          <Field label="Full description"><Textarea rows={6} value={form.full_description} onChange={(e) => setForm({ ...form, full_description: e.target.value })} /></Field>
          <Field label="Deliverables (one per line)"><Textarea rows={5} value={form.deliverables} onChange={(e) => setForm({ ...form, deliverables: e.target.value })} /></Field>
        </div>
        <div className="gradient-border glass rounded-2xl p-6 space-y-4">
          <Field label="Icon name (lucide)"><Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="Sparkles" /></Field>
          <Field label="Technologies (comma-separated)"><Input value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} /></Field>
          <Field label="CTA text"><Input value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} /></Field>
          <Field label="CTA link"><Input value={form.cta_link} onChange={(e) => setForm({ ...form, cta_link: e.target.value })} /></Field>
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-medium">Active</span>
            <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
          </div>
        </div>
      </div>
    </AdminShell>
  );
};
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5"><label className="text-sm font-medium">{label}</label>{children}</div>
);
export default ServiceEditor;
