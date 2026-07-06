import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { logActivity } from "@/lib/activity";

const AdminServices = () => {
  const [items, setItems] = useState<any[]>([]);
  const load = async () => {
    const { data } = await supabase.from("services").select("*").order("display_order");
    setItems(data ?? []);
  };
  useEffect(() => { load(); }, []);

  const toggle = async (id: string, active: boolean) => {
    await supabase.from("services").update({ active }).eq("id", id);
    await logActivity(active ? "Activated service" : "Deactivated service", "service", id);
    load();
  };

  const remove = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await logActivity("Deleted service", "service", id, { title });
    toast.success("Deleted"); load();
  };

  const loadDefaults = async () => {
    try {
      const { services: defaultServices } = await import("@/data/services");
      const toInsert = defaultServices.map((s, idx) => {
        let iconName = "Sparkles";
        if (s.title.includes("Website")) iconName = "Code2";
        else if (s.title.includes("Mobile")) iconName = "Smartphone";
        else if (s.title.includes("Custom")) iconName = "Cpu";
        else if (s.title.includes("UI")) iconName = "Palette";
        else if (s.title.includes("Brand")) iconName = "Sparkles";
        else if (s.title.includes("Market")) iconName = "TrendingUp";
        else if (s.title.includes("AI")) iconName = "Brain";
        else if (s.title.includes("Auto")) iconName = "Workflow";

        return {
          title: s.title,
          slug: s.slug,
          icon: iconName,
          short_description: s.desc,
          full_description: s.overview.what + "\n\n" + s.overview.why,
          deliverables: s.deliverables,
          technologies: s.technologies,
          active: true,
          display_order: idx,
        };
      });

      const { error } = await supabase.from("services").insert(toInsert);
      if (error) {
        toast.error("Failed to load defaults: " + error.message);
      } else {
        toast.success("Loaded default services!");
        load();
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <AdminShell title="Services" actions={
      <div className="flex items-center gap-2">
        {items.length === 0 && (
          <Button variant="outline" size="sm" onClick={loadDefaults}>
            Load Defaults
          </Button>
        )}
        <Button asChild variant="hero" size="sm"><Link to="/admin/services/new"><Plus className="w-3.5 h-3.5 mr-1" /> New service</Link></Button>
      </div>
    }>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((s) => (
          <div key={s.id} className="gradient-border glass rounded-2xl p-5 flex flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-accent font-medium mb-1">{s.icon}</div>
                <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{s.short_description}</p>
              </div>
              <Switch checked={s.active} onCheckedChange={(v) => toggle(s.id, v)} />
            </div>
            <div className="flex gap-2 mt-4">
              <Button asChild variant="glass" size="sm"><Link to={`/admin/services/${s.id}`}><Pencil className="w-3.5 h-3.5" /> Edit</Link></Button>
              <Button variant="ghost" size="sm" onClick={() => remove(s.id, s.title)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
};
export default AdminServices;
