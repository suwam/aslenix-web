import { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Bot, Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";

const TOOLS = [
  { id: "blog", label: "Blog post (HTML)", placeholder: "10 ways AI is changing web design" },
  { id: "service", label: "Service description", placeholder: "AI Chatbot Development" },
  { id: "ideas", label: "Blog post ideas", placeholder: "AI for small business" },
  { id: "social", label: "Social captions", placeholder: "Launching our new AI service" },
  { id: "email", label: "Outreach email", placeholder: "Web redesign for SaaS startup" },
  { id: "seo_description", label: "SEO description", placeholder: "ASLENIX homepage" },
  { id: "proposal", label: "Proposal section", placeholder: "E-commerce platform for retailer" },
];

const AdminAITools = () => {
  const [task, setTask] = useState("blog");
  const [title, setTitle] = useState("");
  const [hint, setHint] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!title.trim()) return toast.error("Add a title or topic");
    setLoading(true); setOutput("");
    const { data, error } = await supabase.functions.invoke("ai-content", { body: { task, title, hint } });
    setLoading(false);
    if (error || data?.error) return toast.error(error?.message ?? data?.error);
    setOutput(data?.content ?? "");
    toast.success("Generated");
  };

  const copy = () => { navigator.clipboard.writeText(output); toast.success("Copied"); };

  return (
    <AdminShell title="AI Tools Studio">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="gradient-border glass rounded-2xl p-6 space-y-4">
          <div>
            <Label>Tool</Label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {TOOLS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTask(t.id); setTitle(""); setOutput(""); }}
                  className={`text-left px-3 py-2 rounded-lg text-sm transition-all ${
                    task === t.id ? "bg-brand-gradient text-foreground" : "bg-foreground/5 hover:bg-foreground/10 text-muted-foreground"
                  }`}
                >{t.label}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 gradient-border glass rounded-2xl p-6 space-y-4">
          <div>
            <Label>Topic / Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={TOOLS.find((t) => t.id === task)?.placeholder} />
          </div>
          <div>
            <Label>Extra context (optional)</Label>
            <Textarea rows={2} value={hint} onChange={(e) => setHint(e.target.value)} placeholder="Audience, tone, keywords…" />
          </div>
          <Button onClick={run} disabled={loading} variant="hero">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
            Generate
          </Button>

          {output && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Output</Label>
                <Button onClick={copy} variant="ghost" size="sm"><Copy className="w-3.5 h-3.5" /> Copy</Button>
              </div>
              <Textarea rows={18} value={output} onChange={(e) => setOutput(e.target.value)} className="font-mono text-xs" />
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  );
};

export default AdminAITools;
