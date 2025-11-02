import { useCallback, useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "@/lib/axios"

export interface TrDocument {
  id: string
  step: number
  tipo: "bens" | "servicos"
  data: Record<string, unknown>
  status?: string | null
  updatedAt?: string | null
  createdAt?: string | null
  meta?: Record<string, unknown>
}

interface UseTrOptions {
  enabled?: boolean
  initialData?: TrDocument
}

interface SaveStepPayload {
  step: number
  patch?: Record<string, unknown>
}

function normalizeTimestamp(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) {
    return value
  }
  return null
}

function normalizeStep(value: unknown, fallback = 1): number {
  const parsed = Number(value)
  if (Number.isInteger(parsed) && parsed > 0) {
    return parsed
  }
  return fallback
}

function normalizeTipo(value: unknown, fallback: "bens" | "servicos" = "bens"): "bens" | "servicos" {
  if (typeof value !== "string") {
    return fallback
  }

  const normalized = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  if (normalized === "servicos") {
    return "servicos"
  }

  return "bens"
}

function normalizeTrDocument(raw: any, fallbackId: string | number): TrDocument {
  const id = raw?.id ?? fallbackId

  return {
    id: String(id),
    step: normalizeStep(raw?.step ?? raw?.current_step ?? raw?.etapa_atual, 1),
    tipo: normalizeTipo(raw?.tipo ?? raw?.type ?? raw?.dados?.tipo ?? raw?.formData?.tipo ?? raw?.form_data?.tipo),
    status: raw?.status ?? raw?.situacao ?? null,
    updatedAt: normalizeTimestamp(raw?.updatedAt ?? raw?.updated_at),
    createdAt: normalizeTimestamp(raw?.createdAt ?? raw?.created_at),
    meta: raw?.meta ?? raw?.metadata ?? undefined,
    data:
      (raw?.data as Record<string, unknown>) ??
      (raw?.formData as Record<string, unknown>) ??
      (raw?.form_data as Record<string, unknown>) ??
      (raw?.dados as Record<string, unknown>) ??
      {},
  }
}

export function useTr(documentId: number | string | null | undefined, options: UseTrOptions = {}) {
  const idAsNumber = typeof documentId === "string" ? Number.parseInt(documentId, 10) : documentId
  const queryClient = useQueryClient()
  const isValidId = typeof idAsNumber === "number" && Number.isFinite(idAsNumber)

  const normalizedInitialData = useMemo(() => {
    if (!options.initialData) {
      return undefined
    }

    return normalizeTrDocument(options.initialData, options.initialData.id)
  }, [options.initialData])

  const queryKey = useMemo(() => ["tr", idAsNumber], [idAsNumber])

  const queryResult = useQuery<TrDocument>({
    queryKey,
    queryFn: async () => {
      if (idAsNumber === null || idAsNumber === undefined) {
        throw new Error("O identificador do TR é obrigatório para carregar os dados.")
      }

      const response = await api.get(`/api/tr/${idAsNumber}`)
      return normalizeTrDocument(response.data, idAsNumber)
    },
    enabled: options.enabled ?? isValidId,
    initialData: normalizedInitialData,
    staleTime: 0,
  })

  const mutation = useMutation({
    mutationFn: async ({ step, patch }: SaveStepPayload) => {
      if (idAsNumber === null || idAsNumber === undefined) {
        throw new Error("O identificador do TR é obrigatório para salvar os dados.")
      }

      const body: Record<string, unknown> = {}

      if (Number.isInteger(step) && step > 0) {
        body.step = step
      }

      if (patch && Object.keys(patch).length > 0) {
        body.patch = patch
      }

      const response = await api.patch(`/api/tr/${idAsNumber}`, body)
      return normalizeTrDocument(response.data, idAsNumber)
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, (current: TrDocument | undefined) => {
        if (!current) {
          return updated
        }

        return {
          ...current,
          ...updated,
          data: {
            ...(current.data ?? {}),
            ...(updated?.data ?? {}),
          },
          tipo: updated?.tipo ?? current.tipo,
        }
      })
    },
  })

  const saveStep = useCallback(
    (step: number, patch?: Record<string, unknown>) => mutation.mutateAsync({ step, patch }),
    [mutation]
  )

  return {
    ...queryResult,
    saveStep,
    isSaving: mutation.isPending,
    saveError: mutation.error,
  }
}
