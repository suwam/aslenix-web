import { useState } from "react";
import { z } from "zod";
import { motion } from "framer-motion";
import { Mail, Phone, Globe, Send, Github, Linkedin, Instagram, Twitter, MessageCircle, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";

const schema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(5, "Phone seems too short").max(30),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000),
});

const contactInfo = [
  { icon: Mail, label: "Email", value: "info.aslenix.np@gmail.com", href: "mailto:info.aslenix.np@gmail.com" },
  { icon: Phone, label: "Phone", value: "+977 9709043147", href: "tel:+9779709043147" },
  { icon: Globe, label: "Website", value: "www.aslenix.tech", href: "https://www.aslenix.tech" },
  { icon: MessageCircle, label: "WhatsApp", value: "Message us", href: "https://wa.me/message/JIZWD7OFCQVWK1" },
];

const socialDefinitions = [
  { icon: Facebook, key: "facebook", label: "Facebook" },
  { icon: Linkedin, key: "linkedin", label: "LinkedIn" },
  { icon: Instagram, key: "instagram", label: "Instagram" },
  { icon: Twitter, key: "twitter", label: "Twitter" },
  { icon: Github, key: "github", label: "GitHub" },
];

export const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const settings = useSupabaseRealtime<any>(
    async () => {
      const { data } = await supabase.from("site_settings").select("social_links").eq("id", 1).maybeSingle();
      return data ?? null;
    },
    ["site_settings"],
    [],
  );

  const socialLinks =
    settings?.social_links && typeof settings.social_links === "object" && !Array.isArray(settings.social_links)
      ? settings.social_links as Record<string, string>
      : {};
  const normalizeUrl = (url?: string | null) => {
    const trimmed = url?.trim();
    if (!trimmed) return "";
    if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };
  const socials = socialDefinitions
    .map((social) => ({ ...social, href: normalizeUrl(socialLinks[social.key]) }))
    .filter((social) => social.href);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("leads").insert({
      name: parsed.data.name, email: parsed.data.email,
      phone: parsed.data.phone, message: parsed.data.message,
      source: "website",
    });
    setLoading(false);
    if (error) { toast.error("Couldn't send your message. Please try again."); return; }
    toast.success("Message sent! We'll be in touch within 24 hours.");
    setForm({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <section id="contact" className="py-24 sm:py-32 relative">
      <div className="absolute inset-x-0 top-0 h-[500px] bg-brand-gradient opacity-[0.05] blur-[150px] -z-10" />
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-block px-3 py-1 glass rounded-full text-xs font-medium text-accent mb-6">
            GET IN TOUCH
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight mb-6">
            Let's build <span className="text-gradient">something legendary</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Tell us about your project. We respond within 24 hours.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={submit}
            className="lg:col-span-3 gradient-border glass rounded-3xl p-8 space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <Input
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="h-12 bg-muted/40 border-white/5 focus-visible:ring-accent"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Email</label>
                <Input
                  required
                  type="email"
                  maxLength={255}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="h-12 bg-muted/40 border-white/5 focus-visible:ring-accent"
                  placeholder="you@company.com"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Phone</label>
              <Input
                required
                maxLength={30}
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="h-12 bg-muted/40 border-white/5 focus-visible:ring-accent"
                placeholder="+977 ..."
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Message</label>
              <Textarea
                required
                maxLength={1000}
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="bg-muted/40 border-white/5 focus-visible:ring-accent resize-none"
                placeholder="Tell us about your project, timeline, and goals..."
              />
            </div>
            <Button type="submit" variant="hero" size="lg" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Sending..." : (<>Send Message <Send className="ml-1 h-4 w-4" /></>)}
            </Button>
          </motion.form>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-4"
          >
            {contactInfo.map((c) => (
              <a
                key={c.label}
                href={c.href}
                className="block gradient-border glass rounded-2xl p-5 glow-hover group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-brand-gradient flex items-center justify-center shadow-[0_0_20px_hsl(var(--accent)/0.35)]">
                    <c.icon className="h-4.5 w-4.5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">{c.label}</div>
                    <div className="font-medium group-hover:text-accent transition-colors">{c.value}</div>
                  </div>
                </div>
              </a>
            ))}

            {socials.length > 0 && (
              <div className="gradient-border glass rounded-2xl p-5">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Follow Us</div>
                <div className="flex gap-2">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="w-10 h-10 rounded-lg glass border border-white/5 flex items-center justify-center hover:bg-brand-gradient hover:border-transparent transition-all duration-300"
                    >
                      <s.icon className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
