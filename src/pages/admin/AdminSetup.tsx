import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { Loader2, Lock, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ADMIN_EMAIL } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { toast } from "@/hooks/use-toast";

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters").max(128),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

const AdminSetup = () => {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAuth();
  const [password, setPassword] = useState("aslenix3212");
  const [confirm, setConfirm] = useState("aslenix3212");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && isAdmin) navigate("/admin/dashboard", { replace: true });
  }, [isAdmin, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse({ password, confirm });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setSubmitting(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: ADMIN_EMAIL,
      password: parsed.data.password,
      options: { emailRedirectTo: `${window.location.origin}/admin/dashboard` },
    });
    setSubmitting(false);

    if (signUpError) {
      if (signUpError.message.toLowerCase().includes("registered") || signUpError.message.toLowerCase().includes("exists")) {
        setError("Admin account already exists. Please sign in instead.");
      } else {
        setError(signUpError.message);
      }
      return;
    }

    if (data.session) {
      toast({ title: "Admin account created", description: "Welcome to ASLENIX." });
      navigate("/admin/dashboard", { replace: true });
    } else {
      toast({ title: "Admin account created", description: "You can now sign in." });
      navigate("/admin/login", { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-accent/20 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="glass rounded-3xl p-8 md:p-10 border border-white/10">
          <div className="flex flex-col items-center mb-8">
            <Logo />
            <div className="mt-6 flex items-center gap-2 px-3 py-1 rounded-full glass border border-white/10">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
                One-Time Setup
              </span>
            </div>
            <h1 className="mt-5 font-display text-3xl font-bold text-center bg-brand-gradient bg-clip-text text-transparent">
              Create Admin Account
            </h1>
            <p className="mt-2 text-sm text-muted-foreground text-center">
              This page is only used once to provision the single admin account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Admin email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={ADMIN_EMAIL}
                  readOnly
                  disabled
                  className="pl-10 h-11 bg-background/40 border-white/10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Initial password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-11 bg-background/40 border-white/10 focus-visible:ring-accent"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Default is the configured admin password — please change it from the admin panel after first login.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="pl-10 h-11 bg-background/40 border-white/10 focus-visible:ring-accent"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                {error}
              </div>
            )}

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><ShieldCheck className="w-4 h-4" /> Create Admin Account</>}
            </Button>

            <Link to="/admin/login" className="block text-center text-sm text-muted-foreground hover:text-foreground">
              Already set up? Go to login →
            </Link>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSetup;
