"use client"

import Link from "next/link"
import { Fragment } from "react"
import { Clock, ExternalLink, Loader2 } from "lucide-react"

import { DataTable, type DataTableColumn } from "@/components/data-display/data-table"
import { StatusBadge, type StatusVariant } from "@/components/data-display/status-badge"
import { Badge } from "@/components/ui/badge"
import { buildEdocsUrl, normalizeEdocsValue } from "@/lib/edocs"

import type { ProcessListMeta, ProcessSummary } from "../types"

interface ProcessTableProps {
  processes: ProcessSummary[]
  meta?: ProcessListMeta
  isLoading?: boolean
  isFetching?: boolean
  onRowClick?: (process: ProcessSummary) => void
  errorMessage?: string
}

function formatDate(date?: string) {
  if (!date) return "—"

  const parsedDate = new Date(date)

  if (Number.isNaN(parsedDate.getTime())) {
    return date
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate)
}

function resolveStatusVariant(status: string): StatusVariant {
  const normalized = status.toLowerCase()

  if (normalized.includes("apro")) return "APPROVED"
  if (normalized.includes("pend")) return "PENDING"
  if (normalized.includes("reje")) return "REJECTED"
  if (normalized.includes("rascun") || normalized.includes("draft")) return "DRAFT"
  if (normalized.includes("arquiv") || normalized.includes("arch")) return "ARCHIVED"

  return "PENDING"
}

function buildColumns(): DataTableColumn<ProcessSummary>[] {
  return [
    {
      id: "edocsNumber",
      label: "Nº Edocs",
      accessor: (row) => {
        const normalizedEdocs = normalizeEdocsValue(row.edocsNumber)
        if (!normalizedEdocs) {
          return <span className="text-sm text-slate-500">—</span>
        }

        const href = row.edocsUrl ?? buildEdocsUrl(normalizedEdocs)

        return (
          <Link
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
            onClick={(event) => event.stopPropagation()}
          >
            {normalizedEdocs}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only">Abrir processo no portal E-Docs</span>
          </Link>
        )
      },
      width: "w-40",
      sortable: true,
    },
    {
      id: "type",
      label: "Tipo",
      accessor: (row) => <span className="text-sm text-slate-600">{row.type || "—"}</span>,
      width: "w-32",
      sortable: true,
    },
    {
      id: "title",
      label: "Título",
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="line-clamp-2 text-sm font-medium text-slate-800">{row.title}</span>
          {row.unit ? <span className="text-caption text-muted-foreground">{row.unit}</span> : null}
        </div>
      ),
      sortable: true,
    },
    {
      id: "status",
      label: "Status",
      accessor: (row) => (
        <StatusBadge status={resolveStatusVariant(row.status)}>{row.statusLabel ?? row.status}</StatusBadge>
      ),
      align: "center",
      width: "w-36",
    },
    {
      id: "responsible",
      label: "Responsável",
      accessor: (row) => row.responsible || "—",
      width: "w-40",
      sortable: true,
    },
    {
      id: "updated_at",
      label: "Última atualização",
      accessor: (row) => (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock className="h-4 w-4 text-slate-400" aria-hidden />
          {formatDate(row.lastUpdated)}
        </div>
      ),
      width: "w-48",
      sortable: true,
    },
  ]
}

function LoadingState() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 h-8 w-48 animate-pulse rounded-md bg-slate-200" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-12 animate-pulse rounded-md bg-slate-100" />
        ))}
      </div>
    </div>
  )
}

export function ProcessTable({
  processes,
  meta,
  isLoading = false,
  isFetching = false,
  onRowClick,
  errorMessage,
}: ProcessTableProps) {
  if (isLoading) {
    return <LoadingState />
  }

  const columns = buildColumns()
  const totalLabel = meta?.total ? `${meta.total} processos encontrados` : `${processes.length} processos`

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-h4 font-semibold text-slate-900">Processos monitorados</h2>
          <p className="text-body-small text-muted-foreground">
            Clique em uma linha para visualizar o detalhamento completo, timeline e documentos vinculados.
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-2">
          {isFetching && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
          {totalLabel}
        </Badge>
      </div>

      {errorMessage ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 py-16 text-center">
          <p className="text-body font-semibold text-red-700">Não foi possível carregar os processos.</p>
          <p className="text-caption text-red-600">{errorMessage}</p>
        </div>
      ) : processes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 py-16">
          <p className="text-body font-medium text-slate-700">Nenhum processo encontrado com os filtros atuais.</p>
          <p className="text-caption text-muted-foreground">
            Ajuste os filtros para ampliar a pesquisa e visualizar outros processos.
          </p>
        </div>
      ) : (
        <Fragment>
          <DataTable
            data={processes}
            columns={columns}
            showPagination={false}
            className="text-sm"
            onRowClick={onRowClick}
            getRowKey={(row) => row.id}
          />
          <div className="mt-4 text-right text-caption text-muted-foreground">
            {meta?.total ? `${meta.total} registros contabilizados.` : `Atualizado em ${formatDate(processes[0]?.lastUpdated)}`}
          </div>
        </Fragment>
      )}
    </div>
  )
}
