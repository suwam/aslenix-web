import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-white/10 bg-background/80 text-foreground hover:bg-white/5 hover:border-accent/40 hover:text-white shadow-[0_0_18px_-5px_rgba(59,130,246,0.2)]",
        secondary: "bg-[#2b0b2f] text-white hover:bg-[#3d1d53] shadow-[0_15px_35px_-20px_rgba(255,79,216,0.35)]",
        ghost: "hover:bg-white/5 hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        hero: "relative bg-gradient-to-r from-[#ff2d92] via-[#d13bff] to-[#3b82f6] text-white shadow-[0_14px_50px_-16px_rgba(255,79,216,0.45)] hover:shadow-[0_20px_70px_-22px_rgba(255,79,216,0.55)] hover:-translate-y-0.5 hover:scale-[1.02] before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-[#ff2d92] before:via-[#d13bff] before:to-[#3b82f6] before:opacity-0 hover:before:opacity-80 before:blur-2xl before:-z-10 before:transition-opacity",
        glass: "glass border border-white/10 text-foreground hover:border-accent/40 hover:bg-white/5 hover:shadow-[0_0_30px_-5px_hsl(var(--accent)/0.4)]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-4",
        lg: "h-12 px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
