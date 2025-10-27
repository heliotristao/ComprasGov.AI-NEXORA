"use client"

import { useRouter, useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"

import { getPlan } from "@/lib/api/plans"
import { useAuthStore } from "@/stores/authStore"

import AppLayout from "@/app/(app)/layout"
import withAuth from "@/components/auth/withAuth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function PlanDetailsPageComponent() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { token } = useAuthStore()

  const planId = params.id

  const {
    data: plan,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["plan", planId],
    queryFn: () => getPlan(planId, token!),
    enabled: !!token && !!planId,
  })

  const handleBack = () => {
    router.push("/plans")
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Detalhes do Plano: {planId}
            </h1>
            <p className="text-sm text-slate-500">
              Consulte as principais informações do plano selecionado.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={handleBack} className="w-full sm:w-auto">
              Voltar
            </Button>
            <Button className="w-full sm:w-auto" variant="secondary">
              Editar
            </Button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          {isLoading && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Informações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-600">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-6 w-1/2" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-6 w-1/2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Objeto da Contratação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-xl">Justificativa da Contratação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {isError && (
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-red-600">Erro</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700">Plano não encontrado.</p>
                </CardContent>
              </Card>
            </div>
          )}

          {plan && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Informações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-600">
                  <div className="space-y-1">
                    <span className="font-medium text-slate-900">Status</span>
                    <div>
                      <Badge variant="info">{plan.status}</Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="font-medium text-slate-900">Data de criação</span>
                    <p>{new Date(plan.created_at).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Objeto da Contratação</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-slate-700">{plan.objeto}</p>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-xl">Justificativa da Contratação</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-slate-700">{plan.justificativa}</p>
                </CardContent>
              </Card>
            </>
          )}
        </section>
      </div>
    </AppLayout>
  )
}

const PlanDetailsPage = withAuth(PlanDetailsPageComponent)

export default PlanDetailsPage
