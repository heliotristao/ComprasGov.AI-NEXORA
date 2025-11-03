"use client"

import { Controller, useFormContext } from "react-hook-form"

import { AiField } from "../AiField"
import type { EtpFormValues } from "../etp.zod"

interface StepSolutionProps {
  etpId: string | null
  getContext: () => EtpFormValues
}

const TEST_IDS = {
  evaluatedAlternatives: "alternativas-avaliadas",
  recommendedSolution: "solucao-recomendada",
  expectedBenefits: "beneficios-esperados",
} as const

export function StepSolution({ etpId, getContext }: StepSolutionProps) {
  const { control } = useFormContext<EtpFormValues>()

  return (
    <div className="grid gap-6">
      <Controller
        control={control}
        name="solution.evaluatedAlternatives"
        render={({ field, fieldState }) => (
          <AiField
            id="solution.evaluatedAlternatives"
            label="Alternativas avaliadas"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            description="Documente quais cenários foram considerados e os critérios utilizados para a análise."
            placeholder="Liste cada alternativa avaliada, destacando custos, riscos e impactos para o órgão."
            etpId={etpId}
            fieldKey="solution-alternatives"
            getContext={() => ({ ...getContext(), step: "solution" })}
            rows={6}
            testId={TEST_IDS.evaluatedAlternatives}
          />
        )}
      />

      <Controller
        control={control}
        name="solution.recommendedSolution"
        render={({ field, fieldState }) => (
          <AiField
            id="solution.recommendedSolution"
            label="Solução recomendada"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            description="Explique qual abordagem foi escolhida, justificando os benefícios frente às demais alternativas."
            placeholder="Descreva a solução selecionada, fornecedores de referência e os principais diferenciais."
            etpId={etpId}
            fieldKey="solution-recommended"
            getContext={() => ({ ...getContext(), step: "solution" })}
            rows={5}
            testId={TEST_IDS.recommendedSolution}
          />
        )}
      />

      <Controller
        control={control}
        name="solution.expectedBenefits"
        render={({ field, fieldState }) => (
          <AiField
            id="solution.expectedBenefits"
            label="Benefícios esperados"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            description="Aponte ganhos de eficiência, mitigação de riscos e impactos positivos para os usuários finais."
            placeholder="Liste benefícios quantitativos e qualitativos que justificam a adoção da solução proposta."
            etpId={etpId}
            fieldKey="solution-benefits"
            getContext={() => ({ ...getContext(), step: "solution" })}
            rows={5}
            testId={TEST_IDS.expectedBenefits}
          />
        )}
      />
    </div>
  )
}
