"use client"

import { Controller, useFormContext } from "react-hook-form"

import { AiField } from "../../AiField"
import type { TrFormValues } from "../../tr.zod"

interface SlasStepProps {
  trId: string | null
  getContext: () => TrFormValues
}

const TEST_IDS = {
  niveisServico: "slas-niveis-servico",
  indicadoresDesempenho: "indicadores-desempenho",
  penalidades: "penalidades-aplicaveis",
} as const

export function SlasStep({ trId, getContext }: SlasStepProps) {
  const { control } = useFormContext<TrFormValues>()

  return (
    <div className="grid gap-6">
      <Controller
        control={control}
        name={"slas.niveisServico" as const}
        render={({ field, fieldState }) => (
          <AiField
            id="slas.niveisServico"
            label="Níveis de serviço (SLAs)"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            description="Defina parâmetros de qualidade, tempos máximos e metas de atendimento."
            placeholder="Informe tempos de resposta, resolução e disponibilidade exigidos."
            trId={trId}
            fieldKey="slas-niveis"
            getContext={() => ({ ...getContext(), step: "slas" })}
            rows={5}
            testId={TEST_IDS.niveisServico}
          />
        )}
      />

      <Controller
        control={control}
        name={"slas.indicadoresDesempenho" as const}
        render={({ field, fieldState }) => (
          <AiField
            id="slas.indicadoresDesempenho"
            label="Indicadores de desempenho"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            description="Liste indicadores que serão monitorados e suas metas."
            placeholder="Ex.: Índice de satisfação, taxa de retrabalho, disponibilidade de equipe."
            trId={trId}
            fieldKey="slas-indicadores"
            getContext={() => ({ ...getContext(), step: "slas" })}
            rows={5}
            testId={TEST_IDS.indicadoresDesempenho}
          />
        )}
      />

      <Controller
        control={control}
        name={"slas.penalidades" as const}
        render={({ field, fieldState }) => (
          <AiField
            id="slas.penalidades"
            label="Penalidades aplicáveis"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            description="Descreva penalidades e mecanismos de compensação em caso de descumprimento."
            placeholder="Inclua multas, descontos, reforço de equipe ou rescisão contratual."
            trId={trId}
            fieldKey="slas-penalidades"
            getContext={() => ({ ...getContext(), step: "slas" })}
            rows={5}
            testId={TEST_IDS.penalidades}
          />
        )}
      />
    </div>
  )
}
