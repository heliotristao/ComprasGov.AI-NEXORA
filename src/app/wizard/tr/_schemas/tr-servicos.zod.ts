import { z } from "zod"

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

export type TrServicosFormValues = z.infer<typeof trServicosSchema>

export type TrServicosStepFieldPath =
  | "escopo.descricaoServico"
  | "escopo.objetivos"
  | "escopo.requisitosTecnicos"
  | "dimensionamento.quantidadeProfissionais"
  | "dimensionamento.cargaHoraria"
  | "dimensionamento.criteriosAlocacao"
  | "slas.niveisServico"
  | "slas.indicadoresDesempenho"
  | "slas.penalidades"

export const emptyTrServicosValues: TrServicosFormValues = {
  tipo: "servicos",
  escopo: {
    descricaoServico: "",
    objetivos: "",
    requisitosTecnicos: "",
  },
  dimensionamento: {
    quantidadeProfissionais: 1,
    cargaHoraria: "",
    criteriosAlocacao: "",
  },
  slas: {
    niveisServico: "",
    indicadoresDesempenho: "",
    penalidades: "",
  },
}
