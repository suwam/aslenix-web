import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, FolderKanban, Sparkles, Newspaper, Inbox,
  BarChart3, Image as ImageIcon, Search, Bot, FileText,
  Settings as SettingsIcon, Activity, LogOut, Home, Layout,
  Users, Receipt, CheckSquare, Megaphone, Download, Gauge,
  DollarSign, Calendar as CalIcon, MessageSquare, Sparkle, Workflow, UserCheck, Award,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const main = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/homepage", label: "Homepage", icon: Layout },
  { to: "/admin/brands", label: "Brands / Partners", icon: Award },
  { to: "/admin/clients", label: "Clients", icon: Users },
  { to: "/admin/team", label: "Team", icon: UserCheck },
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/services", label: "Services", icon: Sparkles },
  { to: "/admin/blogs", label: "Blogs", icon: Newspaper },
  { to: "/admin/leads", label: "Leads", icon: Inbox },
];

const business = [
  { to: "/admin/invoices", label: "Invoices", icon: Receipt },
  { to: "/admin/finance", label: "Finance", icon: DollarSign },
  { to: "/admin/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/admin/calendar", label: "Calendar", icon: CalIcon },
  { to: "/admin/proposals", label: "Proposals", icon: FileText },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
];

const portal = [
  { to: "/admin/chat", label: "Messages", icon: MessageSquare },
  { to: "/admin/client-users", label: "Portal Users", icon: UserCheck },
  { to: "/admin/automation", label: "Automation", icon: Workflow },
];

const tools = [
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/insights", label: "AI Insights", icon: Sparkle },
  { to: "/admin/performance", label: "Performance", icon: Gauge },
  { to: "/admin/media", label: "Media Library", icon: ImageIcon },
  { to: "/admin/seo", label: "SEO Manager", icon: Search },
  { to: "/admin/ai-tools", label: "AI Tools", icon: Bot },
  { to: "/admin/exports", label: "Data Export", icon: Download },
];

const system = [
  { to: "/admin/settings", label: "Settings", icon: SettingsIcon },
  { to: "/admin/activity", label: "Activity Logs", icon: Activity },
];

export const AdminSidebar = () => {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const isActive = (to: string) =>
    pathname === to || (to !== "/admin/dashboard" && pathname.startsWith(to));

  const linkClass = (to: string) =>
    `flex items-center gap-3 w-full rounded-lg transition-all ${
      isActive(to)
        ? "bg-brand-gradient text-white font-medium shadow-[0_4px_20px_-6px_hsl(var(--accent)/0.6)]"
        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
    }`;

  const handleLogout = async () => {
    await signOut();
    toast.success("Logged out");
    navigate("/admin/login", { replace: true });
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-white/5">
      <SidebarContent className="bg-[hsl(240_18%_5%)]">
        <div className="px-4 py-5 border-b border-white/5">
          {!collapsed ? <Logo /> : <div className="w-8 h-8 rounded-lg bg-brand-gradient" />}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-3">
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {main.map((n) => (
                <SidebarMenuItem key={n.to}>
                  <SidebarMenuButton asChild>
                    <NavLink to={n.to} className={linkClass(n.to)}>
                      <n.icon className="w-4 h-4 shrink-0" />
                      {!collapsed && <span className="text-sm">{n.label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-3">
            Business
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {business.map((n) => (
                <SidebarMenuItem key={n.to}>
                  <SidebarMenuButton asChild>
                    <NavLink to={n.to} className={linkClass(n.to)}>
                      <n.icon className="w-4 h-4 shrink-0" />
                      {!collapsed && <span className="text-sm">{n.label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-3">
            Client Portal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {portal.map((n) => (
                <SidebarMenuItem key={n.to}>
                  <SidebarMenuButton asChild>
                    <NavLink to={n.to} className={linkClass(n.to)}>
                      <n.icon className="w-4 h-4 shrink-0" />
                      {!collapsed && <span className="text-sm">{n.label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-3">
            Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tools.map((n) => (
                <SidebarMenuItem key={n.to}>
                  <SidebarMenuButton asChild>
                    <NavLink to={n.to} className={linkClass(n.to)}>
                      <n.icon className="w-4 h-4 shrink-0" />
                      {!collapsed && <span className="text-sm">{n.label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-3">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {system.map((n) => (
                <SidebarMenuItem key={n.to}>
                  <SidebarMenuButton asChild>
                    <NavLink to={n.to} className={linkClass(n.to)}>
                      <n.icon className="w-4 h-4 shrink-0" />
                      {!collapsed && <span className="text-sm">{n.label}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/" target="_blank" className={linkClass("__site")}>
                    <Home className="w-4 h-4 shrink-0" />
                    {!collapsed && <span className="text-sm">View Site</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} className="flex items-center gap-3 w-full rounded-lg text-destructive hover:bg-destructive/10">
                  <LogOut className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="text-sm">Logout</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
