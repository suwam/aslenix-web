import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, FileDown, Pencil, FileText } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { logActivity } from "@/lib/activity";

type Item = { id?: string; description: string; qty: number; price: number; position: number };
type Invoice = {
  id?: string; invoice_number: string; client_id?: string | null; project_id?: string | null;
  issue_date: string; due_date?: string | null; status: string; currency: string;
  tax_pct: number; subtotal?: number; tax_amount?: number; total?: number; notes?: string;
};

const STATUS_COLOR: Record<string, string> = {
  draft: "bg-muted text-muted-foreground", sent: "bg-primary/20 text-primary",
  paid: "bg-green-500/20 text-green-400", overdue: "bg-destructive/20 text-destructive",
  cancelled: "bg-muted text-muted-foreground line-through",
};

const blankInvoice = (): Invoice => ({
  invoice_number: `INV-${Date.now().toString().slice(-6)}`,
  issue_date: new Date().toISOString().slice(0, 10),
  status: "draft", currency: "USD", tax_pct: 13,
});

const AdminInvoices = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [inv, setInv] = useState<Invoice>(blankInvoice());
  const [items, setItems] = useState<Item[]>([{ description: "", qty: 1, price: 0, position: 0 }]);

  const load = async () => {
    const [r, c] = await Promise.all([
      supabase.from("invoices").select("*, clients(company_name)").order("created_at", { ascending: false }),
      supabase.from("clients").select("id, company_name").order("company_name"),
    ]);
    setRows(r.data ?? []); setClients(c.data ?? []);
  };
  useEffect(() => { load(); }, []);

  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const taxAmount = subtotal * (inv.tax_pct / 100);
  const total = subtotal + taxAmount;

  const openEdit = async (row: any) => {
    setInv(row);
    const { data } = await supabase.from("invoice_items").select("*").eq("invoice_id", row.id).order("position");
    setItems(data?.length ? data : [{ description: "", qty: 1, price: 0, position: 0 }]);
    setOpen(true);
  };

  const openNew = () => { setInv(blankInvoice()); setItems([{ description: "", qty: 1, price: 0, position: 0 }]); setOpen(true); };

  const save = async () => {
    const payload = {
      invoice_number: inv.invoice_number, client_id: inv.client_id || null, project_id: inv.project_id || null,
      issue_date: inv.issue_date, due_date: inv.due_date || null, status: inv.status as any,
      currency: inv.currency, tax_pct: inv.tax_pct, subtotal, tax_amount: taxAmount, total,
      notes: inv.notes || null, paid_at: inv.status === "paid" ? new Date().toISOString() : null,
    };

    let invoiceId = inv.id;
    if (invoiceId) {
      const { error } = await supabase.from("invoices").update(payload).eq("id", invoiceId);
      if (error) return toast.error(error.message);
      await supabase.from("invoice_items").delete().eq("invoice_id", invoiceId);
    } else {
      const { data, error } = await supabase.from("invoices").insert(payload).select().single();
      if (error) return toast.error(error.message);
      invoiceId = data.id;
    }
    const itemRows = items.filter((i) => i.description.trim()).map((i, idx) => ({
      invoice_id: invoiceId, description: i.description, qty: i.qty, price: i.price, position: idx,
    }));
    if (itemRows.length) await supabase.from("invoice_items").insert(itemRows);

    toast.success("Saved");
    await logActivity(`${inv.id ? "Updated" : "Created"} invoice ${inv.invoice_number}`, "invoice", invoiceId);
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete invoice?")) return;
    await supabase.from("invoices").delete().eq("id", id);
    toast.success("Deleted"); load();
  };

  const exportPdf = async (row: any) => {
    const { data: lineItems } = await supabase.from("invoice_items").select("*").eq("invoice_id", row.id).order("position");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth(); const margin = 48; let y = margin;

    doc.setFillColor(99, 102, 241); doc.rect(0, 0, W, 8, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.setTextColor(20,20,28);
    doc.text("ASLENIX", margin, y + 24);
    doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(120,120,130);
    doc.text("info.aslenix.np@gmail.com · aslenix.com", margin, y + 40);
    doc.setFont("helvetica","bold"); doc.setFontSize(28); doc.setTextColor(20,20,28);
    doc.text("INVOICE", W - margin, y + 28, { align: "right" });
    doc.setFont("helvetica","normal"); doc.setFontSize(10); doc.setTextColor(100,100,110);
    doc.text(row.invoice_number, W - margin, y + 46, { align: "right" });
    y += 80;

    doc.setDrawColor(230); doc.line(margin, y, W - margin, y); y += 22;
    doc.setFontSize(10); doc.setTextColor(120,120,130); doc.text("BILLED TO", margin, y);
    doc.text("ISSUE DATE", W/2, y); doc.text("DUE DATE", W - margin - 80, y); y += 14;
    doc.setFontSize(11); doc.setTextColor(20,20,28);
    doc.text(row.clients?.company_name ?? "—", margin, y);
    doc.text(row.issue_date, W/2, y);
    doc.text(row.due_date ?? "—", W - margin - 80, y);
    y += 30;

    doc.setFillColor(245,245,250); doc.rect(margin, y, W - margin*2, 22, "F");
    doc.setFontSize(10); doc.setTextColor(60,60,70);
    doc.text("Description", margin + 8, y + 15);
    doc.text("Qty", W - margin - 200, y + 15);
    doc.text("Price", W - margin - 130, y + 15);
    doc.text("Total", W - margin - 8, y + 15, { align: "right" });
    y += 22;

    doc.setFont("helvetica","normal"); doc.setTextColor(40,40,50);
    (lineItems ?? []).forEach((it: any) => {
      const lines = doc.splitTextToSize(it.description, W - margin*2 - 220);
      const h = Math.max(20, lines.length * 12 + 8);
      doc.text(lines, margin + 8, y + 14);
      doc.text(String(it.qty), W - margin - 200, y + 14);
      doc.text(`${row.currency} ${Number(it.price).toFixed(2)}`, W - margin - 130, y + 14);
      doc.text(`${row.currency} ${(Number(it.qty) * Number(it.price)).toFixed(2)}`, W - margin - 8, y + 14, { align: "right" });
      y += h; doc.setDrawColor(240); doc.line(margin, y, W - margin, y);
    });

    y += 20; doc.setFontSize(10);
    doc.text("Subtotal", W - margin - 130, y); doc.text(`${row.currency} ${Number(row.subtotal).toFixed(2)}`, W - margin - 8, y, { align: "right" }); y += 14;
    doc.text(`Tax (${row.tax_pct}%)`, W - margin - 130, y); doc.text(`${row.currency} ${Number(row.tax_amount).toFixed(2)}`, W - margin - 8, y, { align: "right" }); y += 18;
    doc.setFont("helvetica","bold"); doc.setFontSize(13);
    doc.text("TOTAL", W - margin - 130, y); doc.text(`${row.currency} ${Number(row.total).toFixed(2)}`, W - margin - 8, y, { align: "right" });
    y += 36;

    if (row.notes) {
      doc.setFont("helvetica","bold"); doc.setFontSize(10); doc.setTextColor(20,20,28);
      doc.text("Notes", margin, y); y += 12;
      doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(90,90,100);
      const nl = doc.splitTextToSize(row.notes, W - margin*2);
      doc.text(nl, margin, y);
    }

    const pageH = doc.internal.pageSize.getHeight();
    doc.setFontSize(8); doc.setTextColor(160,160,170);
    doc.text(`Status: ${row.status.toUpperCase()} · Thank you for your business`, W/2, pageH - 24, { align: "center" });

    doc.save(`${row.invoice_number}.pdf`);
    await logActivity(`Exported invoice ${row.invoice_number}`, "invoice", row.id);
  };

  return (
    <AdminShell title="Invoices" actions={
      <Button onClick={openNew} variant="hero" size="sm"><Plus className="w-3.5 h-3.5" /> New Invoice</Button>
    }>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle>{inv.id ? "Edit" : "New"} Invoice</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div><Label>Number</Label><Input value={inv.invoice_number} onChange={(e) => setInv({ ...inv, invoice_number: e.target.value })} /></div>
            <div>
              <Label>Client</Label>
              <Select value={inv.client_id ?? ""} onValueChange={(v) => setInv({ ...inv, client_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={inv.status} onValueChange={(v) => setInv({ ...inv, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["draft","sent","paid","overdue","cancelled"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Issue date</Label><Input type="date" value={inv.issue_date} onChange={(e) => setInv({ ...inv, issue_date: e.target.value })} /></div>
            <div><Label>Due date</Label><Input type="date" value={inv.due_date ?? ""} onChange={(e) => setInv({ ...inv, due_date: e.target.value })} /></div>
            <div><Label>Currency</Label><Input value={inv.currency} onChange={(e) => setInv({ ...inv, currency: e.target.value })} /></div>
            <div><Label>Tax %</Label><Input type="number" value={inv.tax_pct} onChange={(e) => setInv({ ...inv, tax_pct: Number(e.target.value) })} /></div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2"><Label>Line items</Label>
              <Button size="sm" variant="glass" onClick={() => setItems([...items, { description: "", qty: 1, price: 0, position: items.length }])}><Plus className="w-3.5 h-3.5" /></Button>
            </div>
            {items.map((it, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 mb-2">
                <Input className="col-span-7" placeholder="Description" value={it.description} onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, description: e.target.value } : x))} />
                <Input className="col-span-2" type="number" placeholder="Qty" value={it.qty} onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, qty: Number(e.target.value) } : x))} />
                <Input className="col-span-2" type="number" placeholder="Price" value={it.price} onChange={(e) => setItems(items.map((x, j) => j === i ? { ...x, price: Number(e.target.value) } : x))} />
                <Button className="col-span-1" size="icon" variant="ghost" onClick={() => setItems(items.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
          </div>
          <div><Label>Notes</Label><Textarea rows={2} value={inv.notes ?? ""} onChange={(e) => setInv({ ...inv, notes: e.target.value })} /></div>
          <div className="flex items-center justify-between border-t border-white/5 pt-3">
            <div className="text-sm">
              <div>Subtotal: <strong>{inv.currency} {subtotal.toFixed(2)}</strong></div>
              <div>Tax: <strong>{inv.currency} {taxAmount.toFixed(2)}</strong></div>
              <div className="text-lg">Total: <strong className="text-gradient">{inv.currency} {total.toFixed(2)}</strong></div>
            </div>
            <Button onClick={save} variant="hero">Save invoice</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="gradient-border glass rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="text-left p-3">Number</th>
              <th className="text-left p-3">Client</th>
              <th className="text-left p-3">Issue</th>
              <th className="text-left p-3">Due</th>
              <th className="text-right p-3">Total</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-white/5 hover:bg-white/5">
                <td className="p-3 font-mono text-xs">{r.invoice_number}</td>
                <td className="p-3">{r.clients?.company_name ?? "—"}</td>
                <td className="p-3 text-xs text-muted-foreground">{r.issue_date}</td>
                <td className="p-3 text-xs text-muted-foreground">{r.due_date ?? "—"}</td>
                <td className="p-3 text-right font-medium">{r.currency} {Number(r.total).toFixed(2)}</td>
                <td className="p-3"><span className={`text-[10px] uppercase px-2 py-1 rounded-full ${STATUS_COLOR[r.status]}`}>{r.status}</span></td>
                <td className="p-3 text-right">
                  <div className="inline-flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => exportPdf(r)}><FileDown className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(r)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="w-3.5 h-3.5 text-destructive" /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={7} className="p-12 text-center text-muted-foreground"><FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />No invoices yet</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
};

export default AdminInvoices;
