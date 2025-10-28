"use client"

import { Controller, useFormContext } from "react-hook-form"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import type { TrFormValues } from "../types"

export function TrServicosSlasStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<TrFormValues>()

  const slasErrors = (errors as any)?.slas ?? {}

  return (
    <div className="grid gap-6">
      <Controller
        control={control}
        name={"slas.niveisServico" as const}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="slas.niveisServico" className="text-sm font-semibold text-neutral-800">
              Níveis de serviço (SLAs)
            </Label>
            <Textarea
              id="slas.niveisServico"
              rows={4}
              placeholder="Defina tempos de resposta, disponibilidade e critérios de aceitação."
              {...field}
            />
            {slasErrors?.niveisServico ? (
              <p className="text-xs font-medium text-error-600">{slasErrors.niveisServico.message as string}</p>
            ) : (
              <p className="text-xs text-neutral-500">Estabeleça metas claras para acompanhamento de desempenho.</p>
            )}
          </div>
        )}
      />

      <Controller
        control={control}
        name={"slas.indicadoresDesempenho" as const}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="slas.indicadoresDesempenho" className="text-sm font-semibold text-neutral-800">
              Indicadores de desempenho
            </Label>
            <Textarea
              id="slas.indicadoresDesempenho"
              rows={4}
              placeholder="Informe métricas que serão monitoradas e limites aceitáveis."
              {...field}
            />
            {slasErrors?.indicadoresDesempenho ? (
              <p className="text-xs font-medium text-error-600">
                {slasErrors.indicadoresDesempenho.message as string}
              </p>
            ) : (
              <p className="text-xs text-neutral-500">
                Utilize indicadores objetivos para facilitar auditorias e fiscalizações.
              </p>
            )}
          </div>
        )}
      />

      <Controller
        control={control}
        name={"slas.penalidades" as const}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="slas.penalidades" className="text-sm font-semibold text-neutral-800">
              Penalidades e mecanismos de correção
            </Label>
            <Textarea
              id="slas.penalidades"
              rows={4}
              placeholder="Determine descontos, sanções ou ações corretivas em caso de descumprimento."
              {...field}
            />
            {slasErrors?.penalidades ? (
              <p className="text-xs font-medium text-error-600">{slasErrors.penalidades.message as string}</p>
            ) : (
              <p className="text-xs text-neutral-500">
                Garanta meios de reequilíbrio contratual e proteção do interesse público.
              </p>
            )}
          </div>
        )}
      />
    </div>
  )
}
