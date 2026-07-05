import { ArrowRight, Megaphone, Sparkles } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type AnnouncementPopupProps = {
  popup: {
    id: string;
    message: string;
    link?: string | null;
    link_text?: string | null;
    poster_url?: string | null;
  };
  onClose: () => void;
};

export const AnnouncementPopup = ({ popup, onClose }: AnnouncementPopupProps) => (
  <Dialog open={!!popup} onOpenChange={(open) => !open && onClose()}>
    <DialogContent className="max-w-xl overflow-hidden border-foreground/10 bg-[#0c0b12]/95 p-0 text-foreground shadow-[0_30px_120px_-35px_rgba(255,45,146,0.55)] backdrop-blur-2xl [&>button]:right-5 [&>button]:top-5 [&>button]:z-20 [&>button]:flex [&>button]:h-9 [&>button]:w-9 [&>button]:items-center [&>button]:justify-center [&>button]:rounded-full [&>button]:border [&>button]:border-foreground/10 [&>button]:bg-foreground/5 [&>button]:text-foreground/70 [&>button]:opacity-100 [&>button]:ring-offset-transparent [&>button]:transition [&>button:hover]:border-accent/50 [&>button:hover]:bg-foreground/10 [&>button:hover]:text-foreground">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,45,146,0.28),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.25),transparent_36%),linear-gradient(180deg,rgba(255,255,255,0.06),transparent_45%)]" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-accent/80 to-transparent" />
        <div className="pointer-events-none absolute inset-x-12 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />

        <div className="relative px-7 py-9 text-center sm:px-10 sm:py-11">
          {popup.poster_url ? (
            <div className="mx-auto mb-6 max-w-sm overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/30 shadow-[0_25px_80px_-40px_rgba(255,255,255,0.5)]">
              <img src={popup.poster_url} alt="" className="aspect-[1200/630] w-full object-cover" />
            </div>
          ) : (
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-brand-gradient shadow-[0_18px_55px_-18px_hsl(var(--accent)/0.9)] ring-1 ring-white/15">
              <Megaphone className="h-7 w-7 text-foreground" />
            </div>
          )}
          <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-foreground/60">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Announcement
          </div>
          <p className="mx-auto max-w-md text-balance font-display text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
            {popup.message}
          </p>
          {popup.link && (
            <a
              href={popup.link}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-foreground shadow-[0_18px_50px_-22px_hsl(var(--accent)/0.9)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_65px_-24px_hsl(var(--accent)/1)]"
            >
              {popup.link_text ?? "Learn more"}
              <ArrowRight className="h-4 w-4" />
            </a>
          )}
        </div>
      </div>
    </DialogContent>
  </Dialog>
);
