"use client"

import { Controller, useFormContext } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import type { TrFormValues } from "../types"

export function TrBensGarantiaStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<TrFormValues>()

  const garantiaErrors = (errors as any)?.garantia ?? {}

  return (
    <div className="grid gap-6">
      <Controller
        control={control}
        name={"garantia.tipoGarantia" as const}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="garantia.tipoGarantia" className="text-sm font-semibold text-neutral-800">
              Tipo de garantia
            </Label>
            <Input id="garantia.tipoGarantia" placeholder="Ex.: Garantia estendida, garantia contratual" {...field} />
            {garantiaErrors?.tipoGarantia ? (
              <p className="text-xs font-medium text-error-600">{garantiaErrors.tipoGarantia.message as string}</p>
            ) : (
              <p className="text-xs text-neutral-500">Informe o mecanismo de garantia exigido do fornecedor.</p>
            )}
          </div>
        )}
      />

      <Controller
        control={control}
        name={"garantia.prazoGarantia" as const}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="garantia.prazoGarantia" className="text-sm font-semibold text-neutral-800">
              Prazo da garantia
            </Label>
            <Input id="garantia.prazoGarantia" placeholder="Ex.: 24 meses, até 2026" {...field} />
            {garantiaErrors?.prazoGarantia ? (
              <p className="text-xs font-medium text-error-600">{garantiaErrors.prazoGarantia.message as string}</p>
            ) : (
              <p className="text-xs text-neutral-500">Defina o período de cobertura necessário para garantir o desempenho.</p>
            )}
          </div>
        )}
      />

      <Controller
        control={control}
        name={"garantia.assistenciaTecnica" as const}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="garantia.assistenciaTecnica" className="text-sm font-semibold text-neutral-800">
              Assistência técnica e suporte
            </Label>
            <Textarea
              id="garantia.assistenciaTecnica"
              rows={4}
              placeholder="Detalhe canais, prazos de atendimento e condições de manutenção."
              {...field}
            />
            {garantiaErrors?.assistenciaTecnica ? (
              <p className="text-xs font-medium text-error-600">
                {garantiaErrors.assistenciaTecnica.message as string}
              </p>
            ) : (
              <p className="text-xs text-neutral-500">
                Estabeleça responsabilidades do fornecedor em caso de falhas ou defeitos.
              </p>
            )}
          </div>
        )}
      />
    </div>
  )
}
