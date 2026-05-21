import { Suspense, lazy, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { X, Megaphone } from "lucide-react";

const AnnouncementPopup = lazy(() =>
  import("@/components/AnnouncementPopup").then((module) => ({ default: module.AnnouncementPopup })),
);

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
        <Suspense fallback={null}>
          <AnnouncementPopup popup={popup} onClose={() => dismissPopup(popup)} />
        </Suspense>
      )}
    </>
  );
};
