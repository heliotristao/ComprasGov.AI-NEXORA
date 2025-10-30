import { z } from "zod"

export const trBensSchema = z.object({
  tipo: z.literal("bens"),
  identificacao: z.object({
    codigoEdocs: z
      .string()
      .trim()
      .min(1, "Informe o código E-Docs.")
      .regex(/^[0-9]{4}-[A-Z0-9]{6}$/i, "Informe o código no formato AAAA-XXXXXX."),
    objeto: z
      .string()
      .trim()
      .min(1, "Descreva o objeto da contratação."),
    justificativa: z
      .string()
      .trim()
      .min(1, "Explique a justificativa da necessidade."),
    setorRequisitante: z
      .string()
      .trim()
      .min(1, "Informe o setor requisitante."),
  }),
  especificacoes: z.object({
    descricaoTecnica: z
      .string()
      .trim()
      .min(1, "Detalhe as especificações técnicas."),
    requisitosMinimos: z
      .string()
      .trim()
      .min(1, "Liste os requisitos mínimos."),
    normasReferencia: z
      .string()
      .trim()
      .min(1, "Informe as normas ou referências aplicáveis."),
  }),
  quantidades: z.object({
    quantidadeTotal: z.coerce
      .number({ message: "Informe a quantidade total." })
      .min(1, "Informe a quantidade estimada."),
    unidadeMedida: z
      .string()
      .trim()
      .min(1, "Informe a unidade de medida."),
    justificativaQuantidade: z
      .string()
      .trim()
      .min(1, "Justifique a quantidade solicitada."),
    cronogramaEntrega: z
      .string()
      .trim()
      .min(1, "Detalhe o cronograma de entrega."),
  }),
  garantia: z.object({
    tipoGarantia: z
      .string()
      .trim()
      .min(1, "Informe o tipo de garantia."),
    prazoGarantia: z
      .string()
      .trim()
      .min(1, "Informe o prazo da garantia."),
    assistenciaTecnica: z
      .string()
      .trim()
      .min(1, "Detalhe as condições de assistência técnica."),
  }),
})

export type TrBensFormValues = z.infer<typeof trBensSchema>

export type TrBensStepFieldPath =
  | "identificacao.codigoEdocs"
  | "identificacao.objeto"
  | "identificacao.justificativa"
  | "identificacao.setorRequisitante"
  | "especificacoes.descricaoTecnica"
  | "especificacoes.requisitosMinimos"
  | "especificacoes.normasReferencia"
  | "quantidades.quantidadeTotal"
  | "quantidades.unidadeMedida"
  | "quantidades.justificativaQuantidade"
  | "quantidades.cronogramaEntrega"
  | "garantia.tipoGarantia"
  | "garantia.prazoGarantia"
  | "garantia.assistenciaTecnica"

export const emptyTrBensValues: TrBensFormValues = {
  tipo: "bens",
  identificacao: {
    codigoEdocs: "",
    objeto: "",
    justificativa: "",
    setorRequisitante: "",
  },
  especificacoes: {
    descricaoTecnica: "",
    requisitosMinimos: "",
    normasReferencia: "",
  },
  quantidades: {
    quantidadeTotal: 1,
    unidadeMedida: "",
    justificativaQuantidade: "",
    cronogramaEntrega: "",
  },
  garantia: {
    tipoGarantia: "",
    prazoGarantia: "",
    assistenciaTecnica: "",
  },
}
