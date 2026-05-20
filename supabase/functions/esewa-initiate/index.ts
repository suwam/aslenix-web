// Initialise an eSewa payment session for an invoice (sandbox EPAYTEST by default)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// HMAC-SHA256 base64 signature for v2 eSewa
async function sign(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { invoice_token, return_origin } = await req.json();
    if (!invoice_token) throw new Error("invoice_token required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: invoice, error } = await supabase
      .from("invoices")
      .select("id, invoice_number, total, paid_amount, currency, client_id, status")
      .eq("pay_token", invoice_token)
      .maybeSingle();
    if (error || !invoice) throw new Error("Invoice not found");

    const remaining = Math.max(0, Number(invoice.total) - Number(invoice.paid_amount ?? 0));
    if (remaining <= 0) throw new Error("Invoice already paid");

    // Create pending transaction
    const { data: tx, error: txErr } = await supabase
      .from("transactions")
      .insert({
        invoice_id: invoice.id,
        client_id: invoice.client_id,
        method: "esewa",
        status: "pending",
        amount: remaining,
        currency: "NPR",
        reference_id: `${invoice.invoice_number}-${Date.now()}`,
      })
      .select()
      .single();
    if (txErr) throw txErr;

    // eSewa v2 sandbox config
    const merchantCode = Deno.env.get("ESEWA_MERCHANT_CODE") ?? "EPAYTEST";
    const secret = Deno.env.get("ESEWA_SECRET_KEY") ?? "8gBm/:&EnhH.1/q";
    const gateway = Deno.env.get("ESEWA_GATEWAY_URL") ??
      "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

    const amount = remaining.toFixed(2);
    const tax_amount = "0";
    const total_amount = amount;
    const transaction_uuid = tx.reference_id;
    const product_code = merchantCode;
    const product_service_charge = "0";
    const product_delivery_charge = "0";
    const success_url = `${return_origin}/pay/${invoice_token}/success?tx=${tx.id}`;
    const failure_url = `${return_origin}/pay/${invoice_token}/failed?tx=${tx.id}`;

    const signed_field_names = "total_amount,transaction_uuid,product_code";
    const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const signature = await sign(message, secret);

    return new Response(
      JSON.stringify({
        gateway,
        fields: {
          amount, tax_amount, total_amount, transaction_uuid, product_code,
          product_service_charge, product_delivery_charge,
          success_url, failure_url, signed_field_names, signature,
        },
        transaction_id: tx.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
