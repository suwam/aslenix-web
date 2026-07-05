import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { ArrowLeft, Loader2, Mail, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ADMIN_EMAIL } from "@/lib/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";

const schema = z.string().trim().email("Invalid email address");

const AdminForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = schema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    if (parsed.data.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      // Don't reveal the admin email — just pretend it succeeded.
      setSent(true);
      return;
    }
    setSubmitting(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });
    setSubmitting(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">



      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="glass rounded-3xl p-8 md:p-10 border border-foreground/10">
          <div className="flex flex-col items-center mb-8">
            <Logo />
            <div className="mt-6 flex items-center gap-2 px-3 py-1 rounded-full glass border border-foreground/10">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
                Password Reset
              </span>
            </div>
            <h1 className="mt-5 font-display text-3xl font-bold text-center bg-brand-gradient bg-clip-text text-transparent">
              Forgot Password?
            </h1>
            <p className="mt-2 text-sm text-muted-foreground text-center">
              We'll send a reset link to your inbox.
            </p>
          </div>

          {sent ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                If an admin account matches that email, a password reset link has been sent.
                Check your inbox and spam folder.
              </p>
              <Button asChild variant="glass" className="w-full">
                <Link to="/admin/login"><ArrowLeft className="w-4 h-4" /> Back to login</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@aslenix.tech"
                    className="pl-10 h-11 bg-background/40 border-foreground/10 focus-visible:ring-accent"
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
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : "Send reset link"}
              </Button>

              <Link to="/admin/login" className="block text-center text-sm text-muted-foreground hover:text-foreground">
                ← Back to login
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminForgotPassword;
