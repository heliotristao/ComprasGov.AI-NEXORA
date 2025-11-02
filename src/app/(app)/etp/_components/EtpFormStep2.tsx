"use client"

import { Controller, useFormContext } from "react-hook-form"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

import type { EtpFormValues } from "./types"

export function EtpFormStep2() {
  const {
    control,
    formState: { errors },
  } = useFormContext<EtpFormValues>()

  return (
    <div className="grid gap-6">
      <Controller
        control={control}
        name="solution.alternatives"
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="solution.alternatives" className="text-sm font-semibold text-neutral-800">
              Alternativas avaliadas
            </Label>
            <Textarea
              id="solution.alternatives"
              rows={5}
              placeholder="Liste as alternativas de solução consideradas e os critérios de avaliação."
              {...field}
            />
            {errors.solution?.alternatives ? (
              <p className="text-xs font-medium text-error-600">{errors.solution.alternatives.message}</p>
            ) : (
              <p className="text-xs text-neutral-500">
                Registre as opções analisadas, com pontos fortes e fracos de cada cenário.
              </p>
            )}
          </div>
        )}
      />

      <Controller
        control={control}
        name="solution.recommended"
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="solution.recommended" className="text-sm font-semibold text-neutral-800">
              Solução recomendada
            </Label>
            <Textarea
              id="solution.recommended"
              rows={5}
              placeholder="Explique qual solução será adotada e o porquê da escolha."
              {...field}
            />
            {errors.solution?.recommended ? (
              <p className="text-xs font-medium text-error-600">{errors.solution.recommended.message}</p>
            ) : (
              <p className="text-xs text-neutral-500">
                Descreva a solução selecionada e evidencie os ganhos esperados.
              </p>
            )}
          </div>
        )}
      />

      <Controller
        control={control}
        name="solution.scope"
        render={({ field }) => (
          <div className="space-y-2">
            <Label htmlFor="solution.scope" className="text-sm font-semibold text-neutral-800">
              Escopo detalhado e requisitos
            </Label>
            <Textarea
              id="solution.scope"
              rows={5}
              placeholder="Liste requisitos funcionais, não funcionais e restrições relevantes."
              {...field}
            />
            {errors.solution?.scope ? (
              <p className="text-xs font-medium text-error-600">{errors.solution.scope.message}</p>
            ) : (
              <p className="text-xs text-neutral-500">
                Especifique os requisitos mínimos, entregáveis e critérios de aceitação.
              </p>
            )}
          </div>
        )}
      />
    </div>
  )
}
