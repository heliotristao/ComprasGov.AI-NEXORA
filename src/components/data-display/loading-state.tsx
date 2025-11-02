import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string
  size?: "sm" | "md" | "lg"
}

export function LoadingState({
  text = "Carregando...",
  size = "md",
  className,
  ...props
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 p-12",
        className
      )}
      {...props}
    >
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {text && <p className="text-body-small text-muted-foreground">{text}</p>}
    </div>
  )
}

// Skeleton Loader Components
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="space-y-3 rounded-lg border p-6">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
      <Skeleton className="h-16 w-full" />
    </div>
  )
}
