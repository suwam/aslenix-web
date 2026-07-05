import { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  hint?: string;
};

export const StatCard = ({ label, value, icon: Icon, hint }: Props) => {
  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-foreground/10 bg-background/60 p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-accent/30 backdrop-blur-xl">
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-brand-gradient/0 via-brand-gradient/10 to-brand-gradient/0 opacity-0 transition-all duration-700 group-hover:translate-x-full group-hover:opacity-100" />
      <div className="absolute inset-0 bg-brand-gradient opacity-0 transition-opacity duration-500 group-hover:opacity-[0.03]" />
      
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">{label}</div>
          <div className="font-display text-5xl font-bold tracking-tight text-foreground">{value}</div>
          {hint && <div className="text-sm font-medium text-accent mt-3">{hint}</div>}
        </div>
        <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-foreground/5 border border-foreground/10 text-foreground shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-brand-gradient group-hover:border-transparent group-hover:text-foreground group-hover:shadow-[0_0_30px_-5px_hsl(var(--accent)/0.6)]">
          <Icon className="h-6 w-6 transition-colors duration-500" />
        </div>
      </div>
    </div>
  );
};
