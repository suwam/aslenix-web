import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, FileDown, Wand2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { logActivity } from "@/lib/activity";

type LineItem = { description: string; qty: number; price: number };

const AdminProposals = () => {
  const [client, setClient] = useState("");
  const [project, setProject] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [overview, setOverview] = useState("");
  const [items, setItems] = useState<LineItem[]>([{ description: "Discovery & Strategy", qty: 1, price: 1200 }]);
  const [taxPct, setTaxPct] = useState(13);
  const [notes, setNotes] = useState("Payment terms: 50% upfront, 50% on delivery. Quote valid for 30 days.");

  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const tax = subtotal * (taxPct / 100);
  const total = subtotal + tax;

  const setItem = (idx: number, patch: Partial<LineItem>) =>
    setItems((arr) => arr.map((it, i) => i === idx ? { ...it, ...patch } : it));

  const addItem = () => setItems((arr) => [...arr, { description: "", qty: 1, price: 0 }]);
  const removeItem = (i: number) => setItems((arr) => arr.filter((_, idx) => idx !== i));

  const aiOverview = async () => {
    if (!project) return toast.error("Add a project name first");
    toast.info("Generating overview…");
    const { data } = await supabase.functions.invoke("ai-content", { body: { task: "proposal", title: project, hint: `Client: ${client}` } });
    const text = (data?.content ?? "").replace(/<[^>]+>/g, "").trim();
    setOverview(text);
    toast.success("Overview added");
  };

  const exportPdf = async () => {
    if (!client || !project) return toast.error("Client and project required");

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const margin = 48;
    let y = margin;

    // Header bar
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, W, 8, "F");

    // Brand
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(20, 20, 28);
    doc.text("ASLENIX", margin, y + 24);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 130);
    doc.text("Next-Gen Digital Agency · info.aslenix.np@gmail.com", margin, y + 40);

    doc.setFontSize(10);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, W - margin, y + 24, { align: "right" });
    if (validUntil) doc.text(`Valid until: ${validUntil}`, W - margin, y + 40, { align: "right" });

    y += 70;
    doc.setDrawColor(230);
    doc.line(margin, y, W - margin, y);
    y += 24;

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(20, 20, 28);
    doc.text("Project Proposal", margin, y);
    y += 22;

    // Client
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(70, 70, 80);
    doc.text(`Prepared for: ${client}`, margin, y); y += 16;
    doc.text(`Project: ${project}`, margin, y); y += 28;

    // Overview
    if (overview) {
      doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(20,20,28);
      doc.text("Overview", margin, y); y += 16;
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(70,70,80);
      const lines = doc.splitTextToSize(overview, W - margin * 2);
      doc.text(lines, margin, y); y += lines.length * 13 + 16;
    }

    // Line items table
    doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(20,20,28);
    doc.text("Scope & Pricing", margin, y); y += 14;

    doc.setFillColor(245, 245, 250);
    doc.rect(margin, y, W - margin * 2, 22, "F");
    doc.setFontSize(10); doc.setTextColor(60,60,70);
    doc.text("Description", margin + 8, y + 15);
    doc.text("Qty", W - margin - 180, y + 15);
    doc.text("Price", W - margin - 110, y + 15);
    doc.text("Total", W - margin - 8, y + 15, { align: "right" });
    y += 22;

    doc.setFont("helvetica", "normal"); doc.setTextColor(40,40,50);
    items.forEach((it) => {
      const lines = doc.splitTextToSize(it.description || "—", W - margin * 2 - 220);
      const rowH = Math.max(20, lines.length * 12 + 8);
      if (y + rowH > doc.internal.pageSize.getHeight() - 100) { doc.addPage(); y = margin; }
      doc.text(lines, margin + 8, y + 14);
      doc.text(String(it.qty), W - margin - 180, y + 14);
      doc.text(`$${it.price.toFixed(2)}`, W - margin - 110, y + 14);
      doc.text(`$${(it.qty * it.price).toFixed(2)}`, W - margin - 8, y + 14, { align: "right" });
      y += rowH;
      doc.setDrawColor(240); doc.line(margin, y, W - margin, y);
    });

    y += 20;
    doc.setFontSize(10);
    doc.text("Subtotal", W - margin - 110, y); doc.text(`$${subtotal.toFixed(2)}`, W - margin - 8, y, { align: "right" }); y += 14;
    doc.text(`Tax (${taxPct}%)`, W - margin - 110, y); doc.text(`$${tax.toFixed(2)}`, W - margin - 8, y, { align: "right" }); y += 16;
    doc.setFont("helvetica","bold"); doc.setFontSize(12);
    doc.text("Total", W - margin - 110, y); doc.text(`$${total.toFixed(2)}`, W - margin - 8, y, { align: "right" });
    y += 30;

    if (notes) {
      doc.setFont("helvetica","bold"); doc.setFontSize(11); doc.setTextColor(20,20,28);
      doc.text("Notes", margin, y); y += 14;
      doc.setFont("helvetica","normal"); doc.setFontSize(9); doc.setTextColor(90,90,100);
      const nl = doc.splitTextToSize(notes, W - margin * 2);
      doc.text(nl, margin, y);
    }

    // Footer
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFontSize(8); doc.setTextColor(160,160,170);
    doc.text("ASLENIX · Make It Possible · aslenix.com", W / 2, pageH - 24, { align: "center" });

    const fileName = `proposal-${client.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.pdf`;
    doc.save(fileName);
    await logActivity(`Exported proposal: ${project}`, "proposal", client);
    toast.success("PDF downloaded");
  };

  return (
    <AdminShell title="Proposals" actions={
      <Button onClick={exportPdf} variant="hero" size="sm"><FileDown className="w-3.5 h-3.5" /> Export PDF</Button>
    }>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="gradient-border glass rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><Label>Client name</Label><Input value={client} onChange={(e) => setClient(e.target.value)} /></div>
            <div><Label>Project name</Label><Input value={project} onChange={(e) => setProject(e.target.value)} /></div>
            <div><Label>Valid until</Label><Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} /></div>
            <div><Label>Tax %</Label><Input type="number" value={taxPct} onChange={(e) => setTaxPct(Number(e.target.value))} /></div>
            <div className="md:col-span-2">
              <div className="flex items-center justify-between">
                <Label>Overview</Label>
                <Button onClick={aiOverview} variant="ghost" size="sm"><Wand2 className="w-3.5 h-3.5" /> AI</Button>
              </div>
              <Textarea rows={5} value={overview} onChange={(e) => setOverview(e.target.value)} />
            </div>
          </div>

          <div className="gradient-border glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold">Line items</h3>
              <Button onClick={addItem} variant="glass" size="sm"><Plus className="w-3.5 h-3.5" /> Add</Button>
            </div>
            <div className="space-y-2">
              {items.map((it, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <Input className="col-span-7" placeholder="Description" value={it.description} onChange={(e) => setItem(i, { description: e.target.value })} />
                  <Input className="col-span-2" type="number" placeholder="Qty" value={it.qty} onChange={(e) => setItem(i, { qty: Number(e.target.value) })} />
                  <Input className="col-span-2" type="number" placeholder="Price" value={it.price} onChange={(e) => setItem(i, { price: Number(e.target.value) })} />
                  <Button variant="ghost" size="icon" onClick={() => removeItem(i)} className="col-span-1"><Trash2 className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
          </div>

          <div className="gradient-border glass rounded-2xl p-6">
            <Label>Notes / Terms</Label>
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <div className="gradient-border glass rounded-2xl p-6 h-fit sticky top-24">
          <h3 className="font-display text-lg font-semibold mb-4">Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax ({taxPct}%)</span><span>${tax.toFixed(2)}</span></div>
            <div className="flex justify-between border-t border-foreground/10 pt-2 font-bold text-base"><span>Total</span><span className="text-gradient">${total.toFixed(2)}</span></div>
          </div>
          <Button onClick={exportPdf} variant="hero" className="w-full mt-6"><FileDown className="w-4 h-4" /> Export PDF</Button>
        </div>
      </div>
    </AdminShell>
  );
};

export default AdminProposals;
