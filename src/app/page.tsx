"use client"

import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const quickActions = [
  {
    label: "Novo Plano (PCA/DFD)",
    href: "/wizard/planning",
  },
  {
    label: "Novo ETP",
    href: "/wizard/etp",
  },
  {
    label: "Novo TR (Bens)",
    href: "/wizard/tr?tipo=bens",
  },
  {
    label: "Novo TR (Serviços)",
    href: "/wizard/tr?tipo=servicos",
  },
]

const metricCards = [
  "Processos Ativos",
  "Licitações em Andamento",
  "Contratos Vigentes",
  "Economia Gerada",
]

export default function DashboardPage() {
  const router = useRouter()

  return (
    <div className="space-y-10">
      <section className="space-y-6">
        <div>
          <h1 className="text-h2 text-primary-900">Acesso Rápido</h1>
          <p className="mt-2 text-body text-neutral-600">
            Selecione uma das ações para iniciar um novo processo.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Button
              key={action.href}
              className="h-auto justify-start rounded-xl border border-primary-200 bg-primary px-5 py-6 text-base font-semibold shadow-sm transition-transform hover:-translate-y-0.5 hover:bg-primary/90"
              onClick={() => router.push(action.href)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </section>

      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metricCards.map((title) => (
            <Card key={title} className="border-dashed">
              <CardHeader>
                <CardTitle className="text-h5 text-neutral-700">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-body-small text-neutral-500">
                  Indicador disponível em breve.
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
