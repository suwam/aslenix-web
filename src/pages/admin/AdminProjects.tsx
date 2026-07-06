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
    <AdminShell
      title="Projects"
      actions={
        <Button asChild variant="hero" size="sm">
          <Link to="/admin/projects/new"><Plus className="w-3.5 h-3.5 mr-1" /> New Project</Link>
        </Button>
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <Input
          placeholder="Search projects…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
        />
        <div className="text-sm text-muted-foreground">Manage your portfolio projects.</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => (
          <div key={p.id} className="gradient-border glass rounded-3xl p-5 group flex flex-col">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-foreground/5 text-lg font-semibold text-foreground/90 overflow-hidden">
                {p.cover_image ? (
                  <img src={p.cover_image} alt={p.title} className="h-full w-full object-cover" />
                ) : (
                  <span>{p.title.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-lg font-semibold text-foreground truncate">{p.title}</h3>
                  {p.featured && (
                    <span className="shrink-0 rounded-full bg-foreground/5 px-2 py-1 text-xs uppercase tracking-[0.2em] text-accent flex items-center">
                      <Star className="w-3 h-3 fill-accent" />
                    </span>
                  )}
                </div>
                <p className="text-sm text-accent/90 mt-1 truncate">{p.category || "Project"}</p>
              </div>
            </div>
            
            <p className="text-sm leading-6 text-muted-foreground line-clamp-3 flex-1">
              {p.short_description || (p.client_name ? `Client: ${p.client_name}` : "No description provided.")}
            </p>
            
            <div className="mt-5 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button size="icon" variant="ghost" asChild>
                <Link to={`/admin/projects/${p.id}`}><Pencil className="w-3.5 h-3.5" /></Link>
              </Button>
              <Button size="icon" variant="ghost" onClick={() => remove(p.id, p.title)}>
                <Trash2 className="w-3.5 h-3.5 text-destructive" />
              </Button>
            </div>
          </div>
        ))}

        {loading ? (
          <div className="col-span-full py-12 text-center"><div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent opacity-50" /></div>
        ) : filtered.length === 0 && (
          <div className="col-span-full rounded-3xl border border-foreground/10 bg-foreground/5 p-10 text-center text-sm text-muted-foreground">
            No projects found.
          </div>
        )}
      </div>
    </AdminShell>
  );
};
export default AdminProjects;
