import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-slate-900 text-white hover:bg-slate-900/90",
        secondary: "border-transparent bg-slate-100 text-slate-700 hover:bg-slate-100/80",
        success: "border-transparent bg-emerald-100 text-emerald-700",
        info: "border-transparent bg-sky-100 text-sky-700",
        warning: "border-transparent bg-amber-100 text-amber-700",
        outline: "text-slate-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

Badge.displayName = "Badge"

export { Badge, badgeVariants }
