import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Save, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { logActivity } from "@/lib/activity";

const DEFAULT_PAGES = ["home", "about", "services", "projects", "blog", "contact"];

type Row = { id?: string; page_key: string; title?: string; description?: string; keywords?: string[]; og_image?: string };

const AdminSEO = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("seo_meta").select("*").order("page_key");
    const existing = data ?? [];
    const keys = new Set(existing.map((r) => r.page_key));
    DEFAULT_PAGES.forEach((k) => { if (!keys.has(k)) existing.push({ page_key: k, title: "", description: "", keywords: [] } as any); });
    setRows(existing as any);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const update = (i: number, patch: Partial<Row>) => setRows((r) => r.map((x, idx) => idx === i ? { ...x, ...patch } : x));

  const save = async (row: Row) => {
    const payload = {
      page_key: row.page_key,
      title: row.title || null,
      description: row.description || null,
      keywords: row.keywords ?? [],
      og_image: row.og_image || null,
    };
    const { error } = row.id
      ? await supabase.from("seo_meta").update(payload).eq("id", row.id)
      : await supabase.from("seo_meta").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(`Saved ${row.page_key}`);
    await logActivity(`Updated SEO for ${row.page_key}`, "seo_meta", row.page_key);
    load();
  };

  const remove = async (row: Row) => {
    if (!row.id) return;
    if (!confirm(`Delete SEO for ${row.page_key}?`)) return;
    await supabase.from("seo_meta").delete().eq("id", row.id);
    toast.success("Deleted");
    load();
  };

  const aiFill = async (i: number) => {
    const row = rows[i];
    toast.info("Generating with AI…");
    const [t, d, k] = await Promise.all([
      supabase.functions.invoke("ai-content", { body: { task: "seo_title", title: `ASLENIX ${row.page_key} page` } }),
      supabase.functions.invoke("ai-content", { body: { task: "seo_description", title: `ASLENIX ${row.page_key} page` } }),
      supabase.functions.invoke("ai-content", { body: { task: "seo_keywords", title: `ASLENIX ${row.page_key}` } }),
    ]);
    update(i, {
      title: (t.data?.content ?? "").trim().slice(0, 60),
      description: (d.data?.content ?? "").trim().slice(0, 160),
      keywords: (k.data?.content ?? "").split(",").map((s: string) => s.trim()).filter(Boolean).slice(0, 10),
    });
    toast.success("Filled — review and save");
  };

  const addCustom = () => {
    const key = prompt("Page key (e.g. pricing, blog/post-slug):");
    if (!key) return;
    setRows((r) => [...r, { page_key: key, title: "", description: "", keywords: [] }]);
  };

  return (
    <AdminShell title="SEO Manager" actions={
      <Button onClick={addCustom} variant="hero" size="sm"><Plus className="w-3.5 h-3.5" /> Add page</Button>
    }>
      {loading ? <div className="text-muted-foreground">Loading…</div> : (
        <div className="space-y-4">
          {rows.map((row, i) => (
            <div key={row.page_key + i} className="gradient-border glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4 gap-2">
                <h3 className="font-display text-lg font-semibold">/{row.page_key}</h3>
                <div className="flex gap-2">
                  <Button onClick={() => aiFill(i)} variant="glass" size="sm"><Wand2 className="w-3.5 h-3.5" /> AI</Button>
                  <Button onClick={() => save(row)} variant="hero" size="sm"><Save className="w-3.5 h-3.5" /> Save</Button>
                  {row.id && <Button onClick={() => remove(row)} variant="ghost" size="sm"><Trash2 className="w-3.5 h-3.5" /></Button>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Meta title <span className="text-xs text-muted-foreground">({(row.title ?? "").length}/60)</span></Label>
                  <Input value={row.title ?? ""} maxLength={60} onChange={(e) => update(i, { title: e.target.value })} />
                </div>
                <div>
                  <Label>OG image URL</Label>
                  <Input value={row.og_image ?? ""} onChange={(e) => update(i, { og_image: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <Label>Description <span className="text-xs text-muted-foreground">({(row.description ?? "").length}/160)</span></Label>
                  <Textarea rows={2} maxLength={160} value={row.description ?? ""} onChange={(e) => update(i, { description: e.target.value })} />
                </div>
                <div className="md:col-span-2">
                  <Label>Keywords (comma separated)</Label>
                  <Input value={(row.keywords ?? []).join(", ")} onChange={(e) => update(i, { keywords: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminShell>
  );
};

export default AdminSEO;
