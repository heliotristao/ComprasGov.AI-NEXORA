import Link from "next/link"
import type { LucideIcon } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface DashboardCardProps {
  title: string
  value: string
  icon: LucideIcon
  href?: string
}

export function DashboardCard({ title, value, icon: Icon, href }: DashboardCardProps) {
  const card = (
    <Card
      className={cn(
        "border-slate-200 transition-transform duration-200",
        href &&
          "cursor-pointer group-hover:-translate-y-1 group-hover:shadow-lg group-focus-visible:-translate-y-1 group-focus-visible:shadow-lg"
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
        <Icon className="h-5 w-5 text-slate-400" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold text-slate-900">{value}</p>
      </CardContent>
    </Card>
  )

  if (!href) {
    return card
  }

  return (
    <Link
      href={href}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
    >
      {card}
    </Link>
  )
}
