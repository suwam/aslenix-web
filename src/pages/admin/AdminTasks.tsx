import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Calendar, User } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type Task = {
  id?: string; title: string; description?: string; status: "todo"|"in_progress"|"done";
  priority: "low"|"medium"|"high"|"urgent"; due_date?: string | null; assignee_email?: string;
};
const empty: Task = { title: "", status: "todo", priority: "medium" };

const COLS: { key: Task["status"]; label: string; color: string }[] = [
  { key: "todo", label: "To Do", color: "from-muted to-muted" },
  { key: "in_progress", label: "In Progress", color: "from-primary to-secondary" },
  { key: "done", label: "Done", color: "from-green-500 to-emerald-500" },
];

const PRIORITY: Record<string, string> = {
  low: "bg-muted text-muted-foreground", medium: "bg-primary/20 text-primary",
  high: "bg-secondary/20 text-secondary", urgent: "bg-destructive/20 text-destructive",
};

const AdminTasks = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Task>(empty);

  const load = async () => {
    const { data } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
    setRows(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.title.trim()) return toast.error("Title required");
    const payload = { ...editing, completed_at: editing.status === "done" ? new Date().toISOString() : null };
    const { error } = editing.id
      ? await supabase.from("tasks").update(payload).eq("id", editing.id)
      : await supabase.from("tasks").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setOpen(false); setEditing(empty); load();
  };

  const move = async (id: string, status: Task["status"]) => {
    await supabase.from("tasks").update({ status, completed_at: status === "done" ? new Date().toISOString() : null }).eq("id", id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete task?")) return;
    await supabase.from("tasks").delete().eq("id", id);
    load();
  };

  return (
    <AdminShell title="Tasks" actions={
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild><Button onClick={() => setEditing(empty)} variant="hero" size="sm"><Plus className="w-3.5 h-3.5" /> New Task</Button></DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing.id ? "Edit" : "New"} Task</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Title</Label><Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea rows={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Status</Label>
                <Select value={editing.status} onValueChange={(v: any) => setEditing({ ...editing, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{COLS.map((c) => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Priority</Label>
                <Select value={editing.priority} onValueChange={(v: any) => setEditing({ ...editing, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["low","medium","high","urgent"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Due date</Label><Input type="date" value={editing.due_date ?? ""} onChange={(e) => setEditing({ ...editing, due_date: e.target.value })} /></div>
              <div><Label>Assignee email</Label><Input type="email" value={editing.assignee_email ?? ""} onChange={(e) => setEditing({ ...editing, assignee_email: e.target.value })} /></div>
            </div>
            <Button onClick={save} variant="hero" className="w-full">{editing.id ? "Update" : "Create"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    }>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLS.map((col) => {
          const items = rows.filter((r) => r.status === col.key);
          return (
            <div key={col.key} className="gradient-border glass rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${col.color}`} />
                  <h3 className="font-display font-semibold">{col.label}</h3>
                  <span className="text-xs text-muted-foreground">({items.length})</span>
                </div>
              </div>
              <div className="space-y-2 min-h-[200px]">
                {items.map((t) => (
                  <div key={t.id} className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition group">
                    <div className="flex items-start justify-between gap-2">
                      <button onClick={() => { setEditing(t); setOpen(true); }} className="text-left flex-1">
                        <div className="text-sm font-medium">{t.title}</div>
                        {t.description && <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.description}</div>}
                      </button>
                      <Button size="icon" variant="ghost" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => remove(t.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase ${PRIORITY[t.priority]}`}>{t.priority}</span>
                      {t.due_date && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(t.due_date), "MMM d")}</span>}
                      {t.assignee_email && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><User className="w-3 h-3" />{t.assignee_email.split("@")[0]}</span>}
                    </div>
                    <div className="flex gap-1 mt-2">
                      {COLS.filter((c) => c.key !== col.key).map((c) => (
                        <button key={c.key} onClick={() => move(t.id, c.key)} className="text-[10px] text-muted-foreground hover:text-foreground">→ {c.label}</button>
                      ))}
                    </div>
                  </div>
                ))}
                {items.length === 0 && <div className="text-xs text-muted-foreground text-center py-8">No tasks</div>}
              </div>
            </div>
          );
        })}
      </div>
    </AdminShell>
  );
};

export default AdminTasks;
