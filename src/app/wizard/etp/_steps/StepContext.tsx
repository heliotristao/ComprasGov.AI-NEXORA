"use client"

import { Controller, useFormContext } from "react-hook-form"

import { AiField } from "../AiField"
import type { EtpFormValues } from "../etp.zod"

interface StepContextProps {
  etpId: string | null
  getContext: () => EtpFormValues
}

export function StepContext({ etpId, getContext }: StepContextProps) {
  const { control } = useFormContext<EtpFormValues>()

  return (
    <div className="grid gap-6">
      <Controller
        control={control}
        name="context.problemDescription"
        render={({ field, fieldState }) => (
          <AiField
            id="context.problemDescription"
            label="Problema ou necessidade identificada"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            description="Descreva claramente a dor ou necessidade que motivou a elaboração do ETP."
            placeholder="Explique qual situação demanda a contratação e quais impactos estão sendo enfrentados."
            etpId={etpId}
            fieldKey="context-problem"
            getContext={() => ({ ...getContext(), step: "context" })}
            rows={6}
          />
        )}
      />

      <Controller
        control={control}
        name="context.objectives"
        render={({ field, fieldState }) => (
          <AiField
            id="context.objectives"
            label="Objetivos do projeto"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            description="Detalhe quais resultados se pretende alcançar com a contratação."
            placeholder="Liste os objetivos estratégicos, indicadores e ganhos esperados."
            etpId={etpId}
            fieldKey="context-objectives"
            getContext={() => ({ ...getContext(), step: "context" })}
            rows={5}
          />
        )}
      />

      <Controller
        control={control}
        name="context.legalBasis"
        render={({ field, fieldState }) => (
          <AiField
            id="context.legalBasis"
            label="Fundamentação legal"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            description="Indique normas, artigos ou pareceres que respaldam a contratação."
            placeholder="Cite leis, decretos, notas técnicas ou orientações normativas relevantes."
            etpId={etpId}
            fieldKey="context-legal"
            getContext={() => ({ ...getContext(), step: "context" })}
            rows={5}
          />
        )}
      />
    </div>
  )
}
