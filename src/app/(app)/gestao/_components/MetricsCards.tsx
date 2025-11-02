"use client"

import { useMemo } from "react"
import { Activity, BarChart3, CheckCircle2, Gauge } from "lucide-react"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  type TooltipProps as RechartsTooltipProps,
} from "recharts"

import { MetricCard } from "@/components/data-display/metric-card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

import type { ProcessMetrics } from "../types"

interface MetricsCardsProps {
  metrics?: ProcessMetrics
  isLoading?: boolean
  isFetching?: boolean
}

interface SparklineProps {
  values?: number[]
  color: string
  gradientId: string
}

interface SparklinePoint {
  label: string
  value: number
}

interface SparklineTooltipData {
  value?: number
}

type SparklineTooltipProps = RechartsTooltipProps<number, string> & {
  color: string
  payload?: SparklineTooltipData[]
}

function normalizeValues(values?: number[]): SparklinePoint[] {
  if (!values || values.length === 0) {
    return []
  }

  return values.map((value, index) => ({
    label: `T${index + 1}`,
    value,
  }))
}

function Sparkline({ values, color, gradientId }: SparklineProps) {
  const data = useMemo(() => normalizeValues(values), [values])

  if (data.length === 0) {
    return (
      <div className="h-16 rounded-md border border-dashed border-slate-200 bg-slate-50/50 px-3 text-caption text-muted-foreground">
        Sem histórico suficiente para projeção.
      </div>
    )
  }

  return (
    <div className="h-16">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.28} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="value" stroke={color} fill={`url(#${gradientId})`} strokeWidth={2} />
          <RechartsTooltip content={<SparklineTooltip color={color} />} cursor={{ stroke: color, strokeDasharray: "4 4" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function SparklineTooltip({ active, payload = [], color }: SparklineTooltipProps) {
  if (!active || payload.length === 0) {
    return null
  }

  const datum = payload[0]
  const value = typeof datum?.value === "number" ? datum.value : null

  return (
    <div className="rounded-md border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
      <p className="text-caption font-semibold" style={{ color }}>
        {value ?? "—"}
      </p>
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-500">período</p>
    </div>
  )
}

export function MetricsCards({ metrics, isLoading = false, isFetching = false }: MetricsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-40 rounded-xl" />
        ))}
      </div>
    )
  }

  const activeProcesses = metrics?.activeProcesses ?? 0
  const pendingProcesses = metrics?.pendingProcesses ?? 0
  const averageSla = metrics?.averageSla ?? 0
  const approvalRate = metrics?.approvalRate ?? 0

  const activeTrend = metrics?.trend?.active
  const pendingTrend = metrics?.trend?.pending
  const slaTrend = metrics?.trend?.sla
  const approvalTrend = metrics?.trend?.approval

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        title="Processos Ativos"
        value={activeProcesses}
        description="Em acompanhamento neste momento"
        icon={Activity}
        iconColor="text-primary"
        iconBgColor="bg-primary/10"
        className={cn({ "ring-2 ring-primary/40": isFetching })}
      >
        <Sparkline values={activeTrend} color="#2563EB" gradientId="active-processes-trend" />
      </MetricCard>

      <MetricCard
        title="Processos Pendentes"
        value={pendingProcesses}
        description="Aguardando ação do responsável"
        icon={BarChart3}
        iconColor="text-amber-600"
        iconBgColor="bg-amber-100"
      >
        <Sparkline values={pendingTrend} color="#D97706" gradientId="pending-processes-trend" />
      </MetricCard>

      <MetricCard
        title="SLA médio"
        value={`${averageSla.toFixed(1)} dias`}
        description="Tempo médio de conclusão"
        icon={Gauge}
        iconColor="text-emerald-600"
        iconBgColor="bg-emerald-100"
      >
        <Sparkline values={slaTrend} color="#059669" gradientId="sla-trend" />
      </MetricCard>

      <MetricCard
        title="% Aprovados"
        value={formatPercentage(approvalRate)}
        description="Processos finalizados com aprovação"
        icon={CheckCircle2}
        iconColor="text-purple-600"
        iconBgColor="bg-purple-100"
      >
        <Sparkline values={approvalTrend} color="#7C3AED" gradientId="approval-trend" />
      </MetricCard>
    </div>
  )
}
