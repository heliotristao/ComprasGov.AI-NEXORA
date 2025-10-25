"use client"

import { FileSignature, FileText, Gavel } from "lucide-react"
import { useMemo } from "react"

import withAuth from "@/components/auth/withAuth"
import { DashboardCard } from "@/components/dashboard/DashboardCard"
import { useAuthStore } from "@/stores/authStore"

const dashboardCards = [
  { title: "Planos em Elaboração", value: "3", icon: FileText },
  { title: "Licitações Abertas", value: "1", icon: Gavel },
  { title: "Contratos Ativos", value: "12", icon: FileSignature },
] as const

function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  const userName = useMemo(() => {
    if (user && typeof user === "object" && "name" in user) {
      return String(user.name)
    }

    return "Usuário"
  }, [user])

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500">Bem-vindo de volta, {userName}.</p>
          </div>
        </div>
      </header>

      <section aria-label="Resumo das atividades" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {dashboardCards.map((card) => (
          <DashboardCard key={card.title} title={card.title} value={card.value} icon={card.icon} />
        ))}
      </section>
    </div>
  )
}

export default withAuth(DashboardPage)
