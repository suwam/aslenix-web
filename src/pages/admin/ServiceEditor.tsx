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
import { Plus, Trash2, GripVertical } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

const empty = {
  title: "", slug: "", icon: "Sparkles", short_description: "", full_description: "",
  deliverables: "", technologies: "", cta_text: "Get Started", cta_link: "#contact", active: true,
  overview: { what: "", why: "" },
  packages: [] as any[],
  caseStudies: [] as any[],
  faqs: [] as any[],
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
      const ov = data.overview as any;
      setForm({
        title: data.title, slug: data.slug, icon: data.icon ?? "Sparkles",
        short_description: data.short_description ?? "",
        full_description: data.full_description ?? "",
        deliverables: ((data.deliverables as string[]) ?? []).join("\n"),
        technologies: (data.technologies ?? []).join(", "),
        cta_text: data.cta_text ?? "", cta_link: data.cta_link ?? "",
        active: data.active,
        overview: { what: ov?.what ?? "", why: ov?.why ?? "" },
        packages: (data.packages as any[]) ?? [],
        caseStudies: (data.case_studies as any[]) ?? [],
        faqs: (data.faqs as any[]) ?? [],
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
      deliverables: form.deliverables.split("\n").map((s) => s.trim()).filter(Boolean) as Json,
      technologies: form.technologies.split(",").map((s) => s.trim()).filter(Boolean),
      cta_text: form.cta_text || null,
      cta_link: form.cta_link || null,
      active: form.active,
      overview: form.overview as Json,
      packages: form.packages as Json,
      case_studies: form.caseStudies as Json,
      faqs: form.faqs as Json,
    };
    const res = isNew
      ? await supabase.from("services").insert(payload).select().maybeSingle()
      : await supabase.from("services").update(payload).eq("id", id!).select().maybeSingle();
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    await logActivity(isNew ? "Created service" : "Updated service", "service", res.data?.id, { title: payload.title });
    toast.success("Saved"); nav("/admin/services");
  };

  const addPackage = () => setForm({ ...form, packages: [...form.packages, { name: "", price: "", startingFrom: false, highlighted: false, features: [] }] });
  const addCaseStudy = () => setForm({ ...form, caseStudies: [...form.caseStudies, { title: "", category: "", description: "" }] });
  const addFaq = () => setForm({ ...form, faqs: [...form.faqs, { q: "", a: "" }] });

  return (
    <AdminShell title={isNew ? "New service" : "Edit service"} actions={
      <>
        <Button variant="ghost" size="sm" onClick={() => nav("/admin/services")}>Cancel</Button>
        <Button variant="hero" size="sm" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save"}</Button>
      </>
    }>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="gradient-border glass rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-lg border-b border-white/10 pb-2">Basic Info</h3>
            <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || toSlug(e.target.value) })} /></Field>
            <Field label="Slug"><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: toSlug(e.target.value) })} /></Field>
            <Field label="Short description"><Textarea rows={2} value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} /></Field>
            <Field label="Full description"><Textarea rows={3} value={form.full_description} onChange={(e) => setForm({ ...form, full_description: e.target.value })} /></Field>
            <Field label="Deliverables (one per line)"><Textarea rows={4} value={form.deliverables} onChange={(e) => setForm({ ...form, deliverables: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Overview: What it is"><Textarea rows={3} value={form.overview.what} onChange={(e) => setForm({ ...form, overview: { ...form.overview, what: e.target.value } })} /></Field>
              <Field label="Overview: Why it matters"><Textarea rows={3} value={form.overview.why} onChange={(e) => setForm({ ...form, overview: { ...form.overview, why: e.target.value } })} /></Field>
            </div>
          </div>

          <div className="gradient-border glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-semibold text-lg">Packages</h3>
              <Button size="sm" variant="ghost" onClick={addPackage}><Plus className="w-4 h-4 mr-1"/> Add Package</Button>
            </div>
            {form.packages.map((pkg, i) => (
              <div key={i} className="p-4 rounded-xl border border-white/10 bg-black/20 space-y-3 relative">
                <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => setForm({ ...form, packages: form.packages.filter((_, idx) => idx !== i) })}><Trash2 className="w-4 h-4" /></Button>
                <div className="grid grid-cols-2 gap-3 pr-8">
                  <Field label="Name"><Input value={pkg.name} onChange={(e) => { const p = [...form.packages]; p[i].name = e.target.value; setForm({ ...form, packages: p }); }} /></Field>
                  <Field label="Price"><Input value={pkg.price} onChange={(e) => { const p = [...form.packages]; p[i].price = e.target.value; setForm({ ...form, packages: p }); }} /></Field>
                </div>
                <Field label="Features (comma separated)"><Input value={(pkg.features || []).join(", ")} onChange={(e) => { const p = [...form.packages]; p[i].features = e.target.value.split(",").map(s => s.trim()).filter(Boolean); setForm({ ...form, packages: p }); }} /></Field>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm"><Switch checked={pkg.startingFrom} onCheckedChange={(v) => { const p = [...form.packages]; p[i].startingFrom = v; setForm({ ...form, packages: p }); }} /> "Starting From"</label>
                  <label className="flex items-center gap-2 text-sm"><Switch checked={pkg.highlighted} onCheckedChange={(v) => { const p = [...form.packages]; p[i].highlighted = v; setForm({ ...form, packages: p }); }} /> Highlighted (Popular)</label>
                </div>
              </div>
            ))}
          </div>

          <div className="gradient-border glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-semibold text-lg">Case Studies</h3>
              <Button size="sm" variant="ghost" onClick={addCaseStudy}><Plus className="w-4 h-4 mr-1"/> Add Case Study</Button>
            </div>
            {form.caseStudies.map((cs, i) => (
              <div key={i} className="p-4 rounded-xl border border-white/10 bg-black/20 space-y-3 relative">
                <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => setForm({ ...form, caseStudies: form.caseStudies.filter((_, idx) => idx !== i) })}><Trash2 className="w-4 h-4" /></Button>
                <div className="grid grid-cols-2 gap-3 pr-8">
                  <Field label="Title"><Input value={cs.title} onChange={(e) => { const c = [...form.caseStudies]; c[i].title = e.target.value; setForm({ ...form, caseStudies: c }); }} /></Field>
                  <Field label="Category"><Input value={cs.category} onChange={(e) => { const c = [...form.caseStudies]; c[i].category = e.target.value; setForm({ ...form, caseStudies: c }); }} /></Field>
                </div>
                <Field label="Description"><Textarea rows={2} value={cs.description} onChange={(e) => { const c = [...form.caseStudies]; c[i].description = e.target.value; setForm({ ...form, caseStudies: c }); }} /></Field>
              </div>
            ))}
          </div>

          <div className="gradient-border glass rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-semibold text-lg">FAQs</h3>
              <Button size="sm" variant="ghost" onClick={addFaq}><Plus className="w-4 h-4 mr-1"/> Add FAQ</Button>
            </div>
            {form.faqs.map((faq, i) => (
              <div key={i} className="p-4 rounded-xl border border-white/10 bg-black/20 space-y-3 relative">
                <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-7 w-7 text-destructive" onClick={() => setForm({ ...form, faqs: form.faqs.filter((_, idx) => idx !== i) })}><Trash2 className="w-4 h-4" /></Button>
                <Field label="Question"><Input value={faq.q} onChange={(e) => { const f = [...form.faqs]; f[i].q = e.target.value; setForm({ ...form, faqs: f }); }} className="pr-8" /></Field>
                <Field label="Answer"><Textarea rows={2} value={faq.a} onChange={(e) => { const f = [...form.faqs]; f[i].a = e.target.value; setForm({ ...form, faqs: f }); }} /></Field>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="gradient-border glass rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-lg border-b border-white/10 pb-2">Settings</h3>
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
      </div>
    </AdminShell>
  );
};
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5"><label className="text-sm font-medium">{label}</label>{children}</div>
);
export default ServiceEditor;
