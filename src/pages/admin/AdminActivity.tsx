import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

const AdminActivity = () => {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(200)
      .then(({ data }) => setItems(data ?? []));
  }, []);
  return (
    <AdminShell title="Activity Logs">
      <div className="gradient-border glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="text-left px-4 py-3">Action</th><th className="text-left px-4 py-3">User</th><th className="text-left px-4 py-3">Entity</th><th className="text-right px-4 py-3">When</th></tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {items.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-12 text-muted-foreground">No activity yet</td></tr>
            ) : items.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3 font-medium">{a.action}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.user_email ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{a.entity_type ?? "—"}</td>
                <td className="px-4 py-3 text-right text-xs text-muted-foreground">{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
};
export default AdminActivity;
