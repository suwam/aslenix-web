import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, TrendingUp, AlertCircle, Lightbulb } from "lucide-react";
import { toast } from "sonner";

const AdminInsights = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const { data: r, error } = await supabase.functions.invoke("ai-insights", { body: {} });
    setLoading(false);
    if (error || r?.error) return toast.error(r?.error ?? error?.message ?? "Failed");
    setData(r);
  };

  useEffect(() => { generate(); }, []);

  return (
    <AdminShell title="AI Insights" actions={<Button onClick={generate} variant="hero" size="sm" disabled={loading}>{loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}Refresh</Button>}>
      {!data ? (
        <div className="text-center py-20 text-muted-foreground"><Loader2 className="w-8 h-8 animate-spin mx-auto" /></div>
      ) : (
        <div className="space-y-6">
          <div className="gradient-border glass rounded-2xl p-6">
            <h3 className="font-display text-xl mb-3 flex items-center gap-2"><Sparkles className="w-5 h-5 text-accent" />Business Summary</h3>
            <p className="text-muted-foreground leading-relaxed">{data.insights?.summary ?? "—"}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card title="Wins" icon={TrendingUp} color="text-green-400" items={data.insights?.wins} />
            <Card title="Risks" icon={AlertCircle} color="text-destructive" items={data.insights?.risks} />
            <Card title="Recommendations" icon={Lightbulb} color="text-yellow-400" items={data.insights?.recommendations} />
            <Card title="Blog Topics" icon={Sparkles} color="text-accent" items={data.insights?.blog_topics} />
          </div>

          {data.insights?.social_posts?.length > 0 && (
            <div className="gradient-border glass rounded-2xl p-6">
              <h3 className="font-display text-lg mb-3">Suggested Social Posts</h3>
              <div className="space-y-3">
                {data.insights.social_posts.map((p: string, i: number) => (
                  <div key={i} className="bg-white/5 rounded-xl p-3 text-sm">{p}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
};

const Card = ({ title, icon: Icon, color, items }: any) => (
  <div className="gradient-border glass rounded-2xl p-5">
    <h4 className={`font-display flex items-center gap-2 mb-3 ${color}`}><Icon className="w-4 h-4" />{title}</h4>
    <ul className="space-y-2 text-sm text-muted-foreground">
      {(items ?? []).map((it: string, i: number) => <li key={i} className="flex gap-2"><span className="text-accent">•</span><span>{it}</span></li>)}
      {!items?.length && <li className="text-xs opacity-60">No suggestions</li>}
    </ul>
  </div>
);
export default AdminInsights;
