"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useRouter } from "next/navigation"

import { MoreHorizontal, PlusCircle } from "lucide-react"

import withAuth from "@/components/auth/withAuth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { PlanSummary } from "@/hooks/api/usePlans"
import { usePlans } from "@/hooks/api/usePlans"

interface NormalizedPlan {
  id: string
  object: string
  status: string
  createdAt?: string
}

function normalizePlan(plan: PlanSummary, index: number): NormalizedPlan {
  const fallbackId = `PLANO-${index + 1}`

  const id =
    (typeof plan.id === "string" && plan.id.length > 0
      ? plan.id
      : typeof plan.identifier === "string" && plan.identifier.length > 0
        ? plan.identifier
        : undefined) ?? fallbackId

  const object =
    (typeof plan.object === "string" && plan.object.length > 0
      ? plan.object
      : typeof plan.title === "string" && plan.title.length > 0
        ? plan.title
        : typeof plan.name === "string" && plan.name.length > 0
          ? plan.name
          : typeof plan.description === "string" && plan.description.length > 0
            ? plan.description
            : "—")

  const status =
    typeof plan.status === "string" && plan.status.length > 0
      ? plan.status
      : "Status não informado"

  const createdAtRaw =
    (typeof plan.createdAt === "string" && plan.createdAt.length > 0
      ? plan.createdAt
      : typeof plan.created_at === "string" && plan.created_at.length > 0
        ? plan.created_at
        : undefined) ?? undefined

  return {
    id,
    object,
    status,
    createdAt: createdAtRaw,
  }
}

function formatDate(value?: string) {
  if (!value) {
    return "—"
  }

  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate)
}

function resolveStatusBadge(status: string) {
  const normalized = status.toLowerCase()

  if (normalized.includes("elabora")) {
    return { label: "Em Elaboração", variant: "info" as const }
  }

  if (normalized.includes("revis")) {
    return { label: "Em Revisão", variant: "warning" as const }
  }

  if (normalized.includes("aprov")) {
    return { label: "Aprovado", variant: "success" as const }
  }

  return { label: status, variant: "secondary" as const }
}

const skeletonRows = Array.from({ length: 5 })

function PlansPageComponent() {
  const { data, isLoading, isError } = usePlans()
  const router = useRouter()

  const plans = useMemo(() => {
    if (!data || data.length === 0) {
      return []
    }

    return data.map(normalizePlan)
  }, [data])

  const showEmptyState = !isLoading && !isError && plans.length === 0

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Planos de Contratação
          </h1>
          <p className="text-sm text-slate-500">
            Acompanhe o status dos planos e avance cada etapa do processo.
          </p>
        </div>
        <Link className="w-full sm:w-auto" href="/plans/new">
          <Button className="w-full sm:w-auto">
            <PlusCircle aria-hidden className="h-4 w-4" />
            Novo Plano
          </Button>
        </Link>
      </header>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/60">
              <TableHead className="w-[200px] text-slate-600">ID do Plano</TableHead>
              <TableHead className="text-slate-600">Objeto</TableHead>
              <TableHead className="w-[160px] text-slate-600">Status</TableHead>
              <TableHead className="w-[160px] text-slate-600">Criado em</TableHead>
              <TableHead className="w-[120px] text-right text-slate-600">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? skeletonRows.map((_, index) => (
                  <TableRow key={`skeleton-${index}`} className="hover:bg-transparent">
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-full max-w-[320px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-28 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-8 w-8 rounded-full" />
                    </TableCell>
                  </TableRow>
                ))
              : null}

            {!isLoading && isError ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-red-600">
                  Não foi possível carregar os planos de contratação. Tente novamente mais tarde.
                </TableCell>
              </TableRow>
            ) : null}

            {!isLoading && !isError
              ? plans.map((plan, index) => {
                  const { label, variant } = resolveStatusBadge(plan.status)

                  return (
                    <TableRow
                      key={plan.id ?? `plan-${index}`}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <TableCell className="font-medium text-slate-900">
                        {plan.id}
                      </TableCell>
                      <TableCell className="text-slate-700">{plan.object}</TableCell>
                      <TableCell>
                        <Badge variant={variant}>{label}</Badge>
                      </TableCell>
                      <TableCell className="text-slate-600">
                        {formatDate(plan.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-label="Abrir menu de ações"
                              variant="ghost"
                              size="icon-sm"
                              className="ml-auto text-slate-500 hover:text-slate-900"
                            >
                              <MoreHorizontal aria-hidden className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() =>
                                router.push(`/plans/${encodeURIComponent(plan.id)}`)
                              }
                            >
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem>Editar</DropdownMenuItem>
                            <DropdownMenuItem>Excluir</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              : null}

            {showEmptyState ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12">
                  <div className="flex flex-col items-center justify-center gap-4 text-center">
                    <p className="text-sm text-slate-500">
                      Nenhum plano de contratação encontrado.
                    </p>
                    <Link href="/plans/new">
                      <Button variant="outline">Criar Novo Plano</Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </section>
    </div>
  )
}

const PlansPage = withAuth(PlansPageComponent)

export default PlansPage
