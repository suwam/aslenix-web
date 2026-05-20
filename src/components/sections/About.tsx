import { motion } from "framer-motion";
import { Target, Eye, Heart, Users } from "lucide-react";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { supabase } from "@/integrations/supabase/client";

type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio?: string | null;
  photo_url?: string | null;
  position: number;
  active: boolean;
};

const pillars = [
  {
    icon: Target,
    title: "Our Mission",
    text: "Empower brands and businesses to thrive in the digital era through innovative, scalable, and human-centric technology.",
  },
  {
    icon: Eye,
    title: "Our Vision",
    text: "To become South Asia's most trusted catalyst for digital transformation — bridging imagination with intelligent engineering.",
  },
  {
    icon: Heart,
    title: "Our Values",
    text: "Craft, clarity, and conviction. We obsess over detail, ship with confidence, and partner with our clients for the long run.",
  },
];

export const About = () => {
  const team = useSupabaseRealtime<TeamMember[]>(
    async () => {
      const { data } = await supabase
        .from("team_members")
        .select("*")
        .eq("active", true)
        .order("position", { ascending: true });
      return (data ?? []) as TeamMember[];
    },
    ["team_members"],
    [],
  ) ?? [];

  return (
    <section id="about" className="py-24 sm:py-32 relative">
      <div className="container">
        <div className="grid lg:grid-cols-[1fr_0.95fr] gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-block px-3 py-1 glass rounded-full text-xs font-medium text-accent mb-6">
              ABOUT ASLENIX
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight mb-6">
              A modern technology studio building the <span className="text-gradient">future of digital</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-4">
              ASLENIX is a Nepal-born digital company crafting websites, mobile apps,
              custom software, brand identities, and AI-powered solutions for
              ambitious teams worldwide.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We blend strategy, design, and engineering into one seamless studio —
              shipping products that look stunning, perform beautifully, and grow with
              your business.
            </p>
          </motion.div>

          <div className="space-y-4">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass gradient-border rounded-2xl p-6 glow-hover"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-brand-gradient flex items-center justify-center shadow-[0_0_30px_hsl(var(--accent)/0.4)]">
                    <p.icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-semibold mb-2">{p.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-muted-foreground">
                <Users className="w-4 h-4 text-accent" />
                Team & Leadership
              </div>
              <h3 className="font-display text-3xl sm:text-4xl font-bold mt-4">
                Built by focused digital leaders, designers, and engineers.
              </h3>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Every team member is chosen for deep product experience, technical craft,
              and a pragmatic approach to scaling modern businesses.
            </p>
          </div>

          {team.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {team.map((member) => (
                <div key={member.id} className="glass gradient-border rounded-3xl p-6 transition hover:-translate-y-1">
                  <div className="flex items-center gap-4 mb-5">
                    {member.photo_url ? (
                      <img src={member.photo_url} alt={member.name} className="h-16 w-16 rounded-3xl object-cover" />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/5 text-xl font-semibold text-white/90">
                        {member.name
                          .split(" ")
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                    )}
                    <div>
                      <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground/80">{member.role}</p>
                      <h4 className="text-xl font-semibold text-white">{member.name}</h4>
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{member.bio || "Experienced digital specialist focused on building premium product experiences."}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-sm text-muted-foreground">
              Team details will appear here once added through the admin panel.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
