import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/admin/StatCard";
import { DollarSign, TrendingUp, Clock, FileText, Download } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { downloadCSV, toCSV } from "@/lib/csv";
import jsPDF from "jspdf";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "#22c55e", "#f59e0b", "#ef4444"];

const AdminFinance = () => {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [tx, setTx] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from("invoices").select("*, clients(company_name)").order("issue_date", { ascending: false }),
      supabase.from("clients").select("id, company_name"),
      supabase.from("transactions").select("*").order("created_at", { ascending: false }),
    ]).then(([i, c, t]) => { setInvoices(i.data ?? []); setClients(c.data ?? []); setTx(t.data ?? []); });
  }, []);

  const stats = useMemo(() => {
    const paid = invoices.filter((i) => i.status === "paid");
    const pending = invoices.filter((i) => i.status !== "paid" && i.status !== "cancelled");
    const revenue = paid.reduce((s, i) => s + Number(i.total), 0);
    const due = pending.reduce((s, i) => s + Number(i.total) - Number(i.paid_amount ?? 0), 0);
    return { revenue, due, paidCount: paid.length, pendingCount: pending.length };
  }, [invoices]);

  const monthly = useMemo(() => {
    const map = new Map<string, number>();
    invoices.filter((i) => i.status === "paid").forEach((i) => {
      const k = (i.paid_at ?? i.issue_date ?? "").slice(0, 7);
      if (!k) return;
      map.set(k, (map.get(k) ?? 0) + Number(i.total));
    });
    return [...map.entries()].sort().slice(-12).map(([month, total]) => ({ month, total: Number(total.toFixed(2)) }));
  }, [invoices]);

  const statusBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    invoices.forEach((i) => map.set(i.status, (map.get(i.status) ?? 0) + 1));
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [invoices]);

  const byClient = useMemo(() => {
    const map = new Map<string, number>();
    invoices.filter((i) => i.status === "paid").forEach((i) => {
      const k = i.clients?.company_name ?? "Unknown";
      map.set(k, (map.get(k) ?? 0) + Number(i.total));
    });
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, total]) => ({ name, total: Number(total.toFixed(2)) }));
  }, [invoices]);

  const exportCsv = () => {
    const rows = invoices.map((i) => ({
      number: i.invoice_number, client: i.clients?.company_name, status: i.status,
      currency: i.currency, total: i.total, paid: i.paid_amount, due: Number(i.total) - Number(i.paid_amount ?? 0),
      issue_date: i.issue_date, due_date: i.due_date, paid_at: i.paid_at,
    }));
    downloadCSV(`aslenix-finance-${Date.now()}.csv`, toCSV(rows));
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    const W = doc.internal.pageSize.getWidth();
    doc.setFillColor(99, 102, 241); doc.rect(0, 0, W, 6, "F");
    doc.setFontSize(20); doc.setTextColor(20, 20, 30); doc.text("ASLENIX — Financial Report", 14, 24);
    doc.setFontSize(10); doc.setTextColor(120); doc.text(new Date().toLocaleString(), 14, 32);
    let y = 48; const line = (l: string, v: string) => { doc.setTextColor(120); doc.text(l, 14, y); doc.setTextColor(20); doc.text(v, 90, y); y += 10; };
    line("Total revenue", `${stats.revenue.toFixed(2)}`);
    line("Outstanding", `${stats.due.toFixed(2)}`);
    line("Paid invoices", String(stats.paidCount));
    line("Pending invoices", String(stats.pendingCount));
    y += 6; doc.setFontSize(13); doc.text("Top clients", 14, y); y += 8; doc.setFontSize(10);
    byClient.forEach((c) => { doc.setTextColor(80); doc.text(c.name.slice(0, 60), 14, y); doc.setTextColor(20); doc.text(c.total.toFixed(2), 150, y); y += 8; });
    doc.save(`aslenix-finance-${Date.now()}.pdf`);
  };

  return (
    <AdminShell title="Financial Dashboard" actions={
      <div className="flex gap-2">
        <Button size="sm" variant="glass" onClick={exportCsv}><Download className="w-3.5 h-3.5" /> CSV</Button>
        <Button size="sm" variant="hero" onClick={exportPdf}><FileText className="w-3.5 h-3.5" /> PDF</Button>
      </div>
    }>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Revenue" value={`Rs ${stats.revenue.toLocaleString()}`} icon={DollarSign} hint={`${stats.paidCount} paid`} />
        <StatCard label="Outstanding" value={`Rs ${stats.due.toLocaleString()}`} icon={Clock} hint={`${stats.pendingCount} pending`} />
        <StatCard label="Transactions" value={tx.length} icon={TrendingUp} />
        <StatCard label="Clients" value={clients.length} icon={FileText} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="gradient-border glass rounded-2xl p-5">
          <h3 className="font-display text-lg mb-3">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthly}>
              <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="hsl(var(--primary))" /><stop offset="50%" stopColor="hsl(var(--secondary))" /><stop offset="100%" stopColor="hsl(var(--accent))" /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              <Line type="monotone" dataKey="total" stroke="url(#g)" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="gradient-border glass rounded-2xl p-5">
          <h3 className="font-display text-lg mb-3">Invoice Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={statusBreakdown} dataKey="value" nameKey="name" outerRadius={90} label>
                {statusBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="gradient-border glass rounded-2xl p-5 lg:col-span-2">
          <h3 className="font-display text-lg mb-3">Top Clients by Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={byClient}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="gradient-border glass rounded-2xl p-5 mt-6">
        <h3 className="font-display text-lg mb-3">Recent Transactions</h3>
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-muted-foreground"><tr><th className="text-left p-2">Reference</th><th className="text-left p-2">Method</th><th className="text-left p-2">Status</th><th className="text-right p-2">Amount</th><th className="text-right p-2">Date</th></tr></thead>
          <tbody>
            {tx.slice(0, 12).map((t) => (
              <tr key={t.id} className="border-t border-white/5">
                <td className="p-2 font-mono text-xs">{t.reference_id}</td>
                <td className="p-2 capitalize">{t.method}</td>
                <td className="p-2"><span className={`text-[10px] px-2 py-0.5 rounded-full uppercase ${t.status === "success" ? "bg-green-500/20 text-green-400" : t.status === "failed" ? "bg-destructive/20 text-destructive" : "bg-yellow-500/20 text-yellow-400"}`}>{t.status}</span></td>
                <td className="p-2 text-right">{t.currency} {Number(t.amount).toFixed(2)}</td>
                <td className="p-2 text-right text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {tx.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No transactions yet</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
};
export default AdminFinance;
