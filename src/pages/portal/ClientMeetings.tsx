import { useEffect, useState } from "react";
import { ClientPortalLayout } from "@/components/portal/ClientPortalLayout";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ExternalLink } from "lucide-react";

const ClientMeetings = () => {
  const [rows, setRows] = useState<any[]>([]);
  useEffect(() => { supabase.from("meetings").select("*").order("starts_at").then(({ data }) => setRows(data ?? [])); }, []);
  return (
    <ClientPortalLayout title="Scheduled Meetings">
      <div className="grid gap-3">
        {rows.map((m) => (
          <div key={m.id} className="gradient-border glass rounded-2xl p-5 flex items-start gap-4">
            <Calendar className="w-5 h-5 text-accent mt-1" />
            <div className="flex-1">
              <h3 className="font-display font-semibold">{m.title}</h3>
              <p className="text-sm text-muted-foreground">{m.description}</p>
              <div className="text-xs text-muted-foreground mt-2">{new Date(m.starts_at).toLocaleString()} → {new Date(m.ends_at).toLocaleTimeString()}</div>
              {m.meeting_link && <a href={m.meeting_link} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline mt-1 inline-flex items-center gap-1"><ExternalLink className="w-3 h-3" />Join meeting</a>}
            </div>
            <span className={`text-[10px] uppercase px-2 py-1 rounded-full ${m.status === "completed" ? "bg-green-500/20 text-green-400" : m.status === "cancelled" ? "bg-destructive/20 text-destructive" : "bg-blue-500/20 text-blue-400"}`}>{m.status}</span>
          </div>
        ))}
        {rows.length === 0 && <div className="text-center py-20 text-muted-foreground">No meetings scheduled</div>}
      </div>
    </ClientPortalLayout>
  );
};
export default ClientMeetings;
