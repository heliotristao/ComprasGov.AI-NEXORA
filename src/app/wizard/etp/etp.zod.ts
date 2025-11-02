import { z } from "zod"

import { EDOCS_REGEX } from "@/lib/edocs"

export const identificationSchema = z.object({
  requestingUnit: z
    .string()
    .trim()
    .min(1, "Informe a unidade requisitante."),
  edocsNumber: z
    .string()
    .trim()
    .min(1, "Informe o código E-Docs.")
    .regex(EDOCS_REGEX, "Informe um código E-Docs válido no formato AAAA-XXXXXX."),
  processTitle: z
    .string()
    .trim()
    .min(3, "Informe um título com pelo menos 3 caracteres."),
  summary: z
    .string()
    .trim()
    .min(10, "Apresente um resumo com pelo menos 10 caracteres."),
})

export const contextSchema = z.object({
  problemDescription: z
    .string()
    .trim()
    .min(10, "Descreva o problema ou necessidade identificada."),
  objectives: z
    .string()
    .trim()
    .min(10, "Detalhe os objetivos pretendidos com a contratação."),
  legalBasis: z
    .string()
    .trim()
    .min(5, "Informe os fundamentos legais aplicáveis."),
})

export const solutionSchema = z.object({
  evaluatedAlternatives: z
    .string()
    .trim()
    .min(10, "Liste as alternativas avaliadas."),
  recommendedSolution: z
    .string()
    .trim()
    .min(10, "Descreva a solução recomendada."),
  expectedBenefits: z
    .string()
    .trim()
    .min(10, "Detalhe os benefícios esperados."),
})

export const viabilitySchema = z.object({
  marketAnalysis: z
    .string()
    .trim()
    .min(10, "Apresente a análise de mercado."),
  estimatedBudget: z.coerce
    .number({ message: "Informe um valor numérico." })
    .nonnegative("Informe um valor igual ou superior a zero."),
  executionSchedule: z
    .string()
    .trim()
    .min(10, "Descreva o cronograma previsto."),
  risksAndMitigations: z
    .string()
    .trim()
    .min(10, "Liste os principais riscos e estratégias de mitigação."),
})

export const etpSchema = z.object({
  identification: identificationSchema,
  context: contextSchema,
  solution: solutionSchema,
  viability: viabilitySchema,
})

export type EtpFormValues = z.infer<typeof etpSchema>

export const emptyEtpFormValues: EtpFormValues = {
  identification: {
    requestingUnit: "",
    edocsNumber: "",
    processTitle: "",
    summary: "",
  },
  context: {
    problemDescription: "",
    objectives: "",
    legalBasis: "",
  },
  solution: {
    evaluatedAlternatives: "",
    recommendedSolution: "",
    expectedBenefits: "",
  },
  viability: {
    marketAnalysis: "",
    estimatedBudget: 0,
    executionSchedule: "",
    risksAndMitigations: "",
  },
}

export const partialEtpDataSchema = z.object({
  identification: identificationSchema.partial().optional(),
  context: contextSchema.partial().optional(),
  solution: solutionSchema.partial().optional(),
  viability: viabilitySchema.partial().optional(),
})

export const etpDocumentSchema = z.object({
  id: z.union([z.string(), z.number()]).transform((value) => String(value)),
  step: z.coerce.number().int().positive().optional().default(1),
  status: z.string().optional().nullable(),
  edocs: z.string().optional().nullable(),
  updatedAt: z.string().optional().nullable(),
  createdAt: z.string().optional().nullable(),
  data: partialEtpDataSchema.optional().default({}),
})

export type EtpDocument = z.infer<typeof etpDocumentSchema>

function resolveDocumentData(raw: any): Partial<EtpFormValues> {
  const dataCandidate =
    raw?.data ?? raw?.formData ?? raw?.form_data ?? raw?.dados ?? raw?.payload ?? {}

  try {
    const parsed = partialEtpDataSchema.parse(dataCandidate)
    return (parsed ?? {}) as Partial<EtpFormValues>
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Dados de formulário do ETP fora do padrão esperado.", error)
    }
    return {}
  }
}

export function normalizeEtpDocument(raw: unknown): EtpDocument {
  const base = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {}

  const parsed = etpDocumentSchema.parse({
    ...base,
    id: base.id ?? base.ID ?? base.identifier ?? base.etpId ?? base.documentId ?? base.document_id,
    step: base.step ?? base.currentStep ?? base.current_step ?? base.etapa_atual,
    status: base.status ?? base.situacao ?? base.state ?? null,
    edocs: base.edocs ?? base.numeroEdocs ?? base.numero_edocs ?? base.edocsNumber ?? null,
    updatedAt: base.updatedAt ?? base.updated_at ?? base.modifiedAt ?? base.modified_at ?? null,
    createdAt: base.createdAt ?? base.created_at ?? base.created ?? base.criadoEm ?? null,
    data: resolveDocumentData(base),
  })

  return parsed
}

export function mergeWithDefaults(partial: Partial<EtpFormValues> | null | undefined): EtpFormValues {
  return {
    identification: {
      ...emptyEtpFormValues.identification,
      ...(partial?.identification ?? {}),
    },
    context: {
      ...emptyEtpFormValues.context,
      ...(partial?.context ?? {}),
    },
    solution: {
      ...emptyEtpFormValues.solution,
      ...(partial?.solution ?? {}),
    },
    viability: {
      ...emptyEtpFormValues.viability,
      ...(partial?.viability ?? {}),
      estimatedBudget: Number(partial?.viability?.estimatedBudget ?? emptyEtpFormValues.viability.estimatedBudget),
    },
  }
}

export const validationResponseSchema = z.object({
  errors: z.array(z.string()).optional().default([]),
  warnings: z.array(z.string()).optional().default([]),
  infos: z.array(z.string()).optional().default([]),
  checkedAt: z.string().optional().nullable(),
})

export type EtpValidationResult = z.infer<typeof validationResponseSchema>

export type EtpStepFieldPath =
  | "identification.requestingUnit"
  | "identification.edocsNumber"
  | "identification.processTitle"
  | "identification.summary"
  | "context.problemDescription"
  | "context.objectives"
  | "context.legalBasis"
  | "solution.evaluatedAlternatives"
  | "solution.recommendedSolution"
  | "solution.expectedBenefits"
  | "viability.marketAnalysis"
  | "viability.estimatedBudget"
  | "viability.executionSchedule"
  | "viability.risksAndMitigations"
