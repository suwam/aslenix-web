import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Pencil, Quote } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Testimonial = {
  id?: string;
  quote: string;
  name: string;
  role: string | null;
  email?: string | null;
  rating?: number;
  active: boolean;
  display_order: number;
};

const empty: Testimonial = {
  quote: "", name: "", role: "", email: "", rating: 5, active: true, display_order: 0,
};

const sb = supabase as any;

const AdminTestimonials = () => {
  const [rows, setRows] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial>(empty);

  const load = async () => {
    const { data, error } = await sb
      .from("testimonials").select("*").order("display_order").order("created_at", { ascending: false });
    
    if (error) {
      console.error("Testimonials fetch error:", error);
      return;
    }
    setRows((data ?? []) as Testimonial[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.name.trim() || !editing.quote.trim()) return toast.error("Name and quote required");
    const payload = { ...editing, role: editing.role || null, email: editing.email || null, rating: editing.rating || 5 };
    const { error } = editing.id
      ? await sb.from("testimonials").update(payload).eq("id", editing.id)
      : await sb.from("testimonials").insert(payload);
    
    if (error) {
      if (error.code === '42P01') {
         return toast.error("Database table missing! Please run the SQL migration in your Supabase dashboard.");
      }
      return toast.error(error.message);
    }
    toast.success("Saved");
    setOpen(false); setEditing(empty); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    const { error } = await sb.from("testimonials").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  const toggle = async (id: string, active: boolean) => {
    await sb.from("testimonials").update({ active }).eq("id", id); load();
  };

  return (
    <AdminShell title="Testimonials / Reviews" actions={
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setEditing(empty)} variant="hero" size="sm">
            <Plus className="w-3.5 h-3.5" /> Add Review
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing.id ? "Edit" : "New"} Review</DialogTitle></DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div><Label>Review / Quote *</Label><Textarea rows={4} value={editing.quote} onChange={(e) => setEditing({ ...editing, quote: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Reviewer Name *</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div><Label>Company / Role</Label><Input value={editing.role ?? ""} onChange={(e) => setEditing({ ...editing, role: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Email <span className="text-muted-foreground text-xs font-normal">(Private)</span></Label><Input type="email" value={editing.email ?? ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></div>
              <div><Label>Rating (1-5)</Label><Input type="number" min={1} max={5} value={editing.rating ?? 5} onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) || 5 })} /></div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div><Label>Display Order</Label><Input type="number" value={editing.display_order} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) || 0 })} /></div>
              <div className="flex items-center gap-2 mt-auto pb-2">
                <Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} />
                <Label>Active (Visible on public site)</Label>
              </div>
            </div>
            <Button onClick={save} variant="hero" className="w-full mt-4">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    }>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
        {rows.map((r) => (
          <div key={r.id} className={cn("gradient-border glass rounded-2xl p-5 flex flex-col gap-4 transition-all", !r.active && "opacity-60 grayscale-[30%]")}>
            <div className="flex items-center justify-between">
              <Quote className="w-6 h-6 text-accent/50" />
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className={cn("w-4 h-4", i < (r.rating || 5) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted")} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                ))}
              </div>
            </div>
            
            <div className="text-sm leading-relaxed text-foreground/90 italic flex-1">
              "{r.quote}"
            </div>
            <div className="flex items-center justify-between mt-2 pt-4 border-t border-foreground/5">
              <div>
                <div className="font-semibold text-sm flex items-center gap-2">
                  {r.name}
                  {!r.active && <span className="bg-destructive/10 text-destructive text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">Pending</span>}
                </div>
                <div className="text-xs text-muted-foreground">{r.role} {r.email ? `• ${r.email}` : ''}</div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={r.active} onCheckedChange={(v) => toggle(r.id!, v)} title={r.active ? "Hide" : "Approve & Show"} />
                <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button size="icon" variant="ghost" onClick={() => remove(r.id!)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
              </div>
            </div>
          </div>
        ))}
        {loading ? (
          <div className="col-span-full py-12 text-center"><div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent opacity-50" /></div>
        ) : rows.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-12">
            No testimonials found. Click "Add Review" to create one.
            <div className="mt-2 text-xs opacity-70">Note: If you see this and haven't run the SQL migration yet, you must run it in your Supabase Dashboard!</div>
          </div>
        )}
      </div>
    </AdminShell>
  );
};

export default AdminTestimonials;
