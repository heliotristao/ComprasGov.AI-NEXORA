"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react"

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
  const authMutation = useAuth()
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(72,106,242,0.12),_transparent_55%)]" aria-hidden="true" />
      <div className="relative z-10 w-full max-w-md">
        <Card className="border border-primary/15 shadow-xl shadow-primary/5">
          <CardHeader className="space-y-6 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="rounded-full border border-primary/20 bg-white/80 p-4 shadow-sm">
                <Image
                  src="/comprasgovai-logo.svg"
                  alt="Logo ComprasGov.AI - NEXORA"
                  width={72}
                  height={72}
                  priority
                />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-2xl font-semibold text-secondary">
                  Bem-vindo ao ComprasGov.AI - NEXORA
                </CardTitle>
                <p className="text-sm font-medium uppercase tracking-[0.3em] text-primary/80">
                  Plataforma Oficial
                </p>
              </div>
            </div>
            <CardDescription className="text-base text-muted-foreground">
              Acesse a plataforma de contratações inteligentes.
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
                  className="transition-shadow focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  {...register("email")}
                />
                {errors.email ? (
                  <p className="flex items-center gap-2 text-sm text-destructive" role="alert">
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    {errors.email.message}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Link
                    href="#"
                    className="text-sm font-medium text-primary transition hover:text-primary/80"
                  >
                    Esqueceu sua senha?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    aria-invalid={Boolean(errors.password)}
                    className="pr-11 transition-shadow focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition hover:text-primary"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {errors.password ? (
                  <p className="flex items-center gap-2 text-sm text-destructive" role="alert">
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    {errors.password.message}
                  </p>
                ) : null}
              </div>
              {authMutation.isError ? (
                <div
                  className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                  role="alert"
                  aria-live="assertive"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <span>
                    {authMutation.error?.message ??
                      "Não foi possível realizar o login. Tente novamente."}
                  </span>
                </div>
              ) : null}
              <Button
                type="submit"
                className="group relative flex w-full items-center justify-center gap-2"
                disabled={authMutation.isPending}
              >
                {authMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
