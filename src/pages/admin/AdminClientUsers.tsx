import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

const AdminClientUsers = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);

  const load = async () => {
    const [u, c] = await Promise.all([
      supabase.from("client_users").select("*, clients(company_name)").order("created_at", { ascending: false }),
      supabase.from("clients").select("id, company_name"),
    ]);
    setRows(u.data ?? []); setClients(c.data ?? []);
  };
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: "approved" | "rejected") => {
    await supabase.from("client_users").update({
      status, approved_at: status === "approved" ? new Date().toISOString() : null,
    }).eq("id", id);
    toast.success(`User ${status}`);
    load();
  };

  const linkClient = async (id: string, client_id: string) => {
    await supabase.from("client_users").update({ client_id }).eq("id", id);
    toast.success("Linked"); load();
  };

  return (
    <AdminShell title="Client Portal Users">
      <div className="gradient-border glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-foreground/5 text-xs uppercase text-muted-foreground"><tr>
            <th className="text-left p-3">Name</th><th className="text-left p-3">Email</th><th className="text-left p-3">Status</th><th className="text-left p-3">Linked client</th><th className="text-right p-3">Actions</th>
          </tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-foreground/5">
                <td className="p-3">{r.full_name ?? "—"}</td>
                <td className="p-3 text-muted-foreground">{r.email}</td>
                <td className="p-3"><span className={`text-[10px] uppercase px-2 py-0.5 rounded-full ${r.status === "approved" ? "bg-green-500/20 text-green-400" : r.status === "rejected" ? "bg-destructive/20 text-destructive" : "bg-yellow-500/20 text-yellow-400"}`}>{r.status}</span></td>
                <td className="p-3">
                  <select value={r.client_id ?? ""} onChange={(e) => linkClient(r.id, e.target.value)} className="bg-foreground/5 border border-foreground/10 rounded px-2 py-1 text-xs">
                    <option value="">—</option>
                    {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
                  </select>
                </td>
                <td className="p-3 text-right">
                  {r.status !== "approved" && <Button size="sm" variant="ghost" onClick={() => setStatus(r.id, "approved")}><CheckCircle2 className="w-4 h-4 text-green-400" /></Button>}
                  {r.status !== "rejected" && <Button size="sm" variant="ghost" onClick={() => setStatus(r.id, "rejected")}><XCircle className="w-4 h-4 text-destructive" /></Button>}
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="p-12 text-center text-muted-foreground">No portal signups yet</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
};
export default AdminClientUsers;
