"use client"

import { Controller, useFormContext } from "react-hook-form"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import type { TrFormValues } from "../types"

export function TrServicosEscopoStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<TrFormValues>()

  const escopoErrors = (errors as any)?.escopo ?? {}

  return (
    <div className="grid gap-6">
      <Controller
        control={control}
        name={"escopo.descricaoServico" as const}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="escopo.descricaoServico" className="text-sm font-semibold text-neutral-800">
              Descrição do serviço
            </Label>
            <Textarea
              id="escopo.descricaoServico"
              rows={5}
              placeholder="Detalhe as atividades, entregáveis e contexto da prestação de serviço."
              {...field}
            />
            {escopoErrors?.descricaoServico ? (
              <p className="text-xs font-medium text-error-600">
                {escopoErrors.descricaoServico.message as string}
              </p>
            ) : (
              <p className="text-xs text-neutral-500">
                Deixe claro o escopo operacional para orientar o fornecedor.
              </p>
            )}
          </div>
        )}
      />

      <Controller
        control={control}
        name={"escopo.objetivos" as const}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="escopo.objetivos" className="text-sm font-semibold text-neutral-800">
              Objetivos estratégicos
            </Label>
            <Textarea
              id="escopo.objetivos"
              rows={4}
              placeholder="Liste os resultados esperados e benefícios institucionais."
              {...field}
            />
            {escopoErrors?.objetivos ? (
              <p className="text-xs font-medium text-error-600">{escopoErrors.objetivos.message as string}</p>
            ) : (
              <p className="text-xs text-neutral-500">
                Vincule a contratação às metas do plano e indicadores-chave.
              </p>
            )}
          </div>
        )}
      />

      <Controller
        control={control}
        name={"escopo.requisitosTecnicos" as const}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="escopo.requisitosTecnicos" className="text-sm font-semibold text-neutral-800">
              Requisitos técnicos
            </Label>
            <Textarea
              id="escopo.requisitosTecnicos"
              rows={4}
              placeholder="Indique tecnologias, certificações ou expertises mínimas necessárias."
              {...field}
            />
            {escopoErrors?.requisitosTecnicos ? (
              <p className="text-xs font-medium text-error-600">
                {escopoErrors.requisitosTecnicos.message as string}
              </p>
            ) : (
              <p className="text-xs text-neutral-500">
                Garanta que as exigências suportem a qualidade esperada da prestação.
              </p>
            )}
          </div>
        )}
      />
    </div>
  )
}
