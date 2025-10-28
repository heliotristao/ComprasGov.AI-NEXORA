"use client"

import { Controller, useFormContext } from "react-hook-form"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

import type { EtpFormValues } from "./types"

export function EtpFormStep1() {
  const {
    control,
    formState: { errors },
  } = useFormContext<EtpFormValues>()

  return (
    <div className="grid gap-6">
      <Controller
        control={control}
        name="general.title"
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="general.title" className="text-sm font-semibold text-neutral-800">
              Título do ETP
            </Label>
            <Input
              id="general.title"
              placeholder="Ex.: Aquisição de equipamentos de informática"
              {...field}
            />
            {errors.general?.title ? (
              <p className="text-xs font-medium text-error-600">{errors.general.title.message}</p>
            ) : (
              <p className="text-xs text-neutral-500">
                Defina um título claro que identifique o objeto da contratação.
              </p>
            )}
          </div>
        )}
      />

      <Controller
        control={control}
        name="general.context"
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="general.context" className="text-sm font-semibold text-neutral-800">
              Contexto e cenário atual
            </Label>
            <Textarea
              id="general.context"
              rows={5}
              placeholder="Descreva o contexto institucional e a necessidade identificada."
              {...field}
            />
            {errors.general?.context ? (
              <p className="text-xs font-medium text-error-600">{errors.general.context.message}</p>
            ) : (
              <p className="text-xs text-neutral-500">
                Explique de forma objetiva a situação atual que demanda a contratação.
              </p>
            )}
          </div>
        )}
      />

      <Controller
        control={control}
        name="general.justification"
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="general.justification" className="text-sm font-semibold text-neutral-800">
              Justificativa da necessidade
            </Label>
            <Textarea
              id="general.justification"
              rows={5}
              placeholder="Detalhe as motivações e os objetivos que justificam a contratação."
              {...field}
            />
            {errors.general?.justification ? (
              <p className="text-xs font-medium text-error-600">{errors.general.justification.message}</p>
            ) : (
              <p className="text-xs text-neutral-500">
                Traga argumentos técnicos e legais que embasam a abertura do ETP.
              </p>
            )}
          </div>
        )}
      />
    </div>
  )
}
