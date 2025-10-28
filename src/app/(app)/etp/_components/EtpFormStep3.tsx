"use client"

import { Controller, useFormContext } from "react-hook-form"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

import type { EtpFormValues } from "./types"

export function EtpFormStep3() {
  const {
    control,
    formState: { errors },
  } = useFormContext<EtpFormValues>()

  return (
    <div className="grid gap-6">
      <Controller
        control={control}
        name="viability.marketAnalysis"
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="viability.marketAnalysis" className="text-sm font-semibold text-neutral-800">
              Análise de mercado
            </Label>
            <Textarea
              id="viability.marketAnalysis"
              rows={5}
              placeholder="Apresente a pesquisa de mercado realizada e os principais achados."
              {...field}
            />
            {errors.viability?.marketAnalysis ? (
              <p className="text-xs font-medium text-error-600">{errors.viability.marketAnalysis.message}</p>
            ) : (
              <p className="text-xs text-neutral-500">
                Inclua informações sobre fornecedores, preços e referenciais consultados.
              </p>
            )}
          </div>
        )}
      />

      <Controller
        control={control}
        name="viability.estimatedBudget"
        render={({ field }) => (
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
              {...field}
            />
            {errors.viability?.estimatedBudget ? (
              <p className="text-xs font-medium text-error-600">{errors.viability.estimatedBudget.message}</p>
            ) : (
              <p className="text-xs text-neutral-500">
                Informe o valor estimado considerando pesquisas e histórico da administração.
              </p>
            )}
          </div>
        )}
      />

      <Controller
        control={control}
        name="viability.schedule"
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="viability.schedule" className="text-sm font-semibold text-neutral-800">
              Cronograma e próximos passos
            </Label>
            <Textarea
              id="viability.schedule"
              rows={4}
              placeholder="Detalhe o cronograma estimado e atividades subsequentes."
              {...field}
            />
            {errors.viability?.schedule ? (
              <p className="text-xs font-medium text-error-600">{errors.viability.schedule.message}</p>
            ) : (
              <p className="text-xs text-neutral-500">
                Inclua marcos principais, responsáveis e prazos previstos.
              </p>
            )}
          </div>
        )}
      />

      <Controller
        control={control}
        name="viability.risks"
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="viability.risks" className="text-sm font-semibold text-neutral-800">
              Riscos identificados e mitigação
            </Label>
            <Textarea
              id="viability.risks"
              rows={4}
              placeholder="Aponte riscos relevantes e estratégias de mitigação."
              {...field}
            />
            {errors.viability?.risks ? (
              <p className="text-xs font-medium text-error-600">{errors.viability.risks.message}</p>
            ) : (
              <p className="text-xs text-neutral-500">
                Registre riscos operacionais, financeiros e prazos, indicando como serão tratados.
              </p>
            )}
          </div>
        )}
      />
    </div>
  )
}
