import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, CreditCard } from "lucide-react";
import { Logo } from "@/components/Logo";

const PayInvoice = () => {
  const { token } = useParams();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!token) return;
    supabase.from("invoices").select("*, clients(company_name)").eq("pay_token", token).maybeSingle()
      .then(({ data }) => { setInvoice(data); setLoading(false); });
  }, [token]);

  const pay = async () => {
    setPaying(true);
    const { data, error } = await supabase.functions.invoke("esewa-initiate", {
      body: { invoice_token: token, return_origin: window.location.origin },
    });
    if (error || data?.error) { alert(data?.error ?? error?.message); setPaying(false); return; }
    // Build form and submit
    const form = document.createElement("form");
    form.method = "POST";
    form.action = data.gateway;
    Object.entries(data.fields as Record<string, string>).forEach(([k, v]) => {
      const input = document.createElement("input");
      input.type = "hidden"; input.name = k; input.value = v;
      form.appendChild(input);
    });
    document.body.appendChild(form);
    form.submit();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  if (!invoice) return <div className="min-h-screen flex items-center justify-center text-muted-foreground"><XCircle className="w-6 h-6 mr-2" />Invoice not found</div>;

  const remaining = Math.max(0, Number(invoice.total) - Number(invoice.paid_amount ?? 0));
  const isPaid = invoice.status === "paid" || remaining <= 0;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="gradient-border glass rounded-3xl max-w-lg w-full p-8">
        <div className="flex items-center justify-between mb-6"><Logo /><span className="text-xs text-muted-foreground">{invoice.invoice_number}</span></div>
        <h1 className="text-2xl font-display font-semibold mb-2">Invoice from ASLENIX</h1>
        <p className="text-muted-foreground text-sm mb-6">Billed to {invoice.clients?.company_name ?? "—"}</p>

        <div className="bg-foreground/5 rounded-2xl p-6 mb-6 space-y-2">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total</span><span>{invoice.currency} {Number(invoice.total).toFixed(2)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Paid</span><span>{invoice.currency} {Number(invoice.paid_amount).toFixed(2)}</span></div>
          <div className="flex justify-between text-lg font-semibold pt-2 border-t border-foreground/10"><span>Due</span><span className="text-gradient">{invoice.currency} {remaining.toFixed(2)}</span></div>
        </div>

        {isPaid ? (
          <div className="flex items-center gap-2 text-green-400 justify-center"><CheckCircle2 className="w-5 h-5" /> This invoice is paid in full.</div>
        ) : (
          <Button onClick={pay} disabled={paying} variant="hero" className="w-full" size="lg">
            {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
            Pay with eSewa
          </Button>
        )}
        <p className="text-[11px] text-muted-foreground text-center mt-4">Secure payment processed by eSewa. ASLENIX never stores your card or wallet credentials.</p>
      </div>
    </div>
  );
};
export default PayInvoice;
