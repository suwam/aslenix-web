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
          <header className="h-16 border-b border-foreground/5 bg-background/80 backdrop-blur-2xl flex items-center px-4 sm:px-6 gap-4 sticky top-0 z-30 shadow-[0_4px_24px_-12px_rgba(0,0,0,0.1)]">
            <SidebarTrigger className="text-foreground/70 hover:text-foreground transition-colors" />
            <div className="hidden md:flex items-center flex-1 max-w-md ml-2 lg:ml-6">
              <div className="relative w-full group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-hover:text-foreground/80" />
                <Input 
                  placeholder="Search admin..." 
                  className="pl-10 h-10 rounded-full bg-foreground/[0.03] border-transparent hover:bg-foreground/[0.05] focus:bg-background focus:border-accent/40 focus:ring-2 focus:ring-accent/20 transition-all shadow-none" 
                />
              </div>
            </div>
            <div className="flex-1 md:hidden" />

            <div className="flex items-center gap-2 sm:gap-3 ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative rounded-full w-10 h-10 hover:bg-foreground/[0.05] transition-colors border border-transparent hover:border-foreground/10">
                    <Bell className="w-[1.125rem] h-[1.125rem] text-foreground/80" />
                    {unread > 0 && (
                      <>
                        <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-secondary animate-ping opacity-75" />
                        <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-secondary border-2 border-background" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 rounded-2xl border-foreground/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-2">
                  <DropdownMenuLabel className="font-display font-medium px-2 pt-1 pb-2">Notifications ({unread} unread)</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-foreground/5" />
                  {recentLeads.length === 0 ? (
                    <div className="text-sm text-muted-foreground px-3 py-8 text-center flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center">
                        <Bell className="w-4 h-4 opacity-50" />
                      </div>
                      No new notifications
                    </div>
                  ) : (
                    recentLeads.map((l) => (
                      <DropdownMenuItem key={l.id} asChild className="rounded-xl cursor-pointer p-2 m-1">
                        <a href="/admin/leads" className="flex items-start gap-3 w-full">
                          <div className="w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center shrink-0 shadow-sm text-foreground font-bold text-xs">
                            {l.name?.[0]?.toUpperCase() || "?"}
                          </div>
                          <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-sm truncate">{l.name}</span>
                              <span className="text-[10px] text-muted-foreground shrink-0 opacity-70">
                                {new Date(l.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground truncate">{l.email}</span>
                          </div>
                        </a>
                      </DropdownMenuItem>
                    ))
                  )}
                  {recentLeads.length > 0 && (
                    <>
                      <DropdownMenuSeparator className="bg-foreground/5" />
                      <DropdownMenuItem asChild className="rounded-xl cursor-pointer m-1 text-center justify-center text-accent hover:text-accent font-medium">
                        <a href="/admin/leads">View all notifications</a>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="h-5 w-px bg-foreground/10 mx-1 hidden sm:block" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="relative w-9 h-9 rounded-full bg-brand-gradient text-foreground text-sm font-bold flex items-center justify-center shadow-[0_0_20px_-5px_hsl(var(--accent)/0.6)] transition-transform hover:scale-105 active:scale-95 border border-foreground/10 shrink-0">
                    {user?.email?.[0].toUpperCase() ?? "A"}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl border-foreground/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-2">
                  <DropdownMenuLabel className="text-xs text-muted-foreground truncate">{user?.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-foreground/5" />
                  <DropdownMenuItem className="rounded-xl cursor-pointer" asChild><a href="/admin/change-password">Change Password</a></DropdownMenuItem>
                  <DropdownMenuItem className="rounded-xl cursor-pointer" asChild><a href="/admin/settings">Settings</a></DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
