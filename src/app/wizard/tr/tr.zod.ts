import { z } from "zod"

import {
  emptyTrBensValues,
  trBensSchema,
  type TrBensFormValues,
  type TrBensStepFieldPath,
} from "./_schemas/tr-bens.zod"
import {
  emptyTrServicosValues,
  trServicosSchema,
  type TrServicosFormValues,
  type TrServicosStepFieldPath,
} from "./_schemas/tr-servicos.zod"

export const trSchema = z.discriminatedUnion("tipo", [trBensSchema, trServicosSchema])

export type TrFormValues = z.infer<typeof trSchema>
export type TrTipo = TrFormValues["tipo"]
export type TrStepFieldPath = TrBensStepFieldPath | TrServicosStepFieldPath

export const validationResponseSchema = z.object({
  errors: z.array(z.string()).optional().default([]),
  warnings: z.array(z.string()).optional().default([]),
  infos: z.array(z.string()).optional().default([]),
  checkedAt: z.string().optional().nullable(),
})

export type TrValidationResult = z.infer<typeof validationResponseSchema>

const emptyValuesByTipo: Record<TrTipo, TrFormValues> = {
  bens: emptyTrBensValues,
  servicos: emptyTrServicosValues,
}

function deepClone<T>(value: T): T {
  if (typeof structuredClone === "function") {
    return structuredClone(value)
  }

  return JSON.parse(JSON.stringify(value)) as T
}

export function getEmptyTrValues(tipo: TrTipo): TrFormValues {
  return deepClone(emptyValuesByTipo[tipo])
}

function mergeBensValues(partial: Partial<TrBensFormValues> | undefined | null): TrBensFormValues {
  const base = deepClone(emptyTrBensValues)
  if (!partial) {
    return base
  }

  return {
    tipo: "bens",
    identificacao: {
      ...base.identificacao,
      ...(partial.identificacao ?? {}),
    },
    especificacoes: {
      ...base.especificacoes,
      ...(partial.especificacoes ?? {}),
    },
    quantidades: {
      ...base.quantidades,
      ...(partial.quantidades ?? {}),
      quantidadeTotal: Number(partial.quantidades?.quantidadeTotal ?? base.quantidades.quantidadeTotal),
    },
    garantia: {
      ...base.garantia,
      ...(partial.garantia ?? {}),
    },
  }
}

function mergeServicosValues(partial: Partial<TrServicosFormValues> | undefined | null): TrServicosFormValues {
  const base = deepClone(emptyTrServicosValues)
  if (!partial) {
    return base
  }

  return {
    tipo: "servicos",
    escopo: {
      ...base.escopo,
      ...(partial.escopo ?? {}),
    },
    dimensionamento: {
      ...base.dimensionamento,
      ...(partial.dimensionamento ?? {}),
      quantidadeProfissionais: Number(
        partial.dimensionamento?.quantidadeProfissionais ?? base.dimensionamento.quantidadeProfissionais,
      ),
    },
    slas: {
      ...base.slas,
      ...(partial.slas ?? {}),
    },
  }
}

export function mergeTrValues(tipo: TrTipo, partial: Partial<TrFormValues> | undefined | null): TrFormValues {
  if (tipo === "servicos") {
    return mergeServicosValues(partial as Partial<TrServicosFormValues>)
  }

  return mergeBensValues(partial as Partial<TrBensFormValues>)
}

const trDocumentSchema = z.object({
  id: z.union([z.string(), z.number()]).transform((value) => String(value)),
  step: z.coerce.number().int().positive().optional().default(1),
  status: z.string().optional().nullable(),
  updatedAt: z.string().optional().nullable(),
  createdAt: z.string().optional().nullable(),
  tipo: z.enum(["bens", "servicos"]).optional().default("bens"),
  data: z.record(z.string(), z.any()).optional().default({}),
})

export type TrDocument = z.infer<typeof trDocumentSchema>

function resolveDocumentData(raw: unknown): Partial<TrFormValues> {
  const candidate =
    (typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>).data : undefined) ??
    (typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>).formData : undefined) ??
    (typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>).form_data : undefined) ??
    (typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>).dados : undefined) ??
    {}

  if (!candidate || typeof candidate !== "object") {
    return {}
  }

  return candidate as Partial<TrFormValues>
}

export function normalizeTrDocument(raw: unknown): TrDocument {
  const base = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {}
  const dados = typeof base.dados === "object" && base.dados !== null ? (base.dados as Record<string, unknown>) : undefined
  const formData =
    typeof base.formData === "object" && base.formData !== null ? (base.formData as Record<string, unknown>) : undefined
  const legacyFormData =
    typeof base.form_data === "object" && base.form_data !== null ? (base.form_data as Record<string, unknown>) : undefined

  return trDocumentSchema.parse({
    ...base,
    id: base.id ?? base.ID ?? base.identifier ?? base.trId ?? base.documentId ?? base.document_id,
    step: base.step ?? base.currentStep ?? base.current_step ?? base.etapa_atual,
    status: base.status ?? base.situacao ?? base.state ?? null,
    tipo: base.tipo ?? base.type ?? base.documentType ?? dados?.tipo ?? formData?.tipo ?? legacyFormData?.tipo,
    data: resolveDocumentData(base),
    updatedAt: base.updatedAt ?? base.updated_at ?? base.modifiedAt ?? base.modified_at ?? null,
    createdAt: base.createdAt ?? base.created_at ?? base.created ?? base.criadoEm ?? null,
  })
}
