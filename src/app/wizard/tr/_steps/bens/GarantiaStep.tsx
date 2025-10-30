"use client"

import { Controller, useFormContext } from "react-hook-form"

import { AiField } from "../../AiField"
import type { TrFormValues } from "../../tr.zod"

interface GarantiaStepProps {
  trId: string | null
  getContext: () => TrFormValues
}

export function GarantiaStep({ trId, getContext }: GarantiaStepProps) {
  const { control } = useFormContext<TrFormValues>()

  return (
    <div className="grid gap-6">
      <Controller
        control={control}
        name={"garantia.tipoGarantia" as const}
        render={({ field, fieldState }) => (
          <AiField
            id="garantia.tipoGarantia"
            label="Tipo de garantia"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            description="Defina o modelo de garantia exigido para os bens adquiridos."
            placeholder="Ex.: Garantia estendida de 36 meses com atendimento on-site."
            trId={trId}
            fieldKey="garantia-tipo"
            getContext={() => ({ ...getContext(), step: "garantia" })}
            rows={4}
          />
        )}
      />

      <Controller
        control={control}
        name={"garantia.prazoGarantia" as const}
        render={({ field, fieldState }) => (
          <AiField
            id="garantia.prazoGarantia"
            label="Prazo de garantia"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            description="Informe o prazo de garantia contratual desejado."
            placeholder="Detalhe períodos de cobertura, início e término de vigência."
            trId={trId}
            fieldKey="garantia-prazo"
            getContext={() => ({ ...getContext(), step: "garantia" })}
            rows={4}
          />
        )}
      />

      <Controller
        control={control}
        name={"garantia.assistenciaTecnica" as const}
        render={({ field, fieldState }) => (
          <AiField
            id="garantia.assistenciaTecnica"
            label="Assistência técnica"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            description="Descreva condições de atendimento, prazos e cobertura da assistência técnica."
            placeholder="Inclua canais de atendimento, SLA de atendimento e requisitos de peças originais."
            trId={trId}
            fieldKey="garantia-assistencia"
            getContext={() => ({ ...getContext(), step: "garantia" })}
            rows={5}
          />
        )}
      />
    </div>
  )
}
