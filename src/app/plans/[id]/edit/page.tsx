"use client"

import { useEffect, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import AppLayout from "@/app/(app)/layout"
import withAuth from "@/components/auth/withAuth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
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
  [key: string]: unknown
}

interface NormalizedPlanDetails {
  id: string
  object: string
  justification: string
}

const editPlanSchema = z.object({
  object: z
    .string()
    .trim()
    .min(1, { message: "Informe o objeto da contratação." }),
  justification: z
    .string()
    .trim()
    .min(1, { message: "Descreva a justificativa da contratação." }),
})

type EditPlanFormValues = z.infer<typeof editPlanSchema>

function resolvePlanId(rawId: string | string[] | undefined) {
  if (!rawId) {
    return undefined
  }

  if (Array.isArray(rawId)) {
    return rawId[0]
  }

  return rawId
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
          : "")

  const justification =
    (typeof details.justification === "string" && details.justification.length > 0
      ? details.justification
      : typeof details.description === "string" && details.description.length > 0
        ? details.description
        : "")

  return {
    id,
    object,
    justification,
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

function PlanEditPageComponent() {
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

  const defaultValues = useMemo(
    () => ({
      object: normalizedPlan?.object ?? "",
      justification: normalizedPlan?.justification ?? "",
    }),
    [normalizedPlan]
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditPlanFormValues>({
    resolver: zodResolver(editPlanSchema),
    defaultValues,
  })

  useEffect(() => {
    if (normalizedPlan) {
      reset(defaultValues)
    }
  }, [defaultValues, normalizedPlan, reset])

  const handleCancel = () => {
    if (planId) {
      router.push(`/plans/${planId}`)
    } else {
      router.push("/plans")
    }
  }

  const displayPlanId = normalizedPlan?.id ?? planId ?? "Plano sem identificador"
  const errorMessage =
    error?.message ?? (planId ? "Plano não encontrado." : "Identificador do plano não informado.")

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900">
            Editar Plano de Contratação: {displayPlanId}
          </h1>
          <p className="text-sm text-slate-600">
            Atualize as informações necessárias do plano selecionado.
          </p>
        </div>

        {isLoading ? (
          <Card className="border-slate-200">
            <CardHeader className="space-y-3">
              <CardTitle className="text-xl font-semibold text-slate-900">
                Carregando dados do plano
              </CardTitle>
              <CardDescription className="text-sm text-slate-600">
                Aguarde enquanto buscamos as informações atuais do plano.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-24 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-24 w-full" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-36" />
            </CardFooter>
          </Card>
        ) : null}

        {!isLoading && (isError || !normalizedPlan) ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-red-600">
              {errorMessage}
            </CardContent>
          </Card>
        ) : null}

        {!isLoading && !isError && normalizedPlan ? (
          <form onSubmit={handleSubmit(() => {})} noValidate>
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="space-y-3">
                <div>
                  <CardTitle className="text-xl font-semibold text-slate-900">
                    Dados do plano
                  </CardTitle>
                  <CardDescription className="text-sm text-slate-600">
                    Revise e ajuste o objeto e a justificativa da contratação conforme necessário.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="object">Objeto da Contratação</Label>
                  <Textarea
                    id="object"
                    {...register("object")}
                    placeholder="Descreva detalhadamente o que será contratado."
                    rows={6}
                    aria-invalid={Boolean(errors.object)}
                    aria-describedby={errors.object ? "object-error" : "object-description"}
                  />
                  <p id="object-description" className="text-sm text-slate-500">
                    Inclua escopo, quantidades e principais requisitos técnicos.
                  </p>
                  {errors.object ? (
                    <p
                      id="object-error"
                      className="text-sm text-destructive"
                      role="alert"
                    >
                      {errors.object.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="justification">Justificativa da Contratação</Label>
                  <Textarea
                    id="justification"
                    {...register("justification")}
                    placeholder="Explique o motivo e a necessidade da contratação."
                    rows={6}
                    aria-invalid={Boolean(errors.justification)}
                    aria-describedby={
                      errors.justification
                        ? "justification-error"
                        : "justification-description"
                    }
                  />
                  <p id="justification-description" className="text-sm text-slate-500">
                    Aponte o problema a ser resolvido, benefícios esperados e base legal.
                  </p>
                  {errors.justification ? (
                    <p
                      id="justification-error"
                      className="text-sm text-destructive"
                      role="alert"
                    >
                      {errors.justification.message}
                    </p>
                  ) : null}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Alterações</Button>
              </CardFooter>
            </Card>
          </form>
        ) : null}
      </div>
    </AppLayout>
  )
}

const PlanEditPage = withAuth(PlanEditPageComponent)

export default PlanEditPage
