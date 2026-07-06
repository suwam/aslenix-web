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
  );

  const isLoading = team === null;
  const activeTeam = team ?? [];

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
            <div className="inline-block px-4 py-1.5 border border-slate-200 bg-white rounded-full text-xs font-bold tracking-wider text-slate-900 shadow-sm mb-6 uppercase">
              ABOUT ASLENIX
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight mb-6 text-slate-900">
              A modern technology studio building the <span className="text-slate-500 italic font-medium">future of digital</span>
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-5">
              ASLENIX is a Nepal-born digital company crafting websites, mobile apps,
              custom software, brand identities, and AI-powered solutions for
              ambitious teams worldwide.
            </p>
            <p className="text-slate-500 leading-relaxed mb-5">
              We blend strategy, design, and engineering into one seamless studio —
              shipping products that look stunning, perform beautifully, and grow with
              your business.
            </p>
            <p className="text-slate-500 leading-relaxed mb-5">
              Our technological arsenal is built on modern, scalable foundations. We leverage the power of industry-leading frameworks to build lightning-fast interfaces, while engineering robust cloud infrastructures designed to handle enterprise-level traffic without breaking a sweat.
            </p>
            <p className="text-slate-500 leading-relaxed">
              Beyond traditional software, our proprietary AI and automation solutions empower businesses to optimize their workflows, uncover data-driven insights, and stay miles ahead of the competition in an increasingly automated world.
            </p>
          </motion.div>

          <div className="space-y-4">
            {pillars.map((p, i) => {
              const colors = [
                { name: "green", bgHover: "hover:shadow-emerald-500/10", gradient: "from-emerald-500/10", iconBox: "border-emerald-500/20", text: "text-emerald-500" },
                { name: "rose", bgHover: "hover:shadow-rose-500/10", gradient: "from-rose-500/10", iconBox: "border-rose-500/20", text: "text-rose-500" },
                { name: "blue", bgHover: "hover:shadow-blue-500/10", gradient: "from-blue-500/10", iconBox: "border-blue-500/20", text: "text-blue-500" },
              ];
              const theme = colors[i % colors.length];
              return (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`group relative bg-white rounded-2xl p-7 text-left w-full border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:-translate-y-1 transition-all duration-300 ${theme.bgHover} overflow-hidden`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} to-transparent pointer-events-none opacity-60`} />
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-5">
                      <div className={`w-12 h-12 rounded-xl bg-white border ${theme.iconBox} flex items-center justify-center transition-transform group-hover:scale-105 duration-300 shadow-sm`}>
                        <p.icon className={`h-5 w-5 ${theme.text}`} />
                      </div>
                      <div className={`text-[10px] font-bold tracking-widest uppercase ${theme.text} opacity-80 mt-1`}>
                        CORE
                      </div>
                    </div>
                    <h3 className="text-xl font-bold font-sans text-slate-900 mb-1">{p.title}</h3>
                    <div className={`text-sm font-semibold ${theme.text} mb-3`}>Our Identity</div>
                    <p className="text-[13px] text-slate-500 leading-relaxed mb-1">{p.text}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="mt-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold tracking-wide text-slate-900 shadow-sm uppercase">
                <Users className="w-4 h-4 text-slate-900" />
                Team & Leadership
              </div>
              <h3 className="font-display text-3xl sm:text-4xl font-bold mt-6 text-slate-900">
                Built by focused digital leaders, designers, and engineers.
              </h3>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              United by a shared passion for innovation, our experts bring together world-class experience in design, engineering, and strategy to build digital solutions that redefine industry standards and drive measurable growth.
            </p>
          </div>

          {isLoading ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-7 flex flex-col items-center w-full border border-slate-100 shadow-sm animate-pulse">
                  <div className="w-full flex justify-end mb-2">
                    <div className="h-3 w-16 bg-slate-200 rounded"></div>
                  </div>
                  <div className="mb-6 mt-2 h-32 w-32 rounded-2xl bg-slate-200"></div>
                  <div className="h-5 w-32 bg-slate-200 rounded mb-2"></div>
                  <div className="h-3 w-24 bg-slate-200 rounded mb-4"></div>
                  <div className="h-3 w-full bg-slate-200 rounded mb-1"></div>
                  <div className="h-3 w-4/5 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : activeTeam.length > 0 ? (
            <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {activeTeam.map((member, i) => {
                const colors = [
                  { name: "cyan", bgHover: "hover:shadow-cyan-500/10", gradient: "from-cyan-500/10", iconBox: "border-cyan-500/20", text: "text-cyan-500" },
                  { name: "amber", bgHover: "hover:shadow-amber-500/10", gradient: "from-amber-500/10", iconBox: "border-amber-500/20", text: "text-amber-500" },
                  { name: "purple", bgHover: "hover:shadow-purple-500/10", gradient: "from-purple-500/10", iconBox: "border-purple-500/20", text: "text-purple-500" },
                  { name: "indigo", bgHover: "hover:shadow-indigo-500/10", gradient: "from-indigo-500/10", iconBox: "border-indigo-500/20", text: "text-indigo-500" },
                  { name: "orange", bgHover: "hover:shadow-orange-500/10", gradient: "from-orange-500/10", iconBox: "border-orange-500/20", text: "text-orange-500" },
                ];
                const theme = colors[i % colors.length];
                return (
                  <div key={member.id} className={`group relative bg-white rounded-2xl p-7 text-center flex flex-col items-center w-full border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:-translate-y-1 transition-all duration-300 ${theme.bgHover} overflow-hidden`}>
                    <div className={`absolute inset-0 bg-gradient-to-b ${theme.gradient} to-transparent pointer-events-none opacity-60`} />
                    
                    <div className="relative z-10 w-full flex flex-col items-center">
                      <div className="w-full flex justify-end mb-2">
                        <div className={`text-[10px] font-bold tracking-widest uppercase ${theme.text} opacity-80 mt-1`}>
                          LEADERSHIP
                        </div>
                      </div>
                      
                      <div className="mb-6 mt-2 relative">
                        {member.photo_url ? (
                          <img src={member.photo_url} alt={member.name} loading="lazy" decoding="async" className={`h-32 w-32 rounded-2xl object-cover border-2 border-white shadow-md mx-auto transition-transform group-hover:scale-105 duration-500 ring-2 ring-slate-50`} />
                        ) : (
                          <div className={`flex h-32 w-32 items-center justify-center rounded-2xl bg-white border-2 border-white shadow-md mx-auto text-4xl font-bold ${theme.text} transition-transform group-hover:scale-105 duration-500 ring-2 ring-slate-50`}>
                            {member.name
                              .split(" ")
                              .map((part) => part[0])
                              .slice(0, 2)
                              .join("")}
                          </div>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold font-sans text-slate-900 mb-1">{member.name}</h3>
                      <div className={`text-sm font-semibold ${theme.text} mb-3 uppercase tracking-wider text-[11px]`}>{member.role}</div>
                      <p className="text-[13px] leading-relaxed text-slate-500 mb-1 max-w-[90%] mx-auto">{member.bio || "Experienced digital specialist focused on building premium product experiences."}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-12 rounded-3xl border border-slate-200 bg-white shadow-sm p-12 text-center text-sm font-medium text-slate-500">
              Team details will appear here once added through the admin panel.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
