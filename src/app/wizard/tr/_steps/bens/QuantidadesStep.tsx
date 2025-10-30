"use client"

import { Controller, useFormContext } from "react-hook-form"

import { AiField } from "../../AiField"
import type { TrFormValues } from "../../tr.zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface QuantidadesStepProps {
  trId: string | null
  getContext: () => TrFormValues
}

export function QuantidadesStep({ trId, getContext }: QuantidadesStepProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<TrFormValues>()

  const quantidadesErrors = (errors as any)?.quantidades ?? {}

  return (
    <div className="grid gap-6">
      <Controller
        control={control}
        name={"quantidades.quantidadeTotal" as const}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="quantidades.quantidadeTotal" className="text-sm font-semibold text-neutral-800">
              Quantidade total estimada
            </Label>
            <Input
              id="quantidades.quantidadeTotal"
              type="number"
              min={1}
              value={field.value ?? 1}
              onChange={(event) => field.onChange(Number(event.target.value))}
              onBlur={field.onBlur}
            />
            {quantidadesErrors?.quantidadeTotal ? (
              <p className="text-xs font-medium text-error-600">
                {quantidadesErrors.quantidadeTotal.message as string}
              </p>
            ) : (
              <p className="text-xs text-neutral-500">Informe a quantidade planejada para contratação.</p>
            )}
          </div>
        )}
      />

      <Controller
        control={control}
        name={"quantidades.unidadeMedida" as const}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="quantidades.unidadeMedida" className="text-sm font-semibold text-neutral-800">
              Unidade de medida
            </Label>
            <Input
              id="quantidades.unidadeMedida"
              placeholder="Ex.: Unidade, Lote, Pacote"
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
            {quantidadesErrors?.unidadeMedida ? (
              <p className="text-xs font-medium text-error-600">
                {quantidadesErrors.unidadeMedida.message as string}
              </p>
            ) : (
              <p className="text-xs text-neutral-500">Indique a unidade que será utilizada no edital.</p>
            )}
          </div>
        )}
      />

      <Controller
        control={control}
        name={"quantidades.justificativaQuantidade" as const}
        render={({ field, fieldState }) => (
          <AiField
            id="quantidades.justificativaQuantidade"
            label="Justificativa da quantidade"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            description="Explique o racional utilizado para dimensionar as quantidades."
            placeholder="Fundamente com histórico de consumo, estimativas ou projeções de demanda."
            trId={trId}
            fieldKey="quantidades-justificativa"
            getContext={() => ({ ...getContext(), step: "quantidades" })}
            rows={5}
          />
        )}
      />

      <Controller
        control={control}
        name={"quantidades.cronogramaEntrega" as const}
        render={({ field, fieldState }) => (
          <AiField
            id="quantidades.cronogramaEntrega"
            label="Cronograma de entrega"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            description="Detalhe as etapas de entrega, marcos e prazos desejados."
            placeholder="Informe previsão de entrega inicial, reposições e ajustes de estoque."
            trId={trId}
            fieldKey="quantidades-cronograma"
            getContext={() => ({ ...getContext(), step: "quantidades" })}
            rows={5}
          />
        )}
      />
    </div>
  )
}
