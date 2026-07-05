import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { logActivity } from "@/lib/activity";

const AdminBlogs = () => {
  const [items, setItems] = useState<any[]>([]);
  const load = async () => {
    const { data } = await supabase.from("blogs").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const { error } = await supabase.from("blogs").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await logActivity("Deleted blog", "blog", id, { title });
    toast.success("Deleted"); load();
  };

  return (
    <AdminShell title="Blogs" actions={
      <Button asChild variant="hero" size="sm"><Link to="/admin/blogs/new"><Plus className="w-3.5 h-3.5" /> New post</Link></Button>
    }>
      <div className="gradient-border glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Title</th>
              <th className="text-left px-4 py-3 hidden md:table-cell">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-12 text-muted-foreground">No posts yet</td></tr>
            ) : items.map((b) => (
              <tr key={b.id} className="hover:bg-foreground/5">
                <td className="px-4 py-3">
                  <div className="font-medium">{b.title}</div>
                  <div className="text-xs text-muted-foreground">/{b.slug}</div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{b.category ?? "—"}</td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={b.published ? "default" : "secondary"}>{b.published ? "Published" : "Draft"}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button asChild variant="ghost" size="sm"><Link to={`/admin/blogs/${b.id}`}><Pencil className="w-3.5 h-3.5" /></Link></Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(b.id, b.title)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
};
export default AdminBlogs;
