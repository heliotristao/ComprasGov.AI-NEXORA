"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, type Resolver } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { EdocsInput } from "@/app/_shared/components/EdocsInput"
import { EDOCS_REGEX } from "@/lib/edocs"

const planningSchema = z.object({
  unidadeRequisitante: z
    .string()
    .trim()
    .min(1, "Informe a unidade requisitante."),
  eDocs: z
    .string()
    .min(1, "Informe o código do E-Docs.")
    .regex(EDOCS_REGEX, "Formato inválido. Use AAAA-XXXXXX."),
  descricaoObjeto: z
    .string()
    .trim()
    .min(1, "Descreva o objeto da contratação."),
  estimativaValor: z.coerce
    .number({ message: "Informe um valor numérico." })
    .nonnegative("Informe um valor igual ou superior a zero."),
})

const planningServiceBase = process.env.NEXT_PUBLIC_PLANNING_API_URL?.replace(/\/$/, "")
const apiUrl = planningServiceBase ? `${planningServiceBase}/plannings` : "/plannings"

type PlanningFormValues = z.infer<typeof planningSchema>

export default function PlanningWizardPage() {
  const [apiResponse, setApiResponse] = useState<unknown | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
    trigger,
  } = useForm<PlanningFormValues>({
    resolver: zodResolver(planningSchema) as Resolver<PlanningFormValues>,
    mode: "onChange",
    defaultValues: {
      unidadeRequisitante: "",
      eDocs: "",
      descricaoObjeto: "",
      estimativaValor: 0,
    },
  })

  const onSubmit = async (values: PlanningFormValues) => {
    setApiResponse(null)
    setApiError(null)

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          unidadeRequisitante: values.unidadeRequisitante,
          eDocs: values.eDocs,
          descricaoObjeto: values.descricaoObjeto,
          estimativaValor: values.estimativaValor,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setApiError(
          typeof data?.message === "string"
            ? data.message
            : "Não foi possível criar o plano. Verifique a API."
        )
        setApiResponse(data)
        return
      }

      setApiResponse(data)
      reset({
        unidadeRequisitante: "",
        eDocs: "",
        descricaoObjeto: "",
        estimativaValor: 0,
      })
    } catch (error) {
      setApiError("Erro ao conectar com o serviço de planejamento.")
    }
  }

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-h2 text-primary-900">Wizard de Planejamento</h1>
        <p className="text-body text-neutral-600">
          Preencha os dados abaixo para registrar um novo plano de contratação.
        </p>
      </header>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-h4 text-neutral-800">Dados do Plano</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="unidadeRequisitante">Unidade Requisitante</Label>
                <Input
                  id="unidadeRequisitante"
                  placeholder="Ex.: Departamento de Compras"
                  {...register("unidadeRequisitante")}
                />
                {errors.unidadeRequisitante && (
                  <p className="text-sm text-error-600">{errors.unidadeRequisitante.message}</p>
                )}
              </div>

              <Controller
                control={control}
                name="eDocs"
                render={({ field, fieldState }) => (
                  <EdocsInput
                    id="eDocs"
                    label="E-Docs"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={() => {
                      field.onBlur()
                      void trigger("eDocs")
                    }}
                    error={fieldState.error?.message}
                    helperText="Informe o código oficial no formato AAAA-123456."
                    required
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricaoObjeto">Descrição do objeto</Label>
              <Textarea
                id="descricaoObjeto"
                placeholder="Descreva o objeto da contratação"
                rows={4}
                {...register("descricaoObjeto")}
              />
              {errors.descricaoObjeto && (
                <p className="text-sm text-error-600">{errors.descricaoObjeto.message}</p>
              )}
            </div>

            <div className="space-y-2 md:w-1/3">
              <Label htmlFor="estimativaValor">Estimativa de valor (R$)</Label>
              <Input
                id="estimativaValor"
                type="number"
                step="0.01"
                min="0"
                {...register("estimativaValor")}
              />
              {errors.estimativaValor && (
                <p className="text-sm text-error-600">{errors.estimativaValor.message}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="min-w-[160px]"
              >
                {isSubmitting ? "Enviando..." : "Criar Plano"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {(apiResponse || apiError) && (
        <Card className="border border-dashed border-primary-200 bg-primary-50">
          <CardHeader>
            <CardTitle className="text-h5 text-primary-900">Resposta da API</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {apiError && <p className="text-sm text-error-600">{apiError}</p>}
            {apiResponse != null && (
              <pre className="overflow-x-auto rounded-lg bg-white p-4 text-xs text-neutral-800 shadow-inner">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
