import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { KeyRound, LayoutDashboard, LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const nav = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/change-password", label: "Change Password", icon: KeyRound },
];

export const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Logged out", description: "You have been signed out securely." });
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="absolute top-0 -left-40 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] rounded-full bg-accent/10 blur-[140px] pointer-events-none" />

      <header className="relative z-10 border-b border-white/5 glass">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden md:flex items-center gap-1">
              {nav.map((n) => {
                const active = pathname === n.to;
                return (
                  <Link
                    key={n.to}
                    to={n.to}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      active
                        ? "bg-brand-gradient text-white shadow-[0_8px_24px_-8px_hsl(var(--accent)/0.6)]"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    <n.icon className="w-4 h-4" />
                    {n.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <Button variant="glass" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" /> Logout
          </Button>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden border-t border-white/5">
          <div className="container flex gap-1 py-2 overflow-x-auto">
            {nav.map((n) => {
              const active = pathname === n.to;
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    active
                      ? "bg-brand-gradient text-white"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <n.icon className="w-3.5 h-3.5" />
                  {n.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <main className="relative z-10 container py-10">{children}</main>
    </div>
  );
};
