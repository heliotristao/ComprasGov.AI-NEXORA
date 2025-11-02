"use client"

import { Controller, useFormContext } from "react-hook-form"

import { EdocsField } from "../../../etp/EdocsField"
import { AiField } from "../../AiField"
import type { TrFormValues } from "../../tr.zod"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface IdentificacaoStepProps {
  trId: string | null
  getContext: () => TrFormValues
}

export function IdentificacaoStep({ trId, getContext }: IdentificacaoStepProps) {
  const {
    control,
    trigger,
    formState: { errors },
  } = useFormContext<TrFormValues>()

  const identificacaoErrors = (errors as any)?.identificacao ?? {}

  return (
    <div className="grid gap-6">
      <Controller
        control={control}
        name={"identificacao.codigoEdocs" as const}
        render={({ field }) => (
          <EdocsField
            id="identificacao.codigoEdocs"
            label="Código E-Docs"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={() => {
              field.onBlur()
              void trigger("identificacao.codigoEdocs")
            }}
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
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
            {identificacaoErrors?.objeto ? (
              <p className="text-xs font-medium text-error-600">{identificacaoErrors.objeto.message as string}</p>
            ) : (
              <p className="text-xs text-neutral-500">Descreva objetivamente o item que será contratado.</p>
            )}
          </div>
        )}
      />

      <Controller
        control={control}
        name={"identificacao.justificativa" as const}
        render={({ field, fieldState }) => (
          <AiField
            id="identificacao.justificativa"
            label="Justificativa da necessidade"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            description="Explique o cenário que demanda a contratação e os benefícios esperados."
            placeholder="Fundamente a necessidade com dados e alinhamento estratégico."
            trId={trId}
            fieldKey="identificacao-justificativa"
            getContext={() => ({ ...getContext(), step: "identificacao" })}
            rows={6}
          />
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
            <Input
              id="identificacao.setorRequisitante"
              placeholder="Ex.: Diretoria de Tecnologia"
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
            />
            {identificacaoErrors?.setorRequisitante ? (
              <p className="text-xs font-medium text-error-600">
                {identificacaoErrors.setorRequisitante.message as string}
              </p>
            ) : (
              <p className="text-xs text-neutral-500">Informe a área responsável pela solicitação.</p>
            )}
          </div>
        )}
      />
    </div>
  )
}
