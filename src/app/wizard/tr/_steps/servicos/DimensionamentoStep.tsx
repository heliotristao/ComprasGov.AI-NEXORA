"use client"

import { Controller, useFormContext } from "react-hook-form"

import { AiField } from "../../AiField"
import type { TrFormValues } from "../../tr.zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DimensionamentoStepProps {
  trId: string | null
  getContext: () => TrFormValues
}

export function DimensionamentoStep({ trId, getContext }: DimensionamentoStepProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<TrFormValues>()

  const dimensionamentoErrors = (errors as any)?.dimensionamento ?? {}

  return (
    <div className="grid gap-6">
      <Controller
        control={control}
        name={"dimensionamento.quantidadeProfissionais" as const}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="dimensionamento.quantidadeProfissionais" className="text-sm font-semibold text-neutral-800">
              Quantidade de profissionais
            </Label>
            <Input
              id="dimensionamento.quantidadeProfissionais"
              type="number"
              min={1}
              value={field.value ?? 1}
              onChange={(event) => field.onChange(Number(event.target.value))}
              onBlur={field.onBlur}
            />
            {dimensionamentoErrors?.quantidadeProfissionais ? (
              <p className="text-xs font-medium text-error-600">
                {dimensionamentoErrors.quantidadeProfissionais.message as string}
              </p>
            ) : (
              <p className="text-xs text-neutral-500">Informe a equipe mínima necessária para execução.</p>
            )}
          </div>
        )}
      />

      <Controller
        control={control}
        name={"dimensionamento.cargaHoraria" as const}
        render={({ field, fieldState }) => (
          <AiField
            id="dimensionamento.cargaHoraria"
            label="Carga horária prevista"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            description="Detalhe horários, jornadas e regime de trabalho esperado."
            placeholder="Ex.: 40 horas semanais por profissional, com atuação presencial."
            trId={trId}
            fieldKey="dimensionamento-carga"
            getContext={() => ({ ...getContext(), step: "dimensionamento" })}
            rows={4}
          />
        )}
      />

      <Controller
        control={control}
        name={"dimensionamento.criteriosAlocacao" as const}
        render={({ field, fieldState }) => (
          <AiField
            id="dimensionamento.criteriosAlocacao"
            label="Critérios de alocação"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            description="Explique como os profissionais serão distribuídos e acionados."
            placeholder="Informe escalas, plantões, substituições e critérios de priorização."
            trId={trId}
            fieldKey="dimensionamento-criterios"
            getContext={() => ({ ...getContext(), step: "dimensionamento" })}
            rows={5}
          />
        )}
      />
    </div>
  )
}
