import { z } from "zod"

export const etpFormSchema = z.object({
  general: z.object({
    title: z
      .string({ required_error: "Informe o título do ETP." })
      .trim()
      .min(3, "Informe um título com pelo menos 3 caracteres."),
    context: z
      .string({ required_error: "Descreva o contexto atual." })
      .trim()
      .min(10, "Explique o contexto com pelo menos 10 caracteres."),
    justification: z
      .string({ required_error: "Apresente a justificativa." })
      .trim()
      .min(10, "Detalhe a justificativa com pelo menos 10 caracteres."),
  }),
  solution: z.object({
    alternatives: z
      .string({ required_error: "Liste as alternativas avaliadas." })
      .trim()
      .min(10, "Descreva as alternativas com pelo menos 10 caracteres."),
    recommended: z
      .string({ required_error: "Informe a solução recomendada." })
      .trim()
      .min(10, "Explique a solução recomendada com pelo menos 10 caracteres."),
    scope: z
      .string({ required_error: "Descreva o escopo." })
      .trim()
      .min(10, "Detalhe o escopo com pelo menos 10 caracteres."),
  }),
  viability: z.object({
    marketAnalysis: z
      .string({ required_error: "Informe a análise de mercado." })
      .trim()
      .min(10, "Detalhe a análise com pelo menos 10 caracteres."),
    estimatedBudget: z.coerce
      .number({ invalid_type_error: "Informe um valor numérico." })
      .min(0, "O valor estimado deve ser igual ou maior que zero."),
    schedule: z
      .string({ required_error: "Descreva o cronograma." })
      .trim()
      .min(5, "Detalhe o cronograma com pelo menos 5 caracteres."),
    risks: z
      .string({ required_error: "Informe os riscos identificados." })
      .trim()
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
