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
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-block px-4 py-1.5 border border-slate-200 bg-white rounded-full text-xs font-bold tracking-wider text-slate-900 shadow-sm mb-6 uppercase">
            GET IN TOUCH
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight mb-6 text-slate-900">
            Let's build <span className="text-slate-500 italic font-medium">something legendary</span>
          </h2>
          <p className="text-slate-600 text-lg">
            Tell us about your project. We respond within 24 hours.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {/* Left Column: Form & Socials */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onSubmit={submit}
              className="bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-3xl p-8 sm:p-10 space-y-6"
            >
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-bold text-slate-900 mb-2 block">Name</label>
                  <Input
                    required
                    maxLength={100}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-slate-900 focus-visible:border-slate-900 transition-colors"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-900 mb-2 block">Email</label>
                  <Input
                    required
                    type="email"
                    maxLength={255}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-slate-900 focus-visible:border-slate-900 transition-colors"
                    placeholder="you@company.com"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-900 mb-2 block">Phone</label>
                <Input
                  required
                  maxLength={30}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-slate-900 focus-visible:border-slate-900 transition-colors"
                  placeholder="+977 ..."
                />
              </div>
              <div>
                <label className="text-sm font-bold text-slate-900 mb-2 block">Message</label>
                <Textarea
                  required
                  maxLength={1000}
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="bg-slate-50 border-slate-200 focus-visible:ring-slate-900 focus-visible:border-slate-900 resize-none transition-colors"
                  placeholder="Tell us about your project, timeline, and goals..."
                />
              </div>
              <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto bg-slate-900 text-white hover:bg-slate-800 rounded-full h-12 px-8 font-medium transition-colors">
                {loading ? "Sending..." : (<>Send Message <Send className="ml-2 h-4 w-4" /></>)}
              </Button>
            </motion.form>

            {settings === null ? (
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div className="h-2 w-16 bg-slate-200 rounded mb-5 animate-pulse"></div>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-11 h-11 rounded-xl bg-slate-100 animate-pulse border border-slate-200"></div>
                  ))}
                </div>
              </div>
            ) : socials.length > 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Follow Us</div>
                <div className="flex gap-3">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300"
                    >
                      <s.icon className="h-4.5 w-4.5" />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Right Column: Main Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {contactInfo.slice(0, 2).map((c, i) => {
              const colors = [
                { name: "indigo", bgHover: "hover:shadow-indigo-500/10", gradient: "from-indigo-500/10", iconBox: "border-indigo-500/20", text: "text-indigo-500" },
                { name: "emerald", bgHover: "hover:shadow-emerald-500/10", gradient: "from-emerald-500/10", iconBox: "border-emerald-500/20", text: "text-emerald-500" },
              ];
              const theme = colors[i % colors.length];
              return (
                <a
                  key={c.label}
                  href={c.href}
                  className={`block relative bg-white rounded-2xl p-7 text-left w-full border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:-translate-y-1 transition-all duration-300 group overflow-hidden ${theme.bgHover}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} to-transparent pointer-events-none opacity-60`} />
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-5">
                      <div className={`w-12 h-12 rounded-xl bg-white border ${theme.iconBox} flex items-center justify-center transition-transform group-hover:scale-105 duration-300 shadow-sm`}>
                        <c.icon className={`h-5 w-5 ${theme.text}`} />
                      </div>
                      <div className={`text-[10px] font-bold tracking-widest uppercase ${theme.text} opacity-80 mt-1`}>CONTACT</div>
                    </div>
                    <h3 className="text-xl font-bold font-sans text-slate-900 mb-1">{c.label}</h3>
                    <div className={`text-sm font-semibold ${theme.text} mb-3`}>Reach out</div>
                    <p className="text-[13px] text-slate-500 leading-relaxed mb-1">{c.value}</p>
                  </div>
                </a>
              );
            })}

            <div className="grid sm:grid-cols-2 gap-6">
              {contactInfo.slice(2, 4).map((c, i) => {
                const colors = [
                  { name: "blue", bgHover: "hover:shadow-blue-500/10", gradient: "from-blue-500/10", iconBox: "border-blue-500/20", text: "text-blue-500" },
                  { name: "green", bgHover: "hover:shadow-green-500/10", gradient: "from-green-500/10", iconBox: "border-green-500/20", text: "text-green-500" },
                ];
                const theme = colors[i % colors.length];
                return (
                  <a
                    key={c.label}
                    href={c.href}
                    className={`block relative bg-white rounded-2xl p-6 text-left w-full border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:-translate-y-1 transition-all duration-300 group overflow-hidden ${theme.bgHover}`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} to-transparent pointer-events-none opacity-60`} />
                    <div className="relative z-10">
                      <div className="flex flex-col gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-white border ${theme.iconBox} flex items-center justify-center transition-transform group-hover:scale-105 duration-300 shadow-sm`}>
                          <c.icon className={`h-4 w-4 ${theme.text}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold font-sans text-slate-900 mb-0.5">{c.label}</h3>
                          <p className="text-[11px] text-slate-500 truncate">{c.value}</p>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
