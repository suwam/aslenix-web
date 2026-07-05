import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatCard } from "@/components/admin/StatCard";
import { supabase } from "@/integrations/supabase/client";
import {
  FolderKanban,
  Sparkles,
  Newspaper,
  Inbox,
  Plus,
  Layout,
  Award,
  Users,
  UserCheck,
  Receipt,
  DollarSign,
  CheckSquare,
  Calendar as CalIcon,
  FileText,
  Megaphone,
  MessageSquare,
  Search,
  Sparkle,
  Gauge,
  Image as ImageIcon,
  Bot,
  Download,
  Settings,
  Activity,
  Shield,
  Zap,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const quickLinks = [
  { to: "/admin/projects", label: "Fast Delivery", icon: Layout },
  { to: "/admin/services", label: "2x Faster Development", icon: Zap },
  { to: "/admin/settings", label: "Enterprise Security", icon: Shield },
  { to: "/admin/automation", label: "Safe & Reliable Systems", icon: CheckSquare },
  { to: "/admin/ai-tools", label: "AI Automation", icon: Bot },
  { to: "/admin/activity", label: "24/7 Smart Operations", icon: Clock },
];

const AdminDashboard = () => {
  const [stats, setStats] = useState({ projects: 0, services: 0, blogs: 0, leads: 0, unreadLeads: 0 });
  const [activity, setActivity] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [p, s, b, l, lu, a] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("services").select("id", { count: "exact", head: true }),
        supabase.from("blogs").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("id", { count: "exact", head: true }),
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("is_read", false),
        supabase.from("activity_logs").select("*").order("created_at", { ascending: false }).limit(8),
      ]);
      setStats({
        projects: p.count ?? 0, services: s.count ?? 0, blogs: b.count ?? 0,
        leads: l.count ?? 0, unreadLeads: lu.count ?? 0,
      });
      setActivity(a.data ?? []);
    })();
  }, []);

  return (
    <AdminShell title="Dashboard" actions={
      <>
        <Button asChild variant="glass" size="sm"><Link to="/admin/projects/new"><Plus className="w-3.5 h-3.5" /> Project</Link></Button>
        <Button asChild variant="glass" size="sm"><Link to="/admin/services/new"><Plus className="w-3.5 h-3.5" /> Service</Link></Button>
        <Button asChild variant="hero" size="sm"><Link to="/admin/blogs/new"><Plus className="w-3.5 h-3.5" /> Blog</Link></Button>
      </>
    }>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Projects" value={stats.projects} icon={FolderKanban} accent="blue" />
        <StatCard label="Services" value={stats.services} icon={Sparkles} accent="magenta" />
        <StatCard label="Blogs" value={stats.blogs} icon={Newspaper} accent="pink" />
        <StatCard label="Leads" value={stats.leads} icon={Inbox} hint={`${stats.unreadLeads} unread`} accent="magenta" />
      </div>

      <div className="mb-8 rounded-3xl border border-foreground/10 bg-background/80 p-6 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.7)]">
        <div className="flex items-center justify-between gap-4 mb-6 flex-col sm:flex-row">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground/70">Quick access</p>
            <h2 className="font-display text-2xl font-semibold text-foreground">All admin sections</h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Open any admin page directly from the dashboard, with every route connected for fast management.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="group relative overflow-hidden rounded-[2rem] border border-foreground/10 bg-background/50 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-accent/30 backdrop-blur-xl"
            >
              <div className="absolute inset-0 -translate-y-full bg-gradient-to-b from-brand-gradient/10 to-transparent opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100" />
              <div className="relative z-10">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground/5 border border-foreground/10 text-foreground mb-5 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-3 group-hover:bg-brand-gradient group-hover:border-transparent group-hover:text-foreground group-hover:shadow-[0_0_24px_-4px_hsl(var(--accent)/0.6)]">
                  <link.icon className="h-5 w-5 transition-colors duration-500" />
                </div>
                <h3 className="font-display text-lg font-bold tracking-tight text-foreground mb-2">{link.label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Open the {link.label} admin view.</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="gradient-border glass rounded-2xl p-6">
        <h2 className="font-display text-xl font-semibold mb-4">Recent activity</h2>
        {activity.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">No activity yet — start managing content above.</div>
        ) : (
          <ul className="divide-y divide-white/5">
            {activity.map((a) => (
              <li key={a.id} className="py-3 flex items-center justify-between gap-4 text-sm">
                <div className="min-w-0">
                  <div className="font-medium truncate">{a.action}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {a.user_email}{a.entity_type ? ` · ${a.entity_type}` : ""}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AdminShell>
  );
};

export default AdminDashboard;
