"use client"

import Image from "next/image"
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

import logo from "@/public/assets/images/logo-comprasgov-ai.svg"

const loginSchema = z.object({
  email: z.string().email({ message: "Informe um email válido." }),
  password: z
    .string()
    .min(8, { message: "A senha deve conter pelo menos 8 caracteres." }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
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
        <Card className="border-border/80 shadow-lg">
          <CardHeader className="space-y-6 text-center">
            <Image
              src={logo}
              alt="Logo ComprasGov.AI - NEXORA"
              className="mx-auto h-16 w-auto"
              priority
            />
            <div className="space-y-1">
              <CardTitle className="text-2xl font-semibold text-secondary">
                Bem-vindo de volta
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Acesse o ComprasGov.AI - NEXORA com suas credenciais oficiais.
              </CardDescription>
            </div>
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
