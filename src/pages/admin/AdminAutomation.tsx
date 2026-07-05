import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Workflow } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const AdminAutomation = () => {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("automation_logs").select("*").order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => setLogs(data ?? []));
  }, []);

  const workflows = [
    { trigger: "New lead submitted", action: "Logged + admin notified", color: "bg-blue-500/20 text-blue-400" },
    { trigger: "Invoice marked sent", action: "Pay link emailed to client", color: "bg-purple-500/20 text-purple-400" },
    { trigger: "eSewa payment success", action: "Invoice auto-marked paid", color: "bg-green-500/20 text-green-400" },
    { trigger: "Project marked complete", action: "Final invoice draft created", color: "bg-pink-500/20 text-pink-400" },
    { trigger: "Blog published", action: "Public site refreshes instantly", color: "bg-yellow-500/20 text-yellow-400" },
  ];

  return (
    <AdminShell title="Automation Workflows">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {workflows.map((w, i) => (
          <div key={i} className="gradient-border glass rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2"><Workflow className="w-5 h-5 text-accent" /><span className="font-medium">{w.trigger}</span></div>
            <div className={`text-xs px-2 py-1 rounded-full inline-block ${w.color}`}>→ {w.action}</div>
          </div>
        ))}
      </div>

      <div className="gradient-border glass rounded-2xl overflow-hidden">
        <div className="p-3 border-b border-foreground/5 text-xs uppercase tracking-wider text-muted-foreground">Recent automation events</div>
        <table className="w-full text-sm">
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-foreground/5">
                <td className="p-3 font-mono text-xs">{l.workflow}</td>
                <td className="p-3 text-xs text-muted-foreground">{JSON.stringify(l.payload).slice(0, 100)}</td>
                <td className="p-3 text-xs text-right text-muted-foreground">{formatDistanceToNow(new Date(l.created_at), { addSuffix: true })}</td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td className="p-12 text-center text-muted-foreground">No automation events yet</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
};
export default AdminAutomation;
