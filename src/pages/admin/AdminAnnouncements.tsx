import { useEffect, useState } from "react";
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
import { Plus, Trash2, Megaphone, Pencil } from "lucide-react";
import { toast } from "sonner";

type A = {
  id?: string; message: string; type: "banner"|"popup"; link?: string; link_text?: string;
  poster_url?: string | null;
  active: boolean; dismissible: boolean; starts_at?: string | null; ends_at?: string | null;
};
const empty: A = { message: "", type: "banner", poster_url: null, active: true, dismissible: true };

const AdminAnnouncements = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<A>(empty);

  const load = async () => {
    const { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.message.trim()) return toast.error("Message required");
    const payload = { ...editing, starts_at: editing.starts_at || null, ends_at: editing.ends_at || null };
    const { error } = editing.id
      ? await supabase.from("announcements").update(payload).eq("id", editing.id)
      : await supabase.from("announcements").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setOpen(false); setEditing(empty); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("announcements").delete().eq("id", id);
    load();
  };

  const toggle = async (id: string, active: boolean) => {
    await supabase.from("announcements").update({ active }).eq("id", id); load();
  };

  return (
    <AdminShell title="Announcements" actions={
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild><Button onClick={() => setEditing(empty)} variant="hero" size="sm"><Plus className="w-3.5 h-3.5" /> New</Button></DialogTrigger>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing.id ? "Edit" : "New"} Announcement</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Message</Label><Textarea rows={3} value={editing.message} onChange={(e) => setEditing({ ...editing, message: e.target.value })} /></div>
            <MediaPicker
              label="Poster"
              value={editing.poster_url}
              cropAspect={1200 / 630}
              onChange={(poster_url) => setEditing({ ...editing, poster_url })}
            />
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Type</Label>
                <Select value={editing.type} onValueChange={(v: any) => setEditing({ ...editing, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="banner">Top banner</SelectItem><SelectItem value="popup">Popup</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Link text</Label><Input value={editing.link_text ?? ""} onChange={(e) => setEditing({ ...editing, link_text: e.target.value })} /></div>
              <div className="col-span-2"><Label>Link URL</Label><Input value={editing.link ?? ""} onChange={(e) => setEditing({ ...editing, link: e.target.value })} placeholder="https://…" /></div>
              <div><Label>Starts</Label><Input type="datetime-local" value={editing.starts_at ?? ""} onChange={(e) => setEditing({ ...editing, starts_at: e.target.value })} /></div>
              <div><Label>Ends</Label><Input type="datetime-local" value={editing.ends_at ?? ""} onChange={(e) => setEditing({ ...editing, ends_at: e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm"><Switch checked={editing.active} onCheckedChange={(v) => setEditing({ ...editing, active: v })} /> Active</label>
              <label className="flex items-center gap-2 text-sm"><Switch checked={editing.dismissible} onCheckedChange={(v) => setEditing({ ...editing, dismissible: v })} /> Dismissible</label>
            </div>
            <Button onClick={save} variant="hero" className="w-full">Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    }>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.id} className="gradient-border glass rounded-2xl p-5 flex items-start gap-4">
            {r.poster_url ? (
              <img src={r.poster_url} alt="" className="h-14 w-11 rounded-lg object-cover shrink-0 border border-white/10" />
            ) : (
              <Megaphone className="w-5 h-5 text-accent shrink-0 mt-1" />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-white/5">{r.type}</span>
                {r.active ? <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Live</span>
                          : <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-muted">Off</span>}
              </div>
              <div className="text-sm">{r.message}</div>
              {r.link && <a href={r.link} target="_blank" className="text-xs text-accent">{r.link_text ?? r.link} →</a>}
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={r.active} onCheckedChange={(v) => toggle(r.id, v)} />
              <Button size="icon" variant="ghost" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
              <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="text-center text-muted-foreground py-12">No announcements yet</div>}
      </div>
    </AdminShell>
  );
};

export default AdminAnnouncements;
