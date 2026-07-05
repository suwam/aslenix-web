import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { Plus, Trash2, Pencil, Star } from "lucide-react";
import { toast } from "sonner";

type Brand = {
  id?: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  description: string | null;
  category: "partner" | "client" | "technology" | "sponsor";
  active: boolean;
  featured: boolean;
  display_order: number;
};

const empty: Brand = {
  name: "", logo_url: null, website_url: "", description: "",
  category: "partner", active: true, featured: false, display_order: 0,
};

const sb = supabase as any;

const AdminBrands = () => {
  const [rows, setRows] = useState<Brand[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Brand>(empty);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const load = async () => {
    const { data, error } = await sb
      .from("brands").select("*").order("display_order").order("created_at");
    if (error) return toast.error(error.message);
    setRows((data ?? []) as Brand[]);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.name.trim()) return toast.error("Name required");
    const payload = { ...editing, website_url: editing.website_url || null, description: editing.description || null };
    const { error } = editing.id
      ? await sb.from("brands").update(payload).eq("id", editing.id)
      : await sb.from("brands").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setOpen(false); setEditing(empty); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this brand?")) return;
    const { error } = await sb.from("brands").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  const toggle = async (id: string, active: boolean) => {
    await sb.from("brands").update({ active }).eq("id", id); load();
  };

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (filter !== "all" && r.category !== filter) return false;
      if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [rows, search, filter]);

  return (
    <AdminShell title="Brands / Partners" actions={
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setEditing(empty)} variant="hero" size="sm">
            <Plus className="w-3.5 h-3.5" /> Add Brand
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing.id ? "Edit" : "New"} Brand</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
            <div><Label>Name *</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
            <MediaPicker label="Logo" value={editing.logo_url} cropAspect={null} onChange={(url) => setEditing({ ...editing, logo_url: url })} />
            {editing.logo_url && (
              <div className="rounded-lg border border-foreground/10 p-3 flex items-center justify-center bg-foreground/30">
                <img src={editing.logo_url} alt="preview" className="h-14 object-contain" />
              </div>
            )}
            <div><Label>Website URL</Label><Input value={editing.website_url ?? ""} onChange={(e) => setEditing({ ...editing, website_url: e.target.value })} placeholder="https://…" /></div>
            <div><Label>Description</Label><Textarea rows={2} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Category</Label>
                <Select value={editing.category} onValueChange={(v: any) => setEditing({ ...editing, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="partner">Partner</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="sponsor">Sponsor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Display Order</Label><Input type="number" value={editing.display_order} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) || 0 })} /></div>
            </div>
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-sm"><Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} /> Active</label>
              <label className="flex items-center gap-2 text-sm"><Switch checked={editing.featured} onCheckedChange={(v) => setEditing({ ...editing, featured: v })} /> Featured</label>
            </div>
            <Button onClick={save} variant="hero" className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    }>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input placeholder="Search brands…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="partner">Partner</SelectItem>
            <SelectItem value="client">Client</SelectItem>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="sponsor">Sponsor</SelectItem>
          </SelectContent>
        </Select>
        <div className="text-xs text-muted-foreground ml-auto">{filtered.length} of {rows.length}</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((r) => (
          <div key={r.id} className="gradient-border glass rounded-2xl p-4 flex flex-col gap-3">
            <div className="h-20 rounded-lg bg-foreground/30 border border-foreground/5 flex items-center justify-center overflow-hidden">
              {r.logo_url
                ? <img src={r.logo_url} alt={r.name} className="max-h-14 object-contain" />
                : <div className="text-xs text-muted-foreground">No logo</div>}
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium truncate">{r.name}</span>
                  {r.featured && <Star className="w-3 h-3 fill-accent text-accent shrink-0" />}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{r.category} · #{r.display_order}</div>
              </div>
              <Switch checked={r.active} onCheckedChange={(v) => toggle(r.id!, v)} />
            </div>
            <div className="flex items-center gap-1 -mr-1">
              <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
              <Button size="icon" variant="ghost" onClick={() => remove(r.id!)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-12">No brands yet — click "Add Brand" to create one.</div>
        )}
      </div>
    </AdminShell>
  );
};

export default AdminBrands;
