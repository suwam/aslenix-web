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
    <AdminShell title="Leads & Notifications">
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gradient-border glass rounded-3xl p-16 text-center text-muted-foreground shadow-[0_8px_30px_-12px_rgba(0,0,0,0.1)]">
            <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mb-4">
              <Mail className="w-8 h-8 opacity-50" />
            </div>
            <h3 className="text-xl font-display font-medium text-foreground mb-2">No Notifications Yet</h3>
            <p className="max-w-sm">When new leads or notifications arrive, they'll show up right here.</p>
          </div>
        ) : items.map((l) => (
          <div 
            key={l.id} 
            className={`group relative gradient-border glass rounded-3xl p-6 transition-all duration-500 hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.2)] hover:-translate-y-1 ${
              !l.is_read ? "bg-accent/5 ring-1 ring-accent/30 shadow-[0_0_30px_-10px_hsl(var(--accent)/0.2)]" : "bg-background/40"
            }`}
          >
            {!l.is_read && (
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent animate-pulse shadow-[0_0_10px_hsl(var(--accent))]" />
            )}
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <button onClick={() => update(l.id, { is_read: !l.is_read })} className="mt-1 shrink-0 transition-transform hover:scale-110">
                  {l.is_read ? <CheckCircle2 className="w-5 h-5 text-muted-foreground/50 hover:text-foreground/80 transition-colors" /> : <Circle className="w-5 h-5 text-accent drop-shadow-[0_0_8px_hsl(var(--accent)/0.5)]" />}
                </button>

                <div className="w-12 h-12 rounded-full bg-brand-gradient flex items-center justify-center shrink-0 shadow-[0_4px_15px_-5px_hsl(var(--accent)/0.5)] text-foreground font-bold text-lg">
                  {l.name?.[0]?.toUpperCase() || "?"}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-1.5">
                    <h3 className="font-display font-bold text-lg">{l.name}</h3>
                    <Badge variant={l.status === "new" ? "default" : l.status === "converted" ? "secondary" : "outline"} className="rounded-full px-3">
                      {l.status}
                    </Badge>
                    {!l.is_read && <Badge variant="default" className="bg-accent text-accent-foreground rounded-full px-3 shadow-[0_0_10px_hsl(var(--accent)/0.3)]">New</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-4 items-center">
                    <a href={`mailto:${l.email}`} className="flex items-center gap-1.5 hover:text-accent transition-colors">
                      <Mail className="w-3.5 h-3.5" /> {l.email}
                    </a>
                    {l.phone && (
                      <a href={`tel:${l.phone}`} className="flex items-center gap-1.5 hover:text-accent transition-colors">
                        <Phone className="w-3.5 h-3.5" /> {l.phone}
                      </a>
                    )}
                    <span className="flex items-center gap-1.5 opacity-70 border-l border-foreground/10 pl-4">
                      {formatDistanceToNow(new Date(l.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                <Select value={l.status} onValueChange={(v) => update(l.id, { status: v })}>
                  <SelectTrigger className="w-36 h-10 rounded-xl bg-foreground/[0.03] border-transparent hover:bg-foreground/[0.05] transition-colors"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-xl border-foreground/10">
                    <SelectItem value="new" className="rounded-lg">New</SelectItem>
                    <SelectItem value="contacted" className="rounded-lg">Contacted</SelectItem>
                    <SelectItem value="converted" className="rounded-lg">Converted</SelectItem>
                    <SelectItem value="archived" className="rounded-lg">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl hover:bg-destructive/10 text-destructive/70 hover:text-destructive transition-colors" onClick={() => remove(l.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {l.message && (
              <div className="mt-5 pl-16">
                <div className="p-4 rounded-2xl bg-foreground/[0.02] border border-foreground/5 text-sm text-foreground/80 leading-relaxed relative">
                  <div className="absolute top-4 left-0 -ml-[5px] w-1.5 h-1.5 rounded-full bg-foreground/20" />
                  {l.message}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </AdminShell>
  );
};
export default AdminLeads;
