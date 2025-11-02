"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PlusCircle, Search, Filter, Download, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"

import withAuth from "@/components/auth/withAuth"
import { DataTable, type Column } from "@/components/data-display/data-table"
import { StatusBadge } from "@/components/data-display/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { usePlans, type PlanSummary } from "@/hooks/api/usePlans"
import { PROCESS_STATUS } from "@/lib/constants"

interface NormalizedPlan {
  id: string
  identifier: string
  object: string
  status: keyof typeof PROCESS_STATUS
  createdAt: string
  estimatedValue?: number
}

function normalizePlan(plan: PlanSummary, index: number): NormalizedPlan {
  const fallbackId = `PLANO-${index + 1}`

  const id =
    (typeof plan.id === "string" && plan.id.length > 0
      ? plan.id
      : typeof plan.identifier === "string" && plan.identifier.length > 0
        ? plan.identifier
        : undefined) ?? fallbackId

  const identifier =
    (typeof plan.identifier === "string" && plan.identifier.length > 0
      ? plan.identifier
      : undefined) ?? fallbackId

  const object =
    (typeof plan.object === "string" && plan.object.length > 0
      ? plan.object
      : typeof plan.title === "string" && plan.title.length > 0
        ? plan.title
        : undefined) ?? "Sem título"

  const status =
    (typeof plan.status === "string" && plan.status.length > 0
      ? plan.status
      : undefined) ?? "draft"

  const createdAt =
    (typeof plan.created_at === "string" && plan.created_at.length > 0
      ? plan.created_at
      : typeof plan.createdAt === "string" && plan.createdAt.length > 0
        ? plan.createdAt
        : undefined) ?? new Date().toISOString()

  return {
    id,
    identifier,
    object,
    status: status as keyof typeof PROCESS_STATUS,
    createdAt,
    estimatedValue: typeof plan.estimated_value === "number" ? plan.estimated_value : undefined,
  }
}

function PlansPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1) // Reset to first page on search
    }, 500)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Reset page when status filter changes
  useEffect(() => {
    setPage(1)
  }, [statusFilter])

  // Fetch plans with server-side filters
  const { data, isLoading, isError } = usePlans({
    search: debouncedSearch || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    page,
    limit: pageSize,
  })

  // Normalizar planos
  const plans: NormalizedPlan[] = useMemo(
    () => (data?.plans || []).map(normalizePlan),
    [data?.plans]
  )

  const totalPlans = data?.total || 0
  const totalPages = Math.ceil(totalPlans / pageSize)

  // Definir colunas da tabela
  const columns: Column<NormalizedPlan>[] = [
    {
      id: "identifier",
      label: "Identificador",
      accessor: (row) => row.identifier,
      sortable: true,
      width: "w-32",
    },
    {
      id: "object",
      label: "Objeto",
      accessor: (row) => (
        <div className="max-w-md">
          <p className="line-clamp-2 font-medium" title={row.object}>
            {row.object}
          </p>
        </div>
      ),
      sortable: true,
    },
    {
      id: "status",
      label: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
      width: "w-32",
      align: "center",
    },
    {
      id: "estimatedValue",
      label: "Valor Estimado",
      accessor: (row) =>
        row.estimatedValue
          ? new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(row.estimatedValue)
          : "-",
      sortable: true,
      width: "w-40",
      align: "right",
    },
    {
      id: "createdAt",
      label: "Criado em",
      accessor: (row) => new Date(row.createdAt).toLocaleDateString("pt-BR"),
      sortable: true,
      width: "w-32",
    },
    {
      id: "actions",
      label: "Ações",
      accessor: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/plans/${row.id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              Visualizar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/plans/${row.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/etp/novo?planId=${row.id}`)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Criar ETP
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      width: "w-20",
      align: "center",
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-64 animate-pulse rounded-lg bg-slate-200" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        Não foi possível carregar os planos. Tente novamente mais tarde.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-h1 text-slate-900">Planos de Contratação</h1>
          <p className="text-body-small text-slate-500">
            Gerencie todos os planos de contratação do órgão
          </p>
        </div>
        <Link href="/plans/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Plano
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-h4">Filtros</CardTitle>
          <CardDescription>Refine sua busca por planos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Busca */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Buscar por identificador ou objeto..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filtro de Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">Todos os status</option>
              <option value="draft">Rascunho</option>
              <option value="pending">Pendente</option>
              <option value="approved">Aprovado</option>
              <option value="rejected">Rejeitado</option>
              <option value="archived">Arquivado</option>
            </select>
          </div>

          {/* Ações */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-body-small text-slate-500">
              {totalPlans} {totalPlans === 1 ? "plano encontrado" : "planos encontrados"}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Mais Filtros
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardContent className="p-0">
          <DataTable
            data={plans}
            columns={columns}
            showPagination
            initialPageSize={pageSize}
            emptyMessage="Nenhum plano encontrado"
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default withAuth(PlansPage)
