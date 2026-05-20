import { ReactNode, useEffect, useState } from "react";
import { Link, NavLink, Navigate, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, LayoutDashboard, FolderKanban, Receipt, MessageSquare, Calendar, FileText, LogOut, Clock } from "lucide-react";
import { Logo } from "@/components/Logo";

const nav = [
  { to: "/portal", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/portal/projects", label: "Projects", icon: FolderKanban },
  { to: "/portal/invoices", label: "Invoices", icon: Receipt },
  { to: "/portal/meetings", label: "Meetings", icon: Calendar },
  { to: "/portal/messages", label: "Messages", icon: MessageSquare },
  { to: "/portal/proposals", label: "Documents", icon: FileText },
];

export const ClientPortalLayout = ({ children, title }: { children: ReactNode; title?: string }) => {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user) { setChecking(false); return; }
    supabase.from("client_users").select("*, clients(company_name)").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { setProfile(data); setChecking(false); });
  }, [user]);

  if (loading || checking) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>;
  }
  if (!user) return <Navigate to="/portal/login" state={{ from: location }} replace />;

  if (!profile || profile.status !== "approved") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="gradient-border glass rounded-3xl max-w-lg w-full p-10 text-center">
          <Clock className="w-14 h-14 mx-auto text-accent mb-4" />
          <h1 className="text-2xl font-display font-semibold mb-2">{profile?.status === "rejected" ? "Account rejected" : "Awaiting approval"}</h1>
          <p className="text-muted-foreground mb-6">{profile?.status === "rejected" ? "Please contact ASLENIX for assistance." : "Your account is pending verification by the ASLENIX team. We'll email you once approved."}</p>
          <button onClick={async () => { await signOut(); navigate("/portal/login"); }} className="text-sm text-muted-foreground hover:text-foreground">Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 border-r border-white/5 bg-[hsl(240_18%_5%)] p-4 flex flex-col">
        <div className="mb-6"><Logo /></div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground/60 px-2 mb-2">Client Portal</div>
        <nav className="flex-1 space-y-1">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${isActive ? "bg-brand-gradient text-white font-medium" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}>
              <n.icon className="w-4 h-4" />{n.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/5 pt-4 mt-4">
          <div className="px-2 mb-3">
            <div className="text-sm font-medium truncate">{profile.full_name ?? user.email}</div>
            <div className="text-xs text-muted-foreground truncate">{profile.clients?.company_name ?? "—"}</div>
          </div>
          <button onClick={async () => { await signOut(); navigate("/portal/login"); }} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full text-destructive hover:bg-destructive/10">
            <LogOut className="w-4 h-4" />Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        {title && <h1 className="font-display text-3xl font-semibold mb-6">{title}</h1>}
        {children}
      </main>
    </div>
  );
};

export const usePortalProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  useEffect(() => {
    if (!user) return;
    supabase.from("client_users").select("*, clients(company_name)").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setProfile(data));
  }, [user]);
  return profile;
};
