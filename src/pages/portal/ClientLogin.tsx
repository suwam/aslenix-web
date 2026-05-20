import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const ClientLogin = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: `${window.location.origin}/portal`,
          data: { display_name: name },
        },
      });
      if (error) { toast.error(error.message); setLoading(false); return; }
      if (data.user) {
        await supabase.from("client_users").insert({
          user_id: data.user.id, email, full_name: name, status: "pending",
        });
      }
      toast.success("Account created. Awaiting admin approval.");
      navigate("/portal");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { toast.error(error.message); setLoading(false); return; }
      navigate("/portal");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="gradient-border glass rounded-3xl max-w-md w-full p-8">
        <div className="flex justify-center mb-6"><Logo /></div>
        <h1 className="text-2xl font-display font-semibold text-center mb-2">Client Portal</h1>
        <p className="text-center text-sm text-muted-foreground mb-6">{mode === "login" ? "Sign in to access your projects" : "Create your client account"}</p>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && <div><Label>Full name</Label><Input required value={name} onChange={(e) => setName(e.target.value)} /></div>}
          <div><Label>Email</Label><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><Label>Password</Label><Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} /></div>
          <Button type="submit" variant="hero" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}{mode === "login" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground mt-6">
          {mode === "login" ? (
            <>New client? <button onClick={() => setMode("signup")} className="text-accent hover:underline">Request access</button></>
          ) : (
            <>Already have an account? <button onClick={() => setMode("login")} className="text-accent hover:underline">Sign in</button></>
          )}
        </div>
        <div className="text-center text-xs text-muted-foreground mt-4">
          <Link to="/" className="hover:text-foreground">← Back to website</Link>
        </div>
      </div>
    </div>
  );
};
export default ClientLogin;
