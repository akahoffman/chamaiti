import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Material 3 — filled
        default: "bg-primary text-primary-foreground shadow-elev-1 hover:shadow-elev-2 hover:brightness-110",
        // Material 3 — tonal
        tonal:
          "bg-primary-container text-primary-container-foreground hover:shadow-elev-1 hover:brightness-110",
        destructive:
          "bg-destructive text-destructive-foreground shadow-elev-1 hover:brightness-110",
        // Material 3 — outlined
        outline: "border border-outline bg-transparent text-foreground hover:bg-surface-3",
        secondary: "bg-surface-3 text-foreground hover:bg-surface-4",
        // Material 3 — text
        ghost: "text-foreground hover:bg-surface-3",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
        fab: "h-14 px-6 rounded-2xl text-base shadow-elev-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
