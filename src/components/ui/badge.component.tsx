import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/utils/class-name.util";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-emerald-500 text-white hover:bg-emerald-600",
        secondary:
          "border-transparent bg-violet-100 text-violet-800 hover:bg-violet-200",
        destructive:
          "border-transparent bg-red-500 text-white hover:bg-red-600",
        outline: "text-emerald-700 border-emerald-200",
        green:
          "border-transparent bg-green-100 text-green-800 hover:bg-green-200",
        blue: "border-transparent bg-sky-100 text-sky-800 hover:bg-sky-200",
        red: "border-transparent bg-red-100 text-red-800 hover:bg-red-200",
        yellow:
          "border-transparent bg-amber-100 text-amber-800 hover:bg-amber-200",
        purple:
          "border-transparent bg-fuchsia-100 text-fuchsia-800 hover:bg-fuchsia-200",
        pink: "border-transparent bg-pink-100 text-pink-800 hover:bg-pink-200",
        indigo:
          "border-transparent bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
        teal: "border-transparent bg-teal-100 text-teal-800 hover:bg-teal-200",
        orange:
          "border-transparent bg-orange-100 text-orange-800 hover:bg-orange-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
