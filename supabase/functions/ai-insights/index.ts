// Generate business insights summary from leads/projects/invoices using Lovable AI
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const [leads, projects, invoices, blogs] = await Promise.all([
      supabase.from("leads").select("status,created_at,subject"),
      supabase.from("projects").select("title,status,progress,budget,category"),
      supabase.from("invoices").select("status,total,paid_amount,currency,issue_date"),
      supabase.from("blogs").select("title,views,published"),
    ]);

    const summary = {
      leads_total: leads.data?.length ?? 0,
      leads_new: leads.data?.filter((l: any) => l.status === "new").length ?? 0,
      projects_active: projects.data?.filter((p: any) => p.status === "in_progress").length ?? 0,
      projects_done: projects.data?.filter((p: any) => p.status === "completed").length ?? 0,
      revenue_paid: invoices.data?.reduce((s: number, i: any) => s + (i.status === "paid" ? Number(i.total) : 0), 0) ?? 0,
      revenue_pending: invoices.data?.reduce((s: number, i: any) => s + (i.status !== "paid" ? Number(i.total) - Number(i.paid_amount ?? 0) : 0), 0) ?? 0,
      top_blog: [...(blogs.data ?? [])].sort((a: any, b: any) => b.views - a.views)[0]?.title,
      categories: [...new Set(projects.data?.map((p: any) => p.category).filter(Boolean))],
    };

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an analytics consultant for a digital agency named ASLENIX. Reply with concise JSON." },
          {
            role: "user",
            content: `Analyse this snapshot and return JSON {"summary":"...","wins":["..."],"risks":["..."],"recommendations":["..."],"blog_topics":["..."],"social_posts":["..."]}. Snapshot: ${JSON.stringify(summary)}`,
          },
        ],
      }),
    });

    if (!aiRes.ok) throw new Error(`AI error ${aiRes.status}: ${await aiRes.text()}`);
    const ai = await aiRes.json();
    const text = ai.choices?.[0]?.message?.content ?? "{}";
    const cleaned = text.replace(/```json|```/g, "").trim();
    let parsed: any = {};
    try { parsed = JSON.parse(cleaned); } catch { parsed = { summary: cleaned }; }

    return new Response(JSON.stringify({ stats: summary, insights: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
