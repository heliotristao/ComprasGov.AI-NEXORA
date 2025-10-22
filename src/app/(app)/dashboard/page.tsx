"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import withAuth from "@/components/auth/withAuth"

const dashboardStats = [
  { label: "Licitações em Andamento", value: "5", description: "Processos ativos acompanhados pela equipe." },
  { label: "Contratos Ativos", value: "12", description: "Contratos vigentes com monitoramento automático." },
  { label: "Economia Estimada", value: "R$ 240K", description: "Redução potencial identificada em análises recentes." },
]

function DashboardPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Visão geral das principais métricas do ComprasGov.AI. Os dados apresentados são placeholders e serão atualizados com
          integrações futuras.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {dashboardStats.map((stat) => (
          <Card key={stat.label} className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium text-slate-500">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-3xl font-semibold text-slate-900">{stat.value}</p>
              <p className="mt-2 text-sm text-slate-500">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}

export default withAuth(DashboardPage)
