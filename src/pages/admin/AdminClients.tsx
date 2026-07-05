import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Building2, Mail, Phone, Globe } from "lucide-react";
import { toast } from "sonner";
import { logActivity } from "@/lib/activity";

type Client = {
  id?: string; company_name: string; contact_name?: string; email?: string;
  phone?: string; website?: string; address?: string; notes?: string;
};

const empty: Client = { company_name: "" };

const AdminClients = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Client>(empty);
  const [search, setSearch] = useState("");

  const load = async () => {
    const { data } = await supabase.from("clients").select("*, projects(id)").order("created_at", { ascending: false });
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.company_name.trim()) return toast.error("Company name required");
    const payload = { ...editing };
    const { error } = editing.id
      ? await supabase.from("clients").update(payload).eq("id", editing.id)
      : await supabase.from("clients").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(`${editing.id ? "Updated" : "Created"} ${editing.company_name}`);
    await logActivity(`${editing.id ? "Updated" : "Created"} client: ${editing.company_name}`, "client", editing.id);
    setOpen(false); setEditing(empty); load();
  };

  const remove = async (c: Client) => {
    if (!confirm(`Delete ${c.company_name}?`)) return;
    await supabase.from("clients").delete().eq("id", c.id!);
    toast.success("Deleted"); load();
  };

  const filtered = rows.filter((r) =>
    !search || r.company_name.toLowerCase().includes(search.toLowerCase()) ||
    r.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminShell title="Clients" actions={
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setEditing(empty)} variant="hero" size="sm"><Plus className="w-3.5 h-3.5" /> New Client</Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing.id ? "Edit" : "New"} Client</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><Label>Company name *</Label><Input value={editing.company_name} onChange={(e) => setEditing({ ...editing, company_name: e.target.value })} /></div>
            <div><Label>Contact name</Label><Input value={editing.contact_name ?? ""} onChange={(e) => setEditing({ ...editing, contact_name: e.target.value })} /></div>
            <div><Label>Email</Label><Input type="email" value={editing.email ?? ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={editing.phone ?? ""} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /></div>
            <div><Label>Website</Label><Input value={editing.website ?? ""} onChange={(e) => setEditing({ ...editing, website: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Address</Label><Input value={editing.address ?? ""} onChange={(e) => setEditing({ ...editing, address: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Notes</Label><Textarea rows={3} value={editing.notes ?? ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} /></div>
          </div>
          <Button onClick={save} variant="hero">{editing.id ? "Update" : "Create"}</Button>
        </DialogContent>
      </Dialog>
    }>
      <Input placeholder="Search clients…" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm mb-4" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <div key={c.id} className="gradient-border glass rounded-2xl p-5 group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center text-foreground font-bold">
                {c.company_name[0]?.toUpperCase()}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                <Button size="icon" variant="ghost" onClick={() => { setEditing(c); setOpen(true); }}><Pencil className="w-3.5 h-3.5" /></Button>
                <Button size="icon" variant="ghost" onClick={() => remove(c)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
              </div>
            </div>
            <h3 className="font-display text-lg font-semibold">{c.company_name}</h3>
            {c.contact_name && <div className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1"><Building2 className="w-3 h-3" />{c.contact_name}</div>}
            {c.email && <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1"><Mail className="w-3 h-3" />{c.email}</div>}
            {c.phone && <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1"><Phone className="w-3 h-3" />{c.phone}</div>}
            {c.website && <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1"><Globe className="w-3 h-3" />{c.website}</div>}
            <div className="mt-3 pt-3 border-t border-foreground/5 text-xs text-muted-foreground">{c.projects?.length ?? 0} projects</div>
          </div>
        ))}
        {filtered.length === 0 && <div className="col-span-full text-center text-muted-foreground py-12">No clients yet</div>}
      </div>
    </AdminShell>
  );
};

export default AdminClients;
