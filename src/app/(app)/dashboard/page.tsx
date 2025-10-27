"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  FileText,
  Gavel,
  FileSignature,
  TrendingUp,
  DollarSign,
  Clock,
  AlertTriangle,
  Sparkles,
} from "lucide-react"
import { useMemo } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

import withAuth from "@/components/auth/withAuth"
import { MetricCard } from "@/components/data-display/metric-card"
import { ChartWrapper } from "@/components/data-display/chart-wrapper"
import { DataTable, type Column } from "@/components/data-display/data-table"
import { StatusBadge } from "@/components/data-display/status-badge"
import { AIInsight } from "@/components/ai/ai-insight"
import { AIAssistant, type ChatMessage } from "@/components/ai/ai-assistant"
import { Button } from "@/components/ui/button"
import { getApiBaseUrl } from "@/lib/env"
import { useAuthStore } from "@/stores/authStore"
import { PROCESS_STATUS } from "@/lib/constants"

interface DashboardSummaryResponse {
  plans_in_progress: number
  open_tenders: number
  active_contracts: number
}

interface Process {
  id: string
  identifier: string
  object: string
  status: keyof typeof PROCESS_STATUS
  created_at: string
  estimated_value?: number
}

// Dados mockados para os gráficos (em produção, viriam da API)
const monthlyData = [
  { month: "Jan", processes: 12, value: 2400000 },
  { month: "Fev", processes: 15, value: 3100000 },
  { month: "Mar", processes: 18, value: 2800000 },
  { month: "Abr", processes: 14, value: 3500000 },
  { month: "Mai", processes: 20, value: 4200000 },
  { month: "Jun", processes: 22, value: 3800000 },
]

const statusDistribution = [
  { status: "Rascunho", count: 8 },
  { status: "Pendente", count: 12 },
  { status: "Aprovado", count: 25 },
  { status: "Rejeitado", count: 3 },
]

function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Query para resumo do dashboard
  const { data, isLoading, isError } = useQuery<DashboardSummaryResponse>({
    queryKey: ["dashboard", "summary", token],
    queryFn: async () => {
      if (!token) throw new Error("Token de autenticação ausente.")

      const baseUrl = getApiBaseUrl()
      const requestUrl = new URL("/dashboard/summary", baseUrl)

      const response = await fetch(requestUrl, {
        headers: { Authorization: `Bearer ${token}` },
        method: "GET",
      })

      if (!response.ok) throw new Error("Falha ao carregar o resumo do dashboard.")
      return (await response.json()) as DashboardSummaryResponse
    },
    enabled: Boolean(token),
  })

  // Query para processos recentes
  const { data: recentProcesses } = useQuery<Process[]>({
    queryKey: ["processes", "recent", token],
    queryFn: async () => {
      if (!token) throw new Error("Token ausente.")
      
      const baseUrl = getApiBaseUrl()
      const response = await fetch(`${baseUrl}/plans?limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      if (!response.ok) return []
      return await response.json()
    },
    enabled: Boolean(token),
  })

  const userName = useMemo(() => {
    if (user && typeof user === "object" && "name" in user) {
      return String(user.name)
    }
    return "Usuário"
  }, [user])

  // Handler para enviar mensagem ao assistente
  const handleSendMessage = async (message: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    setIsProcessing(true)
    // Simular resposta da IA (em produção, chamar API real)
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Entendi sua pergunta. Como posso ajudar você com os processos de compra?",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsProcessing(false)
    }, 1500)
  }

  // Colunas da tabela de processos recentes
  const processColumns: Column<Process>[] = [
    {
      id: "identifier",
      label: "Identificador",
      accessor: (row) => row.identifier || "-",
      sortable: true,
      width: "w-32",
    },
    {
      id: "object",
      label: "Objeto",
      accessor: (row) => (
        <span className="line-clamp-2" title={row.object}>
          {row.object}
        </span>
      ),
      sortable: true,
    },
    {
      id: "status",
      label: "Status",
      accessor: (row) => <StatusBadge status={row.status} />,
      width: "w-32",
      align: "center",
    },
    {
      id: "created_at",
      label: "Criado em",
      accessor: (row) => new Date(row.created_at).toLocaleDateString("pt-BR"),
      sortable: true,
      width: "w-32",
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-slate-200" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        Não foi possível carregar o dashboard. Tente novamente mais tarde.
      </div>
    )
  }

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-h1 text-slate-900">Dashboard</h1>
            <p className="text-body-small text-slate-500">Bem-vindo de volta, {userName}.</p>
          </div>
          <Button onClick={() => setIsAssistantOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" />
            Assistente IA
          </Button>
        </header>

        {/* Métricas Principais */}
        <section aria-label="Métricas principais" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Processos Ativos"
            value={data?.plans_in_progress || 0}
            icon={FileText}
            description="Em elaboração"
            trend="up"
            trendValue="+12%"
            iconColor="text-primary"
            iconBgColor="bg-primary/10"
          />
          <MetricCard
            title="Licitações Abertas"
            value={data?.open_tenders || 0}
            icon={Gavel}
            description="Aguardando propostas"
            trend="neutral"
            trendValue="0%"
            iconColor="text-amber-600"
            iconBgColor="bg-amber-100"
          />
          <MetricCard
            title="Contratos Ativos"
            value={data?.active_contracts || 0}
            icon={FileSignature}
            description="Vigentes"
            trend="up"
            trendValue="+5%"
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-100"
          />
          <MetricCard
            title="Economia Gerada"
            value="R$ 2,5M"
            icon={TrendingUp}
            description="Últimos 6 meses"
            trend="up"
            trendValue="+18%"
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
        </section>

        {/* Insights da IA */}
        <section aria-label="Insights da IA" className="grid gap-4 lg:grid-cols-2">
          <AIInsight
            title="Oportunidade de Economia"
            description="A IA identificou 3 processos com valores acima da média de mercado. Considere revisar as estimativas."
            type="suggestion"
            action={
              <Button size="sm" variant="outline">
                Ver Processos
              </Button>
            }
          />
          <AIInsight
            title="Prazo de Atenção"
            description="2 processos estão próximos do prazo limite para publicação. Revise com urgência."
            type="warning"
            action={
              <Button size="sm" variant="outline">
                Ver Detalhes
              </Button>
            }
          />
        </section>

        {/* Gráficos */}
        <section aria-label="Análises" className="grid gap-4 lg:grid-cols-2">
          <ChartWrapper
            title="Evolução Mensal de Processos"
            description="Processos criados nos últimos 6 meses"
            height={300}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#FFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "6px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="processes"
                  stroke="#1E40AF"
                  strokeWidth={2}
                  name="Processos"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartWrapper>

          <ChartWrapper
            title="Distribuição por Status"
            description="Status atual dos processos"
            height={300}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="status" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: "#FFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "6px",
                  }}
                />
                <Bar dataKey="count" fill="#1E40AF" name="Quantidade" />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </section>

        {/* Processos Recentes */}
        <section aria-label="Processos recentes">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-h3 text-slate-900">Processos Recentes</h2>
              <p className="text-body-small text-slate-500">Últimos processos criados</p>
            </div>
            <Button variant="outline" size="sm">
              Ver Todos
            </Button>
          </div>
          <DataTable
            data={recentProcesses || []}
            columns={processColumns}
            showPagination={false}
            emptyMessage="Nenhum processo encontrado"
          />
        </section>
      </div>

      {/* Assistente IA */}
      <AIAssistant
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        messages={messages}
        onSendMessage={handleSendMessage}
        isProcessing={isProcessing}
      />
    </>
  )
}

export default withAuth(DashboardPage)

