import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { task, title, hint } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not set");

    const prompts: Record<string, string> = {
      blog: `Write a polished, ~600 word blog post in HTML for a digital agency named ASLENIX. Use <h2>, <p>, <ul>/<li> as needed. No <html>/<body> wrappers. Title: "${title}". ${hint ? `Hint: ${hint}` : ""}`,
      service: `Write a polished service description (~250 words) in HTML for the service: "${title}". Include what it is, why it matters, and what's included. ${hint ?? ""}`,
      seo_title: `Write a single SEO meta title (max 60 chars, no quotes) for: "${title}". ${hint ?? ""} Output the title only.`,
      seo_description: `Write a single SEO meta description (max 160 chars, no quotes) for: "${title}". ${hint ?? ""} Output the description only.`,
      seo_keywords: `Output 8 SEO keywords as a comma-separated list (no numbering, no quotes) for: "${title}". ${hint ?? ""}`,
      social: `Write 3 short social media captions (LinkedIn, Twitter/X, Instagram) for "${title}". Use emojis sparingly. Format as plain text with headings "LinkedIn:", "Twitter:", "Instagram:". ${hint ?? ""}`,
      email: `Write a professional outreach email (subject + body) for the topic: "${title}". ${hint ?? ""} Format as "Subject: ..." then a blank line then the body.`,
      proposal: `Write a polished project proposal section in HTML (overview, scope, deliverables, timeline) for project: "${title}". ${hint ?? ""}`,
      ideas: `Generate 10 fresh blog post ideas about "${title}" for a digital agency. Output as a numbered list, no extra text.`,
    };
    const prompt = prompts[task] ?? prompts.blog;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a senior content strategist for a premium digital agency. Output only the requested content, nothing else." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (r.status === 429) return new Response(JSON.stringify({ error: "Rate limit. Try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (r.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in workspace settings." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!r.ok) throw new Error(`AI gateway ${r.status}`);

    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content ?? "";
    const excerpt = content.replace(/<[^>]+>/g, " ").trim().slice(0, 180);
    return new Response(JSON.stringify({ content, excerpt }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
