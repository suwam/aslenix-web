import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Trash2, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { logActivity } from "@/lib/activity";

const AdminLeads = () => {
  const [items, setItems] = useState<any[]>([]);
  const load = async () => {
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const update = async (id: string, patch: any) => {
    await supabase.from("leads").update(patch).eq("id", id);
    load();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete lead?")) return;
    await supabase.from("leads").delete().eq("id", id);
    await logActivity("Deleted lead", "lead", id);
    toast.success("Deleted"); load();
  };

  return (
    <AdminShell title="Leads & Messages">
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="gradient-border glass rounded-2xl p-12 text-center text-muted-foreground">
            No leads yet. They'll appear here when someone submits the contact form.
          </div>
        ) : items.map((l) => (
          <div key={l.id} className={`gradient-border glass rounded-2xl p-5 ${!l.is_read ? "ring-1 ring-accent/30" : ""}`}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3 min-w-0">
                <button onClick={() => update(l.id, { is_read: !l.is_read })} className="mt-1">
                  {l.is_read ? <CheckCircle2 className="w-4 h-4 text-muted-foreground" /> : <Circle className="w-4 h-4 text-accent" />}
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{l.name}</h3>
                    <Badge variant={l.status === "new" ? "default" : l.status === "converted" ? "secondary" : "outline"}>{l.status}</Badge>
                    {!l.is_read && <Badge variant="default" className="bg-accent">New</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-3 mt-1">
                    <a href={`mailto:${l.email}`} className="flex items-center gap-1 hover:text-accent"><Mail className="w-3 h-3" /> {l.email}</a>
                    {l.phone && <a href={`tel:${l.phone}`} className="flex items-center gap-1 hover:text-accent"><Phone className="w-3 h-3" /> {l.phone}</a>}
                    <span>{formatDistanceToNow(new Date(l.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select value={l.status} onValueChange={(v) => update(l.id, { status: v })}>
                  <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={() => remove(l.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3 whitespace-pre-wrap">{l.message}</p>
          </div>
        ))}
      </div>
    </AdminShell>
  );
};
export default AdminLeads;
