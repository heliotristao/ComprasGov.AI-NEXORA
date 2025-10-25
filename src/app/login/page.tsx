"use client"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/hooks/useAuth"

const loginSchema = z.object({
  email: z.string().email({ message: "Informe um email válido." }),
  password: z
    .string()
    .min(8, { message: "A senha deve conter pelo menos 8 caracteres." }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  // INÍCIO DO CÓDIGO DE DIAGNÓSTICO - DEBUG-001
  console.log("--- INICIANDO DIAGNÓSTICO DE AMBIENTE ---")
  console.log(
    "Valor de process.env.NEXT_PUBLIC_API_URL:",
    process.env.NEXT_PUBLIC_API_URL,
  )
  console.log(
    "Tipo de process.env.NEXT_PUBLIC_API_URL:",
    typeof process.env.NEXT_PUBLIC_API_URL,
  )
  console.log("Objeto process.env completo:", process.env)
  console.log("--- FIM DO DIAGNÓSTICO DE AMBIENTE ---")
  // FIM DO CÓDIGO DE DIAGNÓSTICO - DEBUG-001
  const authMutation = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await authMutation.mutateAsync(data)
    } catch {
      // Erros são tratados pelo estado da mutation
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="space-y-4 text-center">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-semibold text-secondary">
                ComprasGov.AI - NEXORA
              </CardTitle>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
                Plataforma Oficial
              </p>
            </div>
            <CardDescription className="text-base text-muted-foreground">
              Acesse com suas credenciais oficiais.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  {...register("email")}
                />
                {errors.email ? (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.email.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                  {...register("password")}
                />
                {errors.password ? (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.password.message}
                  </p>
                ) : null}
              </div>
              {authMutation.isError ? (
                <p className="text-sm text-destructive" role="alert">
                  {authMutation.error?.message ??
                    "Não foi possível realizar o login."}
                </p>
              ) : null}
              <Button
                type="submit"
                className="w-full"
                disabled={authMutation.isPending}
              >
                {authMutation.isPending ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
