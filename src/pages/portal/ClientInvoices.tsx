import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { ClientPortalLayout } from "@/components/portal/ClientPortalLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CreditCard, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const ClientInvoices = () => {
  const rows = useSupabaseRealtime<any[]>(
    async () => {
      const { data } = await supabase.from("invoices").select("*").order("issue_date", { ascending: false });
      return data ?? [];
    },
    ["invoices"],
    [],
  ) ?? [];
  return (
    <ClientPortalLayout title="Invoices">
      <div className="gradient-border glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-xs uppercase text-muted-foreground"><tr>
            <th className="text-left p-3">Number</th><th className="text-left p-3">Issue</th><th className="text-left p-3">Due</th><th className="text-right p-3">Total</th><th className="text-left p-3">Status</th><th className="text-right p-3">Pay</th>
          </tr></thead>
          <tbody>
            {rows.map((r) => {
              const due = Math.max(0, Number(r.total) - Number(r.paid_amount ?? 0));
              return (
                <tr key={r.id} className="border-t border-white/5">
                  <td className="p-3 font-mono text-xs">{r.invoice_number}</td>
                  <td className="p-3 text-xs">{r.issue_date}</td>
                  <td className="p-3 text-xs">{r.due_date ?? "—"}</td>
                  <td className="p-3 text-right">{r.currency} {Number(r.total).toFixed(2)}</td>
                  <td className="p-3"><span className={`text-[10px] uppercase px-2 py-0.5 rounded-full ${r.status === "paid" ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>{r.status}</span></td>
                  <td className="p-3 text-right">
                    {due > 0 ? (
                      <Button asChild size="sm" variant="hero"><Link to={`/pay/${r.pay_token}`} target="_blank"><CreditCard className="w-3.5 h-3.5" />Pay {r.currency} {due.toFixed(2)}</Link></Button>
                    ) : (
                      <span className="text-xs text-green-400">Paid</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">No invoices yet</td></tr>}
          </tbody>
        </table>
      </div>
    </ClientPortalLayout>
  );
};
export default ClientInvoices;
