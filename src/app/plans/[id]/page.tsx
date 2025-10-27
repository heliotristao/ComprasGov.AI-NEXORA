"use client"

import { useRouter, useParams } from "next/navigation"
import { useMemo } from "react"

import AppLayout from "@/app/(app)/layout"
import withAuth from "@/components/auth/withAuth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const placeholderObject =
  "Aquisição de plataforma integrada para gestão do ciclo completo de contratações públicas, incluindo módulos de planejamento, acompanhamento de licitações e monitoramento de contratos, com suporte a integrações externas e relatórios em tempo real."

const placeholderJustification =
  "A contratação é necessária para modernizar os processos administrativos, garantir conformidade com a legislação vigente e oferecer maior transparência aos órgãos de controle. Espera-se redução de custos operacionais, padronização de fluxos e melhoria no atendimento às demandas das áreas requisitantes."

function resolvePlanId(rawId: string | string[] | undefined) {
  if (!rawId) {
    return "Plano sem identificador"
  }

  if (Array.isArray(rawId)) {
    return rawId[0] ?? "Plano sem identificador"
  }

  return rawId
}

function PlanDetailsPageComponent() {
  const router = useRouter()
  const params = useParams<{ id?: string | string[] }>()

  const planId = useMemo(() => resolvePlanId(params?.id), [params?.id])

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
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <div className="space-y-1">
                <span className="font-medium text-slate-900">Status</span>
                <div>
                  <Badge variant="info">Em Elaboração</Badge>
                </div>
              </div>
              <div className="space-y-1">
                <span className="font-medium text-slate-900">Data de criação</span>
                <p>12 de fevereiro de 2025</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Objeto da Contratação</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-slate-700">{placeholderObject}</p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl">Justificativa da Contratação</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-slate-700">{placeholderJustification}</p>
            </CardContent>
          </Card>
        </section>
      </div>
    </AppLayout>
  )
}

const PlanDetailsPage = withAuth(PlanDetailsPageComponent)

export default PlanDetailsPage
