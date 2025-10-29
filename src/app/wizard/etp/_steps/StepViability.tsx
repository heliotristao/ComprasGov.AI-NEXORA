"use client"

import { Controller, useFormContext } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { AiField } from "../AiField"
import type { EtpFormValues } from "../etp.zod"

interface StepViabilityProps {
  etpId: string | null
  getContext: () => EtpFormValues
}

export function StepViability({ etpId, getContext }: StepViabilityProps) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<EtpFormValues>()

  return (
    <div className="grid gap-6">
      <Controller
        control={control}
        name="viability.marketAnalysis"
        render={({ field, fieldState }) => (
          <AiField
            id="viability.marketAnalysis"
            label="Análise de mercado"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            description="Apresente pesquisas realizadas, fornecedores consultados e benchmarks utilizados."
            placeholder="Contextualize a pesquisa de mercado, preços de referência e principais aprendizados."
            etpId={etpId}
            fieldKey="viability-market"
            getContext={() => ({ ...getContext(), step: "viability" })}
            rows={6}
          />
        )}
      />

      <div className="space-y-2">
        <Label htmlFor="viability.estimatedBudget" className="text-sm font-semibold text-neutral-800">
          Estimativa de investimento (R$)
        </Label>
        <Input
          id="viability.estimatedBudget"
          type="number"
          min="0"
          step="0.01"
          placeholder="0,00"
          inputMode="decimal"
          {...register("viability.estimatedBudget", { valueAsNumber: true })}
        />
        {errors.viability?.estimatedBudget ? (
          <p className="text-xs font-medium text-error-600">{errors.viability.estimatedBudget.message}</p>
        ) : (
          <p className="text-xs text-neutral-500">Informe o valor estimado considerando pesquisas, histórico e contexto orçamentário.</p>
        )}
      </div>

      <Controller
        control={control}
        name="viability.executionSchedule"
        render={({ field, fieldState }) => (
          <AiField
            id="viability.executionSchedule"
            label="Cronograma previsto"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            description="Detalhe etapas, marcos e responsáveis para a execução da solução."
            placeholder="Apresente fases do projeto, prazos e dependências críticas."
            etpId={etpId}
            fieldKey="viability-schedule"
            getContext={() => ({ ...getContext(), step: "viability" })}
            rows={5}
          />
        )}
      />

      <Controller
        control={control}
        name="viability.risksAndMitigations"
        render={({ field, fieldState }) => (
          <AiField
            id="viability.risksAndMitigations"
            label="Riscos e mitigação"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            description="Aponte riscos técnicos, financeiros ou operacionais e as estratégias de mitigação previstas."
            placeholder="Liste riscos relevantes e descreva ações para mitigá-los."
            etpId={etpId}
            fieldKey="viability-risks"
            getContext={() => ({ ...getContext(), step: "viability" })}
            rows={5}
          />
        )}
      />
    </div>
  )
}
