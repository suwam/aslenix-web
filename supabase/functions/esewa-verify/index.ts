// Verify an eSewa transaction (called from /pay/:token/success page)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { tx_id, encoded_data } = await req.json();
    if (!tx_id) throw new Error("tx_id required");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: tx, error: txErr } = await supabase
      .from("transactions").select("*").eq("id", tx_id).maybeSingle();
    if (txErr || !tx) throw new Error("Transaction not found");

    let parsed: any = {};
    if (encoded_data) {
      try { parsed = JSON.parse(atob(encoded_data)); } catch { /* ignore */ }
    }

    // eSewa status check API
    const merchantCode = Deno.env.get("ESEWA_MERCHANT_CODE") ?? "EPAYTEST";
    const statusUrl = Deno.env.get("ESEWA_STATUS_URL") ??
      "https://rc.esewa.com.np/api/epay/transaction/status/";
    const url = `${statusUrl}?product_code=${merchantCode}&total_amount=${tx.amount}&transaction_uuid=${tx.reference_id}`;

    let gatewayStatus = "PENDING";
    let raw: any = parsed;
    try {
      const res = await fetch(url);
      raw = await res.json();
      gatewayStatus = raw.status ?? gatewayStatus;
    } catch (e) {
      raw = { ...parsed, fetch_error: String(e) };
    }

    const newStatus = gatewayStatus === "COMPLETE" ? "success"
      : gatewayStatus === "PENDING" ? "pending"
      : "failed";

    await supabase.from("transactions").update({
      status: newStatus,
      gateway_txn_id: raw.ref_id ?? raw.transaction_code ?? null,
      raw_response: raw,
    }).eq("id", tx_id);

    if (newStatus === "success") {
      await supabase.from("automation_logs").insert({
        workflow: "payment.success",
        payload: { tx_id, invoice_id: tx.invoice_id, amount: tx.amount },
      });
    }

    return new Response(JSON.stringify({ status: newStatus }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
