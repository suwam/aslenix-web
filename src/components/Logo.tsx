import { memo } from "react";
import logo from "@/assets/aslenix-logo.webp";

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo = memo(({ className = "h-10 w-10", showText = true }: LogoProps) => {
  return (
    <a href="#home" className="flex items-center gap-2 group">
      <img
        src={logo}
        alt="ASLENIX logo"
        className={`${className} object-contain transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110 drop-shadow-[0_0_18px_hsl(var(--accent)/0.5)]`}
        width={40}
        height={40}
        loading="eager"
        decoding="async"
      />
      {showText && (
        <span className="font-display font-bold tracking-tight text-lg sm:text-xl text-gradient">
          ASLENIX
        </span>
      )}
    </a>
  );
});

Logo.displayName = "Logo";
