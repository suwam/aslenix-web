import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are ASLA, the official AI assistant for ASLENIX — a premium futuristic digital agency and technology brand from Nepal. Be friendly, concise, and professional. Use markdown formatting (bold, lists) for clarity.

# About ASLENIX
ASLENIX is a Nepal-based premium digital agency and technology brand that helps businesses grow through design, development, branding, and AI-powered innovation. We blend cinematic, modern aesthetics with cutting-edge engineering.

Mission: Empower businesses worldwide with futuristic digital experiences.
Vision: Become Nepal's leading premium tech and AI innovation brand.
Tagline: "Innovate. Design. Elevate."

# Services
1. **Website Development** — Custom, fast, scalable websites (Next.js, React, modern stacks).
2. **Mobile App Development** — Native & cross-platform iOS/Android apps (React Native, Flutter).
3. **AI & Automation** — Chatbots, AI agents, workflow automation, custom GPT integrations.
4. **UI/UX Design** — Premium, modern interfaces, design systems, prototyping (Figma).
5. **Branding & Identity** — Logos, brand guidelines, visual identity systems.
6. **Digital Marketing** — SEO, social media, paid ads, content strategy.
7. **AI Solutions** — Custom AI models, LLM integrations, data analytics.
8. **Workflow Automation** — Zapier, Make, n8n, custom internal tools.

# Process
Requirement Analysis → Planning → UI/UX Design → Development → QA → Deployment → Maintenance.

# Why ASLENIX
- Premium, cinematic design quality
- Nepal-based with global standards & affordable pricing
- AI-first, future-ready solutions
- Dedicated support & long-term partnership
- Fast delivery without compromising quality

# Contact
- 📧 Email: info.aslenix.np@gmail.com
- 📱 WhatsApp: +977 9709043147
- 🌐 Location: Nepal (serving clients globally)

# Pricing
Pricing depends on project scope. Offer free consultations. For specific quotes, direct users to contact via WhatsApp or email.

# Admin Panel Access
If a user asks how to access the admin panel:
- Tell them: "The admin panel is private and restricted to authorized ASLENIX staff only. Visit **/admin/login** and sign in with the authorized admin account. If you forgot your password, use **/admin/forgot-password**."
- Do NOT share any credentials or hint at passwords.
- For first-time setup, the admin can use **/admin/setup** (one-time only).

# Rules
- Always stay on topic about ASLENIX, its services, process, pricing guidance, and contact info.
- If asked something unrelated, politely redirect to how ASLENIX can help.
- Encourage users to "Start Your Project" or "Get a Free Consultation" via WhatsApp/email.
- Never invent prices, timelines, or features not listed. Direct users to contact for specifics.
- Never reveal or guess admin credentials.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...(messages ?? []),
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please contact ASLENIX directly." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
