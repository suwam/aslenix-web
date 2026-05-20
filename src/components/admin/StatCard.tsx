import { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: number | string;
  icon: LucideIcon;
  hint?: string;
  accent?: "pink" | "blue" | "magenta";
};

export const StatCard = ({ label, value, icon: Icon, hint, accent = "magenta" }: Props) => {
  const ring = {
    pink: "from-secondary/30 to-secondary/0",
    blue: "from-primary/30 to-primary/0",
    magenta: "from-accent/30 to-accent/0",
  }[accent];

  return (
    <div className="relative gradient-border glass rounded-2xl p-6 overflow-hidden glow-hover">
      <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-br ${ring} blur-2xl pointer-events-none`} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{label}</div>
          <div className="font-display text-4xl font-bold">{value}</div>
          {hint && <div className="text-xs text-muted-foreground mt-2">{hint}</div>}
        </div>
        <div className="w-11 h-11 rounded-xl bg-brand-gradient flex items-center justify-center shadow-[0_0_24px_-4px_hsl(var(--accent)/0.5)]">
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
};
