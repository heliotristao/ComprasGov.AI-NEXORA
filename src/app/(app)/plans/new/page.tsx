"use client"

import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import withAuth from "@/components/auth/withAuth"
import { useToast } from "@/hooks/useToast"
import { config } from "@/lib/config"
import { useAuthStore } from "@/stores/authStore"

const newPlanSchema = z.object({
  object: z
    .string()
    .trim()
    .min(1, { message: "Informe o objeto da contratação." }),
  justification: z
    .string()
    .trim()
    .min(1, { message: "Descreva a justificativa da contratação." }),
})

type NewPlanFormValues = z.infer<typeof newPlanSchema>

function NewPlanPageComponent() {
  const router = useRouter()
  const { toast } = useToast()
  const token = useAuthStore((state) => state.token)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<NewPlanFormValues>({
    resolver: zodResolver(newPlanSchema),
    defaultValues: {
      object: "",
      justification: "",
    },
  })

  const createPlanMutation = useMutation({
    mutationFn: async (data: NewPlanFormValues) => {
      if (!config.api.baseUrl) {
        throw new Error(
          "A URL base da API não está configurada. Configure a variável NEXT_PUBLIC_API_URL."
        )
      }

      if (!token) {
        throw new Error("Sessão expirada. Faça login novamente.")
      }

      const requestUrl = new URL("plans", config.api.baseUrl).toString()

      const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        let errorMessage = "Falha ao criar o plano. Tente novamente."

        try {
          const errorBody = await response.json()

          if (typeof errorBody?.message === "string" && errorBody.message.trim().length > 0) {
            errorMessage = errorBody.message
          }
        } catch {
          // Ignora erros ao processar o corpo da resposta de erro.
        }

        throw new Error(errorMessage)
      }

      const rawBody = await response.text()

      if (!rawBody) {
        return null
      }

      try {
        return JSON.parse(rawBody)
      } catch {
        return rawBody
      }
    },
    onSuccess: () => {
      toast({ title: "Plano criado com sucesso!", variant: "success" })
      router.push("/plans")
    },
    onError: (error: unknown) => {
      const description =
        error instanceof Error && error.message !== "Falha ao criar o plano. Tente novamente."
          ? error.message
          : undefined

      toast({
        title: "Falha ao criar o plano. Tente novamente.",
        description,
        variant: "destructive",
      })
    },
  })

  const onSubmit = async (data: NewPlanFormValues) => {
    try {
      await createPlanMutation.mutateAsync(data)
    } catch {
      // Os erros já são tratados no onError da mutação.
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-slate-900">Novo Plano de Contratação</h1>
        <p className="text-sm text-slate-600">
          Preencha as informações básicas para iniciar o planejamento.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="space-y-3">
            <div>
              <CardTitle className="text-xl font-semibold text-slate-900">
                Dados iniciais do plano
              </CardTitle>
              <CardDescription className="text-sm text-slate-600">
                Defina o objeto e a justificativa da contratação para guiar as próximas etapas.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="object">Objeto da Contratação</Label>
              <Textarea
                id="object"
                {...register("object")}
                placeholder="Descreva detalhadamente o que será contratado."
                rows={6}
                aria-invalid={Boolean(errors.object)}
                aria-describedby={
                  errors.object ? "object-error" : "object-description"
                }
              />
              <p id="object-description" className="text-sm text-slate-500">
                Inclua escopo, quantidades e principais requisitos técnicos.
              </p>
              {errors.object ? (
                <p
                  id="object-error"
                  className="flex items-center gap-2 text-sm text-destructive"
                  role="alert"
                >
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  {errors.object.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="justification">Justificativa da Contratação</Label>
              <Textarea
                id="justification"
                {...register("justification")}
                placeholder="Explique o motivo e a necessidade da contratação."
                rows={6}
                aria-invalid={Boolean(errors.justification)}
                aria-describedby={
                  errors.justification
                    ? "justification-error"
                    : "justification-description"
                }
              />
              <p id="justification-description" className="text-sm text-slate-500">
                Aponte o problema a ser resolvido, benefícios esperados e base legal.
              </p>
              {errors.justification ? (
                <p
                  id="justification-error"
                  className="flex items-center gap-2 text-sm text-destructive"
                  role="alert"
                >
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  {errors.justification.message}
                </p>
              ) : null}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => router.push("/plans")}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={createPlanMutation.isPending}
            >
              {createPlanMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Salvando...
                </>
              ) : (
                "Salvar Rascunho"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

export default withAuth(NewPlanPageComponent)
