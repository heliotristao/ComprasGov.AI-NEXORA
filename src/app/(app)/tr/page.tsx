"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  FileSignature,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data - substituir por hook real
const mockTRs = [
  {
    id: 1,
    identificador: "TR-2025-001",
    objeto: "Aquisição de equipamentos de informática",
    etp_id: 1,
    etp_identificador: "ETP-2025-001",
    status: "em_elaboracao",
    progresso: 45,
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-01-20T14:30:00Z",
  },
  {
    id: 2,
    identificador: "TR-2025-002",
    objeto: "Contratação de empresa especializada em manutenção predial",
    etp_id: 2,
    etp_identificador: "ETP-2025-002",
    status: "concluido",
    progresso: 100,
    created_at: "2025-01-10T09:00:00Z",
    updated_at: "2025-01-18T16:45:00Z",
  },
  {
    id: 3,
    identificador: "TR-2025-003",
    objeto: "Aquisição de material de expediente",
    etp_id: 3,
    etp_identificador: "ETP-2025-003",
    status: "validacao",
    progresso: 85,
    created_at: "2025-01-12T11:30:00Z",
    updated_at: "2025-01-22T10:15:00Z",
  },
]

const statusConfig = {
  em_elaboracao: {
    label: "Em Elaboração",
    variant: "default" as const,
    icon: Clock,
    color: "text-blue-600 bg-blue-50",
  },
  validacao: {
    label: "Em Validação",
    variant: "secondary" as const,
    icon: AlertCircle,
    color: "text-yellow-600 bg-yellow-50",
  },
  concluido: {
    label: "Concluído",
    variant: "default" as const,
    icon: CheckCircle2,
    color: "text-green-600 bg-green-50",
  },
  aprovado: {
    label: "Aprovado",
    variant: "default" as const,
    icon: CheckCircle2,
    color: "text-emerald-600 bg-emerald-50",
  },
}

export default function TRListPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)

  // Filtrar TRs
  const filteredTRs = mockTRs.filter((tr) => {
    const matchesSearch =
      tr.identificador.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tr.objeto.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || tr.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateString))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Termos de Referência (TR)
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Gerencie os Termos de Referência criados a partir dos ETPs aprovados
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de TRs</CardTitle>
            <FileSignature className="h-4 w-4 text-slate-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTRs.length}</div>
            <p className="text-xs text-slate-600 mt-1">
              Documentos cadastrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Elaboração</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockTRs.filter(tr => tr.status === "em_elaboracao").length}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Validação</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockTRs.filter(tr => tr.status === "validacao").length}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Aguardando revisão
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockTRs.filter(tr => tr.status === "concluido" || tr.status === "aprovado").length}
            </div>
            <p className="text-xs text-slate-600 mt-1">
              Finalizados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Busque e filtre os Termos de Referência
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Buscar por identificador ou objeto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                onClick={() => setStatusFilter("all")}
                size="sm"
              >
                Todos
              </Button>
              <Button
                variant={statusFilter === "em_elaboracao" ? "default" : "outline"}
                onClick={() => setStatusFilter("em_elaboracao")}
                size="sm"
              >
                Em Elaboração
              </Button>
              <Button
                variant={statusFilter === "validacao" ? "default" : "outline"}
                onClick={() => setStatusFilter("validacao")}
                size="sm"
              >
                Validação
              </Button>
              <Button
                variant={statusFilter === "concluido" ? "default" : "outline"}
                onClick={() => setStatusFilter("concluido")}
                size="sm"
              >
                Concluídos
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de TRs</CardTitle>
          <CardDescription>
            {filteredTRs.length} {filteredTRs.length === 1 ? "documento encontrado" : "documentos encontrados"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredTRs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileSignature className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Nenhum TR encontrado
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Crie um TR a partir de um ETP aprovado"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Identificador</TableHead>
                    <TableHead>Objeto</TableHead>
                    <TableHead>ETP Base</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progresso</TableHead>
                    <TableHead>Atualizado em</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTRs.map((tr) => {
                    const statusInfo = statusConfig[tr.status as keyof typeof statusConfig]
                    const StatusIcon = statusInfo?.icon

                    return (
                      <TableRow key={tr.id}>
                        <TableCell className="font-medium">
                          {tr.identificador}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md">
                            <p className="line-clamp-2" title={tr.objeto}>
                              {tr.objeto}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/etp/${tr.etp_id}`}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            {tr.etp_identificador}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-2 px-2 py-1 rounded-md w-fit ${statusInfo?.color}`}>
                            {StatusIcon && <StatusIcon className="h-3 w-3" />}
                            <span className="text-xs font-medium">
                              {statusInfo?.label}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-24 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 transition-all"
                                style={{ width: `${tr.progresso}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-600">
                              {tr.progresso}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-slate-600">
                          {formatDate(tr.updated_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Ações
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => router.push(`/tr/${tr.id}/wizard`)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Continuar Edição
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => router.push(`/tr/${tr.id}/visualizar`)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => tr.progresso >= 100 && router.push(`/tr/${tr.id}/consolidar`)}
                              >
                                <FileText className="mr-2 h-4 w-4" />
                                Consolidar
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Baixar DOCX
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
