import { memo } from "react";
import logo from "@/assets/new-logo.png";

interface LogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

export const Logo = memo(({ className = "h-16 w-16", showText = true, textClassName = "text-gradient" }: LogoProps) => {
  return (
    <a href="#home" className="flex items-center gap-3 group">
      <img
        src={logo}
        alt="ASLENIX logo"
        className={`${className} object-contain transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110 drop-shadow-[0_0_18px_hsl(var(--accent)/0.5)]`}
        width={64}
        height={64}
        loading="eager"
        decoding="async"
      />
      {showText && (
        <div className={`flex flex-col items-center justify-center pt-1 ${textClassName}`}>
          <span className="font-display font-bold tracking-[0.4em] text-xl sm:text-2xl leading-none pl-[0.4em]">
            ASLENIX
          </span>
          <span className="font-sans font-bold tracking-[0.3em] text-[8px] sm:text-[9px] uppercase text-slate-800 mt-2 leading-none pl-[0.3em]">
            TECH & SOLUTION
          </span>
        </div>
      )}
    </a>
  );
});

Logo.displayName = "Logo";
