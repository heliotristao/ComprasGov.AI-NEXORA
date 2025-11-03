"use client"

import { Controller, useFormContext } from "react-hook-form"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { AiField } from "../AiField"
import { EdocsField } from "../EdocsField"
import type { EtpFormValues } from "../etp.zod"

interface StepIdentificationProps {
  etpId: string | null
  getContext: () => EtpFormValues
}

const TEST_IDS = {
  requestingUnit: "unidade-requisitante",
  edocsNumber: "numero-edocs",
  processTitle: "titulo-processo",
  summary: "resumo-executivo",
} as const

export function StepIdentification({ etpId, getContext }: StepIdentificationProps) {
  const {
    register,
    control,
    trigger,
    formState: { errors },
  } = useFormContext<EtpFormValues>()

  return (
    <div className="grid gap-6">
      <div className="space-y-2">
        <Label htmlFor="identification.requestingUnit" className="text-sm font-semibold text-neutral-800">
          Unidade requisitante
        </Label>
        <Input
          id="identification.requestingUnit"
          placeholder="Ex.: Diretoria de Tecnologia da Informação"
          {...register("identification.requestingUnit")}
          data-testid={TEST_IDS.requestingUnit}
        />
        {errors.identification?.requestingUnit ? (
          <p className="text-xs font-medium text-error-600">{errors.identification.requestingUnit.message}</p>
        ) : (
          <p className="text-xs text-neutral-500">Informe a área responsável por demandar o estudo técnico preliminar.</p>
        )}
      </div>

      <Controller
        control={control}
        name="identification.edocsNumber"
        render={({ field, fieldState }) => (
          <EdocsField
            id="identification.edocsNumber"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={() => {
              field.onBlur()
              void trigger("identification.edocsNumber")
            }}
            error={fieldState.error?.message}
            testId={TEST_IDS.edocsNumber}
          />
        )}
      />

      <div className="space-y-2">
        <Label htmlFor="identification.processTitle" className="text-sm font-semibold text-neutral-800">
          Título do processo
        </Label>
        <Input
          id="identification.processTitle"
          placeholder="Ex.: Aquisição de equipamentos de informática"
          {...register("identification.processTitle")}
          data-testid={TEST_IDS.processTitle}
        />
        {errors.identification?.processTitle ? (
          <p className="text-xs font-medium text-error-600">{errors.identification.processTitle.message}</p>
        ) : (
          <p className="text-xs text-neutral-500">Defina um título claro que identifique o objeto da contratação.</p>
        )}
      </div>

      <Controller
        control={control}
        name="identification.summary"
        render={({ field, fieldState }) => (
          <AiField
            id="identification.summary"
            label="Resumo executivo"
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            description="Apresente uma visão geral do problema, objetivos e solução pretendida."
            placeholder="Descreva de forma sucinta o objetivo do ETP e o resultado esperado."
            etpId={etpId}
            fieldKey="identification-summary"
            getContext={() => ({ ...getContext(), step: "identification" })}
            rows={6}
            testId={TEST_IDS.summary}
          />
        )}
      />
    </div>
  )
}
