import { ReactNode, useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";

export const AdminShell = ({ children, title, actions }: { children: ReactNode; title?: string; actions?: ReactNode }) => {
  const [unread, setUnread] = useState(0);
  const [recentLeads, setRecentLeads] = useState<{ id: string; name: string; email: string; created_at: string }[]>([]);
  const { user } = useAuth();

  const loadUnread = async () => {
    const { data, count } = await supabase
      .from("leads")
      .select("id,name,email,created_at", { count: "exact" })
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(5);
    setUnread(count ?? 0);
    setRecentLeads(data ?? []);
  };

  useEffect(() => {
    loadUnread();
    const channel = supabase
      .channel("admin-leads")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => loadUnread())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-white/5 glass flex items-center px-4 gap-4 sticky top-0 z-30">
            <SidebarTrigger />
            <div className="hidden md:flex items-center flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search…" className="pl-9 bg-muted/30 border-white/5" />
              </div>
            </div>
            <div className="flex-1 md:hidden" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-4 h-4" />
                  {unread > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-secondary text-white text-[10px] font-bold flex items-center justify-center">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications ({unread} unread)</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {recentLeads.length === 0 ? (
                  <div className="text-sm text-muted-foreground px-3 py-6 text-center">No new leads</div>
                ) : (
                  recentLeads.map((l) => (
                    <DropdownMenuItem key={l.id} asChild>
                      <a href="/admin/leads" className="flex flex-col items-start gap-0.5">
                        <div className="font-medium text-sm">{l.name}</div>
                        <div className="text-xs text-muted-foreground">{l.email}</div>
                      </a>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-9 h-9 rounded-full bg-brand-gradient text-white text-sm font-bold flex items-center justify-center">
                  {user?.email?.[0].toUpperCase() ?? "A"}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-xs">{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><a href="/admin/change-password">Change Password</a></DropdownMenuItem>
                <DropdownMenuItem asChild><a href="/admin/settings">Settings</a></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>

          <main className="flex-1 p-6 lg:p-8">
            {(title || actions) && (
              <div className="flex items-start sm:items-center justify-between gap-4 mb-8 flex-col sm:flex-row">
                {title && <h1 className="font-display text-3xl font-bold">{title}</h1>}
                {actions && <div className="flex gap-2 flex-wrap">{actions}</div>}
              </div>
            )}
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
