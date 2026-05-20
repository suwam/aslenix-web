import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { ArrowRight, Sparkles, X, Megaphone } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type Ann = {
  id: string;
  message: string;
  type: "banner" | "popup";
  link?: string | null;
  link_text?: string | null;
  poster_url?: string | null;
  dismissible: boolean;
};

export const SiteAnnouncement = () => {
  const [banner, setBanner] = useState<Ann | null>(null);
  const [popup, setPopup] = useState<Ann | null>(null);
  const [closedPopups, setClosedPopups] = useState<Set<string>>(() => new Set());

  const announcements = useSupabaseRealtime<Ann[]>(
    async () => {
      const { data } = await supabase.from("announcements").select("id,message,type,link,link_text,poster_url,dismissible,active")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(10);
      return (data ?? []) as Ann[];
    },
    ["announcements"],
    [],
  ) ?? [];

  useEffect(() => {
    const list = announcements;
    const b = list.find((a) => a.type === "banner" && !sessionStorage.getItem(`ann-${a.id}`));
    const p = list.find((a) => a.type === "popup" && !closedPopups.has(a.id));
    setBanner(b ?? null);
    setPopup(p ?? null);
  }, [announcements, closedPopups]);

  const dismiss = (a: Ann, setter: (v: any) => void) => {
    sessionStorage.setItem(`ann-${a.id}`, "1"); setter(null);
  };

  const dismissPopup = (a: Ann) => {
    setClosedPopups((prev) => new Set(prev).add(a.id));
    setPopup(null);
  };

  return (
    <>
      {banner && (
        <div className="sticky top-0 z-[60] bg-brand-gradient text-white text-sm">
          <div className="container flex items-center justify-center gap-3 py-2 text-center">
            <Megaphone className="w-4 h-4 shrink-0" />
            <span>{banner.message}</span>
            {banner.link && <a href={banner.link} className="underline font-medium">{banner.link_text ?? "Learn more"}</a>}
            {banner.dismissible && <button onClick={() => dismiss(banner, setBanner)} className="ml-2 opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>}
          </div>
        </div>
      )}
      {popup && (
        <Dialog open={!!popup} onOpenChange={(o) => !o && dismissPopup(popup)}>
          <DialogContent className="max-w-xl overflow-hidden border-white/10 bg-[#0c0b12]/95 p-0 text-white shadow-[0_30px_120px_-35px_rgba(255,45,146,0.55)] backdrop-blur-2xl [&>button]:right-5 [&>button]:top-5 [&>button]:z-20 [&>button]:flex [&>button]:h-9 [&>button]:w-9 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:border [&>button]:border-white/10 [&>button]:bg-white/5 [&>button]:text-white/70 [&>button]:opacity-100 [&>button]:ring-offset-transparent [&>button]:transition [&>button:hover]:border-accent/50 [&>button:hover]:bg-white/10 [&>button:hover]:text-white">
            <div className="relative">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,45,146,0.28),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.25),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_45%)]" />
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-accent/80 to-transparent" />
              <div className="pointer-events-none absolute inset-x-12 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />

              <div className="relative px-7 py-9 text-center sm:px-10 sm:py-11">
                {popup.poster_url ? (
                  <div className="mx-auto mb-6 max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-[0_25px_80px_-40px_rgba(255,255,255,0.5)]">
                    <img src={popup.poster_url} alt="" className="aspect-[1200/630] w-full object-cover" />
                  </div>
                ) : (
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-brand-gradient shadow-[0_18px_55px_-18px_hsl(var(--accent)/0.9)] ring-1 ring-white/15">
                    <Megaphone className="h-7 w-7 text-white" />
                  </div>
                )}
                <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-white/60">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                  Announcement
                </div>
                <p className="mx-auto max-w-md text-balance font-display text-2xl font-semibold leading-tight text-white sm:text-3xl">
                  {popup.message}
                </p>
                {popup.link && (
                  <a
                    href={popup.link}
                    className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-[0_18px_50px_-22px_hsl(var(--accent)/0.9)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_65px_-24px_hsl(var(--accent)/1)]"
                  >
                    {popup.link_text ?? "Learn more"}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};
