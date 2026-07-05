import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatCard } from "@/components/admin/StatCard";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Gauge, Trash2, Activity } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { format, subDays } from "date-fns";
import { toast } from "sonner";

const AdminPerformance = () => {
  const [errors, setErrors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const since = subDays(new Date(), 7).toISOString();
    const { data } = await supabase.from("error_logs").select("*").gte("created_at", since).order("created_at", { ascending: false }).limit(200);
    setErrors(data ?? []); setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const avgLoad = errors.filter((e) => e.load_time_ms).reduce((s, e, _, a) => s + e.load_time_ms / a.length, 0);
  const byDay: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) byDay[format(subDays(new Date(), i), "MMM d")] = 0;
  errors.forEach((e) => { const d = format(new Date(e.created_at), "MMM d"); if (d in byDay) byDay[d]++; });
  const chart = Object.entries(byDay).map(([date, count]) => ({ date, count }));

  const clear = async () => {
    if (!confirm("Clear all error logs?")) return;
    await supabase.from("error_logs").delete().gte("id", "00000000-0000-0000-0000-000000000000");
    toast.success("Cleared"); load();
  };

  return (
    <AdminShell title="Performance Monitor" actions={
      <Button onClick={clear} variant="ghost" size="sm"><Trash2 className="w-3.5 h-3.5" /> Clear logs</Button>
    }>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Errors (7d)" value={errors.length} icon={AlertTriangle} accent="magenta" />
        <StatCard label="Avg load" value={`${Math.round(avgLoad)}ms`} icon={Gauge} accent="blue" />
        <StatCard label="Unique pages" value={new Set(errors.map((e) => e.page_path)).size} icon={Activity} accent="pink" />
      </div>

      <div className="gradient-border glass rounded-2xl p-6 mb-6">
        <h3 className="font-display text-lg font-semibold mb-4">Errors — last 7 days</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              <Bar dataKey="count" fill="hsl(var(--secondary))" radius={[8,8,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="gradient-border glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-foreground/5 text-xs uppercase text-muted-foreground">
            <tr><th className="text-left p-3">Time</th><th className="text-left p-3">Page</th><th className="text-left p-3">Message</th><th className="text-left p-3">Severity</th><th className="text-right p-3">Load</th></tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading…</td></tr> :
             errors.length === 0 ? <tr><td colSpan={5} className="p-12 text-center text-muted-foreground">No errors recorded — your site is healthy ✨</td></tr> :
             errors.map((e) => (
              <tr key={e.id} className="border-t border-foreground/5 hover:bg-foreground/5">
                <td className="p-3 text-xs text-muted-foreground whitespace-nowrap">{format(new Date(e.created_at), "MMM d HH:mm")}</td>
                <td className="p-3 text-xs font-mono">{e.page_path ?? "—"}</td>
                <td className="p-3 text-xs max-w-md truncate" title={e.message}>{e.message}</td>
                <td className="p-3"><span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">{e.severity}</span></td>
                <td className="p-3 text-right text-xs">{e.load_time_ms ? `${e.load_time_ms}ms` : "—"}</td>
              </tr>
             ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
};

export default AdminPerformance;
