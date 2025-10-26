"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type NewPlanFormValues = {
  object: string
  justification: string
}

export default function NewPlanPage() {
  const { register, handleSubmit } = useForm<NewPlanFormValues>({
    defaultValues: {
      object: "",
      justification: "",
    },
  })

  const onSubmit = (_data: NewPlanFormValues) => {
    // TODO: Implementar lógica de salvamento na tarefa subsequente.
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">
          Criar Novo Plano de Contratação
        </h1>
        <p className="text-sm text-slate-600">
          Preencha as informações iniciais para começar a estruturar o plano de
          contratação.
        </p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">
            Informações do Plano
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-6"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="object">Objeto da Contratação</Label>
              <Textarea
                id="object"
                {...register("object")}
                placeholder="Descreva detalhadamente o objeto da contratação"
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="justification">Justificativa da Contratação</Label>
              <Textarea
                id="justification"
                {...register("justification")}
                placeholder="Explique o motivo e a necessidade da contratação"
                rows={6}
              />
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link className="sm:w-auto" href="/plans">
                <Button className="w-full sm:w-auto" type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
              <Button className="w-full sm:w-auto" type="submit">
                Salvar Rascunho
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
