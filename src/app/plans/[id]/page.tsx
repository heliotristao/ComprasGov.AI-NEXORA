"use client"

import { useRouter, useParams } from "next/navigation"
import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"

import AppLayout from "@/app/(app)/layout"
import withAuth from "@/components/auth/withAuth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { api } from "@/lib/axios"
import { useAuthStore } from "@/stores/authStore"

interface PlanDetailsResponse {
  id?: string
  identifier?: string
  object?: string
  title?: string
  name?: string
  description?: string
  justification?: string
  status?: string
  createdAt?: string
  created_at?: string
  updatedAt?: string
  updated_at?: string
  [key: string]: unknown
}

interface NormalizedPlanDetails {
  id: string
  object: string
  justification: string
  status: string
  createdAt?: string
}

function resolvePlanId(rawId: string | string[] | undefined) {
  if (!rawId) {
    return undefined
  }

  if (Array.isArray(rawId)) {
    return rawId[0]
  }

  return rawId
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

function normalizePlanDetails(
  details: PlanDetailsResponse,
  fallbackId?: string
): NormalizedPlanDetails {
  const id =
    (typeof details.identifier === "string" && details.identifier.length > 0
      ? details.identifier
      : typeof details.id === "string" && details.id.length > 0
        ? details.id
        : typeof details.name === "string" && details.name.length > 0
          ? details.name
          : undefined) ?? fallbackId ?? "Plano sem identificador"

  const object =
    (typeof details.object === "string" && details.object.length > 0
      ? details.object
      : typeof details.title === "string" && details.title.length > 0
        ? details.title
        : typeof details.description === "string" && details.description.length > 0
          ? details.description
          : "—")

  const justification =
    (typeof details.justification === "string" && details.justification.length > 0
      ? details.justification
      : typeof details.description === "string" && details.description.length > 0
        ? details.description
        : "—")

  const status =
    typeof details.status === "string" && details.status.length > 0
      ? details.status
      : "Status não informado"

  const createdAt =
    (typeof details.createdAt === "string" && details.createdAt.length > 0
      ? details.createdAt
      : typeof details.created_at === "string" && details.created_at.length > 0
        ? details.created_at
        : undefined) ?? undefined

  return {
    id,
    object,
    justification,
    status,
    createdAt,
  }
}

async function fetchPlanDetails(planId: string, token: string) {
  try {
    const { data } = await api.get<PlanDetailsResponse>(`/api/v1/plans/${planId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!data || typeof data !== "object") {
      throw new Error("Resposta inválida da API de planos.")
    }

    return data
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response?.status === 404) {
        throw new Error("Plano não encontrado.")
      }

      const fallbackMessage = "Não foi possível carregar os detalhes do plano."
      const messageFromApi =
        typeof error.response?.data === "object" &&
        error.response?.data !== null &&
        typeof (error.response.data as { message?: unknown }).message === "string"
          ? ((error.response.data as { message?: string }).message as string)
          : fallbackMessage

      throw new Error(messageFromApi)
    }

    throw error
  }
}

function PlanDetailsPageComponent() {
  const router = useRouter()
  const params = useParams<{ id?: string | string[] }>()
  const token = useAuthStore((state) => state.token)

  const planId = useMemo(() => resolvePlanId(params?.id), [params?.id])

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<PlanDetailsResponse, Error>({
    queryKey: ["plan", planId],
    queryFn: () => {
      if (!planId) {
        throw new Error("Identificador do plano não informado.")
      }

      if (!token) {
        throw new Error("Sessão expirada. Faça login novamente.")
      }

      return fetchPlanDetails(planId, token)
    },
    enabled: Boolean(planId && token),
    staleTime: 30_000,
  })

  const normalizedPlan = useMemo(() => {
    if (!data) {
      return null
    }

    return normalizePlanDetails(data, planId)
  }, [data, planId])

  const handleBack = () => {
    router.push("/plans")
  }

  const displayPlanId = normalizedPlan?.id ?? planId ?? "Plano sem identificador"

  const { label: statusLabel, variant: statusVariant } = normalizedPlan
    ? resolveStatusBadge(normalizedPlan.status)
    : { label: "Status não informado", variant: "secondary" as const }

  const errorMessage =
    error?.message ?? (planId ? "Plano não encontrado." : "Identificador do plano não informado.")

  return (
    <AppLayout>
      <div className="space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Detalhes do Plano: {displayPlanId}
            </h1>
            <p className="text-sm text-slate-500">
              Consulte as principais informações do plano selecionado.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={handleBack} className="w-full sm:w-auto">
              Voltar
            </Button>
            <Button className="w-full sm:w-auto" variant="secondary">
              Editar
            </Button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          {isLoading ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Informações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-600">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-32 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Objeto da Contratação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-xl">Justificativa da Contratação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            </>
          ) : null}

          {!isLoading && (isError || !normalizedPlan) ? (
            <Card className="lg:col-span-2">
              <CardContent className="py-10 text-center text-sm text-red-600">
                {errorMessage}
              </CardContent>
            </Card>
          ) : null}

          {!isLoading && !isError && normalizedPlan ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Informações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-600">
                  <div className="space-y-1">
                    <span className="font-medium text-slate-900">Status</span>
                    <div>
                      <Badge variant={statusVariant}>{statusLabel}</Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="font-medium text-slate-900">Data de criação</span>
                    <p>{formatDate(normalizedPlan.createdAt)}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Objeto da Contratação</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-slate-700">
                    {normalizedPlan.object}
                  </p>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-xl">Justificativa da Contratação</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-slate-700">
                    {normalizedPlan.justification}
                  </p>
                </CardContent>
              </Card>
            </>
          ) : null}
        </section>
      </div>
    </AppLayout>
  )
}

const PlanDetailsPage = withAuth(PlanDetailsPageComponent)

export default PlanDetailsPage
