import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { ClientPortalLayout } from "@/components/portal/ClientPortalLayout";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

const STATUS_COLOR: Record<string, string> = {
  planning: "bg-yellow-500/20 text-yellow-400",
  in_progress: "bg-blue-500/20 text-blue-400",
  review: "bg-purple-500/20 text-purple-400",
  completed: "bg-green-500/20 text-green-400",
  on_hold: "bg-muted text-muted-foreground",
};

const ClientProjects = () => {
  const rows = useSupabaseRealtime<any[]>(
    async () => {
      const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
    ["projects"],
    [],
  ) ?? [];
  return (
    <ClientPortalLayout title="My Projects">
      <div className="grid gap-4">
        {rows.map((p) => (
          <div key={p.id} className="gradient-border glass rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.short_description}</p>
              </div>
              <span className={`text-[10px] uppercase px-2 py-1 rounded-full ${STATUS_COLOR[p.status]}`}>{p.status?.replace("_", " ")}</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground"><span>Progress</span><span>{p.progress}%</span></div>
              <Progress value={p.progress} className="h-2" />
            </div>
            {p.deadline && <div className="text-xs text-muted-foreground mt-3">Deadline: {p.deadline}</div>}
          </div>
        ))}
        {rows.length === 0 && <div className="text-center py-20 text-muted-foreground">No projects yet</div>}
      </div>
    </ClientPortalLayout>
  );
};
export default ClientProjects;
