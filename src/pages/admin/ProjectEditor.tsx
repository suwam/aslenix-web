import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { toSlug } from "@/lib/utils-slug";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { logActivity } from "@/lib/activity";

const empty = {
  title: "", slug: "", short_description: "", full_description: "",
  cover_image: "", category: "", technologies: "" as string,
  project_url: "", client_name: "", completion_date: "", featured: false,
  status: "planning" as "planning"|"in_progress"|"completed"|"on_hold",
  progress: 0, client_id: "" as string, budget: "", start_date: "", deadline: "",
};

const STATUSES = [
  { v: "planning", l: "Planning" },
  { v: "in_progress", l: "In Progress" },
  { v: "completed", l: "Completed" },
  { v: "on_hold", l: "On Hold" },
];

const ProjectEditor = () => {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const nav = useNavigate();
  const [form, setForm] = useState(empty);
  const [clients, setClients] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("clients").select("id, company_name").order("company_name").then(({ data }) => setClients(data ?? []));
  }, []);

  useEffect(() => {
    if (isNew) return;
    supabase.from("projects").select("*").eq("id", id!).maybeSingle().then(({ data }) => {
      if (!data) return;
      setForm({
        title: data.title, slug: data.slug,
        short_description: data.short_description ?? "",
        full_description: data.full_description ?? "",
        cover_image: data.cover_image ?? "",
        category: data.category ?? "",
        technologies: (data.technologies ?? []).join(", "),
        project_url: data.project_url ?? "",
        client_name: data.client_name ?? "",
        completion_date: data.completion_date ?? "",
        featured: data.featured,
        status: (data as any).status ?? "planning",
        progress: (data as any).progress ?? 0,
        client_id: (data as any).client_id ?? "",
        budget: (data as any).budget?.toString() ?? "",
        start_date: (data as any).start_date ?? "",
        deadline: (data as any).deadline ?? "",
      });
    });
  }, [id, isNew]);

  const save = async () => {
    if (!form.title.trim()) return toast.error("Title required");
    setSaving(true);
    const payload: any = {
      title: form.title.trim(),
      slug: (form.slug || toSlug(form.title)).trim(),
      short_description: form.short_description || null,
      full_description: form.full_description || null,
      cover_image: form.cover_image || null,
      category: form.category || null,
      technologies: form.technologies.split(",").map((t) => t.trim()).filter(Boolean),
      project_url: form.project_url || null,
      client_name: form.client_name || null,
      completion_date: form.completion_date || null,
      featured: form.featured,
      status: form.status,
      progress: form.progress,
      client_id: form.client_id || null,
      budget: form.budget ? Number(form.budget) : null,
      start_date: form.start_date || null,
      deadline: form.deadline || null,
    };
    const res = isNew
      ? await supabase.from("projects").insert(payload).select().maybeSingle()
      : await supabase.from("projects").update(payload).eq("id", id!).select().maybeSingle();
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    await logActivity(isNew ? "Created project" : "Updated project", "project", res.data?.id, { title: payload.title });
    toast.success("Saved");
    nav("/admin/projects");
  };

  return (
    <AdminShell title={isNew ? "New project" : "Edit project"} actions={
      <>
        <Button variant="ghost" size="sm" onClick={() => nav("/admin/projects")}>Cancel</Button>
        <Button variant="hero" size="sm" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save"}</Button>
      </>
    }>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="gradient-border glass rounded-2xl p-6 space-y-4">
            <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: form.slug || toSlug(e.target.value) })} /></Field>
            <Field label="Slug"><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: toSlug(e.target.value) })} placeholder="auto from title" /></Field>
            <Field label="Short description"><Textarea rows={2} value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} /></Field>
            <Field label="Full description"><Textarea rows={6} value={form.full_description} onChange={(e) => setForm({ ...form, full_description: e.target.value })} /></Field>
          </div>
          <div className="gradient-border glass rounded-2xl p-6">
            <MediaPicker label="Cover image" value={form.cover_image} onChange={(v) => setForm({ ...form, cover_image: v ?? "" })} />
          </div>
        </div>
        <div className="space-y-4">
          <div className="gradient-border glass rounded-2xl p-6 space-y-4">
            <Field label="Status">
              <Select value={form.status} onValueChange={(v: any) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label={`Progress: ${form.progress}%`}>
              <input type="range" min={0} max={100} value={form.progress} onChange={(e) => setForm({ ...form, progress: Number(e.target.value) })} className="w-full accent-primary" />
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-brand-gradient transition-all" style={{ width: `${form.progress}%` }} />
              </div>
            </Field>
            <Field label="Client">
              <Select value={form.client_id || "__none"} onValueChange={(v) => setForm({ ...form, client_id: v === "__none" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">— None —</SelectItem>
                  {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Budget"><Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="0.00" /></Field>
            <Field label="Start date"><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></Field>
            <Field label="Deadline"><Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} /></Field>
            <Field label="Category"><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Web · App · AI…" /></Field>
            <Field label="Client name (display)"><Input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} /></Field>
            <Field label="Project URL"><Input value={form.project_url} onChange={(e) => setForm({ ...form, project_url: e.target.value })} placeholder="https://…" /></Field>
            <Field label="Completion date"><Input type="date" value={form.completion_date} onChange={(e) => setForm({ ...form, completion_date: e.target.value })} /></Field>
            <Field label="Technologies (comma-separated)"><Input value={form.technologies} onChange={(e) => setForm({ ...form, technologies: e.target.value })} placeholder="React, Node.js" /></Field>
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-medium">Featured</span>
              <Switch checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
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

export default ProjectEditor;
