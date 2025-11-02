import { z } from "zod"

export const etpFormSchema = z.object({
  general: z.object({
    title: z
      .string()
      .trim()
      .min(1, { message: "Informe o título do ETP." })
      .min(3, "Informe um título com pelo menos 3 caracteres."),
    context: z
      .string()
      .trim()
      .min(1, { message: "Descreva o contexto atual." })
      .min(10, "Explique o contexto com pelo menos 10 caracteres."),
    justification: z
      .string()
      .trim()
      .min(1, { message: "Apresente a justificativa." })
      .min(10, "Detalhe a justificativa com pelo menos 10 caracteres."),
  }),
  solution: z.object({
    alternatives: z
      .string()
      .trim()
      .min(1, { message: "Liste as alternativas avaliadas." })
      .min(10, "Descreva as alternativas com pelo menos 10 caracteres."),
    recommended: z
      .string()
      .trim()
      .min(1, { message: "Informe a solução recomendada." })
      .min(10, "Explique a solução recomendada com pelo menos 10 caracteres."),
    scope: z
      .string()
      .trim()
      .min(1, { message: "Descreva o escopo." })
      .min(10, "Detalhe o escopo com pelo menos 10 caracteres."),
  }),
  viability: z.object({
    marketAnalysis: z
      .string()
      .trim()
      .min(1, { message: "Informe a análise de mercado." })
      .min(10, "Detalhe a análise com pelo menos 10 caracteres."),
    estimatedBudget: z.coerce
      .number({ message: "Informe um valor numérico." })
      .min(0, "O valor estimado deve ser igual ou maior que zero."),
    schedule: z
      .string()
      .trim()
      .min(1, { message: "Descreva o cronograma." })
      .min(5, "Detalhe o cronograma com pelo menos 5 caracteres."),
    risks: z
      .string()
      .trim()
      .min(1, { message: "Informe os riscos identificados." })
      .min(5, "Descreva os riscos com pelo menos 5 caracteres."),
  }),
})

export type EtpFormValues = z.infer<typeof etpFormSchema>

export interface EtpRecord {
  id: string
  edocs: string
  status: string
  owner?: string | null
  updatedAt?: string | null
  createdAt?: string | null
  formData?: Partial<EtpFormValues>
  title?: string | null
  step?: number | null
}

export interface EtpListItem {
  id: string
  edocs: string
  status: string
  owner: string
  updatedAt: string
  title: string
}

export interface CreateEtpResponse {
  id: string
}
