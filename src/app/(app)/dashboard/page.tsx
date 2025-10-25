"use client"

import { useQuery } from "@tanstack/react-query"
import { FileSignature, FileText, Gavel } from "lucide-react"
import { useMemo } from "react"

import withAuth from "@/components/auth/withAuth"
import { DashboardCard } from "@/components/dashboard/DashboardCard"
import { getApiBaseUrl } from "@/lib/env"
import { useAuthStore } from "@/stores/authStore"

interface DashboardSummaryResponse {
  plans_in_progress: number
  open_tenders: number
  active_contracts: number
}

function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)

  const { data, isLoading, isError } = useQuery<DashboardSummaryResponse>({
    queryKey: ["dashboard", "summary", token],
    queryFn: async () => {
      if (!token) {
        throw new Error("Token de autenticação ausente.")
      }

      const baseUrl = getApiBaseUrl()
      const requestUrl = new URL("/dashboard/summary", baseUrl)

      const response = await fetch(requestUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "GET",
      })

      if (!response.ok) {
        throw new Error("Falha ao carregar o resumo do dashboard.")
      }

      return (await response.json()) as DashboardSummaryResponse
    },
    enabled: Boolean(token),
  })

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
        {isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="rounded-lg border border-slate-200 bg-white p-6"
              aria-hidden="true"
            >
              <div className="flex flex-col space-y-4">
                <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                <div className="h-8 w-16 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          ))
        ) : isError ? (
          <div className="col-span-full rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            Não foi possível carregar o resumo do dashboard. Tente novamente mais tarde.
          </div>
        ) : data ? (
          [
            {
              title: "Planos em Elaboração",
              value: String(data.plans_in_progress),
              icon: FileText,
              href: "/plans",
            },
            {
              title: "Licitações Abertas",
              value: String(data.open_tenders),
              icon: Gavel,
              href: "/tenders",
            },
            {
              title: "Contratos Ativos",
              value: String(data.active_contracts),
              icon: FileSignature,
              href: "/contracts",
            },
          ].map((card) => (
            <DashboardCard
              key={card.title}
              title={card.title}
              value={card.value}
              icon={card.icon}
              href={card.href}
            />
          ))
        ) : null}
      </section>
    </div>
  )
}

export default withAuth(DashboardPage)
