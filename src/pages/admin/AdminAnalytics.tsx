import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatCard } from "@/components/admin/StatCard";
import { supabase } from "@/integrations/supabase/client";
import { Inbox, FolderKanban, Newspaper, Eye } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "#8b5cf6", "#06b6d4"];

const AdminAnalytics = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const since = subDays(new Date(), 30).toISOString();
      const [l, b, p, s] = await Promise.all([
        supabase.from("leads").select("id,created_at,status,source").gte("created_at", since),
        supabase.from("blogs").select("id,title,views,published,category,created_at").order("views", { ascending: false }),
        supabase.from("projects").select("id,category,featured,created_at"),
        supabase.from("services").select("id,active,created_at"),
      ]);
      setLeads(l.data ?? []);
      setBlogs(b.data ?? []);
      setProjects(p.data ?? []);
      setServices(s.data ?? []);
    })();
  }, []);

  const leadsByDay = useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = format(subDays(new Date(), i), "MMM d");
      days[d] = 0;
    }
    leads.forEach((l) => {
      const d = format(startOfDay(new Date(l.created_at)), "MMM d");
      if (d in days) days[d]++;
    });
    return Object.entries(days).map(([date, count]) => ({ date, count }));
  }, [leads]);

  const leadStatus = useMemo(() => {
    const map: Record<string, number> = {};
    leads.forEach((l) => { map[l.status] = (map[l.status] ?? 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [leads]);

  const topBlogs = blogs.slice(0, 8).map((b) => ({ name: b.title.slice(0, 22), views: b.views }));
  const totalViews = blogs.reduce((s, b) => s + (b.views ?? 0), 0);

  return (
    <AdminShell title="Analytics">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Leads (30d)" value={leads.length} icon={Inbox} accent="magenta" />
        <StatCard label="Blog views" value={totalViews} icon={Eye} accent="pink" />
        <StatCard label="Projects" value={projects.length} icon={FolderKanban} accent="blue" />
        <StatCard label="Services live" value={services.filter((s) => s.active).length} icon={Newspaper} accent="magenta" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 gradient-border glass rounded-2xl p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Leads — last 30 days</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={leadsByDay}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Area type="monotone" dataKey="count" stroke="hsl(var(--accent))" fill="url(#g1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="gradient-border glass rounded-2xl p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Lead status</h3>
          <div className="h-64">
            {leadStatus.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={leadStatus} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
                    {leadStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="gradient-border glass rounded-2xl p-6">
        <h3 className="font-display text-lg font-semibold mb-4">Top blog posts by views</h3>
        <div className="h-72">
          {topBlogs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">No blog data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topBlogs}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                <Bar dataKey="views" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </AdminShell>
  );
};

export default AdminAnalytics;
