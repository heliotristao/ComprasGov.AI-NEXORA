"use client"

import { Controller, useFormContext } from "react-hook-form"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import type { TrFormValues } from "../types"

export function TrBensEspecificacoesStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<TrFormValues>()

  const especificacoesErrors = (errors as any)?.especificacoes ?? {}

  return (
    <div className="grid gap-6">
      <Controller
        control={control}
        name={"especificacoes.descricaoTecnica" as const}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="especificacoes.descricaoTecnica" className="text-sm font-semibold text-neutral-800">
              Descrição técnica detalhada
            </Label>
            <Textarea
              id="especificacoes.descricaoTecnica"
              rows={5}
              placeholder="Liste características, componentes e padrões técnicos necessários."
              {...field}
            />
            {especificacoesErrors?.descricaoTecnica ? (
              <p className="text-xs font-medium text-error-600">
                {especificacoesErrors.descricaoTecnica.message as string}
              </p>
            ) : (
              <p className="text-xs text-neutral-500">
                Inclua especificações claras para orientar a aquisição e evitar questionamentos.
              </p>
            )}
          </div>
        )}
      />

      <Controller
        control={control}
        name={"especificacoes.requisitosMinimos" as const}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="especificacoes.requisitosMinimos" className="text-sm font-semibold text-neutral-800">
              Requisitos mínimos
            </Label>
            <Textarea
              id="especificacoes.requisitosMinimos"
              rows={4}
              placeholder="Determine o desempenho, compatibilidades e demais requisitos mínimos."
              {...field}
            />
            {especificacoesErrors?.requisitosMinimos ? (
              <p className="text-xs font-medium text-error-600">
                {especificacoesErrors.requisitosMinimos.message as string}
              </p>
            ) : (
              <p className="text-xs text-neutral-500">
                Estabeleça critérios essenciais que todas as propostas devem atender.
              </p>
            )}
          </div>
        )}
      />

      <Controller
        control={control}
        name={"especificacoes.normasReferencia" as const}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="especificacoes.normasReferencia" className="text-sm font-semibold text-neutral-800">
              Normas e referências
            </Label>
            <Textarea
              id="especificacoes.normasReferencia"
              rows={4}
              placeholder="Informe normas técnicas, certificações ou referências regulatórias aplicáveis."
              {...field}
            />
            {especificacoesErrors?.normasReferencia ? (
              <p className="text-xs font-medium text-error-600">
                {especificacoesErrors.normasReferencia.message as string}
              </p>
            ) : (
              <p className="text-xs text-neutral-500">
                Cite referências oficiais para garantir aderência às exigências legais.
              </p>
            )}
          </div>
        )}
      />
    </div>
  )
}
