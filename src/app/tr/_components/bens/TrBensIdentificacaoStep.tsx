"use client"

import { Controller, useFormContext } from "react-hook-form"

import { EdocsInput } from "@/app/_shared/components/EdocsInput"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import type { TrFormValues } from "../types"

export function TrBensIdentificacaoStep() {
  const {
    control,
    formState: { errors },
  } = useFormContext<TrFormValues>()

  const identificacaoErrors = (errors as any)?.identificacao ?? {}

  return (
    <div className="grid gap-6">
      <Controller
        control={control}
        name={"identificacao.codigoEdocs" as const}
        render={({ field }) => (
          <EdocsInput
            id="identificacao.codigoEdocs"
            label="Código E-Docs"
            value={field.value}
            onChange={field.onChange}
            required
            helperText="Informe o identificador oficial do processo no ComprasGov."
            error={identificacaoErrors?.codigoEdocs?.message as string | undefined}
          />
        )}
      />

      <Controller
        control={control}
        name={"identificacao.objeto" as const}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="identificacao.objeto" className="text-sm font-semibold text-neutral-800">
              Objeto da contratação
            </Label>
            <Input
              id="identificacao.objeto"
              placeholder="Ex.: Aquisição de equipamentos de informática"
              {...field}
            />
            {identificacaoErrors?.objeto ? (
              <p className="text-xs font-medium text-error-600">{identificacaoErrors.objeto.message as string}</p>
            ) : (
              <p className="text-xs text-neutral-500">
                Descreva de forma objetiva o que será contratado.
              </p>
            )}
          </div>
        )}
      />

      <Controller
        control={control}
        name={"identificacao.justificativa" as const}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="identificacao.justificativa" className="text-sm font-semibold text-neutral-800">
              Justificativa da necessidade
            </Label>
            <Textarea
              id="identificacao.justificativa"
              rows={5}
              placeholder="Explique o cenário que demanda a aquisição e os benefícios esperados."
              {...field}
            />
            {identificacaoErrors?.justificativa ? (
              <p className="text-xs font-medium text-error-600">
                {identificacaoErrors.justificativa.message as string}
              </p>
            ) : (
              <p className="text-xs text-neutral-500">
                Fundamente a necessidade com dados e alinhamento estratégico.
              </p>
            )}
          </div>
        )}
      />

      <Controller
        control={control}
        name={"identificacao.setorRequisitante" as const}
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="identificacao.setorRequisitante" className="text-sm font-semibold text-neutral-800">
              Setor requisitante
            </Label>
            <Input id="identificacao.setorRequisitante" placeholder="Ex.: Diretoria de Tecnologia" {...field} />
            {identificacaoErrors?.setorRequisitante ? (
              <p className="text-xs font-medium text-error-600">
                {identificacaoErrors.setorRequisitante.message as string}
              </p>
            ) : (
              <p className="text-xs text-neutral-500">
                Informe a área responsável pela solicitação.
              </p>
            )}
          </div>
        )}
      />
    </div>
  )
}
