"use client"

import { useCallback, useEffect, useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import {
  ArrowUpDown,
  CalendarRange,
  Check,
  ChevronDown,
  Download,
  Filter,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react"

import type { ProcessListItem, ProcessListMetadata } from "../_types"
import type { SessionUser } from "@/lib/auth/session"
import { PROCESS_STATUS_LABELS, USER_ROLES, PAGE_SIZE_OPTIONS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface AvailableFilters {
  statuses: string[]
  types: string[]
  units: string[]
}

interface ProcessTableProps {
  processes: ProcessListItem[]
  metadata: ProcessListMetadata
  availableFilters: AvailableFilters
  csvExportPath: string
  errorMessage?: string
  sessionUser: SessionUser | null
}

const DEFAULT_PAGE_SIZE = 10
const ALLOWED_SORT_FIELDS = ["identifier", "object", "status", "type", "unit", "updated_at", "updatedAt"]

function formatDate(value?: string) {
  if (!value) return "—"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

function formatCurrency(value?: number | null) {
  if (typeof value !== "number") {
    return "—"
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value)
}

function resolveStatusLabel(status: string) {
  const normalized = status.toLowerCase() as keyof typeof PROCESS_STATUS_LABELS
  return PROCESS_STATUS_LABELS[normalized] ?? status
}

function buildStatusBadgeVariant(status: string): BadgeProps["variant"] {
  const normalized = status.toLowerCase()

  if (normalized.includes("aprov")) return "approved"
  if (normalized.includes("pend")) return "pending"
  if (normalized.includes("reje")) return "rejected"
  if (normalized.includes("rascun")) return "draft"
  if (normalized.includes("arquiv")) return "archived"

  return "secondary"
}

function useInitialFilters(searchParams: ReturnType<typeof useSearchParams>) {
  return useMemo(
    () => ({
      search: searchParams.get("search") ?? "",
      statuses: searchParams.getAll("status"),
      type: searchParams.get("type") ?? "",
      unit: searchParams.get("unit") ?? "",
      startDate: searchParams.get("startDate") ?? "",
      endDate: searchParams.get("endDate") ?? "",
      mine: searchParams.get("mine") === "true",
      perPage: searchParams.get("perPage") ?? String(DEFAULT_PAGE_SIZE),
    }),
    [searchParams]
  )
}

function hasRole(sessionUser: SessionUser | null, roles: string[]): boolean {
  if (!sessionUser?.roles || sessionUser.roles.length === 0) {
    return false
  }

  const normalizedRoles = sessionUser.roles.map((role) => role.toLowerCase())
  return roles.some((role) => normalizedRoles.includes(role.toLowerCase()))
}

export function ProcessTable({
  processes,
  metadata,
  availableFilters,
  csvExportPath,
  errorMessage,
  sessionUser,
}: ProcessTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const initialFilters = useInitialFilters(searchParams)
  const [searchValue, setSearchValue] = useState(initialFilters.search)
  const [statusFilter, setStatusFilter] = useState<string[]>(initialFilters.statuses)
  const [typeFilter, setTypeFilter] = useState(initialFilters.type)
  const [unitFilter, setUnitFilter] = useState(initialFilters.unit)
  const [startDate, setStartDate] = useState(initialFilters.startDate)
  const [endDate, setEndDate] = useState(initialFilters.endDate)
  const [mineOnly, setMineOnly] = useState(initialFilters.mine)
  const [perPage, setPerPage] = useState(initialFilters.perPage || String(DEFAULT_PAGE_SIZE))

  useEffect(() => {
    setSearchValue(initialFilters.search)
    setStatusFilter(initialFilters.statuses)
    setTypeFilter(initialFilters.type)
    setUnitFilter(initialFilters.unit)
    setStartDate(initialFilters.startDate)
    setEndDate(initialFilters.endDate)
    setMineOnly(initialFilters.mine)
    setPerPage(initialFilters.perPage || String(DEFAULT_PAGE_SIZE))
  }, [initialFilters])

  const updateQuery = useCallback(
    (updates: Record<string, string | string[] | boolean | null>, resetPage = false) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          params.delete(key)
          value
            .filter((item) => typeof item === "string" && item.trim().length > 0)
            .forEach((item) => params.append(key, item.trim()))
        } else if (typeof value === "boolean") {
          if (value) {
            params.set(key, "true")
          } else {
            params.delete(key)
          }
        } else if (typeof value === "string" && value.trim().length > 0) {
          params.set(key, value.trim())
        } else {
          params.delete(key)
        }
      })

      if (resetPage) {
        params.delete("page")
        params.set("page", "1")
      }

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      })
    },
    [pathname, router, searchParams]
  )

  useEffect(() => {
    const handler = setTimeout(() => {
      updateQuery({ search: searchValue }, true)
    }, 400)

    return () => clearTimeout(handler)
  }, [searchValue, updateQuery])

  const handleToggleStatus = (status: string) => {
    setStatusFilter((current) => {
      const exists = current.includes(status)
      const next = exists ? current.filter((item) => item !== status) : [...current, status]
      updateQuery({ status: next }, true)
      return next
    })
  }

  const handleTypeChange = (nextType: string) => {
    setTypeFilter(nextType)
    updateQuery({ type: nextType }, true)
  }

  const handleUnitChange = (nextUnit: string) => {
    setUnitFilter(nextUnit)
    updateQuery({ unit: nextUnit }, true)
  }

  const handlePeriodChange = (field: "startDate" | "endDate", value: string) => {
    if (field === "startDate") {
      setStartDate(value)
    } else {
      setEndDate(value)
    }
    updateQuery({ [field]: value }, true)
  }

  const toggleMineOnly = () => {
    setMineOnly((current) => {
      const next = !current
      updateQuery({ mine: next }, true)
      return next
    })
  }

  const handleSort = (field: string) => {
    if (!ALLOWED_SORT_FIELDS.includes(field)) {
      field = "updatedAt"
    }

    const currentField = metadata.sortField ?? ""
    const currentOrder = metadata.sortDirection ?? "asc"

    let nextOrder: "asc" | "desc" = "asc"
    if (currentField === field) {
      nextOrder = currentOrder === "asc" ? "desc" : "asc"
    }

    updateQuery({ sort: field, order: nextOrder }, false)
  }

  const handlePageChange = (nextPage: number) => {
    const totalPages = Math.max(1, Math.ceil(metadata.total / metadata.perPage))
    const safePage = Math.min(Math.max(1, nextPage), totalPages)
    updateQuery({ page: String(safePage) })
  }

  const handlePerPageChange = (value: string) => {
    setPerPage(value)
    updateQuery({ perPage: value }, true)
  }

  const isLoading = isPending
  const isEmpty = !isLoading && processes.length === 0 && !errorMessage
  const canExport = processes.length > 0 && !errorMessage
  const canAdvance = hasRole(sessionUser, [USER_ROLES.MASTER, USER_ROLES.ADMIN, USER_ROLES.MANAGER])

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Buscar por identificador, objeto ou unidade"
            className="pl-9"
            aria-label="Buscar processos"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Status
                {statusFilter.length > 0 ? (
                  <Badge variant="secondary" className="ml-2 rounded-full">
                    {statusFilter.length}
                  </Badge>
                ) : null}
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 space-y-1">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableFilters.statuses.length === 0 ? (
                <DropdownMenuItem
                  onSelect={(event) => event.preventDefault()}
                  className="cursor-default text-muted-foreground"
                >
                  Nenhum status disponível
                </DropdownMenuItem>
              ) : (
                availableFilters.statuses.map((status) => {
                  const isActive = statusFilter.includes(status)
                  return (
                    <DropdownMenuItem
                      key={status}
                      onSelect={(event) => {
                        event.preventDefault()
                        handleToggleStatus(status)
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox checked={isActive} onCheckedChange={() => handleToggleStatus(status)} />
                        <span>{resolveStatusLabel(status)}</span>
                      </div>
                    </DropdownMenuItem>
                  )
                })
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                Tipo
                <ChevronDown className="ml-1 h-3 w-3" />
                {typeFilter ? (
                  <Badge variant="secondary" className="ml-2 rounded-full">
                    1
                  </Badge>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Tipo de processo</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => handleTypeChange("")}>Todos</DropdownMenuItem>
              {availableFilters.types.map((type) => (
                <DropdownMenuItem key={type} onSelect={() => handleTypeChange(type)}>
                  {type}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                Unidade
                <ChevronDown className="ml-1 h-3 w-3" />
                {unitFilter ? (
                  <Badge variant="secondary" className="ml-2 rounded-full">
                    1
                  </Badge>
                ) : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Unidade responsável</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => handleUnitChange("")}>Todas</DropdownMenuItem>
              {availableFilters.units.map((unit) => (
                <DropdownMenuItem key={unit} onSelect={() => handleUnitChange(unit)}>
                  {unit}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarRange className="h-4 w-4" />
                Período
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Intervalo de datas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="grid gap-3 p-2">
                <label className="grid gap-1 text-sm">
                  <span className="text-muted-foreground">Data inicial</span>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(event) => handlePeriodChange("startDate", event.target.value)}
                  />
                </label>
                <label className="grid gap-1 text-sm">
                  <span className="text-muted-foreground">Data final</span>
                  <Input
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    onChange={(event) => handlePeriodChange("endDate", event.target.value)}
                  />
                </label>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            type="button"
            variant={mineOnly ? "default" : "outline"}
            onClick={toggleMineOnly}
            className={cn("gap-2", mineOnly ? "bg-primary text-white" : "")}
          >
            <Check className="h-4 w-4" />
            Meus Processos
          </Button>

          <Button type="button" variant="outline" disabled={!canExport} asChild>
            <Link href={csvExportPath} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Exportar CSV
            </Link>
          </Button>
        </div>
      </div>

      {errorMessage ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-destructive">Não foi possível carregar os processos</CardTitle>
              <CardDescription className="text-destructive/80">{errorMessage}</CardDescription>
            </div>
            <Button variant="outline" onClick={() => router.refresh()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
          </CardHeader>
        </Card>
      ) : null}

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : isEmpty ? (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Nenhum processo encontrado</CardTitle>
            <CardDescription>
              Ajuste os filtros ou crie um novo processo para iniciar um acompanhamento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/wizard/planning">Criar novo processo</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-md border border-border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[160px]">
                    <button
                      type="button"
                      className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                      onClick={() => handleSort("identifier")}
                    >
                      Identificador
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      type="button"
                      className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                      onClick={() => handleSort("object")}
                    >
                      Objeto
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </TableHead>
                  <TableHead className="w-[120px] text-center">
                    <button
                      type="button"
                      className="flex w-full items-center justify-center gap-2 text-sm font-semibold text-slate-700"
                      onClick={() => handleSort("status")}
                    >
                      Status
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </TableHead>
                  <TableHead className="w-[140px]">
                    <button
                      type="button"
                      className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                      onClick={() => handleSort("type")}
                    >
                      Tipo
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </TableHead>
                  <TableHead className="w-[160px]">
                    <button
                      type="button"
                      className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                      onClick={() => handleSort("unit")}
                    >
                      Unidade
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </TableHead>
                  <TableHead className="w-[120px] text-right">
                    Valor
                  </TableHead>
                  <TableHead className="w-[140px]">
                    <button
                      type="button"
                      className="flex items-center gap-2 text-sm font-semibold text-slate-700"
                      onClick={() => handleSort("updated_at")}
                    >
                      Atualizado em
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </TableHead>
                  <TableHead className="w-[120px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processes.map((process) => (
                  <TableRow key={process.id}>
                    <TableCell className="font-medium">{process.identifier}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium text-slate-900">{process.object}</p>
                        {process.owner ? (
                          <p className="text-sm text-muted-foreground">Responsável: {process.owner}</p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={buildStatusBadgeVariant(process.status)}>
                        {resolveStatusLabel(process.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{process.type ?? "—"}</TableCell>
                    <TableCell>{process.unit ?? "—"}</TableCell>
                    <TableCell className="text-right font-medium text-slate-900">
                      {formatCurrency(process.value)}
                    </TableCell>
                    <TableCell>{formatDate(process.updatedAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" asChild>
                        <Link href={`/processos/${process.id}`}>Detalhes</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Linhas por página:</span>
              <select
                className="h-8 rounded-md border border-border bg-white px-2 text-sm"
                value={perPage}
                onChange={(event) => handlePerPageChange(event.target.value)}
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
              <span>
                Página {metadata.page} de {Math.max(1, Math.ceil(metadata.total / metadata.perPage))}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(metadata.page - 1)}
                  disabled={metadata.page <= 1 || isLoading}
                  className="gap-1"
                >
                  <ArrowUpDown className="h-3 w-3 rotate-90" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(metadata.page + 1)}
                  disabled={metadata.page >= Math.ceil(metadata.total / metadata.perPage) || isLoading}
                  className="gap-1"
                >
                  Próxima
                  <ArrowUpDown className="h-3 w-3 -rotate-90" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Atualizando processos...
        </div>
      ) : null}

      {canAdvance ? (
        <div className="rounded-md border border-primary/30 bg-primary/5 p-4 text-sm text-primary">
          Dica: selecione um processo para avançar etapas ou registrar eventos diretamente da linha do tempo.
        </div>
      ) : null}
    </div>
  )
}
