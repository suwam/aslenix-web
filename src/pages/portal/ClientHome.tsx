import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { ClientPortalLayout } from "@/components/portal/ClientPortalLayout";
import { supabase } from "@/integrations/supabase/client";
import { StatCard } from "@/components/admin/StatCard";
import { FolderKanban, Receipt, Calendar, MessageSquare } from "lucide-react";

const ClientHome = () => {
  const stats = useSupabaseRealtime(
    async () => {
      const [p, i, m, c] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("invoices").select("id", { count: "exact", head: true }),
        supabase.from("meetings").select("id", { count: "exact", head: true }).gte("starts_at", new Date().toISOString()),
        supabase.from("conversations").select("unread_client").maybeSingle(),
      ]);
      return {
        projects: p.count ?? 0,
        invoices: i.count ?? 0,
        meetings: m.count ?? 0,
        unread: (c.data as any)?.unread_client ?? 0,
      };
    },
    ["projects", "invoices", "meetings", "conversations"],
    [],
  ) ?? { projects: 0, invoices: 0, meetings: 0, unread: 0 };
  return (
    <ClientPortalLayout title="Welcome back">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Projects" value={stats.projects} icon={FolderKanban} accent="blue" />
        <StatCard label="Invoices" value={stats.invoices} icon={Receipt} accent="pink" />
        <StatCard label="Upcoming Meetings" value={stats.meetings} icon={Calendar} accent="magenta" />
        <StatCard label="Unread Messages" value={stats.unread} icon={MessageSquare} accent="blue" />
      </div>
    </ClientPortalLayout>
  );
};
export default ClientHome;
