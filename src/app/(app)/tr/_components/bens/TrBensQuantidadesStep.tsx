"use client"

import { Controller, useFormContext } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import type { TrFormValues } from "../types"

export function TrBensQuantidadesStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<TrFormValues>()

  const quantidadesErrors = (errors as any)?.quantidades ?? {}

  return (
    <div className="grid gap-6 md:grid-cols-2 md:gap-8">
      <div className="space-y-6">
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
                step={1}
                value={field.value ?? ""}
                onChange={(event) => {
                  const value = event.target.value
                  field.onChange(value === "" ? value : Number(value))
                }}
              />
              {quantidadesErrors?.quantidadeTotal ? (
                <p className="text-xs font-medium text-error-600">
                  {quantidadesErrors.quantidadeTotal.message as string}
                </p>
              ) : (
                <p className="text-xs text-neutral-500">
                  Informe a quantidade planejada com base na demanda projetada.
                </p>
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
              <Input id="quantidades.unidadeMedida" placeholder="Ex.: unidade, caixa, pacote" {...field} />
              {quantidadesErrors?.unidadeMedida ? (
                <p className="text-xs font-medium text-error-600">
                  {quantidadesErrors.unidadeMedida.message as string}
                </p>
              ) : (
                <p className="text-xs text-neutral-500">
                  Utilize a unidade que melhor represente o controle da entrega.
                </p>
              )}
            </div>
          )}
        />
      </div>

      <div className="space-y-6">
        <Controller
          control={control}
          name={"quantidades.justificativaQuantidade" as const}
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="quantidades.justificativaQuantidade" className="text-sm font-semibold text-neutral-800">
                Justificativa da quantidade
              </Label>
              <Textarea
                id="quantidades.justificativaQuantidade"
                rows={4}
                placeholder="Explique a metodologia de estimativa e evidências que sustentam a quantidade."
                {...field}
              />
              {quantidadesErrors?.justificativaQuantidade ? (
                <p className="text-xs font-medium text-error-600">
                  {quantidadesErrors.justificativaQuantidade.message as string}
                </p>
              ) : (
                <p className="text-xs text-neutral-500">
                  Relacione histórico de consumo, projeções ou diretrizes institucionais.
                </p>
              )}
            </div>
          )}
        />

        <Controller
          control={control}
          name={"quantidades.cronogramaEntrega" as const}
          render={({ field }) => (
            <div className="space-y-2">
              <Label htmlFor="quantidades.cronogramaEntrega" className="text-sm font-semibold text-neutral-800">
                Cronograma de entrega
              </Label>
              <Textarea
                id="quantidades.cronogramaEntrega"
                rows={4}
                placeholder="Descreva etapas, marcos e prazos para recebimento dos itens."
                {...field}
              />
              {quantidadesErrors?.cronogramaEntrega ? (
                <p className="text-xs font-medium text-error-600">
                  {quantidadesErrors.cronogramaEntrega.message as string}
                </p>
              ) : (
                <p className="text-xs text-neutral-500">
                  Estruture entregas parciais ou totais alinhadas às necessidades do órgão.
                </p>
              )}
            </div>
          )}
        />
      </div>
    </div>
  )
}
