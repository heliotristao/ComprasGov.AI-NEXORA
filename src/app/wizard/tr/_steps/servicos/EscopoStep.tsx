"use client"

import { Controller, useFormContext } from "react-hook-form"

import { AiField } from "../../AiField"
import type { TrFormValues } from "../../tr.zod"

interface EscopoStepProps {
  trId: string | null
  getContext: () => TrFormValues
}

export function EscopoStep({ trId, getContext }: EscopoStepProps) {
  const { control } = useFormContext<TrFormValues>()

  return (
    <div className="grid gap-6">
      <Controller
        control={control}
        name={"escopo.descricaoServico" as const}
        render={({ field, fieldState }) => (
          <AiField
            id="escopo.descricaoServico"
            label="Descrição do serviço"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            description="Detalhe o escopo funcional, entregáveis e limitações do serviço."
            placeholder="Descreva claramente o que será executado pela contratada."
            trId={trId}
            fieldKey="escopo-descricao"
            getContext={() => ({ ...getContext(), step: "escopo" })}
            rows={6}
          />
        )}
      />

      <Controller
        control={control}
        name={"escopo.objetivos" as const}
        render={({ field, fieldState }) => (
          <AiField
            id="escopo.objetivos"
            label="Objetivos estratégicos"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            description="Liste objetivos estratégicos e benefícios esperados."
            placeholder="Relacionar metas institucionais, indicadores e impactos positivos."
            trId={trId}
            fieldKey="escopo-objetivos"
            getContext={() => ({ ...getContext(), step: "escopo" })}
            rows={5}
          />
        )}
      />

      <Controller
        control={control}
        name={"escopo.requisitosTecnicos" as const}
        render={({ field, fieldState }) => (
          <AiField
            id="escopo.requisitosTecnicos"
            label="Requisitos técnicos"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            description="Informe requisitos funcionais, técnicos e restrições de execução."
            placeholder="Descreva padrões, ferramentas, tecnologias e boas práticas obrigatórias."
            trId={trId}
            fieldKey="escopo-requisitos"
            getContext={() => ({ ...getContext(), step: "escopo" })}
            rows={5}
          />
        )}
      />
    </div>
  )
}
