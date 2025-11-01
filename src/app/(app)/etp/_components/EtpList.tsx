"use client"

import * as React from "react"
import { Plus, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

import { DataTable, type DataTableColumn } from "@/components/data-display/data-table"
import { StatusBadge, type StatusVariant } from "@/components/data-display/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectItem } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { api } from "@/lib/axios"

import { EdocsInput } from "@/app/_shared/components/EdocsInput"
import { EDOCS_REGEX, buildEdocsUrl, isValidEdocs, normalizeEdocsValue } from "@/lib/edocs"
import type { CreateEtpResponse, EtpListItem } from "./types"

const STATUS_FILTERS: { label: string; value: string; badge?: StatusVariant }[] = [
  { label: "Todos", value: "all" },
  { label: "Rascunho", value: "draft", badge: "DRAFT" },
  { label: "Em andamento", value: "pending", badge: "PENDING" },
  { label: "Aprovado", value: "approved", badge: "APPROVED" },
  { label: "Arquivado", value: "archived", badge: "ARCHIVED" },
]

const newEtpSchema = z.object({
  edocs: z
    .string()
    .min(1, { message: "Informe o código do E-Docs." })
    .regex(EDOCS_REGEX, "Formato inválido. Use AAAA-XXXXXX."),
})

interface NewEtpFormValues {
  edocs: string
}

interface NewEtpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (id: string) => void
}

function mapToListItem(rawItem: any): EtpListItem {
  const id = String(rawItem?.id ?? "")
  const edocs = normalizeEdocsValue(
    rawItem?.edocs ?? rawItem?.codigo_edocs ?? rawItem?.numeroEdocs ?? rawItem?.numero_edocs ?? "",
  )
  const status = String(rawItem?.status ?? "draft")
  const owner =
    rawItem?.owner?.name ||
    rawItem?.owner_name ||
    rawItem?.created_by_name ||
    rawItem?.responsavel ||
    "Não informado"
  const updatedAt = rawItem?.updated_at || rawItem?.updatedAt || rawItem?.updated_at_formatted
  const title =
    rawItem?.title ||
    rawItem?.nome ||
    rawItem?.descricao ||
    rawItem?.assunto ||
    `ETP ${id || "Sem identificação"}`

  return {
    id,
    edocs,
    status,
    owner,
    updatedAt: updatedAt || new Date().toISOString(),
    title,
  }
}

function buildPlaceholderList(): EtpListItem[] {
  return Array.from({ length: 5 }).map((_, index) => ({
    id: `placeholder-${index + 1}`,
    edocs: "0000-XXXXXX",
    status: "draft",
    owner: "—",
    updatedAt: new Date(Date.now() - index * 3600_000).toISOString(),
    title: "Rascunho de Estudo Técnico",
  }))
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value))
  } catch (error) {
    return value
  }
}

function normalizeStatusVariant(status: string): StatusVariant {
  const upper = status.toUpperCase()
  if (["DRAFT", "PENDING", "APPROVED", "REJECTED", "ARCHIVED"].includes(upper)) {
    return upper as StatusVariant
  }
  return "DRAFT"
}

function NewEtpModal({ open, onOpenChange, onCreated }: NewEtpModalProps) {
  const router = useRouter()
  const {
    control,
    handleSubmit,
    reset,
    trigger,
    formState: { isSubmitting, isValid },
  } = useForm<NewEtpFormValues>({
    resolver: zodResolver(newEtpSchema),
    mode: "onChange",
    defaultValues: { edocs: "" },
  })

  const onSubmit = React.useCallback(
    async (values: NewEtpFormValues) => {
      try {
        const response = await api.post<CreateEtpResponse>("/api/etp", {
          edocs: values.edocs,
        })
        const newId = String(response.data?.id ?? "")
        if (!newId) {
          throw new Error("Resposta inválida ao criar ETP")
        }

        toast.success("Novo ETP criado com sucesso!")
        reset({ edocs: "" })
        onOpenChange(false)
        onCreated(newId)
        router.push(`/etp/${newId}`)
      } catch (error) {
        console.error("Erro ao criar ETP", error)
        toast.error("Não foi possível criar o ETP. Tente novamente.")
      }
    },
    [onCreated, onOpenChange, reset, router]
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md space-y-6 rounded-xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-lg font-semibold text-neutral-900">
            Novo ETP
          </DialogTitle>
          <p className="text-sm text-neutral-500">
            Informe o código E-Docs que será associado ao novo Estudo Técnico Preliminar.
          </p>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <Controller
            control={control}
            name="edocs"
            render={({ field, fieldState }) => (
              <EdocsInput
                id="modal-edocs"
                label="Código E-Docs"
                value={field.value}
                onChange={field.onChange}
                onBlur={() => {
                  field.onBlur()
                  void trigger("edocs")
                }}
                error={fieldState.error?.message}
                required
              />
            )}
          />

          <DialogFooter className="gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? "Criando..." : "Criar e abrir"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function EtpList() {
  const router = useRouter()
  const [items, setItems] = React.useState<EtpListItem[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const [statusFilter, setStatusFilter] = React.useState("all")
  const [mineOnly, setMineOnly] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 400)

    return () => {
      clearTimeout(handler)
    }
  }, [searchTerm])

  const fetchEtps = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.get("/api/etp", {
        params: {
          status: statusFilter !== "all" ? statusFilter : undefined,
          mine: mineOnly ? "true" : undefined,
          search: debouncedSearch || undefined,
        },
      })

      const payload = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.items)
        ? response.data.items
        : []

      if (!Array.isArray(payload) || payload.length === 0) {
        setItems([])
        setLoading(false)
        return
      }

      const mapped = payload.map(mapToListItem)
      setItems(mapped)
    } catch (err) {
      console.error("Erro ao carregar ETPs", err)
      setError("Não foi possível carregar os ETPs no momento.")
      setItems(buildPlaceholderList())
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, mineOnly, statusFilter])

  React.useEffect(() => {
    void fetchEtps()
  }, [fetchEtps])

  const columns = React.useMemo<DataTableColumn<EtpListItem>[]>(
    () => [
      {
        id: "id",
        label: "Identificador",
        accessor: (row) => `#${row.id}`,
        width: "w-[120px]",
      },
      {
        id: "title",
        label: "Título",
        accessor: (row) => {
          const hasValidEdocs = row.edocs && isValidEdocs(row.edocs)
          return (
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-neutral-900">{row.title}</span>
              <span className="text-xs text-neutral-500">
                E-Docs:
                {hasValidEdocs ? (
                  <a
                    href={buildEdocsUrl(row.edocs)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-1 inline-flex items-center gap-1 text-primary-600 underline-offset-2 hover:text-primary-700 hover:underline"
                  >
                    {row.edocs}
                  </a>
                ) : (
                  <span className="ml-1">—</span>
                )}
              </span>
            </div>
          )
        },
        width: "min-w-[220px]",
      },
      {
        id: "owner",
        label: "Responsável",
        accessor: (row) => row.owner,
        width: "w-[180px]",
      },
      {
        id: "status",
        label: "Status",
        accessor: (row) => <StatusBadge status={normalizeStatusVariant(row.status)} />, 
        width: "w-[140px]",
      },
      {
        id: "updatedAt",
        label: "Atualizado em",
        accessor: (row) => formatDate(row.updatedAt),
        width: "w-[200px]",
      },
      {
        id: "actions",
        label: "",
        accessor: (row) => (
          <Button size="sm" variant="outline" onClick={() => router.push(`/etp/${row.id}`)}>
            Abrir
          </Button>
        ),
        width: "w-[120px] text-right",
        align: "right",
      },
    ],
    [router]
  )

  return (
    <Card className="border border-neutral-200 shadow-sm">
      <CardHeader className="flex flex-col gap-6 border-b border-neutral-100 pb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-neutral-900">Estudos Técnicos Preliminares</CardTitle>
            <p className="text-sm text-neutral-500">
              Acompanhe seus ETPs em andamento, utilize filtros avançados e retome o wizard a qualquer momento.
            </p>
          </div>

          <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo ETP
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_200px_180px]">
          <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
            <Search className="h-4 w-4 text-neutral-400" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por título, E-Docs ou responsável"
              className="border-none bg-transparent p-0 text-sm focus-visible:ring-0"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectItem value="all">Todos os status</SelectItem>
            {STATUS_FILTERS.filter((option) => option.value !== "all").map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </Select>

          <Button
            type="button"
            variant={mineOnly ? "default" : "outline"}
            onClick={() => setMineOnly((prev) => !prev)}
            className={cn("justify-center", mineOnly ? "bg-primary-600 text-white" : "")}
          >
            {mineOnly ? "Exibindo meus ETPs" : "Meus ETPs"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 py-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={`skeleton-${index}`} className="h-14 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-warning-200 bg-warning-50 p-4 text-sm text-warning-700">
            {error}
          </div>
        ) : (
          <DataTable
            data={items}
            columns={columns}
            emptyMessage="Nenhum ETP encontrado com os filtros selecionados."
            showPagination
            className="mt-2"
          />
        )}
      </CardContent>

      <NewEtpModal open={isModalOpen} onOpenChange={setIsModalOpen} onCreated={(_id) => void fetchEtps()} />
    </Card>
  )
}
