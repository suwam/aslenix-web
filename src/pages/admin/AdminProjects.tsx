import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Star, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { logActivity } from "@/lib/activity";

const AdminProjects = () => {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("projects").select("*").order("display_order").order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await logActivity("Deleted project", "project", id, { title });
    toast.success("Deleted");
    load();
  };

  const filtered = items.filter((i) =>
    !q || i.title.toLowerCase().includes(q.toLowerCase()) || (i.category ?? "").toLowerCase().includes(q.toLowerCase())
  );

  return (
    <AdminShell>
      <div className="gradient-border glass rounded-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="font-display text-2xl font-bold">Projects</h1>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search projects…" className="pl-9 bg-muted/30 border-foreground/5 h-9" />
            </div>
            <Button asChild variant="hero" size="sm" className="shrink-0 h-9"><Link to="/admin/projects/new"><Plus className="w-3.5 h-3.5 mr-1" /> New project</Link></Button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Project</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Category</th>
              <th className="text-left px-4 py-3 hidden lg:table-cell">Client</th>
              <th className="px-4 py-3">Featured</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No projects yet</td></tr>
            ) : filtered.map((p) => (
              <tr key={p.id} className="hover:bg-foreground/5">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {p.cover_image
                      ? <img src={p.cover_image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      : <div className="w-10 h-10 rounded-lg bg-brand-gradient" />}
                    <div className="min-w-0">
                      <div className="font-medium truncate">{p.title}</div>
                      <div className="text-xs text-muted-foreground truncate">/{p.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{p.category ?? "—"}</td>
                <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{p.client_name ?? "—"}</td>
                <td className="px-4 py-3 text-center">
                  {p.featured && <Star className="w-4 h-4 text-accent inline fill-accent" />}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button asChild variant="ghost" size="sm"><Link to={`/admin/projects/${p.id}`}><Pencil className="w-3.5 h-3.5" /></Link></Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(p.id, p.title)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
};
export default AdminProjects;
