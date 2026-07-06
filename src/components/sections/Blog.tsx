import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { motion } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Post = { id: string; title: string; excerpt: string | null; category: string | null; published_at: string | null; featured_image: string | null };

const gradients = ["from-secondary/30 to-accent/30", "from-accent/30 to-primary/30", "from-primary/30 to-secondary/30"];

export const Blog = () => {
  const posts = useSupabaseRealtime<Post[]>(
    async () => {
      const { data } = await supabase.from("blogs").select("id,title,excerpt,category,published_at,featured_image")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(3);
      return (data ?? []) as Post[];
    },
    ["blogs"],
    [],
  );

  const isLoading = posts === null;
  const activePosts = posts ?? [];
  return (
    <section id="blog" className="py-24 sm:py-32 relative">
      <div className="container">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-block px-3 py-1 glass rounded-full text-xs font-medium text-accent mb-6">INSIGHTS</div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
              From the <span className="text-gradient">ASLENIX journal</span>
            </h2>
          </motion.div>
          <a href="#" className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline">
            All articles <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="gradient-border glass rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[16/10] bg-muted/50"></div>
                <div className="p-6">
                  <div className="h-4 w-24 bg-muted/50 rounded mb-4"></div>
                  <div className="h-6 w-3/4 bg-muted/50 rounded mb-4"></div>
                  <div className="h-4 w-full bg-muted/50 rounded mb-2"></div>
                  <div className="h-4 w-5/6 bg-muted/50 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activePosts.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">No published posts yet.</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {activePosts.map((post, i) => (
              <motion.article key={post.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group gradient-border glass rounded-2xl overflow-hidden glow-hover cursor-pointer">
                <div className={`relative aspect-[16/10] bg-gradient-to-br ${gradients[i % 3]} overflow-hidden`}>
                  {post.featured_image && <img src={post.featured_image} alt={post.title} loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />}
                  <div className="absolute inset-0 grid-pattern opacity-40" />
                  {post.category && <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full glass text-xs font-medium">{post.category}</div>}
                </div>
                <div className="p-6">
                  {post.published_at && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.published_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
                    </div>
                  )}
                  <h3 className="font-display text-xl font-semibold mb-3 leading-snug group-hover:text-gradient transition-all">{post.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{post.excerpt}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-accent">
                    Read more <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
