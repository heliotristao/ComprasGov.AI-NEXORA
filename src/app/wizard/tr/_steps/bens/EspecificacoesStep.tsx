"use client"

import { Controller, useFormContext } from "react-hook-form"

import { AiField } from "../../AiField"
import type { TrFormValues } from "../../tr.zod"

interface EspecificacoesStepProps {
  trId: string | null
  getContext: () => TrFormValues
}

export function EspecificacoesStep({ trId, getContext }: EspecificacoesStepProps) {
  const { control } = useFormContext<TrFormValues>()

  return (
    <div className="grid gap-6">
      <Controller
        control={control}
        name={"especificacoes.descricaoTecnica" as const}
        render={({ field, fieldState }) => (
          <AiField
            id="especificacoes.descricaoTecnica"
            label="Descrição técnica detalhada"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            description="Apresente os requisitos técnicos obrigatórios e diferenciais desejáveis."
            placeholder="Detalhe características, padrões de qualidade e tecnologias aceitas."
            trId={trId}
            fieldKey="especificacoes-descricao"
            getContext={() => ({ ...getContext(), step: "especificacoes" })}
            rows={6}
          />
        )}
      />

      <Controller
        control={control}
        name={"especificacoes.requisitosMinimos" as const}
        render={({ field, fieldState }) => (
          <AiField
            id="especificacoes.requisitosMinimos"
            label="Requisitos mínimos"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            description="Liste requisitos mandatórios que os fornecedores devem atender."
            placeholder="Inclua certificações, componentes, materiais e desempenho mínimo."
            trId={trId}
            fieldKey="especificacoes-requisitos"
            getContext={() => ({ ...getContext(), step: "especificacoes" })}
            rows={5}
          />
        )}
      />

      <Controller
        control={control}
        name={"especificacoes.normasReferencia" as const}
        render={({ field, fieldState }) => (
          <AiField
            id="especificacoes.normasReferencia"
            label="Normas e referências"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            description="Indique normas técnicas, padrões ou regulamentações aplicáveis."
            placeholder="Cite ABNT, ISO, decretos ou notas técnicas relevantes."
            trId={trId}
            fieldKey="especificacoes-normas"
            getContext={() => ({ ...getContext(), step: "especificacoes" })}
            rows={4}
          />
        )}
      />
    </div>
  )
}
