import { z } from "zod"

export const trTypeSchema = z.enum(["bens", "servicos"])

export const trBensSchema = z.object({
  tipo: z.literal("bens"),
  identificacao: z.object({
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
    codigoEdocs: z
      .string()
      .trim()
      .regex(/^[0-9]{4}-[A-Z0-9]{6}$/i, "Informe o código no formato AAAA-XXXXXX."),
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
      .number({ message: "Informe uma quantidade válida." })
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

export const trServicosSchema = z.object({
  tipo: z.literal("servicos"),
  escopo: z.object({
    descricaoServico: z
      .string()
      .trim()
      .min(1, "Descreva o escopo do serviço."),
    objetivos: z
      .string()
      .trim()
      .min(1, "Liste os objetivos do serviço."),
    requisitosTecnicos: z
      .string()
      .trim()
      .min(1, "Detalhe os requisitos técnicos."),
  }),
  dimensionamento: z.object({
    quantidadeProfissionais: z.coerce
      .number({ message: "Informe a quantidade de profissionais." })
      .min(1, "Informe a quantidade estimada de profissionais."),
    cargaHoraria: z
      .string()
      .trim()
      .min(1, "Informe a carga horária prevista."),
    criteriosAlocacao: z
      .string()
      .trim()
      .min(1, "Detalhe os critérios de alocação."),
  }),
  slas: z.object({
    niveisServico: z
      .string()
      .trim()
      .min(1, "Descreva os níveis de serviço."),
    indicadoresDesempenho: z
      .string()
      .trim()
      .min(1, "Informe os indicadores de desempenho."),
    penalidades: z
      .string()
      .trim()
      .min(1, "Descreva as penalidades aplicáveis."),
  }),
})

export const trFormSchema = z.discriminatedUnion("tipo", [trBensSchema, trServicosSchema])

export type TrFormValues = z.infer<typeof trFormSchema>
export type TrType = z.infer<typeof trTypeSchema>

export const trStepSchemas: Record<TrType, Record<number, z.ZodTypeAny>> = {
  bens: {
    1: trBensSchema.pick({ tipo: true, identificacao: true }),
    2: trBensSchema.pick({ tipo: true, especificacoes: true }),
    3: trBensSchema.pick({ tipo: true, quantidades: true }),
    4: trBensSchema.pick({ tipo: true, garantia: true }),
  },
  servicos: {
    1: trServicosSchema.pick({ tipo: true, escopo: true }),
    2: trServicosSchema.pick({ tipo: true, dimensionamento: true }),
    3: trServicosSchema.pick({ tipo: true, slas: true }),
  },
}
