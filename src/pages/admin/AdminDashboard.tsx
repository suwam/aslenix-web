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

      <div className="mb-8 rounded-3xl border border-white/10 bg-[#0d1021]/80 p-6 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.7)]">
        <div className="flex items-center justify-between gap-4 mb-6 flex-col sm:flex-row">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground/70">Quick access</p>
            <h2 className="font-display text-2xl font-semibold text-white">All admin sections</h2>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Open any admin page directly from the dashboard, with every route connected for fast management.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="group rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:border-accent/40 hover:bg-white/10"
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-[0_10px_30px_-18px_rgba(255,79,216,0.45)] mb-4">
                <link.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white mb-1">{link.label}</h3>
              <p className="text-sm text-muted-foreground">Open the {link.label} admin view.</p>
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
