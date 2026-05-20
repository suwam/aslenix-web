import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { logActivity } from "@/lib/activity";

const AdminSettings = () => {
  const [s, setS] = useState<any>({ social_links: {} });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("site_settings").select("*").eq("id", 1).maybeSingle().then(({ data }) => {
      if (data) setS({ ...data, social_links: data.social_links ?? {} });
    });
  }, []);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("site_settings").update({
      company_name: s.company_name, logo_url: s.logo_url, email: s.email,
      phone: s.phone, website: s.website, address: s.address,
      social_links: s.social_links, footer_text: s.footer_text,
    }).eq("id", 1);
    setSaving(false);
    if (error) return toast.error(error.message);
    await logActivity("Updated site settings", "settings", "1");
    toast.success("Saved");
  };

  const setSocial = (k: string, v: string) =>
    setS({ ...s, social_links: { ...(s.social_links ?? {}), [k]: v } });

  return (
    <AdminShell title="Settings" actions={
      <Button variant="hero" size="sm" disabled={saving} onClick={save}>{saving ? "Saving…" : "Save changes"}</Button>
    }>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 gradient-border glass rounded-2xl p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold mb-2">Company info</h2>
          <Field label="Company name"><Input value={s.company_name ?? ""} onChange={(e) => setS({ ...s, company_name: e.target.value })} /></Field>
          <Field label="Email"><Input value={s.email ?? ""} onChange={(e) => setS({ ...s, email: e.target.value })} /></Field>
          <Field label="Phone"><Input value={s.phone ?? ""} onChange={(e) => setS({ ...s, phone: e.target.value })} /></Field>
          <Field label="Website"><Input value={s.website ?? ""} onChange={(e) => setS({ ...s, website: e.target.value })} /></Field>
          <Field label="Address"><Input value={s.address ?? ""} onChange={(e) => setS({ ...s, address: e.target.value })} /></Field>
          <Field label="Footer text"><Textarea rows={2} value={s.footer_text ?? ""} onChange={(e) => setS({ ...s, footer_text: e.target.value })} /></Field>
        </div>
        <div className="space-y-4">
          <div className="gradient-border glass rounded-2xl p-6">
            <MediaPicker label="Logo" value={s.logo_url} cropAspect={null} onChange={(v) => setS({ ...s, logo_url: v })} />
          </div>
          <div className="gradient-border glass rounded-2xl p-6 space-y-3">
            <h3 className="font-medium">Social links</h3>
            {["facebook", "twitter", "instagram", "linkedin", "github"].map((k) => (
              <Field key={k} label={k[0].toUpperCase() + k.slice(1)}>
                <Input value={s.social_links?.[k] ?? ""} onChange={(e) => setSocial(k, e.target.value)} placeholder="https://…" />
              </Field>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
};
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5"><label className="text-sm font-medium">{label}</label>{children}</div>
);
export default AdminSettings;
