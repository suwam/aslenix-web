import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { Eye, EyeOff, KeyRound, Loader2, Lock, ShieldCheck } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const schema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(128, "Password is too long"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((d) => d.currentPassword !== d.newPassword, {
    message: "New password must differ from current password",
    path: ["newPassword"],
  });

const AdminChangePassword = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = schema.safeParse({ currentPassword, newPassword, confirmPassword });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    if (!user?.email) {
      setError("Session expired. Please log in again.");
      return;
    }

    setSubmitting(true);

    // Re-verify current password by attempting a sign-in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: parsed.data.currentPassword,
    });

    if (verifyError) {
      setSubmitting(false);
      setError("Current password is incorrect.");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: parsed.data.newPassword,
    });
    setSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast({
      title: "Password updated",
      description: "Your admin password has been changed successfully.",
    });
  };

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-xl mx-auto"
      >
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-foreground/10 mb-4">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
              Account Security
            </span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">
            Change <span className="bg-brand-gradient bg-clip-text text-transparent">Password</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Use a strong password with at least 8 characters.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 md:p-8 border border-foreground/10 space-y-5">
          {[
            { id: "current", label: "Current password", value: currentPassword, setter: setCurrentPassword, autoComplete: "current-password" },
            { id: "new", label: "New password", value: newPassword, setter: setNewPassword, autoComplete: "new-password" },
            { id: "confirm", label: "Confirm new password", value: confirmPassword, setter: setConfirmPassword, autoComplete: "new-password" },
          ].map((f) => (
            <div key={f.id} className="space-y-2">
              <Label htmlFor={f.id} className="text-foreground/90">{f.label}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id={f.id}
                  type={show ? "text" : "password"}
                  autoComplete={f.autoComplete}
                  value={f.value}
                  onChange={(e) => f.setter(e.target.value)}
                  className="pl-10 pr-10 h-11 bg-background/40 border-foreground/10 focus-visible:ring-accent"
                  required
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {show ? "Hide passwords" : "Show passwords"}
          </button>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg p-3"
            >
              {error}
            </motion.div>
          )}

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
            ) : (
              <><KeyRound className="w-4 h-4" /> Update Password</>
            )}
          </Button>
        </form>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminChangePassword;
