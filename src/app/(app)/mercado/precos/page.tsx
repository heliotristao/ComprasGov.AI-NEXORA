"use client"

import { useMemo, useState, type ReactElement } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Customized,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps
} from "recharts"
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Filter,
  Loader2,
  MapPin,
  RefreshCcw,
  Search
} from "lucide-react"

import withAuth from "@/components/auth/withAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DateRangePicker, type DateRangeValue } from "@/components/ui/date-range-picker"
import { Input } from "@/components/ui/input"
import { Select, SelectItem } from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { getApiBaseUrl } from "@/lib/env"
import { useAuthStore } from "@/stores/authStore"

interface PriceStatsResponse {
  filters?: {
    query?: string
    region?: string
    category?: string
    start_date?: string
    end_date?: string
  }
  summary?: {
    min_price?: number
    max_price?: number
    avg_price?: number
    median_price?: number
    quartiles?: {
      q1?: number
      q2?: number
      q3?: number
    }
  }
  time_series?: Array<{
    month: string
    median_price?: number
    min_price?: number
    max_price?: number
    quartiles?: {
      q1?: number
      q2?: number
      q3?: number
    }
  }>
  raw_data?: Array<{
    item?: string
    price?: number
    date?: string
    uf?: string
    source?: string
  }>
}

interface AppliedFilters {
  query?: string
  region?: string
  category?: string
  start_date?: string
  end_date?: string
}

interface BoxPlotPoint {
  label: string
  min: number
  q1: number
  median: number
  q3: number
  max: number
}

type ChartTooltipPayload = {
  payload?: BoxPlotPoint
}

type ChartTooltipProps = TooltipProps<number, string> & {
  payload?: ChartTooltipPayload[]
}

const regions = [
  { value: "norte", label: "Norte" },
  { value: "nordeste", label: "Nordeste" },
  { value: "centro-oeste", label: "Centro-Oeste" },
  { value: "sudeste", label: "Sudeste" },
  { value: "sul", label: "Sul" }
]

const categories = [
  { value: "ti", label: "Tecnologia da Informação" },
  { value: "mobiliario", label: "Mobiliário" },
  { value: "servicos", label: "Serviços" },
  { value: "infraestrutura", label: "Infraestrutura" },
  { value: "outros", label: "Outros" }
]

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
})

function formatCurrency(value?: number | null) {
  if (typeof value !== "number" || Number.isNaN(value)) return "-"
  return currencyFormatter.format(value)
}

function formatDateLabel(dateString?: string | null) {
  if (!dateString) return "-"
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return "-"
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC"
  }).format(date)
}

function formatApiDate(date?: Date) {
  if (!date) return undefined
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, "0")
  const day = String(date.getUTCDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function parseMonthLabel(month: string) {
  const [year, monthPart] = month.split("-")
  if (!year || !monthPart) return month
  const parsedDate = new Date(Date.UTC(Number(year), Number(monthPart) - 1, 1))
  if (Number.isNaN(parsedDate.getTime())) return month
  return new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(parsedDate)
}

function buildBoxPlotData(response?: PriceStatsResponse): BoxPlotPoint[] {
  if (!response) return []

  const summary = response.summary
  const fallbackQuartiles = summary?.quartiles
  const fallbackMin = summary?.min_price ?? fallbackQuartiles?.q1 ?? summary?.median_price ?? 0
  const fallbackMax = summary?.max_price ?? fallbackQuartiles?.q3 ?? summary?.median_price ?? 0
  const fallbackMedian = summary?.median_price ?? summary?.avg_price ?? 0

  if (response.time_series && response.time_series.length > 0) {
    return response.time_series.map((item) => {
      const quartiles = item.quartiles ?? fallbackQuartiles
      const min = item.min_price ?? fallbackMin
      const max = item.max_price ?? fallbackMax
      const q1 = quartiles?.q1 ?? fallbackQuartiles?.q1 ?? fallbackMin
      const q3 = quartiles?.q3 ?? fallbackQuartiles?.q3 ?? fallbackMax
      const median = item.median_price ?? quartiles?.q2 ?? fallbackMedian

      return {
        label: parseMonthLabel(item.month),
        min,
        q1,
        median,
        q3,
        max
      }
    })
  }

  if (summary) {
    return [
      {
        label: "Distribuição Geral",
        min: summary.min_price ?? fallbackMin,
        q1: summary.quartiles?.q1 ?? fallbackQuartiles?.q1 ?? fallbackMin,
        median: summary.median_price ?? fallbackMedian,
        q3: summary.quartiles?.q3 ?? fallbackQuartiles?.q3 ?? fallbackMax,
        max: summary.max_price ?? fallbackMax
      }
    ]
  }

  return []
}

function BoxPlotTooltip({ active, payload }: ChartTooltipProps) {
  const tooltipPayload = payload ?? []
  if (!active || tooltipPayload.length === 0) return null
  const datum = tooltipPayload[0]?.payload
  if (!datum) return null

  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-sm font-semibold text-slate-900">{datum.label}</p>
      <div className="mt-2 space-y-1 text-xs text-slate-600">
        <p>Valor mínimo: {formatCurrency(datum.min)}</p>
        <p>Primeiro quartil: {formatCurrency(datum.q1)}</p>
        <p>Mediana: {formatCurrency(datum.median)}</p>
        <p>Terceiro quartil: {formatCurrency(datum.q3)}</p>
        <p>Valor máximo: {formatCurrency(datum.max)}</p>
      </div>
    </div>
  )
}

type BoxPlotShapesProps = {
  xAxisMap?: Record<string, any>
  yAxisMap?: Record<string, any>
  offset?: {
    top: number
    left: number
    height: number
    width: number
  }
  data?: BoxPlotPoint[]
}

function BoxPlotShapes({ xAxisMap = {}, yAxisMap = {}, offset, data = [] }: BoxPlotShapesProps) {
  const xAxisKey = Object.keys(xAxisMap)[0]
  const yAxisKey = Object.keys(yAxisMap)[0]

  const xAxis = xAxisMap[xAxisKey]
  const yAxis = yAxisMap[yAxisKey]

  if (!xAxis || !yAxis) return null

  const safeOffset =
    offset ??
    ({
      top: 0,
      left: 0,
      height: 0,
      width: 0
    } as const)

  return (
    <g>
      {data.map((entry, index) => {
        const xValue = entry.label ?? index
        const baseX = typeof xAxis.scale === "function" ? xAxis.scale(xValue) : 0
        const bandwidth = typeof xAxis.bandwidth === "function" ? xAxis.bandwidth() : xAxis.bandwidth ?? 0
        const xCenter = safeOffset.left + baseX + bandwidth / 2
        const boxWidth = Math.min(48, bandwidth * 0.6 || 24)
        const halfBox = boxWidth / 2

        const minY = safeOffset.top + (typeof yAxis.scale === "function" ? yAxis.scale(entry.min) : entry.min)
        const maxY = safeOffset.top + (typeof yAxis.scale === "function" ? yAxis.scale(entry.max) : entry.max)
        const q1Y = safeOffset.top + (typeof yAxis.scale === "function" ? yAxis.scale(entry.q1) : entry.q1)
        const q3Y = safeOffset.top + (typeof yAxis.scale === "function" ? yAxis.scale(entry.q3) : entry.q3)
        const medianY = safeOffset.top + (typeof yAxis.scale === "function" ? yAxis.scale(entry.median) : entry.median)

        const top = Math.min(q1Y, q3Y)
        const height = Math.max(4, Math.abs(q3Y - q1Y))

        return (
          <g key={`${entry.label}-${index}`}>
            <rect
              x={xCenter - halfBox}
              y={top}
              width={boxWidth}
              height={height}
              fill="#dbeafe"
              stroke="#1d4ed8"
              strokeWidth={1.5}
              rx={4}
            />
            <line
              x1={xCenter - halfBox}
              x2={xCenter + halfBox}
              y1={medianY}
              y2={medianY}
              stroke="#1e40af"
              strokeWidth={2}
            />
            <line
              x1={xCenter}
              x2={xCenter}
              y1={q1Y}
              y2={minY}
              stroke="#1d4ed8"
              strokeWidth={1.5}
            />
            <line
              x1={xCenter}
              x2={xCenter}
              y1={q3Y}
              y2={maxY}
              stroke="#1d4ed8"
              strokeWidth={1.5}
            />
            <line
              x1={xCenter - halfBox * 0.7}
              x2={xCenter + halfBox * 0.7}
              y1={minY}
              y2={minY}
              stroke="#1d4ed8"
              strokeWidth={1.5}
            />
            <line
              x1={xCenter - halfBox * 0.7}
              x2={xCenter + halfBox * 0.7}
              y1={maxY}
              y2={maxY}
              stroke="#1d4ed8"
              strokeWidth={1.5}
            />
          </g>
        )
      })}
    </g>
  )
}

function BoxPlotChart({ data }: { data: BoxPlotPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50">
        <div className="flex flex-col items-center gap-2 text-center text-sm text-slate-500">
          <BarChart3 className="h-6 w-6 text-slate-400" />
          <span>Nenhum dado para exibir no gráfico.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[360px] w-full">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 24, right: 24, bottom: 24, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 12 }} tickLine={false} axisLine={{ stroke: "#cbd5f5" }} />
          <YAxis
            tickFormatter={(value) => formatCurrency(Number(value))}
            tick={{ fill: "#475569", fontSize: 12 }}
            width={120}
            tickLine={false}
            axisLine={{ stroke: "#cbd5f5" }}
          />
          <Tooltip content={<BoxPlotTooltip />} cursor={{ fill: "rgba(148, 163, 184, 0.15)" }} />
          <Bar dataKey="median" fill="transparent" stroke="transparent" />
          <Customized component={<BoxPlotShapes data={data} /> as unknown as ReactElement} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

function PriceMapPage() {
  const token = useAuthStore((state) => state.token)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRegion, setSelectedRegion] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [dateRange, setDateRange] = useState<DateRangeValue | undefined>()
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters | null>(null)

  const { data, isLoading, isError, isFetching, error } = useQuery<PriceStatsResponse>({
    queryKey: ["market-price-stats", appliedFilters, token],
    queryFn: async () => {
      if (!token || !appliedFilters) {
        throw new Error("Filtros inválidos ou token ausente")
      }

      const baseUrl = getApiBaseUrl()
      const requestUrl = new URL("/api/v1/market/price-stats", baseUrl)

      if (appliedFilters.query) requestUrl.searchParams.set("query", appliedFilters.query)
      if (appliedFilters.region) requestUrl.searchParams.set("region", appliedFilters.region)
      if (appliedFilters.category) requestUrl.searchParams.set("category", appliedFilters.category)
      if (appliedFilters.start_date) requestUrl.searchParams.set("start_date", appliedFilters.start_date)
      if (appliedFilters.end_date) requestUrl.searchParams.set("end_date", appliedFilters.end_date)

      const response = await fetch(requestUrl.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error("Falha ao carregar as estatísticas de preços")
      }

      return (await response.json()) as PriceStatsResponse
    },
    enabled: Boolean(token && appliedFilters),
    staleTime: 1000 * 60 * 5,
    retry: false
  })

  const chartData = useMemo(() => buildBoxPlotData(data), [data])

  const hasAppliedFilters = Boolean(appliedFilters)
  const hasResults = Boolean(data && data.raw_data && data.raw_data.length > 0)

  const handleApplyFilters = () => {
    const normalized: AppliedFilters = {
      query: searchTerm.trim() || undefined,
      region: selectedRegion || undefined,
      category: selectedCategory || undefined,
      start_date: formatApiDate(dateRange?.start),
      end_date: formatApiDate(dateRange?.end)
    }

    if (!normalized.query && !normalized.region && !normalized.category && !normalized.start_date && !normalized.end_date) {
      setAppliedFilters({})
    } else {
      setAppliedFilters(normalized)
    }
  }

  const dynamicTitle = useMemo(() => {
    if (!data?.filters) return "Resultados do Mapa de Preços"

    const parts: string[] = []
    if (data.filters.query) {
      parts.push(`para "${data.filters.query}"`)
    }
    if (data.filters.region) {
      parts.push(`na região "${data.filters.region}"`)
    }
    if (data.filters.category) {
      parts.push(`na categoria "${data.filters.category}"`)
    }
    if (data.filters.start_date || data.filters.end_date) {
      const periodParts: string[] = []
      if (data.filters.start_date) periodParts.push(`de ${formatDateLabel(data.filters.start_date)}`)
      if (data.filters.end_date) periodParts.push(`até ${formatDateLabel(data.filters.end_date)}`)
      if (periodParts.length > 0) {
        parts.push(periodParts.join(" "))
      }
    }

    if (parts.length === 0) {
      return "Resultados do Mapa de Preços"
    }

    return `Resultados ${parts.join(" ")}`
  }, [data?.filters])

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          <MapPin className="h-4 w-4" />
          Inteligência de Mercado
        </div>
        <h1 className="text-2xl font-semibold text-slate-900">Mapa de Preços</h1>
        <p className="text-sm text-slate-600">
          Explore as variações de preços com filtros avançados e visualize a distribuição das cotações coletadas.
        </p>
      </header>

      <Card>
        <CardHeader className="space-y-1 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <Filter className="h-4 w-4" />
            Filtros de busca
          </div>
          <CardDescription>
            Combine diferentes filtros para refinar a pesquisa. Clique em &quot;Aplicar Filtros&quot; para atualizar a visualização.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Item</span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Ex: Cadeira de escritório"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-9"
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Região</span>
              <Select
                value={selectedRegion}
                onValueChange={(value) => setSelectedRegion(value)}
                placeholder="Selecione uma região"
              >
                <SelectItem value="">Todas as regiões</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region.value} value={region.value}>
                    {region.label}
                  </SelectItem>
                ))}
              </Select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Categoria</span>
              <Select
                value={selectedCategory}
                onValueChange={(value) => setSelectedCategory(value)}
                placeholder="Selecione uma categoria"
              >
                <SelectItem value="">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </Select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Período</span>
              <DateRangePicker value={dateRange} onChange={setDateRange} />
            </label>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">
              Defina os filtros desejados e clique em &quot;Aplicar Filtros&quot; para consultar os dados mais recentes.
            </div>
            <div className="flex items-center gap-2">
              {hasAppliedFilters ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="gap-2"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedRegion("")
                    setSelectedCategory("")
                    setDateRange(undefined)
                    setAppliedFilters(null)
                  }}
                >
                  <RefreshCcw className="h-4 w-4" />
                  Limpar filtros
                </Button>
              ) : null}
              <Button type="button" onClick={handleApplyFilters} className="gap-2">
                {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                Aplicar filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {!hasAppliedFilters && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-slate-500">
            <BarChart3 className="h-10 w-10 text-slate-300" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-700">Aguardando filtros</p>
              <p className="text-sm text-slate-500">
                Utilize os filtros acima e clique em &quot;Aplicar Filtros&quot; para visualizar o mapa de preços.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {hasAppliedFilters && (
        <div className="space-y-6">
          {isLoading || isFetching ? (
            <Card>
              <CardContent className="flex h-64 flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                <span className="text-sm text-slate-500">Carregando dados de mercado...</span>
              </CardContent>
            </Card>
          ) : null}

          {isError ? (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="flex items-center gap-3 py-6 text-sm text-red-700">
                <AlertCircle className="h-5 w-5" />
                <span>{error instanceof Error ? error.message : "Não foi possível carregar os dados."}</span>
              </CardContent>
            </Card>
          ) : null}

          {!isLoading && !isFetching && !isError && !hasResults ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-slate-500">
                <BarChart3 className="h-10 w-10 text-slate-300" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-700">Nenhum resultado encontrado</p>
                  <p className="text-sm text-slate-500">
                    Ajuste os filtros aplicados para encontrar outras combinações de itens, categorias ou períodos.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {!isLoading && !isFetching && !isError && hasResults ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-semibold text-slate-900">{dynamicTitle}</h2>
                  {data?.summary ? (
                    <p className="text-sm text-slate-600">
                      {`Mínimo: ${formatCurrency(data.summary.min_price)} · Mediana: ${formatCurrency(data.summary.median_price)} · Média: ${formatCurrency(data.summary.avg_price)} · Máximo: ${formatCurrency(data.summary.max_price)}`}
                    </p>
                  ) : null}
                </div>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold text-slate-900">Distribuição de preços</CardTitle>
                    <CardDescription>
                      Boxplot representando a dispersão das cotações encontradas considerando os filtros aplicados.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <BoxPlotChart data={chartData} />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-slate-900">Dados brutos</CardTitle>
                  <CardDescription>Listagem das cotações utilizadas para compor a visualização.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead className="text-right">Preço</TableHead>
                          <TableHead>Data da Compra</TableHead>
                          <TableHead>UF</TableHead>
                          <TableHead>Fonte</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data?.raw_data?.map((row, index) => (
                          <TableRow key={`${row.item ?? "item"}-${index}`}>
                            <TableCell className="font-medium text-slate-900">{row.item ?? "Item não informado"}</TableCell>
                            <TableCell className="text-right">{formatCurrency(row.price)}</TableCell>
                            <TableCell>{formatDateLabel(row.date)}</TableCell>
                            <TableCell>{row.uf ?? "-"}</TableCell>
                            <TableCell>{row.source ?? "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default withAuth(PriceMapPage)
