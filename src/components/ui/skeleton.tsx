import * as React from "react"

import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      role="presentation"
      className={cn("animate-pulse rounded-md bg-slate-200", className)}
      {...props}
    />
  )
}
