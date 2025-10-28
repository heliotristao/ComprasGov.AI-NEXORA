"use client"

import { Controller, useFormContext } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import type { TrFormValues } from "../types"

export function TrServicosDimensionamentoStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<TrFormValues>()

  const dimensionamentoErrors = (errors as any)?.dimensionamento ?? {}

  return (
    <div className="grid gap-6 md:grid-cols-2 md:gap-8">
      <div className="space-y-6">
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
                step={1}
                value={field.value ?? ""}
                onChange={(event) => {
                  const value = event.target.value
                  field.onChange(value === "" ? value : Number(value))
                }}
              />
              {dimensionamentoErrors?.quantidadeProfissionais ? (
                <p className="text-xs font-medium text-error-600">
                  {dimensionamentoErrors.quantidadeProfissionais.message as string}
                </p>
              ) : (
                <p className="text-xs text-neutral-500">
                  Estime a equipe necessária considerando turnos e picos de demanda.
                </p>
              )}
            </div>
          )}
        />

        <Controller
          control={control}
          name={"dimensionamento.cargaHoraria" as const}
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="dimensionamento.cargaHoraria" className="text-sm font-semibold text-neutral-800">
                Carga horária e regime
              </Label>
              <Input
                id="dimensionamento.cargaHoraria"
                placeholder="Ex.: 40h semanais, plantão 12x36"
                {...field}
              />
              {dimensionamentoErrors?.cargaHoraria ? (
                <p className="text-xs font-medium text-error-600">
                  {dimensionamentoErrors.cargaHoraria.message as string}
                </p>
              ) : (
                <p className="text-xs text-neutral-500">
                  Especifique horários, turnos e eventuais escalas especiais.
                </p>
              )}
            </div>
          )}
        />
      </div>

      <Controller
        control={control}
        name={"dimensionamento.criteriosAlocacao" as const}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="dimensionamento.criteriosAlocacao" className="text-sm font-semibold text-neutral-800">
              Critérios de alocação
            </Label>
            <Textarea
              id="dimensionamento.criteriosAlocacao"
              rows={6}
              placeholder="Descreva como os profissionais serão alocados, substituídos e supervisionados."
              {...field}
            />
            {dimensionamentoErrors?.criteriosAlocacao ? (
              <p className="text-xs font-medium text-error-600">
                {dimensionamentoErrors.criteriosAlocacao.message as string}
              </p>
            ) : (
              <p className="text-xs text-neutral-500">
                Inclua critérios de disponibilidade, qualificação e planos de contingência.
              </p>
            )}
          </div>
        )}
      />
    </div>
  )
}
